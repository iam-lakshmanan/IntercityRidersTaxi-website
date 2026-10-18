import { randomUUID } from 'node:crypto';
import { calculateFare } from '@/lib/fare.mjs';
import { tripSchema } from '@/lib/validation.mjs';
import { signQuote, fingerprint } from '@/lib/security.mjs';
import { readRequest, errorResponse, HttpError } from '@/lib/server';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const parsed = tripSchema.safeParse(await readRequest(request));
    if (!parsed.success) throw new HttpError(parsed.error.issues[0]?.message || 'Invalid journey.');
    const form = parsed.data;
    const key = process.env.GOOGLE_MAPS_SERVER_KEY;
    const secret = process.env.QUOTE_SIGNING_SECRET;
    if (!key || !secret || secret.length < 32) throw new HttpError('Live route estimates are currently unavailable. You can still request a manual quote.', 503);
    const query = new URLSearchParams({ origin: form.pickup, destination: form.drop, mode: 'driving', region: 'in', key });
    const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?${query}`, { cache: 'no-store', signal: AbortSignal.timeout(12000) });
    if (!response.ok) throw new HttpError('The route service is unavailable. Please request a manual quote.', 503);
    const data = await response.json();
    const leg = data.routes?.[0]?.legs?.[0];
    if (data.status !== 'OK' || !leg?.distance?.value || !leg?.duration?.value) throw new HttpError('We could not calculate this driving route. Please request a manual quote.', 422);
    const distanceKm = leg.distance.value / 1000;
    const durationMins = leg.duration.value / 60;
    const fare = calculateFare({ vehicleId: form.vehicle, tripType: form.tripType, distanceKm, durationMins });
    const expires = Date.now() + 15 * 60000;
    const token = signQuote({ id: randomUUID(), formHash: fingerprint(form), distanceKm, durationMins, expires }, secret);
    return Response.json({ fare, token, expires, polyline: data.routes[0].overview_polyline?.points || '', start: leg.start_location, end: leg.end_location });
  } catch (error) { return errorResponse(error); }
}
