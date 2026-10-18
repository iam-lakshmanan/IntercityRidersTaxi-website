'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { GoogleMap, Polyline, Marker, useJsApiLoader, type Libraries } from '@react-google-maps/api';
import { ArrowLeft, Check, CheckCircle2, Clock3, MapPin, Route, ShieldCheck, RefreshCw } from 'lucide-react';
import { useSavedBooking, type SavedBooking } from '@/lib/booking-store';
import { calculateFare, vehicles } from '@/lib/fare.mjs';

const money = (value: number) => `₹${value.toLocaleString('en-IN')}`;
type Point = { lat: number; lng: number };
type Fare = { travelKm: number; minimumKm: number; billableKm: number; ratePerKm: number; baseFare: number; driverAllowance: number; total: number; durationMins: number };
type QuotePreview = { fare: Fare; path: Point[]; start: Point; end: Point; routeDistanceKm: number; routeDurationMins: number };
type Confirmation = { reference: string; delivered: true };
const libraries: Libraries = ['places'];

function RouteMap({ quote }: { quote: QuotePreview }) {
  return <GoogleMap mapContainerClassName="route-map" center={quote.start} zoom={8} options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }} onLoad={map => { const bounds = new google.maps.LatLngBounds(); quote.path.forEach(point => bounds.extend(point)); if (quote.path.length) map.fitBounds(bounds, 45); }}><Polyline path={quote.path} options={{ strokeColor: '#00A8E8', strokeWeight: 5 }} /><Marker position={quote.start} label="A" /><Marker position={quote.end} label="B" /></GoogleMap>;
}

export function Estimate() {
  const saved = useSavedBooking();
  if (!saved?.form) return <section className="section"><div className="site-container receipt"><Route size={45} /><h1>Your next journey awaits.</h1><p>Enter your journey details to see an estimate.</p><Link href="/booking" className="button">Start planning</Link></div></section>;
  return <EstimateJourney key={saved.requestId} saved={saved} />;
}

function EstimateJourney({ saved }: { saved: SavedBooking }) {
  const form = saved.form!;
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          form,
          requestId: saved.requestId,
          event: 'booking-confirmed',
          route: { distanceKm: quote.routeDistanceKm, durationMins: quote.routeDurationMins },
          website: '',
        }),
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

  return <section className="section soft-bg"><div className="site-container"><Link className="text-link back-link" href="/booking"><ArrowLeft size={16} /> Edit booking</Link><div className="estimate-grid"><div className="journey-review"><div className="review-header"><span className="eyebrow">HERE’S THE PLAN</span><h2>A clearer road ahead.</h2></div>{quote && isLoaded ? <RouteMap quote={quote} /> : <div className="map-placeholder"><Route size={52} /><strong>{routeLoading ? 'Finding your driving route…' : 'Every good trip starts with a plan.'}</strong><span>{routeLoading ? 'Checking distance and journey time.' : 'Your journey details are ready.'}</span></div>}<div className="review-content"><div className="route-line"><MapPin /><div><small>PICKUP</small><strong>{form.pickup}</strong></div></div><div className="route-line"><MapPin /><div><small>DESTINATION</small><strong>{form.drop}</strong></div></div><div className="review-meta"><span><Clock3 size={16} /> {form.pickupDate} · {form.pickupTime} IST</span><span>{vehicles.find(vehicle => vehicle.id === form.vehicle)?.label} · {form.tripType === 'roundtrip' ? 'Round trip' : form.tripType === 'airport' ? 'Airport transfer' : 'One way'}</span></div>{quote && <div className="route-metrics"><div><small>DRIVING DISTANCE</small><strong>{quote.fare.travelKm} km</strong></div><div><small>DRIVING TIME</small><strong>{Math.floor(quote.fare.durationMins / 60)}h {quote.fare.durationMins % 60}m</strong></div></div>}</div></div><aside className="fare-panel">{confirmation ? <div className="estimate-confirmed"><div className="receipt-icon"><CheckCircle2 size={38} /></div><span className="eyebrow">BOOKING RECEIVED</span><h2>Booking Request Received</h2><p>Our booking team will call <strong>{form.mobile}</strong> shortly to confirm your ride details.</p><div className="reference">BOOKING REFERENCE<strong>{confirmation.reference}</strong></div><div className="included-note"><Check size={15} /> Details sent to the booking team</div></div> : <><span className="eyebrow">YOUR ESTIMATE</span><h2>{quote ? 'Review and confirm.' : 'Calculating your fare.'}</h2>{routeLoading ? <div className="quote-loading" role="status"><span className="spinner" /><p>Checking the route and calculating your fare…</p></div> : quote ? <><div className="fare-total">{money(quote.fare.total)}<span>estimated trip fare</span></div><div className="fare-lines"><p><span>{quote.fare.billableKm} billable km × {money(quote.fare.ratePerKm)}</span><strong>{money(quote.fare.baseFare)}</strong></p><p><span>Driver allowance</span><strong>{money(quote.fare.driverAllowance)}</strong></p><p><span>Estimate total</span><strong>{money(quote.fare.total)}</strong></p></div><p className="fine-print">Minimum {quote.fare.minimumKm} billable km. {form.tripType === 'roundtrip' ? 'Distance includes the return journey. ' : ''}Toll, permit, hill-station and carrier charges are extra.</p><div className="included-note"><Check size={15} /> Calculated from your Google driving route</div></> : <><p className="error-message" role="status">{routeError}</p><button type="button" className="text-link" onClick={() => { setLoading(true); setError(''); setAttempt(value => value + 1); }}><RefreshCw size={15} /> Retry fare estimate</button></>} {!routeLoading && quote && <><button className="button button-full" onClick={confirmBooking} disabled={busy}>{busy ? 'Confirming booking…' : 'Confirm Booking'}</button><p className="privacy-note"><ShieldCheck size={15} /> Your booking details will be sent to our team through Telegram.</p></>}{submitError && <p className="error-message" role="alert">{submitError}</p>}</>}</aside></div></div></section>;
}
