'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Autocomplete, useJsApiLoader, type Libraries } from '@react-google-maps/api';
import { useRouter } from 'next/navigation';
import { ArrowRight, CalendarDays, CarFront, Check, Clock3, MapPin, Plane, RefreshCw, Route, UserRound } from 'lucide-react';
import { tripSchema } from '@/lib/validation.mjs';
import { rates, vehicles } from '@/lib/fare.mjs';
import { beginBooking, useSavedBooking, type TripForm } from '@/lib/booking-store';

const libraries: Libraries = ['places'];
const airports = ['Chennai International Airport (MAA)', 'Coimbatore International Airport (CJB)', 'Madurai Airport (IXM)', 'Tiruchirappalli International Airport (TRZ)', 'Salem Airport (SXV)', 'Thoothukudi Airport (TCR)', 'Neyveli Airport (NVY)', 'Vellore Airport (VOVR)', 'Hosur Aerodrome (VO95)'];

function PlaceInput({ value, onChange, onBlur, name, invalid, placeholder }: { value: string; onChange: (value: string) => void; onBlur: () => void; name: 'pickup' | 'drop'; invalid?: boolean; placeholder: string }) {
  const autocomplete = useRef<google.maps.places.Autocomplete | null>(null);
  return <Autocomplete onLoad={instance => { autocomplete.current = instance; }} options={{ componentRestrictions: { country: 'in' }, fields: ['formatted_address', 'name'] }} onPlaceChanged={() => { const place = autocomplete.current?.getPlace(); if (place?.formatted_address || place?.name) onChange(place.formatted_address || place.name || ''); }}><input id={name} name={name} value={value} onChange={event => onChange(event.target.value)} onBlur={onBlur} placeholder={placeholder} autoComplete="off" aria-invalid={invalid} aria-describedby={invalid ? `${name}-error` : undefined} onKeyDown={event => { if (event.key === 'Enter') event.preventDefault(); }} /></Autocomplete>;
}

function StepHeading({ number, title }: { number: string; title: string }) {
  return <div className="form-step-heading"><span>{number}</span><div><h2>{title}</h2></div></div>;
}

export type RouteDraft = { pickup: string; drop: string };

export function BookingForm({ initial = {}, onRouteChange }: { initial?: Partial<TripForm>; onRouteChange?: (route: RouteDraft) => void }) {
  const saved = useSavedBooking();
  const values = { ...saved?.form, ...initial };
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? <MapsForm key={JSON.stringify(values)} initial={values} onRouteChange={onRouteChange} /> : <BookingFields key={JSON.stringify(values)} initial={values} mapsLoaded={false} onRouteChange={onRouteChange} />;
}

function MapsForm({ initial, onRouteChange }: { initial: Partial<TripForm>; onRouteChange?: (route: RouteDraft) => void }) {
  const { isLoaded } = useJsApiLoader({ id: 'riders-google-maps', googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '', libraries, preventGoogleFontsLoading: true });
  return <BookingFields initial={initial} mapsLoaded={isLoaded} onRouteChange={onRouteChange} />;
}

function BookingFields({ initial, mapsLoaded: isLoaded, onRouteChange }: { initial: Partial<TripForm>; mapsLoaded: boolean; onRouteChange?: (route: RouteDraft) => void }) {
  const router = useRouter();
  const [formError, setFormError] = useState('');
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  const { register, handleSubmit, control, setValue, formState: { errors, isSubmitting } } = useForm<TripForm>({ resolver: zodResolver(tripSchema), defaultValues: { tripType: 'oneway', pickup: '', drop: '', pickupDate: '', pickupTime: '', vehicle: '' as TripForm['vehicle'], customerName: '', mobile: '', email: '', womanAlone: false, seniorCitizen: false, travellingWithInfant: false, extraLuggage: false, ...initial }, mode: 'onBlur' });
  const tripType = useWatch({ control, name: 'tripType' }) || 'oneway';
  const vehicle = useWatch({ control, name: 'vehicle' });
  const pickup = useWatch({ control, name: 'pickup' }) || '';
  const drop = useWatch({ control, name: 'drop' }) || '';
  useEffect(() => { onRouteChange?.({ pickup, drop }); }, [pickup, drop, onRouteChange]);
  const fieldError = (name: keyof TripForm) => errors[name] ? <span className="field-error" id={`${name}-error`}>{errors[name]?.message}</span> : null;

  async function submit(values: TripForm) {
    setFormError('');
    const requestId = crypto.randomUUID();
    try {
      const response = await fetch('/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ form: values, event: 'enquiry', requestId, website: '' }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'We could not send your enquiry. Please try again.');
      beginBooking(values, requestId);
      router.push('/estimate');
    } catch (error) { setFormError(error instanceof Error ? error.message : 'We could not send your enquiry. Please try again.'); }
  }

  const changeTripType = (next: TripForm['tripType']) => { if (next !== tripType) setValue('drop', '', { shouldValidate: false }); setValue('tripType', next, { shouldDirty: true, shouldValidate: true }); };

  return <form className="booking-form previous-form-flow" noValidate onSubmit={handleSubmit(submit)}>
    <div className="booking-form-intro"><span><CarFront size={23} /></span><div><strong>Build your ride</strong><small>Four quick steps to your fare estimate</small></div></div>
    <StepHeading number="01" title="Choose trip type" />
    <div className="booking-trip-tabs">{[{ id: 'oneway' as const, label: 'One Way', Icon: Route }, { id: 'roundtrip' as const, label: 'Round trip', Icon: RefreshCw }, { id: 'airport' as const, label: 'Airport pickup', Icon: Plane }].map(({ id, label, Icon }) => <button type="button" key={id} className={tripType === id ? 'selected' : ''} onClick={() => changeTripType(id)} aria-pressed={tripType === id}><Icon size={18} />{label}</button>)}</div>
    <div className="form-grid route-fields">
      <div className="field"><label htmlFor="pickup">Pickup Location</label><Controller control={control} name="pickup" render={({ field }) => isLoaded && key ? <PlaceInput {...field} name="pickup" invalid={!!errors.pickup} placeholder="Enter pickup location" /> : <input id="pickup" {...field} autoComplete="off" placeholder="Enter pickup location" aria-invalid={!!errors.pickup} aria-describedby={errors.pickup ? 'pickup-error' : undefined} />} />{fieldError('pickup')}</div>
      <div className="field"><label htmlFor="drop">{tripType === 'airport' ? 'Airport' : 'Drop Location'}</label><Controller control={control} name="drop" render={({ field }) => tripType === 'airport' ? <select id="drop" {...field} aria-invalid={!!errors.drop} aria-describedby={errors.drop ? 'drop-error' : undefined}><option value="">Select an airport</option>{airports.map(airport => <option key={airport} value={airport}>{airport}</option>)}</select> : isLoaded && key ? <PlaceInput {...field} name="drop" invalid={!!errors.drop} placeholder="Enter drop location" /> : <input id="drop" {...field} autoComplete="off" placeholder="Enter drop location" aria-invalid={!!errors.drop} aria-describedby={errors.drop ? 'drop-error' : undefined} />} />{fieldError('drop')}</div>
    </div>
    <StepHeading number="02" title="Schedule pickup" />
    <div className="form-grid schedule-fields">
      <div className="field field-with-icon"><label htmlFor="pickupDate">Pickup Date</label><span><CalendarDays size={17} /></span><input type="date" id="pickupDate" min={new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date())} {...register('pickupDate')} aria-invalid={!!errors.pickupDate} aria-describedby={errors.pickupDate ? 'pickupDate-error' : undefined} />{fieldError('pickupDate')}</div>
      <div className="field field-with-icon"><label htmlFor="pickupTime">Pickup Time</label><span><Clock3 size={17} /></span><input type="time" id="pickupTime" {...register('pickupTime')} aria-invalid={!!errors.pickupTime} aria-describedby={errors.pickupTime ? 'pickupTime-error' : undefined} />{fieldError('pickupTime')}</div>
    </div>
    <StepHeading number="03" title="Passenger details" />
    <div className="form-grid passenger-fields">
      <div className="field field-with-icon"><label htmlFor="customerName">Customer Name</label><span><UserRound size={17} /></span><input id="customerName" placeholder="Full name" autoComplete="name" {...register('customerName')} aria-invalid={!!errors.customerName} aria-describedby={errors.customerName ? 'customerName-error' : undefined} />{fieldError('customerName')}</div>
      <div className="field"><label htmlFor="mobile">Mobile Number</label><div className="mobile-input"><span>+91</span><input id="mobile" type="tel" inputMode="numeric" maxLength={10} placeholder="10-digit number" autoComplete="tel-national" {...register('mobile')} aria-invalid={!!errors.mobile} aria-describedby={errors.mobile ? 'mobile-error' : undefined} /></div>{fieldError('mobile')}</div>
    </div>
    <StepHeading number="04" title="Choose your cab" />
    <fieldset className="vehicle-fieldset"><legend className="sr-only">Select Cab Type</legend><div className="vehicle-options visual-vehicle-options">{vehicles.map(item => { const selected = vehicle === item.id; const rate = rates[tripType][item.id as keyof typeof rates.oneway]; return <label key={item.id} className={selected ? 'selected' : ''}><input type="radio" value={item.id} {...register('vehicle')} /><Image src={item.image} alt={item.label} width={130} height={72} sizes="(max-width: 600px) 42vw, 150px" /><span className="vehicle-card-copy"><strong>{item.label}</strong><small>{item.seats} passengers</small></span><span className="vehicle-card-rate">₹{rate}<small>/km</small></span><span className="radio-indicator">{selected && <Check size={12} />}</span></label>; })}</div>{fieldError('vehicle')}</fieldset>
    {formError && <p className="error-message" role="alert">{formError}</p>}
    <button type="submit" className="button button-full booking-submit" disabled={isSubmitting}>{isSubmitting ? 'Sending enquiry…' : 'Get fare estimation'}{!isSubmitting && <ArrowRight size={18} />}</button>
    <p className="form-submit-note"><MapPin size={14} /> Your route details continue to the fare estimate page.</p>
  </form>;
}
