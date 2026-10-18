import assert from 'node:assert/strict';
const base = process.env.INTERCITY_TEST_URL || 'http://127.0.0.1:3011';
const form = { tripType: 'oneway', pickup: 'Coimbatore', drop: 'Chennai', pickupDate: '2099-01-10', pickupTime: '10:30', vehicle: 'sedan', customerName: 'Integration Test', mobile: '9876543210', email: '', womanAlone: false, seniorCitizen: false, travellingWithInfant: false, extraLuggage: false };
async function post(path, data) {
  const response = await fetch(`${base}${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base }, body: JSON.stringify(data) });
  return { status: response.status, data: await response.json() };
}
const quote = await post('/api/fare-estimation', form);
assert.equal(quote.status, 200, JSON.stringify(quote.data));
assert.equal(quote.data.fare.total, 3400);
console.log('PASS: server driving-distance estimate');
const body = { form, token: quote.data.token, requestId: 'test-request-1234567890', event: 'booking-request', fare: { total: 1 }, website: '' };
const submitted = await post('/api/enquiry', body);
assert.equal(submitted.status, 200, JSON.stringify(submitted.data));
assert.equal(submitted.data.delivered, true);
console.log('PASS: notification delivery with server fare, ignoring client total');
const duplicate = await post('/api/enquiry', body);
assert.equal(duplicate.data.reference, submitted.data.reference);
console.log('PASS: duplicate request returns the same reference');
assert.equal((await post('/api/enquiry', { ...body, form: { ...form, drop: 'Madurai' } })).status, 400);
assert.equal((await post('/api/enquiry', { ...body, token: quote.data.token + 'x' })).status, 400);
console.log('PASS: tampered trip and token are rejected');
assert.equal((await post('/api/enquiry', { ...body, event: 'enquiry', token: '' })).status, 200);
console.log('PASS: manual enquiry delivery');
assert.equal((await post('/api/contact', { name: 'Integration Test', mobile: '9876543210', email: '', message: 'Isolated contact form integration test.', requestId: 'test-contact-1234567890', website: '' })).status, 200);
assert.equal((await post('/api/contact', { name: 'Integration Test', mobile: 'bad', email: '', message: 'Invalid number test.', requestId: 'test-contact-1234567890' })).status, 400);
console.log('PASS: contact delivery and server validation');
console.log('All integration checks passed. Upstream Maps and Telegram were mocked.');
