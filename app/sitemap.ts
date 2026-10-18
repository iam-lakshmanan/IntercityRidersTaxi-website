import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
export default function sitemap(): MetadataRoute.Sitemap { return ['', '/services', '/airport-transfers', '/service-routes', '/service-areas', '/tariff', '/booking', '/about-us', '/contact-us', '/privacy'].map(path => ({ url: `${site.url}${path}`, changeFrequency: 'monthly', priority: path ? 0.7 : 1 })); }
