'use client';
import { useMemo, useSyncExternalStore } from 'react';
import { z } from 'zod';
import { tripSchema } from './validation.mjs';
export type TripForm = z.infer<typeof tripSchema>;
export type SavedBooking = { form?: TripForm; requestId: string; receipt?: string; expires: number };
const key = 'intercity-riders-booking-v1';
const listeners = new Set<() => void>();
let volatile: string | null = null;
function subscribe(callback: () => void) { listeners.add(callback); window.addEventListener('storage', callback); return () => { listeners.delete(callback); window.removeEventListener('storage', callback); }; }
function snapshot() {
  let raw;
  try { raw = sessionStorage.getItem(key) || volatile; } catch { raw = volatile; }
  try { return raw && JSON.parse(raw).expires > Date.now() ? raw : null; } catch { return null; }
}
export function saveBooking(data: SavedBooking) {
  volatile = JSON.stringify(data); try { sessionStorage.setItem(key, volatile); } catch { /* In-memory recovery if storage is unavailable. */ }
  for (const callback of listeners) callback();
}
export function beginBooking(form: TripForm) { saveBooking({ form, requestId: crypto.randomUUID(), expires: Date.now() + 2 * 60 * 60 * 1000 }); }
export function useSavedBooking() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  return useMemo(() => {
    try { return JSON.parse(raw || 'null') as SavedBooking | null; } catch { return null; }
  }, [raw]);
}
