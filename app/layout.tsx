import type { Metadata, Viewport } from 'next';
import { Header, Footer } from '@/components/shell';
import { MotionProvider } from '@/components/motion';
import { site } from '@/lib/site';
import './globals.css';
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: 'Intercity Riders | A better way to get there', template: '%s | Intercity Riders' },
  description: 'Thoughtful one-way, outstation and airport taxi journeys across Tamil Nadu. Explore clear fares and request your next ride.',
  applicationName: site.name,
  openGraph: { type: 'website', locale: 'en_IN', siteName: site.name, images: [{ url: '/images/BANNERIMAGE.jpg', width: 1600, height: 755, alt: 'Intercity taxi fleet' }] },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/icon.svg', apple: '/icons/icon-192.png' },
};
export const viewport: Viewport = { themeColor: '#061728', width: 'device-width', initialScale: 1 };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body className="site-shell"><MotionProvider><a className="skip-link" href="#main-content">Skip to content</a><Header /><main id="main-content" className="site-main">{children}</main><Footer /></MotionProvider></body></html>;
}
