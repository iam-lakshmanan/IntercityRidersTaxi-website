import type { Metadata } from 'next';
import { Check, Route, ShieldCheck } from 'lucide-react';
import { BookingForm } from '@/components/booking-form';
import { PageHero } from '@/components/sections';
import { Reveal } from '@/components/motion';
import type { TripForm } from '@/lib/booking-store';
export const metadata: Metadata = { title: 'Book your next journey', alternates: { canonical: '/booking' } };
export default async function BookingPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const str = (key: string) => typeof params[key] === 'string' ? params[key] as string : '';
  const trip = str('trip'); const vehicle = str('vehicle');
  const initial: Partial<TripForm> = {};
  if (str('pickup')) initial.pickup = str('pickup').slice(0, 250);
  if (str('drop')) initial.drop = str('drop').slice(0, 250);
  if (['oneway', 'roundtrip', 'airport'].includes(trip)) initial.tripType = trip as TripForm['tripType'];
  if (['sedan', 'prime_sedan', 'suv', 'prime_suv'].includes(vehicle)) initial.vehicle = vehicle as TripForm['vehicle'];
  return <><PageHero eyebrow="LET’S GET YOU THERE" title="A good journey" accent="starts here." text="A few details now. A little more peace of mind for the road ahead." /><section className="section soft-bg"><div className="site-container booking-layout"><Reveal><BookingForm initial={initial} /></Reveal><aside className="booking-aside"><Reveal><div className="aside-image"><Route size={52} strokeWidth={1} /><span>GOOD ROADS.<br /><strong>GREAT JOURNEYS.</strong></span></div><h2>Your plans.<br />Our attention.</h2><p>From the first enquiry to the final drop, clarity makes all the difference.</p>{['A driving-route estimate, calculated for you', 'Vehicle options for different kinds of trips', 'Special requirements passed to the team', 'No online payment needed to enquire'].map(t => <div className="aside-check" key={t}><Check size={17} />{t}</div>)}<div className="booking-disclaimer"><ShieldCheck size={22} /><p>Your request is reviewed by our team. They’ll contact you to confirm the car and trip details.</p></div></Reveal></aside></div></section></>;
}
