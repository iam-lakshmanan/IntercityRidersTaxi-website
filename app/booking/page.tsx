import type { Metadata } from 'next';
import { BookingWorkspace } from '@/components/booking-workspace';
import { PageHero } from '@/components/sections';
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
  return <><PageHero eyebrow="LET’S GET YOU THERE" title="A good journey" accent="starts here." text="A few details now. A little more peace of mind for the road ahead." /><section className="section booking-page-section soft-bg"><div className="site-container"><BookingWorkspace initial={initial} /></div></section></>;
}
