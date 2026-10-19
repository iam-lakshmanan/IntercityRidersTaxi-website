import Link from 'next/link';
import { RefreshCw, WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return <section className="offline-page">
    <div className="offline-card">
      <span className="offline-icon"><WifiOff size={38} /></span>
      <span className="eyebrow">CONNECTION PAUSED</span>
      <h1>You’re offline.</h1>
      <p>Please reconnect to continue planning your journey. Pages you recently visited may still be available.</p>
      <Link href="/" className="button">Try again <RefreshCw size={18} /></Link>
    </div>
  </section>;
}
