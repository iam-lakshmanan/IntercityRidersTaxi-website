import { randomUUID } from 'node:crypto';
import { tripSchema } from '@/lib/validation.mjs';
import { calculateFare, vehicles } from '@/lib/fare.mjs';
import { fingerprint, verifyQuote } from '@/lib/security.mjs';
import { readRequest, errorResponse, HttpError, notify, once } from '@/lib/server';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const body = await readRequest(request);
    if (body.website) throw new HttpError('Unable to submit this request.');
    const parsed = tripSchema.safeParse(body.form);
    if (!parsed.success) throw new HttpError(parsed.error.issues[0]?.message || 'Check your journey details.');
    const form = parsed.data;
    if (!['enquiry', 'booking-request'].includes(body.event)) throw new HttpError('Invalid request type.');
    if (typeof body.requestId !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(body.requestId)) throw new HttpError('Invalid submission reference.');
    let fare: ReturnType<typeof calculateFare> | undefined;
    let quoteId = '';
    if (body.event === 'booking-request') {
      let quote;
      try { quote = verifyQuote(body.token, process.env.QUOTE_SIGNING_SECRET); }
      catch (error) { throw new HttpError(error instanceof Error ? error.message : 'Invalid quote.'); }
      if (quote.formHash !== fingerprint(form)) throw new HttpError('Journey details changed. Please refresh your estimate.');
      quoteId = quote.id;
      fare = calculateFare({ vehicleId: form.vehicle, tripType: form.tripType, distanceKm: quote.distanceKm, durationMins: quote.durationMins });
    }
    const idempotencyKey = fingerprint({ form, event: body.event, id: quoteId || body.requestId });
    const record = await once(idempotencyKey, async () => {
      const reference = `IR-${randomUUID().slice(0, 8).toUpperCase()}`;
      const requirements = [['womanAlone', 'Woman travelling alone'], ['seniorCitizen', 'Senior citizen'], ['travellingWithInfant', 'Infant'], ['extraLuggage', 'Extra luggage']] as const;
      await notify([
        body.event === 'booking-request' ? 'NEW RIDE REQUEST — availability to be confirmed' : 'MANUAL FARE ENQUIRY',
        reference, `${form.customerName} | ${form.mobile}`, form.email,
        `${form.pickup} → ${form.drop}`, `${form.pickupDate} at ${form.pickupTime} IST`,
        `${form.tripType} | ${vehicles.find(v => v.id === form.vehicle)?.label}`,
        fare ? `Driving distance: ${fare.travelKm} km | Billable: ${fare.billableKm} km\nRate: ₹${fare.ratePerKm}/km | Driver allowance: ₹400\nEstimated fare: ₹${fare.total}\nTolls, permits, hill and carrier charges extra.` : 'Fare to be quoted by booking team.',
        `Requirements: ${requirements.filter(([key]) => form[key]).map(([, label]) => label).join(', ') || 'None'}`,
      ].filter(Boolean).join('\n'));
      return { reference, delivered: true, status: 'request-received' };
    });
    return Response.json(record);
  } catch (error) { return errorResponse(error); }
}
