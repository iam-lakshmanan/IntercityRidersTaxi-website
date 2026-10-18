export const rates = {
  oneway: { sedan: 15, prime_sedan: 15, suv: 20, prime_suv: 24 },
  roundtrip: { sedan: 14, prime_sedan: 14, suv: 19, prime_suv: 22 },
  airport: { sedan: 15, prime_sedan: 15, suv: 20, prime_suv: 24 },
};
export const vehicles = [
  { id: 'sedan', label: 'Sedan', seats: 4, bags: 2, image: '/images/sedan.webp', note: 'An easy choice for everyday escapes.' },
  { id: 'prime_sedan', label: 'Prime Sedan', seats: 4, bags: 2, image: '/images/prime-sedan.webp', note: 'A little extra comfort, all the way.' },
  { id: 'suv', label: 'SUV', seats: 6, bags: 3, image: '/images/suv.webp', note: 'More room for your favourite people.' },
  { id: 'prime_suv', label: 'Prime SUV', seats: 6, bags: 3, image: '/images/prime-suv.webp', note: 'Settle into a more spacious journey.' },
];
export function calculateFare({ vehicleId, tripType, distanceKm, durationMins = 0 }) {
  if (!Object.hasOwn(rates, tripType) || !Object.hasOwn(rates[tripType], vehicleId)) throw new Error('Select a valid trip and vehicle.');
  if (!Number.isFinite(distanceKm) || distanceKm <= 0 || distanceKm > 10000) throw new Error('A valid driving distance is required.');
  const multiplier = tripType === 'roundtrip' ? 2 : 1;
  const travelKm = Math.round(distanceKm * multiplier * 10) / 10;
  const minimumKm = tripType === 'roundtrip' ? 250 : 130;
  const billableKm = Math.max(travelKm, minimumKm);
  const ratePerKm = rates[tripType][vehicleId];
  const baseFare = Math.round(billableKm * ratePerKm);
  return { travelKm, minimumKm, billableKm, ratePerKm, baseFare, driverAllowance: 400, total: baseFare + 400, durationMins: Math.round(durationMins * multiplier) };
}
