'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, MapPin, Navigation, Plane, RefreshCw, Route } from 'lucide-react';
export function QuickBooking() {
  const [trip, setTrip] = useState('oneway');
  const router = useRouter();
  return <div className="quick-booking"><div className="trip-tabs" role="group" aria-label="Journey type">{[
    { id: 'oneway', label: 'One way', Icon: Route }, { id: 'roundtrip', label: 'Round trip', Icon: RefreshCw }, { id: 'airport', label: 'Airport', Icon: Plane },
  ].map(({ id, label, Icon }) => <button type="button" key={id} aria-pressed={trip === id} className={trip === id ? 'selected' : ''} onClick={() => setTrip(id)}><Icon size={15} />{label}</button>)}</div><form onSubmit={e => { e.preventDefault(); const data = new FormData(e.currentTarget); const query = new URLSearchParams({ trip, pickup: String(data.get('pickup')), drop: String(data.get('drop')) }); router.push(`/booking?${query}`); }}><label><MapPin size={22} /><span><small>YOUR PICKUP</small><input name="pickup" aria-label="Pickup city" placeholder={trip === 'airport' ? 'Airport name' : 'Where from?'} required minLength={3} /></span></label><div className="quick-divider"><ArrowRight size={16} /></div><label><Navigation size={22} /><span><small>YOUR DESTINATION</small><input name="drop" aria-label="Destination city" placeholder="Where to?" required minLength={3} /></span></label><button className="button" type="submit">Find my ride <ArrowRight size={18} /></button></form><div className="quick-note"><span className="status-dot" /> Clear fares. Comfortable cars. Your kind of journey.</div></div>;
}
