'use client';
import Link from 'next/link';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { GoogleMap, Polyline, Marker, useJsApiLoader, type Libraries } from '@react-google-maps/api';
import { ArrowLeft, ArrowRight, CalendarDays, Car, Check, CheckCircle2, Clock3, Gauge, Navigation, RefreshCw, Route, ShieldCheck, UserRound } from 'lucide-react';
import { useSavedBooking, type SavedBooking } from '@/lib/booking-store';
import { calculateFare, vehicles } from '@/lib/fare.mjs';

const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;
const formatDuration = (minutes: number) => `${Math.floor(minutes / 60)} hrs ${minutes % 60} mins`;
type Point = { lat: number; lng: number };
type Fare = { travelKm: number; minimumKm: number; billableKm: number; ratePerKm: number; baseFare: number; driverAllowance: number; total: number; durationMins: number };
type QuotePreview = { fare: Fare; path: Point[]; start: Point; end: Point; routeDistanceKm: number; routeDurationMins: number };
type Confirmation = { reference: string; delivered: true };
const libraries: Libraries = ['places'];

function WhatsAppIcon() {
  return <svg viewBox="0 0 24 24" width="21" height="21" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.149-.173.198-.297.298-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.9 6.99c-.002 5.45-4.437 9.884-9.892 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.3-1.654a11.882 11.882 0 0 0 5.69 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>;
}

function bookingWhatsAppUrl(form: SavedBooking['form'], quote: QuotePreview, reference: string) {
  if (!form) return '#';
  const tripLabel = form.tripType === 'roundtrip' ? 'Round Trip' : form.tripType === 'airport' ? 'Airport Pickup' : 'One Way';
  const vehicle = vehicles.find(item => item.id === form.vehicle)?.label || '—';
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(form.pickupDate);
  const travelDate = dateMatch ? `${dateMatch[3]}/${dateMatch[2]}/${dateMatch[1]}` : form.pickupDate;
  const requirements = [form.womanAlone ? 'Woman travelling alone' : '', form.seniorCitizen ? 'Senior citizen' : '', form.travellingWithInfant ? 'Travelling with infant' : '', form.extraLuggage ? 'Extra luggage' : ''].filter(Boolean);
  const message = [
    '🚕 *INTERCITY DROP TAXIS*', '*NEW BOOKING CONFIRMATION*', '━━━━━━━━━━━━━━━━━━━━', '',
    '*BOOKING REFERENCE*', `Booking ID: *${reference}*`, '',
    '*CUSTOMER DETAILS*', `• Name: ${form.customerName}`, `• Mobile: ${form.mobile}`, ...(form.email ? [`• Email: ${form.email}`] : []), '',
    '*JOURNEY DETAILS*', `• Service: ${tripLabel}`, `• Vehicle: ${vehicle}`, `• Pickup: ${form.pickup}`, `• Drop: ${form.drop}`, `• Travel date: ${travelDate}`, `• Pickup time: ${form.pickupTime}`, `• Trip distance: ${quote.fare.travelKm.toLocaleString('en-IN')} km`, `• Billable distance: ${quote.fare.billableKm.toLocaleString('en-IN')} km`, '',
    '*FARE SUMMARY*', `• Estimated fare: *${money(quote.fare.total)}*`, `• Rate per km: ${money(quote.fare.ratePerKm)}`, '• Driver allowance: Included', '',
    '*SPECIAL REQUIREMENTS*', requirements.length ? requirements.map(item => `• ${item}`).join('\n') : '• None', '',
    '_Fare excludes toll, permit, parking, hill-station and carrier charges._', '', '*ACTION REQUIRED*',
    'Please contact the customer to finalize the vehicle and driver allocation.',
  ].join('\n');
  const number = (process.env.NEXT_PUBLIC_PHONE || '+919944942223').replace(/\D/g, '');
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function RouteMap({ quote }: { quote: QuotePreview }) {
  return <GoogleMap mapContainerClassName="route-map" center={quote.start} zoom={8} options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: true }} onLoad={map => { const bounds = new google.maps.LatLngBounds(); quote.path.forEach(point => bounds.extend(point)); if (quote.path.length) map.fitBounds(bounds, 46); }}><Polyline path={quote.path} options={{ strokeColor: '#00A8E8', strokeWeight: 6 }} /><Marker position={quote.start} label="A" /><Marker position={quote.end} label="B" /></GoogleMap>;
}

function DetailItem({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return <div className="estimate-detail-item"><span>{icon}</span><div><small>{label}</small><strong>{value}</strong></div></div>;
}

export function Estimate() {
  const saved = useSavedBooking();
  if (!saved?.form) return <section className="section"><div className="site-container receipt"><Route size={45} /><h1>Your next journey awaits.</h1><p>Enter your journey details to see an estimate.</p><Link href="/booking" className="button">Start planning</Link></div></section>;
  return <EstimateJourney key={saved.requestId} saved={saved} />;
}

function EstimateJourney({ saved }: { saved: SavedBooking }) {
  const form = saved.form!;
  const vehicleLabel = vehicles.find(vehicle => vehicle.id === form.vehicle)?.label || '—';
  const tripLabel = form.tripType === 'roundtrip' ? 'Round Trip' : form.tripType === 'airport' ? 'Airport Pickup' : 'One Way';
  const { isLoaded, loadError } = useJsApiLoader({ id: 'riders-google-maps', googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '', libraries, preventGoogleFontsLoading: true });
  const [quote, setQuote] = useState<QuotePreview | null>(null);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const locked = useRef(false);

  useEffect(() => {
    if (loadError || !isLoaded || !window.google?.maps) return;
    let active = true;
    const service = new google.maps.DirectionsService();
    service.route({ origin: form.pickup, destination: form.drop, travelMode: google.maps.TravelMode.DRIVING }, (directions, status) => {
      if (!active) return;
      const route = directions?.routes[0];
      const leg = route?.legs[0];
      if (status !== 'OK' || !route || !leg?.distance?.value || !leg?.duration?.value) {
        setError('We could not calculate this driving route. Please retry.');
        setLoading(false);
        return;
      }
      try {
        const routeDistanceKm = leg.distance.value / 1000;
        const routeDurationMins = leg.duration.value / 60;
        const fare = calculateFare({ vehicleId: form.vehicle, tripType: form.tripType, distanceKm: routeDistanceKm, durationMins: routeDurationMins }) as Fare;
        setQuote({ fare, routeDistanceKm, routeDurationMins, path: route.overview_path.map(point => point.toJSON()), start: leg.start_location.toJSON(), end: leg.end_location.toJSON() });
      } catch {
        setError('We could not calculate this fare. Please retry.');
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, [form, attempt, isLoaded, loadError]);

  const routeError = loadError ? 'Google Maps could not load. Check the API key and enabled APIs.' : error;
  const routeLoading = loadError ? false : loading;

  async function confirmBooking() {
    if (!quote || locked.current) return;
    locked.current = true;
    setBusy(true);
    setSubmitError('');
    try {
      const response = await fetch('/api/enquiry', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ form, requestId: saved.requestId, event: 'booking-confirmed', route: { distanceKm: quote.routeDistanceKm, durationMins: quote.routeDurationMins }, website: '' }),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (!response.ok || !result.delivered) throw new Error(result.error || 'Your booking could not be confirmed. Please try again.');
      setConfirmation(result);
    } catch (submitFailure) {
      setSubmitError(submitFailure instanceof Error ? submitFailure.message : 'Unable to confirm your booking.');
    } finally {
      locked.current = false;
      setBusy(false);
    }
  }

  return <section className="section soft-bg estimate-section"><div className="site-container"><div className="estimate-topbar"><Link className="text-link" href="/booking"><ArrowLeft size={16} /> Edit booking</Link><span>{tripLabel}</span></div><div className="estimate-grid estimate-reference-grid"><article className="fare-panel estimate-main-card">{confirmation && quote ? <div className="estimate-confirmed"><div className="receipt-icon"><CheckCircle2 size={38} /></div><span className="eyebrow">BOOKING RECEIVED</span><h2>Booking Request Received</h2><p>Our booking team will call <strong>{form.mobile}</strong> shortly to confirm your ride details.</p><div className="reference">BOOKING REFERENCE<strong>{confirmation.reference}</strong></div><div className="included-note"><Check size={15} /> Details sent to the booking team</div><a className="button button-full whatsapp-booking-button" href={bookingWhatsAppUrl(form, quote, confirmation.reference)} target="_blank" rel="noreferrer" aria-label="Send confirmed booking details to the booking team on WhatsApp"><WhatsAppIcon /> Send Details to WhatsApp</a></div> : <><div className="estimate-route-title"><span>{form.pickup}</span><Route size={22} /><span>{form.drop}</span></div>{routeLoading ? <div className="quote-loading estimate-loading" role="status"><span className="spinner" /><p>Checking the route and calculating your fare…</p></div> : quote ? <><div className="estimate-fare-box"><strong>{money(quote.fare.total)}</strong><span>Estimated Fare</span></div><div className="estimate-detail-grid"><DetailItem icon={<Route />} label="Distance" value={`${quote.fare.travelKm} km`} /><DetailItem icon={<Gauge />} label="Billable Distance" value={`${quote.fare.billableKm} km`} /><DetailItem icon={<UserRound />} label="Driver Bata" value={money(quote.fare.driverAllowance)} /><DetailItem icon={<Gauge />} label="Rate per KM" value={money(quote.fare.ratePerKm)} /><DetailItem icon={<Navigation />} label="Base Fare" value={money(quote.fare.baseFare)} /><DetailItem icon={<Clock3 />} label="Duration" value={formatDuration(quote.fare.durationMins)} /><DetailItem icon={<ShieldCheck />} label="Tolls & Parking" value="Extra at actuals" /><DetailItem icon={<Car />} label="Vehicle" value={vehicleLabel} /><DetailItem icon={<CalendarDays />} label="Pickup Date" value={form.pickupDate} /><DetailItem icon={<Clock3 />} label="Pickup Time" value={form.pickupTime} /></div><p className="fine-print estimate-note">Minimum {quote.fare.minimumKm} billable km. {form.tripType === 'roundtrip' ? 'Distance includes the return journey. ' : ''}Toll, permit, hill-station and carrier charges are extra.</p><div className="estimate-actions"><Link className="estimate-back-button" href="/booking"><ArrowLeft size={18} /> Back</Link><button className="button" onClick={confirmBooking} disabled={busy}>{busy ? 'Confirming booking…' : 'Confirm Booking'}{!busy && <ArrowRight size={18} />}</button></div><p className="privacy-note"><ShieldCheck size={15} /> Your booking details will be sent to our team through Telegram.</p></> : <div className="estimate-error-state"><p className="error-message" role="status">{routeError}</p><button type="button" className="text-link" onClick={() => { setLoading(true); setError(''); setAttempt(value => value + 1); }}><RefreshCw size={15} /> Retry fare estimate</button></div>}{submitError && <p className="error-message" role="alert">{submitError}</p>}</>}</article><aside className="journey-review estimate-map-card">{quote && isLoaded ? <RouteMap quote={quote} /> : <div className="map-placeholder"><Route size={52} /><strong>{routeLoading ? 'Finding your driving route…' : 'Every good trip starts with a plan.'}</strong><span>{routeLoading ? 'Checking distance and journey time.' : 'Your journey details are ready.'}</span></div>}<div className="estimate-map-summary"><div className="map-route-row from"><span /><small>From</small><strong>{form.pickup}</strong></div><div className="map-route-row to"><span /><small>To</small><strong>{form.drop}</strong></div>{quote && <div className="map-metrics"><span><Route size={18} /> Distance <strong>{quote.fare.travelKm} km</strong></span><span><Clock3 size={18} /> Duration <strong>{formatDuration(quote.fare.durationMins)}</strong></span></div>}</div></aside></div></div></section>;
}
