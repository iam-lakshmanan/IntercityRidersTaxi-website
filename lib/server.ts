import 'server-only';
import { createHash } from 'node:crypto';
import { sendNotification } from './notify.mjs';
const buckets = new Map<string, { count: number; expires: number }>();
const submissions = new Map<string, { promise: Promise<unknown>; expires: number }>();
export class HttpError extends Error { constructor(message: string, public status = 400) { super(message); } }
export async function readRequest(request: Request) {
  const origin = request.headers.get('origin');
  const expected = new URL(process.env.NEXT_PUBLIC_SITE_URL || request.url).origin;
  if (origin && origin !== expected && origin !== new URL(request.url).origin) throw new HttpError('Request origin is not allowed.', 403);
  if (!request.headers.get('content-type')?.includes('application/json')) throw new HttpError('JSON is required.', 415);
  const clientHeader = process.env.TRUSTED_IP_HEADER;
  const ip = clientHeader ? request.headers.get(clientHeader) || 'unknown' : 'local';
  const key = createHash('sha256').update(ip + new URL(request.url).pathname).digest('hex');
  const now = Date.now();
  for (const [k, v] of buckets) if (v.expires < now) buckets.delete(k);
  const bucket = buckets.get(key) || { count: 0, expires: now + 60000 };
  if (++bucket.count > 15 || buckets.size > 20000) throw new HttpError('Too many requests. Please wait a minute.', 429);
  buckets.set(key, bucket);
  if (Number(request.headers.get('content-length')) > 16000) throw new HttpError('Request is too large.', 413);
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError('A request body is required.');
  let length = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { value, done } = await reader.read(); if (done) break;
    length += value.length;
    if (length > 16000) { await reader.cancel(); throw new HttpError('Request is too large.', 413); }
    chunks.push(value);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { throw new HttpError('Invalid JSON.'); }
}
export function errorResponse(error: unknown) {
  return Response.json({ error: error instanceof Error ? error.message : 'Request failed. Please try again.' }, { status: error instanceof HttpError ? error.status : 502 });
}
export async function notify(message: string) {
  return sendNotification(message, { token: process.env.TELEGRAM_BOT_TOKEN, chatId: process.env.TELEGRAM_CHAT_ID });
}
export async function once<T>(key: string, task: () => Promise<T>): Promise<T> {
  const now = Date.now();
  for (const [k, v] of submissions) if (v.expires < now) submissions.delete(k);
  const existing = submissions.get(key); if (existing) return existing.promise as Promise<T>;
  if (submissions.size > 10000) throw new HttpError('Booking desk is busy. Please retry shortly.', 503);
  const promise = task().catch(error => { submissions.delete(key); throw error; });
  submissions.set(key, { promise, expires: now + 30 * 60000 });
  return promise;
}
