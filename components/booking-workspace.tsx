'use client';

import { useCallback, useState } from 'react';
import { BookingForm, type RouteDraft } from '@/components/booking-form';
import { BookingMapPreview } from '@/components/booking-map-preview';
import type { TripForm } from '@/lib/booking-store';

export function BookingWorkspace({ initial }: { initial: Partial<TripForm> }) {
  const [route, setRoute] = useState<RouteDraft>({ pickup: initial.pickup || '', drop: initial.drop || '' });
  const updateRoute = useCallback((next: RouteDraft) => setRoute(next), []);
  return <div className="booking-page-grid"><BookingForm initial={initial} onRouteChange={updateRoute} /><BookingMapPreview pickup={route.pickup} drop={route.drop} /></div>;
}
