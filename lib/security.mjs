import { createHmac, timingSafeEqual, createHash } from 'node:crypto';
export function fingerprint(value) { return createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
export function signQuote(payload, secret) {
  if (!secret || secret.length < 32) throw new Error('Quote signing is not configured.');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${createHmac('sha256', secret).update(body).digest('base64url')}`;
}
export function verifyQuote(token, secret, now = Date.now()) {
  if (!secret || secret.length < 32 || typeof token !== 'string' || token.length > 10000) throw new Error('Invalid quote.');
  const [body, signature, extra] = token.split('.');
  if (!body || !signature || extra) throw new Error('Invalid quote.');
  const expected = createHmac('sha256', secret).update(body).digest();
  const actual = Buffer.from(signature, 'base64url');
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw new Error('Invalid quote.');
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
  if (!Number.isFinite(payload.expires) || payload.expires < now) throw new Error('Your quote expired. Please refresh the estimate.');
  return payload;
}
