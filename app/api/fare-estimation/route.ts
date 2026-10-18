import { calculateFare } from '@/lib/fare.mjs';
import { readRequest, errorResponse, HttpError } from '@/lib/server';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await readRequest(request);
    const distanceKm = Number(body.distanceKm);
    const durationMins = Number(body.durationMins || 0);
    if (typeof body.vehicleId !== 'string' || typeof body.tripType !== 'string' || !Number.isFinite(distanceKm) || distanceKm <= 0) throw new HttpError('Invalid fare estimate request.');
    return Response.json(calculateFare({ vehicleId: body.vehicleId, tripType: body.tripType, distanceKm, durationMins }));
  } catch (error) {
    return errorResponse(error);
  }
}
