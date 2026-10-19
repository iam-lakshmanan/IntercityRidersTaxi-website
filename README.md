# Intercity Riders

A separate Next.js 16 / React 19 taxi enquiry website with a navy and cyan visual system, responsive pages, Framer Motion, accessible booking forms and server-calculated fares. The original project is unchanged.

## Run locally

Use Node 20.9–24. Run `npm ci`, copy `.env.example` to `.env.local`, configure the required services, then run `npm run dev`. Open http://localhost:3000.

Commands: `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`, `npm start`.

## Configuration

- Update the provisional brand in `lib/site.ts` and matching metadata/logos. Set `NEXT_PUBLIC_SITE_URL` to the real domain. The `.example` domain is deliberately a placeholder.
- Set real `NEXT_PUBLIC_PHONE` (international format, e.g. +91...) and `NEXT_PUBLIC_EMAIL`. Contact details fall back to the original booking phone and email; environment values can override them.
- Google Maps key: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is used for Maps JavaScript, Places and Directions. Enable all three APIs for this key and allow the site origins used in development and production.
- Telegram bot token and chat ID are server-only. Never commit credentials. Both ride requests and the contact form need these values to deliver messages.
- Public environment values are embedded during build; rebuild after changing them.
- Configure a reverse proxy that overwrites an authenticated client IP header, then set `TRUSTED_IP_HEADER` to that header name. Without it, the application uses a shared per-process rate bucket. Do not trust a header clients can spoof.

## Booking rules

One-way / airport per km: Sedan ₹15, Prime Sedan ₹15, SUV ₹20, Prime SUV ₹24. Round trip: ₹14, ₹14, ₹19, ₹22 respectively. Minimum billable distance is 130 km one way / airport and 250 km round trip. Round-trip travel distance and time are doubled. Fixed driver allowance: ₹400. Tolls, permits, hill and carrier charges are extra where applicable. No multi-day pricing is assumed: confirm extended itineraries manually.

`lib/fare.mjs` is the single rate and calculation source. `lib/validation.mjs` validates both browser and API inputs. Google Maps calculates the driving route in the browser, and the server recalculates the fare from the route distance when the customer confirms the booking.

The booking form first sends an enquiry to Telegram, then opens the estimate page. Confirm Booking sends the calculated fare and journey details to Telegram and shows confirmation in the same estimate panel. Drafts expire after two hours.

## Reliability and production limits

Requests have schema validation, body-size limits, same-origin checks, external-service timeouts, rate limiting, a contact honeypot and retry deduplication. Rate limits and idempotency records are held in process memory: use shared Redis/database storage for multi-instance deployment and durable booking records. A process restart loses these records; a timeout after upstream acceptance can still lead to duplicate delivery. Telegram message retention is managed by the operator. The supplied privacy page should be reviewed and finalized for the actual business and its retention practices.

External services are not configured by default. This is intentional: no production credentials were copied. No test messages should be sent to real booking channels. Unit tests mock Telegram; use isolated test accounts for integration testing.

`tests/integration.mjs` checks the actual API handlers against an isolated server on port 3011. Start that server with `tests/mock-upstreams.cjs` preloaded, `INTERCITY_TEST_UPSTREAMS=1` and fake Telegram values. Never enable the mock in normal operation. Run `node tests/integration.mjs` after starting it. The checks cover fare calculation, the initial enquiry, booking confirmation, duplicate submissions, invalid route metrics and contact delivery.

## Design and assets

Palette: #061728, #123A5A, #00A8E8, #F5F8FA. Layouts include editorial service panels, destination photography, fleet cards, route lists and fare tables. Motion respects reduced-motion preferences. Text remains readable before animations run. System fonts avoid build-time font-network dependencies.

Homepage and page banners, plus the logo, are copied from the supplied original project. Destination and example vehicle images: recompressed assets from the supplied original project; confirm reuse rights before public launch. No fabricated statistics or customer reviews are displayed. The traveller-stories section invites authentic feedback.

## Deployment

Build with `npm run build`; run with `npm start` (port 3000). Next.js standalone output is enabled. The Dockerfile accepts public build-time variables; pass server-only secrets at runtime. Place behind HTTPS, validate the contact details/domain, and test Maps and Telegram with isolated test accounts before launch. The service worker is network-only; offline booking is not supported.


## Original website content

The navigation retains Home, About, Services, Tariff, Routes and Contact Us, including /about-us, /service-routes and /contact-us. The homepage includes the complete shared booking form. Original logo and page-specific banner files are in public/images. The footer keeps the original service cities, contact details, social links and developer credit, with the navy/cyan styling. Social profile URLs are carried over from the original source and should be verified by the operator.
