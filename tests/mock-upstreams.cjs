// Only loaded explicitly by the isolated integration-test server.
if (process.env.INTERCITY_TEST_UPSTREAMS !== '1') throw new Error('Test upstreams require explicit opt-in.');
const originalFetch = globalThis.fetch;
globalThis.fetch = async function(input, init) {
  const url = String(input instanceof Request ? input.url : input);
  if (url.startsWith('https://maps.googleapis.com/maps/api/directions/json?')) return Response.json({ status: 'OK', routes: [{ overview_polyline: { points: '_p~iF~ps|U_ulLnnqC_mqNvxq`@' }, legs: [{ distance: { value: 200000 }, duration: { value: 10800 }, start_location: { lat: 11.0168, lng: 76.9558 }, end_location: { lat: 13.0827, lng: 80.2707 } }] }] });
  if (url.startsWith('https://api.telegram.org/bot')) {
    const body = JSON.parse(init.body);
    if (body.text.startsWith('NEW RIDE REQUEST') && !body.text.includes('Estimated fare: ₹3400')) return Response.json({ ok: false }, { status: 400 });
    return Response.json({ ok: true, result: { message_id: 1 } });
  }
  if (url.startsWith('https://')) throw new Error('External network disabled in integration tests.');
  return originalFetch(input, init);
};
