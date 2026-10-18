import type { Metadata } from 'next';
import { Estimate } from '@/components/estimate';
export const metadata: Metadata = { title: 'Your journey estimate', robots: { index: false, follow: false } };
export default function EstimatePage() { return <Estimate />; }
