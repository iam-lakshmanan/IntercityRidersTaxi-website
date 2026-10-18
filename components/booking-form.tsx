'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useJsApiLoader, type Libraries } from '@react-google-maps/api';
import { useRouter } from 'next/navigation';
import { ArrowRight, CalendarDays, CarFront, Check, ChevronDown, ChevronLeft, ChevronRight, Clock3, MapPin, Plane, RefreshCw, Route, UserRound } from 'lucide-react';
import { tripSchema } from '@/lib/validation.mjs';
import { rates, vehicles } from '@/lib/fare.mjs';
import { beginBooking, useSavedBooking, type TripForm } from '@/lib/booking-store';

const libraries: Libraries = ['places'];
const airports = ['Chennai International Airport (MAA)', 'Coimbatore International Airport (CJB)', 'Madurai Airport (IXM)', 'Tiruchirappalli International Airport (TRZ)', 'Salem Airport (SXV)', 'Thoothukudi Airport (TCR)', 'Neyveli Airport (NVY)', 'Vellore Airport (VOVR)', 'Hosur Aerodrome (VO95)'];

type PlaceSuggestion = google.maps.places.AutocompleteSuggestion;

function PlaceInput({ value, onChange, onBlur, name, invalid, placeholder }: { value: string; onChange: (value: string) => void; onBlur: () => void; name: 'pickup' | 'drop'; invalid?: boolean; placeholder: string }) {
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);
  const sessionToken = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const selectedValue = useRef('');
  const listId = `${name}-place-suggestions`;

  useEffect(() => {
    const query = value.trim();
    if (query === selectedValue.current || query.length < 2 || !window.google?.maps) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    const currentRequest = ++requestId.current;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      try {
        const places = await google.maps.importLibrary('places') as google.maps.PlacesLibrary;
        sessionToken.current ||= new places.AutocompleteSessionToken();
        const response = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: query,
          includedRegionCodes: ['in'],
          language: 'en',
          region: 'in',
          sessionToken: sessionToken.current,
        });
        if (currentRequest === requestId.current) {
          setSuggestions(response.suggestions.filter(item => item.placePrediction).slice(0, 6));
          setActiveIndex(-1);
        }
      } catch {
        if (currentRequest === requestId.current) setSuggestions([]);
      } finally {
        if (currentRequest === requestId.current) setLoading(false);
      }
    }, 280);

    return () => window.clearTimeout(timer);
  }, [value]);

  async function chooseSuggestion(suggestion: PlaceSuggestion) {
    const prediction = suggestion.placePrediction;
    if (!prediction) return;
    let nextValue = prediction.text.toString();
    try {
      const place = prediction.toPlace();
      await place.fetchFields({ fields: ['displayName', 'formattedAddress'] });
      nextValue = place.formattedAddress || place.displayName || nextValue;
    } catch {
      // The prediction text is a complete route-ready address fallback.
    }
    selectedValue.current = nextValue;
    sessionToken.current = null;
    setSuggestions([]);
    setActiveIndex(-1);
    onChange(nextValue);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown' && suggestions.length) {
      event.preventDefault();
      setActiveIndex(index => (index + 1) % suggestions.length);
    } else if (event.key === 'ArrowUp' && suggestions.length) {
      event.preventDefault();
      setActiveIndex(index => index <= 0 ? suggestions.length - 1 : index - 1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) void chooseSuggestion(suggestions[activeIndex]);
    } else if (event.key === 'Escape') {
      setSuggestions([]);
      setActiveIndex(-1);
    }
  }

  return <div className="place-autocomplete-new">
    <input id={name} name={name} value={value} onChange={event => { selectedValue.current = ''; onChange(event.target.value); }} onBlur={() => { onBlur(); window.setTimeout(() => setSuggestions([]), 150); }} placeholder={placeholder} autoComplete="off" aria-invalid={invalid} aria-describedby={invalid ? `${name}-error` : undefined} aria-autocomplete="list" aria-controls={listId} aria-expanded={suggestions.length > 0} aria-activedescendant={activeIndex >= 0 ? `${name}-suggestion-${activeIndex}` : undefined} role="combobox" onKeyDown={handleKeyDown} />
    {loading && <span className="place-suggestion-loading" aria-hidden="true" />}
    {suggestions.length > 0 && <div className="place-suggestion-list" id={listId} role="listbox" aria-label="Location suggestions">
      {suggestions.map((suggestion, index) => {
        const prediction = suggestion.placePrediction!;
        const primary = prediction.mainText?.toString() || prediction.text.toString();
        const secondary = prediction.secondaryText?.toString() || '';
        return <button id={`${name}-suggestion-${index}`} type="button" role="option" aria-selected={activeIndex === index} className={activeIndex === index ? 'active' : ''} key={prediction.placeId || `${primary}-${index}`} onMouseDown={event => event.preventDefault()} onClick={() => void chooseSuggestion(suggestion)}><MapPin size={17} /><span><strong>{primary}</strong>{secondary && <small>{secondary}</small>}</span></button>;
      })}
      <div className="place-suggestion-credit">Powered by Google</div>
    </div>}
  </div>;
}

function AirportSelect({ value, onChange, onBlur, invalid }: { value: string; onChange: (value: string) => void; onBlur: () => void; invalid?: boolean }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, airports.indexOf(value)));
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (open && !rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        onBlur();
      }
    }
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [onBlur, open]);

  function choose(airport: string) {
    onChange(airport);
    setActiveIndex(airports.indexOf(airport));
    setOpen(false);
    onBlur();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) setOpen(true);
      setActiveIndex(index => event.key === 'ArrowDown' ? (index + 1) % airports.length : index <= 0 ? airports.length - 1 : index - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open) choose(airports[activeIndex]); else setOpen(true);
    } else if (event.key === 'Escape') {
      setOpen(false);
      onBlur();
    }
  }

  return <div className="airport-select" ref={rootRef}>
    <button id="drop" type="button" className={open ? 'airport-select-trigger open' : 'airport-select-trigger'} onClick={() => setOpen(current => !current)} onKeyDown={handleKeyDown} aria-haspopup="listbox" aria-expanded={open} aria-controls="airport-options" data-invalid={invalid || undefined} aria-describedby={invalid ? 'drop-error' : undefined}>
      <span className="airport-select-icon"><Plane size={18} /></span>
      <span className={value ? 'airport-select-value' : 'airport-select-placeholder'}>{value || 'Select an airport'}</span>
      <ChevronDown className="airport-select-chevron" size={19} />
    </button>
    {open && <div className="airport-select-options" id="airport-options" role="listbox" aria-label="Choose an airport">
      {airports.map((airport, index) => <button type="button" role="option" aria-selected={value === airport} className={activeIndex === index ? 'active' : ''} key={airport} onMouseEnter={() => setActiveIndex(index)} onClick={() => choose(airport)}><span><Plane size={16} /></span><strong>{airport}</strong>{value === airport && <Check size={17} />}</button>)}
    </div>}
  </div>;
}

function indiaToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());
}

function dateParts(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return { year, month: month - 1, day };
}

function dateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function readableDate(value: string) {
  if (!value) return 'Choose a date';
  const { year, month, day } = dateParts(value);
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(year, month, day, 12));
}

function DatePicker({ value, onChange, onBlur, invalid }: { value: string; onChange: (value: string) => void; onBlur: () => void; invalid?: boolean }) {
  const minimum = indiaToday();
  const initial = dateParts(value || minimum);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ year: initial.year, month: initial.month });
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (open && !rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        onBlur();
      }
    }
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [onBlur, open]);

  function moveMonth(offset: number) {
    const next = new Date(view.year, view.month + offset, 1, 12);
    setView({ year: next.getFullYear(), month: next.getMonth() });
  }

  function choose(next: string) {
    onChange(next);
    setOpen(false);
    onBlur();
  }

  const monthStart = new Date(view.year, view.month, 1, 12);
  const gridStart = new Date(view.year, view.month, 1 - monthStart.getDay(), 12);
  const days = Array.from({ length: 42 }, (_, index) => new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + index, 12));
  const monthLabel = new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(monthStart);

  return <div className="custom-picker" ref={rootRef}>
    <button id="pickupDate" type="button" className="picker-trigger" onClick={() => { const next = dateParts(value || minimum); setView({ year: next.year, month: next.month }); setOpen(current => !current); }} aria-haspopup="dialog" aria-expanded={open} data-invalid={invalid || undefined} aria-describedby={invalid ? 'pickupDate-error' : undefined}><span className="picker-trigger-icon"><CalendarDays size={19} /></span><span className={value ? 'picker-value' : 'picker-placeholder'}>{readableDate(value)}</span><ChevronDown size={19} className={open ? 'picker-chevron open' : 'picker-chevron'} /></button>
    {open && <div className="date-picker-panel" role="dialog" aria-label="Choose pickup date">
      <div className="date-picker-header"><strong>{monthLabel}</strong><span><button type="button" onClick={() => moveMonth(-1)} aria-label="Previous month"><ChevronLeft size={19} /></button><button type="button" onClick={() => moveMonth(1)} aria-label="Next month"><ChevronRight size={19} /></button></span></div>
      <div className="date-picker-weekdays" aria-hidden="true">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <span key={day}>{day}</span>)}</div>
      <div className="date-picker-grid">{days.map(day => { const next = dateValue(day); const outside = day.getMonth() !== view.month; const disabled = next < minimum; const selected = next === value; const today = next === minimum; return <button type="button" key={next} disabled={disabled} className={[outside ? 'outside' : '', selected ? 'selected' : '', today ? 'today' : ''].filter(Boolean).join(' ')} aria-label={new Intl.DateTimeFormat('en-IN', { dateStyle: 'full' }).format(day)} aria-pressed={selected} onClick={() => choose(next)}>{day.getDate()}</button>; })}</div>
      <div className="picker-actions"><button type="button" onClick={() => choose('')} disabled={!value}>Clear</button><button type="button" onClick={() => choose(minimum)}>Today</button></div>
    </div>}
  </div>;
}

function readableTime(value: string) {
  if (!value) return 'Choose a time';
  const [hour, minute] = value.split(':').map(Number);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  return `${String(hour % 12 || 12).padStart(2, '0')}:${String(minute).padStart(2, '0')} ${suffix}`;
}

function TimePicker({ value, onChange, onBlur, invalid }: { value: string; onChange: (value: string) => void; onBlur: () => void; invalid?: boolean }) {
  const current = value ? value.split(':').map(Number) : [9, 0];
  const [open, setOpen] = useState(false);
  const [hour, setHour] = useState(current[0]);
  const [minute, setMinute] = useState(current[1]);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (open && !rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        onBlur();
      }
    }
    document.addEventListener('pointerdown', closeOnOutsideClick);
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick);
  }, [onBlur, open]);

  function openPicker() {
    if (value) {
      const [nextHour, nextMinute] = value.split(':').map(Number);
      setHour(nextHour);
      setMinute(nextMinute);
    }
    setOpen(currentOpen => !currentOpen);
  }

  function commit() {
    onChange(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    setOpen(false);
    onBlur();
  }

  return <div className="custom-picker" ref={rootRef}>
    <button id="pickupTime" type="button" className="picker-trigger" onClick={openPicker} aria-haspopup="dialog" aria-expanded={open} data-invalid={invalid || undefined} aria-describedby={invalid ? 'pickupTime-error' : undefined}><span className="picker-trigger-icon"><Clock3 size={19} /></span><span className={value ? 'picker-value' : 'picker-placeholder'}>{readableTime(value)}</span><ChevronDown size={19} className={open ? 'picker-chevron open' : 'picker-chevron'} /></button>
    {open && <div className="time-picker-panel" role="dialog" aria-label="Choose pickup time">
      <div className="time-picker-title"><div><Clock3 size={20} /><span><strong>Pickup time</strong><small>{readableTime(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)}</small></span></div></div>
      <div className="time-picker-labels"><span>HOUR</span><span>MINUTE</span></div>
      <div className="time-picker-columns"><div className="time-picker-hours">{Array.from({ length: 24 }, (_, nextHour) => <button type="button" className={hour === nextHour ? 'selected' : ''} aria-pressed={hour === nextHour} key={nextHour} onClick={() => setHour(nextHour)}>{String(nextHour).padStart(2, '0')}</button>)}</div><div className="time-picker-minutes">{[0, 15, 30, 45].map(nextMinute => <button type="button" className={minute === nextMinute ? 'selected' : ''} aria-pressed={minute === nextMinute} key={nextMinute} onClick={() => setMinute(nextMinute)}>{String(nextMinute).padStart(2, '0')}</button>)}</div></div>
      <div className="picker-actions"><button type="button" onClick={() => { onChange(''); setOpen(false); onBlur(); }} disabled={!value}>Clear</button><button type="button" className="picker-confirm" onClick={commit}>Use this time</button></div>
    </div>}
  </div>;
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
      const response = await fetch('/api/enquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ form: values, event: 'enquiry', requestId, website: '' }), signal: AbortSignal.timeout(20000) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.delivered) throw new Error(result.error || 'We could not send your enquiry. Please try again.');
      beginBooking(values, requestId);
      router.push('/estimate');
    } catch (submitFailure) {
      setFormError(submitFailure instanceof Error ? submitFailure.message : 'We could not send your enquiry. Please try again.');
    }
  }

  const changeTripType = (next: TripForm['tripType']) => { if (next !== tripType) setValue('drop', '', { shouldValidate: false }); setValue('tripType', next, { shouldDirty: true, shouldValidate: true }); };

  return <form className="booking-form previous-form-flow" noValidate onSubmit={handleSubmit(submit)}>
    <div className="booking-form-intro"><span><CarFront size={23} /></span><div><strong>Build your ride</strong><small>Four quick steps to your fare estimate</small></div></div>
    <StepHeading number="01" title="Choose trip type" />
    <div className="booking-trip-tabs">{[{ id: 'oneway' as const, label: 'One Way', Icon: Route }, { id: 'roundtrip' as const, label: 'Round trip', Icon: RefreshCw }, { id: 'airport' as const, label: 'Airport pickup', Icon: Plane }].map(({ id, label, Icon }) => <button type="button" key={id} className={tripType === id ? 'selected' : ''} onClick={() => changeTripType(id)} aria-pressed={tripType === id}><Icon size={18} />{label}</button>)}</div>
    <div className="form-grid route-fields">
      <div className="field"><label htmlFor="pickup">Pickup Location</label><Controller control={control} name="pickup" render={({ field }) => isLoaded && key ? <PlaceInput value={field.value} onBlur={field.onBlur} onChange={value => { field.onChange(value); onRouteChange?.({ pickup: value, drop }); }} name="pickup" invalid={!!errors.pickup} placeholder="Enter pickup location" /> : <input id="pickup" {...field} onChange={event => { field.onChange(event); onRouteChange?.({ pickup: event.target.value, drop }); }} autoComplete="off" placeholder="Enter pickup location" aria-invalid={!!errors.pickup} aria-describedby={errors.pickup ? 'pickup-error' : undefined} />} />{fieldError('pickup')}</div>
      <div className="field"><label htmlFor="drop">{tripType === 'airport' ? 'Airport' : 'Drop Location'}</label><Controller control={control} name="drop" render={({ field }) => tripType === 'airport' ? <AirportSelect value={field.value} onBlur={field.onBlur} onChange={value => { field.onChange(value); onRouteChange?.({ pickup, drop: value }); }} invalid={!!errors.drop} /> : isLoaded && key ? <PlaceInput value={field.value} onBlur={field.onBlur} onChange={value => { field.onChange(value); onRouteChange?.({ pickup, drop: value }); }} name="drop" invalid={!!errors.drop} placeholder="Enter drop location" /> : <input id="drop" {...field} onChange={event => { field.onChange(event); onRouteChange?.({ pickup, drop: event.target.value }); }} autoComplete="off" placeholder="Enter drop location" aria-invalid={!!errors.drop} aria-describedby={errors.drop ? 'drop-error' : undefined} />} />{fieldError('drop')}</div>
    </div>
    <StepHeading number="02" title="Schedule pickup" />
    <div className="form-grid schedule-fields">
      <div className="field date-time-field"><label htmlFor="pickupDate">Pickup Date</label><Controller control={control} name="pickupDate" render={({ field }) => <DatePicker value={field.value} onChange={field.onChange} onBlur={field.onBlur} invalid={!!errors.pickupDate} />} />{fieldError('pickupDate')}</div>
      <div className="field date-time-field"><label htmlFor="pickupTime">Pickup Time</label><Controller control={control} name="pickupTime" render={({ field }) => <TimePicker value={field.value} onChange={field.onChange} onBlur={field.onBlur} invalid={!!errors.pickupTime} />} />{fieldError('pickupTime')}</div>
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
