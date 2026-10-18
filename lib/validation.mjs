import { z } from 'zod';
export const tripSchema = z.object({
  tripType: z.enum(['oneway', 'roundtrip', 'airport']),
  pickup: z.string().trim().min(3, 'Enter a pickup location').max(250),
  drop: z.string().trim().min(3, 'Enter a destination').max(250),
  pickupDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Choose a date'),
  pickupTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Choose a time'),
  vehicle: z.enum(['sedan', 'prime_sedan', 'suv', 'prime_suv']),
  customerName: z.string().trim().min(2, 'Enter your name').max(100),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile'),
  email: z.union([z.literal(''), z.email('Enter a valid email')]),
  womanAlone: z.boolean(), seniorCitizen: z.boolean(), travellingWithInfant: z.boolean(), extraLuggage: z.boolean(),
}).superRefine((value, ctx) => {
  const when = new Date(`${value.pickupDate}T${value.pickupTime}:00+05:30`);
  const calendar = new Date(`${value.pickupDate}T12:00:00Z`);
  if (!Number.isFinite(when.getTime()) || !Number.isFinite(calendar.getTime()) || calendar.toISOString().slice(0, 10) !== value.pickupDate || when.getTime() < Date.now() + 15 * 60000) {
    ctx.addIssue({ code: 'custom', path: ['pickupDate'], message: 'Choose a valid pickup at least 15 minutes from now' });
  }
  if (value.pickup.toLowerCase() === value.drop.toLowerCase()) ctx.addIssue({ code: 'custom', path: ['drop'], message: 'Choose a different destination' });
});
export const contactSchema = z.object({
  name: z.string().trim().min(2).max(100), mobile: z.string().regex(/^[6-9]\d{9}$/),
  email: z.union([z.literal(''), z.email()]), message: z.string().trim().min(10).max(2000),
});
