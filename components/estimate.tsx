'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { GoogleMap, Polyline, Marker, useJsApiLoader, type Libraries } from '@react-google-maps/api';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Clock3, MapPin, Route, ShieldCheck, RefreshCw, Send } from 'lucide-react';
import { useSavedBooking, saveBooking, type SavedBooking } from '@/lib/booking-store';
import { vehicles } from '@/lib/fare.mjs';
const money = (n: number) => `₹${n.toLocaleString('en-IN')}`;
type Fare = { travelKm: number; minimumKm: number; billableKm: number; ratePerKm: number; baseFare: number; driverAllowance: number; total: number; durationMins: number };
type Quote = { fare: Fare; token: string; expires: number; polyline: string; start: { lat: number; lng: number }; end: { lat: number; lng: number } };
const libraries: Libraries = ['places'];
function decodePolyline(encoded: string) {
  const points = []; let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let result = 0, shift = 0, byte;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 31) << shift; shift += 5; } while (byte >= 32);
    lat += result & 1 ? ~(result >> 1) : result >> 1; result = 0; shift = 0;
    do { byte = encoded.charCodeAt(index++) - 63; result |= (byte & 31) << shift; shift += 5; } while (byte >= 32);
    lng += result & 1 ? ~(result >> 1) : result >> 1; points.push({ lat: lat / 1e5, lng: lng / 1e5 });
  } return points;
}
function RouteMap({ quote }: { quote: Quote }) {
  const { isLoaded, loadError } = useJsApiLoader({ id: 'riders-google-maps', googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '', libraries, preventGoogleFontsLoading: true });
  if (!isLoaded || loadError) return <div className="map-placeholder"><Route size={36} /><span>{loadError ? 'Map preview unavailable. Your verified route estimate is shown below.' : 'Loading your route…'}</span></div>;
  const points = decodePolyline(quote.polyline);
  return <GoogleMap mapContainerClassName="route-map" center={quote.start} zoom={8} options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }} onLoad={map => { const bounds = new google.maps.LatLngBounds(); points.forEach(p => bounds.extend(p)); if (points.length) map.fitBounds(bounds, 45); }}><Polyline path={points} options={{ strokeColor: '#00A8E8', strokeWeight: 5 }} /><Marker position={quote.start} label="A" /><Marker position={quote.end} label="B" /></GoogleMap>;
}
export function Estimate() {
  const saved = useSavedBooking();
  if (saved?.receipt) return <section className="section"><div className="container receipt"><div className="receipt-icon"><CheckCircle2 size={42} /></div><span className="eyebrow">YOU’RE ONE STEP CLOSER</span><h1>Your request is with us.</h1><p>Our booking team will contact you to confirm availability and your final journey details. A vehicle has not yet been reserved.</p><div className="reference">YOUR REFERENCE<strong>{saved.receipt}</strong></div><p className="fine-print">Save this reference for any follow-up. Your personal trip details have been cleared from this browser session.</p><Link href="/booking" className="button">Plan another journey <ArrowRight size={17} /></Link></div></section>;
  if (!saved?.form) return <section className="section"><div className="container receipt"><Route size={45} /><h1>Your next journey awaits.</h1><p>Enter your journey details to see an estimate. For privacy, saved details expire after two hours.</p><Link href="/booking" className="button">Start planning <ArrowRight size={17} /></Link></div></section>;
  return <EstimateJourney key={saved.requestId} saved={saved} />;
}
function EstimateJourney({ saved }: { saved: SavedBooking }) {
  const form = saved.form!;
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const locked = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/fare-estimation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form), signal: controller.signal }).then(async res => {
      const data = await res.json(); if (!res.ok) throw new Error(data.error || 'The route could not be calculated.'); return data;
    }).then(data => { setQuote(data); setLoading(false); }).catch(error => { if (!controller.signal.aborted) { setError(error.message); setLoading(false); } });
    return () => controller.abort();
  }, [form, attempt]);
  async function submit(manual: boolean) {
    if (locked.current) return; locked.current = true; setBusy(true); setSubmitError('');
    try {
      const response = await fetch('/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ form, requestId: saved.requestId, event: manual ? 'enquiry' : 'booking-request', token: quote?.token || '', website: '' }), signal: AbortSignal.timeout(20000) });
      const result = await response.json(); if (!response.ok || !result.delivered) throw new Error(result.error || 'Your request was not delivered. Please try again.');
      saveBooking({ requestId: saved.requestId, receipt: result.reference, expires: Date.now() + 2 * 60 * 60 * 1000 });
    } catch (error) { setSubmitError(error instanceof Error ? error.message : 'Unable to send your request.'); } finally { locked.current = false; setBusy(false); }
  }
  const edit = '/booking';
  return <section className="section soft-bg"><div className="container"><Link className="text-link back-link" href={edit}><ArrowLeft size={16} /> Edit your journey</Link><div className="estimate-grid"><div className="journey-review"><div className="review-header"><span className="eyebrow">HERE’S THE PLAN</span><h2>A clearer road ahead.</h2></div>{quote && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? <RouteMap quote={quote} /> : <div className="map-placeholder"><Route size={52} /><strong>{loading ? 'Finding your driving route…' : 'Every good trip starts with a plan.'}</strong><span>{loading ? 'Checking distance and journey time.' : 'Your journey details are ready for our team.'}</span></div>}<div className="review-content"><div className="route-line"><MapPin /><div><small>PICKUP</small><strong>{form.pickup}</strong></div></div><div className="route-line"><MapPin /><div><small>DESTINATION</small><strong>{form.drop}</strong></div></div><div className="review-meta"><span><Clock3 size={16} /> {form.pickupDate} · {form.pickupTime} IST</span><span>{vehicles.find(v => v.id === form.vehicle)?.label} · {form.tripType === 'roundtrip' ? 'Round trip' : form.tripType === 'airport' ? 'Airport transfer' : 'One way'}</span></div>{quote && <div className="route-metrics"><div><small>DRIVING DISTANCE</small><strong>{quote.fare.travelKm} km</strong></div><div><small>DRIVING TIME</small><strong>{Math.floor(quote.fare.durationMins / 60)}h {quote.fare.durationMins % 60}m</strong></div></div>}</div></div><aside className="fare-panel"><span className="eyebrow">NO GUESSWORK</span><h2>{quote ? 'Your fare estimate.' : 'Let’s get you a quote.'}</h2>{loading ? <div className="quote-loading" role="status"><span className="spinner" /><p>Checking the route and calculating your fare…</p></div> : quote ? <><div className="fare-total">{money(quote.fare.total)}<span>estimated trip fare</span></div><div className="fare-lines"><p><span>{quote.fare.billableKm} billable km × {money(quote.fare.ratePerKm)}</span><strong>{money(quote.fare.baseFare)}</strong></p><p><span>Driver allowance</span><strong>{money(quote.fare.driverAllowance)}</strong></p><p><span>Estimate total</span><strong>{money(quote.fare.total)}</strong></p></div><p className="fine-print">Minimum {quote.fare.minimumKm} billable km. {form.tripType === 'roundtrip' ? 'Distance includes the return journey. ' : ''}Toll, permit, hill-station and carrier charges are extra. Quote valid for 15 minutes.</p><div className="included-note"><Check size={15} /> Calculated from a verified driving route</div></> : <><p className="error-message" role="status">{error}</p><p>Send your itinerary to the team for a personal fare quote.</p><button type="button" className="text-link" onClick={() => { setLoading(true); setError(''); setAttempt(a => a + 1); }}><RefreshCw size={15} /> Retry live estimate</button></>}{!loading && <><button className="button button-full" onClick={() => submit(!quote)} disabled={busy}>{busy ? 'Sending your request…' : quote ? 'Request this ride' : 'Request a manual quote'}{!busy && <Send size={16} />}</button><p className="privacy-note"><ShieldCheck size={15} /> Our team will confirm availability. No payment required here.</p></>}{submitError && <p className="error-message" role="alert">{submitError}</p>}</aside></div></div></section>;
}
