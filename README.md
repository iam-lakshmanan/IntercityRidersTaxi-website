# Intercity Riders

A separate Next.js 16 / React 19 taxi enquiry website with a navy and cyan visual system, responsive pages, Framer Motion, accessible booking forms and server-calculated fares. The original project is unchanged.

## Run locally

Use Node 20.9–24. Run `npm ci`, copy `.env.example` to `.env.local`, configure the required services, then run `npm run dev`. Open http://localhost:3010.

Commands: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm start`.

## Configuration

- Update the provisional brand in `lib/site.ts` and matching metadata/logos. Set `NEXT_PUBLIC_SITE_URL` to the real domain. The `.example` domain is deliberately a placeholder.
- Set real `NEXT_PUBLIC_PHONE` (international format, e.g. +91...) and `NEXT_PUBLIC_EMAIL`. Contact links are omitted until configured.
- Browser Maps key: enable Maps JavaScript API and Places API, restrict to website origins. This public key is intentionally browser-visible.
- Server Maps key: enable Directions API and restrict to the deployment server IP. This key verifies distance independently of browser data.
- Set `QUOTE_SIGNING_SECRET` to a cryptographically random string of at least 32 characters.
- Telegram bot token and chat ID are server-only. Never commit credentials. Both ride requests and the contact form need these values to deliver messages.
- Public environment values are embedded during build; rebuild after changing them.
- Configure a reverse proxy that overwrites an authenticated client IP header, then set `TRUSTED_IP_HEADER` to that header name. Without it, the application uses a shared per-process rate bucket. Do not trust a header clients can spoof.

## Booking rules

One-way / airport per km: Sedan ₹15, Prime Sedan ₹15, SUV ₹20, Prime SUV ₹24. Round trip: ₹14, ₹14, ₹19, ₹22 respectively. Minimum billable distance is 130 km one way / airport and 250 km round trip. Round-trip travel distance and time are doubled. Fixed driver allowance: ₹400. Tolls, permits, hill and carrier charges are extra where applicable. No multi-day pricing is assumed: confirm extended itineraries manually.

`lib/fare.mjs` is the single rate and calculation source. `lib/validation.mjs` validates both browser and API inputs. Quotes last 15 minutes, include an HMAC signature and a hash of the validated journey, and are recalculated at submission. The API ignores browser-supplied totals. When routing is unavailable, customers may request a manual quote; the UI does not invent a fare.

The estimate page can refresh from session storage. Drafts expire after two hours. Successful submissions replace personal draft details with a receipt reference. Delivery success means the request reached the team, not that a car is reserved. No payments, driver dispatch, accounts, reservation database or admin dashboard are included.

## Reliability and production limits

Requests have schema validation, body-size limits, same-origin checks, external-service timeouts, rate limiting, a contact honeypot and retry deduplication. Rate limits and idempotency records are held in process memory: use shared Redis/database storage for multi-instance deployment and durable booking records. A process restart loses these records; a timeout after upstream acceptance can still lead to duplicate delivery. Telegram message retention is managed by the operator. The supplied privacy page should be reviewed and finalized for the actual business and its retention practices.

External services are not configured by default. This is intentional: no production credentials were copied. No test messages should be sent to real booking channels. Unit tests mock Telegram; use isolated test accounts for integration testing.

## Design and assets

Palette: #0B1F33, #123A5A, #00A8E8, #F5F8FA. Layouts include editorial service panels, destination photography, fleet cards, route lists and fare tables. Motion respects reduced-motion preferences. Text remains readable before animations run. System fonts avoid build-time font-network dependencies.

Hero and airport photographs: AI-generated for this project. Destination and example vehicle images: recompressed assets from the supplied original project; confirm reuse rights before public launch. No fabricated statistics or customer reviews are displayed. The traveller-stories section invites authentic feedback.

## Deployment

Build with `npm run build`; run with `npm start` (port 3010). Next.js standalone output is enabled. The Dockerfile accepts public build-time variables; pass server-only secrets at runtime. Place behind HTTPS, validate the contact details/domain, and test Maps and Telegram with isolated test accounts before launch. The service worker is network-only; offline booking is not supported.

