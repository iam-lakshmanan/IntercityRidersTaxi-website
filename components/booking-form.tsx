'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Autocomplete, useJsApiLoader, type Libraries } from '@react-google-maps/api';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, LockKeyhole, Plane, RefreshCw, Route } from 'lucide-react';
import { tripSchema } from '@/lib/validation.mjs';
import { vehicles } from '@/lib/fare.mjs';
import { beginBooking, useSavedBooking, type TripForm } from '@/lib/booking-store';
const libraries: Libraries = ['places'];
function PlaceInput({ value, onChange, name, invalid }: { value: string; onChange: (value: string) => void; name: string; invalid?: boolean }) {
  const autocomplete = useRef<google.maps.places.Autocomplete | null>(null);
  return <Autocomplete onLoad={instance => { autocomplete.current = instance; }} options={{ componentRestrictions: { country: 'in' }, fields: ['formatted_address', 'name'] }} onPlaceChanged={() => { const place = autocomplete.current?.getPlace(); if (place?.formatted_address || place?.name) onChange(place.formatted_address || place.name || ''); }}><input id={name} name={name} value={value} onChange={e => onChange(e.target.value)} placeholder={name === 'pickup' ? 'City, airport or full address' : 'Where are you heading?'} aria-invalid={invalid} aria-describedby={invalid ? `${name}-error` : undefined} onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }} /></Autocomplete>;
}
export function BookingForm({ initial = {} }: { initial?: Partial<TripForm> }) {
  const saved = useSavedBooking();
  const values = { ...saved?.form, ...initial };
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? <MapsForm key={JSON.stringify(values)} initial={values} /> : <BookingFields key={JSON.stringify(values)} initial={values} mapsLoaded={false} />;
}
function MapsForm({ initial }: { initial: Partial<TripForm> }) {
  const { isLoaded } = useJsApiLoader({ id: 'riders-google-maps', googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '', libraries, preventGoogleFontsLoading: true });
  return <BookingFields initial={initial} mapsLoaded={isLoaded} />;
}
function BookingFields({ initial, mapsLoaded: isLoaded }: { initial: Partial<TripForm>; mapsLoaded: boolean }) {
  const router = useRouter();
  const [formError, setFormError] = useState('');
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<TripForm>({ resolver: zodResolver(tripSchema), defaultValues: {
    tripType: 'oneway', pickup: '', drop: '', pickupDate: '', pickupTime: '', vehicle: 'sedan', customerName: '', mobile: '', email: '', womanAlone: false, seniorCitizen: false, travellingWithInfant: false, extraLuggage: false, ...initial,
  } });
  const tripType = useWatch({ control, name: 'tripType' });
  const vehicle = useWatch({ control, name: 'vehicle' });
  const fieldError = (name: keyof TripForm) => errors[name] ? <span className="field-error" id={`${name}-error`}>{errors[name]?.message}</span> : null;
  return <form className="booking-form" noValidate onSubmit={handleSubmit(values => {
    try { beginBooking(values); router.push('/estimate'); } catch { setFormError('We could not prepare your journey. Please try again.'); }
  })}>
    <div className="form-step-heading"><span>01</span><div><h2>Your journey</h2><p>Start with the where and when.</p></div></div>
    <div className="booking-trip-tabs">{[{ id: 'oneway', label: 'One way', Icon: Route }, { id: 'roundtrip', label: 'Round trip', Icon: RefreshCw }, { id: 'airport', label: 'Airport', Icon: Plane }].map(({ id, label, Icon }) => <label key={id} className={tripType === id ? 'selected' : ''}><input type="radio" value={id} {...register('tripType')} /><Icon size={17} />{label}</label>)}</div>
    <div className="form-grid">{(['pickup', 'drop'] as const).map(name => <div className="field" key={name}><label htmlFor={name}>{name === 'pickup' ? (tripType === 'airport' ? 'Pickup airport / address' : 'Pickup location') : 'Drop location'}</label><Controller control={control} name={name} render={({ field }) => isLoaded && key ? <PlaceInput {...field} invalid={!!errors[name]} /> : <input id={name} {...field} placeholder={name === 'pickup' ? 'City, airport or address' : 'Your destination'} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-error` : undefined} />} />{fieldError(name)}</div>)}
    <div className="field"><label htmlFor="pickupDate">Pickup date</label><input type="date" id="pickupDate" min={new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())} {...register('pickupDate')} aria-invalid={!!errors.pickupDate} aria-describedby={errors.pickupDate ? 'pickupDate-error' : undefined} />{fieldError('pickupDate')}</div><div className="field"><label htmlFor="pickupTime">Pickup time <small>(IST)</small></label><input type="time" id="pickupTime" {...register('pickupTime')} aria-invalid={!!errors.pickupTime} />{fieldError('pickupTime')}</div></div>
    <p className="form-help">{key && isLoaded ? 'Choose a suggested location for a more precise route.' : 'Enter a full address or city. If live routing is unavailable, our team can provide a manual quote.'}</p>
    <fieldset className="vehicle-fieldset"><legend>Choose your comfort</legend><div className="vehicle-options">{vehicles.map(v => <label key={v.id} className={vehicle === v.id ? 'selected' : ''}><input type="radio" value={v.id} {...register('vehicle')} /><span><strong>{v.label}</strong><small>{v.seats} passengers</small></span><span className="radio-indicator">{vehicle === v.id && <Check size={12} />}</span></label>)}</div>{fieldError('vehicle')}</fieldset>
    <div className="form-step-heading second"><span>02</span><div><h2>A little about you</h2><p>So our team can help you on your way.</p></div></div>
    <div className="form-grid">{([{ name: 'customerName', label: 'Full name', type: 'text', placeholder: 'Your name', autoComplete: 'name' }, { name: 'mobile', label: 'Mobile number', type: 'tel', placeholder: '10-digit Indian mobile', autoComplete: 'tel-national' }, { name: 'email', label: 'Email address (optional)', type: 'email', placeholder: 'you@example.com', autoComplete: 'email' }] as const).map(f => <div className={`field ${f.name === 'email' ? 'full-width' : ''}`} key={f.name}><label htmlFor={f.name}>{f.label}</label><input id={f.name} type={f.type} placeholder={f.placeholder} autoComplete={f.autoComplete} {...register(f.name)} aria-invalid={!!errors[f.name]} aria-describedby={errors[f.name] ? `${f.name}-error` : undefined} />{fieldError(f.name)}</div>)}</div>
    <fieldset className="requirements"><legend>Anything we should know? <small>(optional)</small></legend><div>{([{ key: 'womanAlone', label: 'Woman travelling alone' }, { key: 'seniorCitizen', label: 'Senior traveller' }, { key: 'travellingWithInfant', label: 'Travelling with an infant' }, { key: 'extraLuggage', label: 'Extra luggage' }] as const).map(r => <label key={r.key}><input type="checkbox" {...register(r.key)} />{r.label}</label>)}</div></fieldset>
    {formError && <p className="error-message" role="alert">{formError}</p>}
    <button type="submit" className="button button-full" disabled={isSubmitting}>{isSubmitting ? 'Preparing your journey…' : 'See my fare estimate'}<ArrowRight size={18} /></button><p className="privacy-note"><LockKeyhole size={13} /> Your details are used to help arrange this journey. <Link href="/privacy">Privacy policy</Link></p>
  </form>;
}
