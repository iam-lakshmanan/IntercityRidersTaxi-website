import { contactSchema } from '@/lib/validation.mjs';
import { fingerprint } from '@/lib/security.mjs';
import { readRequest, errorResponse, HttpError, notify, once } from '@/lib/server';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const body = await readRequest(request);
    if (body.website) throw new HttpError('Unable to submit this request.');
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) throw new HttpError('Please check your name, mobile, email and message.');
    if (typeof body.requestId !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(body.requestId)) throw new HttpError('Invalid submission reference.');
    const form = parsed.data;
    await once(fingerprint({ ...form, requestId: body.requestId }), () => notify(`WEBSITE CONTACT\n${form.name}\n${form.mobile}\n${form.email}\n\n${form.message}`));
    return Response.json({ delivered: true });
  } catch (error) { return errorResponse(error); }
}
