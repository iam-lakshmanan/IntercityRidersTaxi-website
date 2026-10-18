import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateFare } from '../lib/fare.mjs';
import { tripSchema, contactSchema } from '../lib/validation.mjs';
import { signQuote, verifyQuote, fingerprint } from '../lib/security.mjs';
import { sendNotification } from '../lib/notify.mjs';
const valid = { tripType: 'oneway', pickup: 'Coimbatore', drop: 'Chennai', pickupDate: '2099-01-10', pickupTime: '00:30', vehicle: 'sedan', customerName: 'Test Traveller', mobile: '9876543210', email: '', womanAlone: false, seniorCitizen: false, travellingWithInfant: false, extraLuggage: false };
test('short one-way journeys apply the 130 km minimum and ₹400 allowance', () => {
  const fare = calculateFare({ vehicleId: 'sedan', tripType: 'oneway', distanceKm: 10 });
  assert.equal(fare.billableKm, 130); assert.equal(fare.total, 2350); assert.equal(fare.travelKm, 10);
});
test('round trips double distance and duration and use their own rates', () => {
  const fare = calculateFare({ vehicleId: 'prime_suv', tripType: 'roundtrip', distanceKm: 150, durationMins: 120 });
  assert.equal(fare.travelKm, 300); assert.equal(fare.total, 7000); assert.equal(fare.durationMins, 240);
  assert.equal(calculateFare({ vehicleId: 'sedan', tripType: 'roundtrip', distanceKm: 20 }).billableKm, 250);
});
test('airport journeys use one-way minimum and category rates', () => {
  assert.equal(calculateFare({ vehicleId: 'suv', tripType: 'airport', distanceKm: 20 }).total, 3000);
});
test('untrusted fare inputs cannot select unknown rates or invalid distances', () => {
  for (const distanceKm of [0, -20, Infinity, NaN, '100', 20000]) assert.throws(() => calculateFare({ vehicleId: 'sedan', tripType: 'oneway', distanceKm }));
  assert.throws(() => calculateFare({ vehicleId: 'unknown', tripType: 'oneway', distanceKm: 100 }));
  assert.throws(() => calculateFare({ vehicleId: 'sedan', tripType: '__proto__', distanceKm: 100 }));
});
test('server validation accepts a future early-morning pickup in IST', () => { assert.equal(tripSchema.safeParse(valid).success, true); });
test('validation rejects invalid mobiles, impossible dates, past pickups and identical routes', () => {
  for (const change of [{ mobile: '123' }, { pickupDate: '2099-02-30' }, { pickupDate: '2020-01-01' }, { pickupDate: '2099-13-01' }, { pickupTime: '25:00' }, { drop: valid.pickup }, { vehicle: 'unknown' }]) assert.equal(tripSchema.safeParse({ ...valid, ...change }).success, false);
  assert.equal(contactSchema.safeParse({ name: 'A', mobile: '123', email: '', message: '' }).success, false);
});
test('quote signatures bind the form and reject tampering or expiration', () => {
  const secret = 'a-strong-test-secret-that-is-longer-than-32-characters';
  const quote = { id: 'test', formHash: fingerprint(valid), distanceKm: 100, durationMins: 90, expires: 2000 };
  const token = signQuote(quote, secret);
  assert.deepEqual(verifyQuote(token, secret, 1000), quote);
  assert.throws(() => verifyQuote(token + 'x', secret, 1000));
  assert.throws(() => verifyQuote(token, secret, 3000));
  assert.throws(() => verifyQuote(token, 'different-secret-with-enough-characters', 1000));
  assert.notEqual(fingerprint({ ...valid, drop: 'Madurai' }), quote.formHash);
});
test('missing or rejected Telegram delivery never reports success', async () => {
  let called = false;
  await assert.rejects(sendNotification('test', { fetcher: async () => { called = true; } }));
  assert.equal(called, false);
  await assert.rejects(sendNotification('test', { token: 'mock', chatId: 'mock', fetcher: async () => ({ ok: false, json: async () => ({ ok: false }) }) }));
  await assert.rejects(sendNotification('test', { token: 'mock', chatId: 'mock', fetcher: async () => ({ ok: true, json: async () => ({ ok: false }) }) }));
  assert.equal(await sendNotification('test', { token: 'mock', chatId: 'mock', fetcher: async () => ({ ok: true, json: async () => ({ ok: true }) }) }), true);
});
