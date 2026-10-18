'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useRef } from 'react';
import { ArrowUpRight, Menu, X, Phone, MapPin, Mail, ShieldCheck, Clock3, Route } from 'lucide-react';
import { navigation, site, footerCities, socialLinks, bookingLink } from '@/lib/site';
import { Reveal } from './motion';

export function Logo() {
  return <span className="brand-logo"><Image src="/images/car-logo3-transparent.png" alt="Intercity Riders — The one you can trust" width={3692} height={1120} sizes="(max-width: 640px) 164px, 204px" priority /></span>;
}

export function Header() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const active = (href: string) => pathname === href || ({ '/about': '/about-us', '/contact': '/contact-us', '/routes': '/service-routes' } as Record<string, string>)[pathname] === href;
  return <>
    <header className="header"><div className="site-container header-inner">
      <Link href="/" aria-label="Intercity Riders home"><Logo /></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{navigation.map(([name, href]) => <Link key={href} href={href} aria-current={active(href) ? 'page' : undefined} className={active(href) ? 'active' : ''}>{name}</Link>)}</nav>
      <div className="header-actions">
        <a href={`tel:${site.phone}`} className="button button-small header-cta"><Phone size={16} /> Call us</a>
        <button className="icon-button menu-toggle" aria-label="Open navigation" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}><Menu /></button>
      </div>
    </div></header>
    <dialog className="mobile-menu" ref={dialog} aria-label="Site navigation"><div className="mobile-menu-top"><Logo /><button className="icon-button" aria-label="Close navigation" onClick={() => dialog.current?.close()}><X /></button></div><nav aria-label="Mobile navigation">{navigation.map(([name, href]) => <Link key={href} href={href} aria-current={active(href) ? 'page' : undefined} onClick={() => dialog.current?.close()}>{name}<ArrowUpRight size={20} /></Link>)}</nav><a href={`tel:${site.phone}`} className="button mobile-call"><Phone size={17} /> Call us</a><p>Your journey. Our priority.</p></dialog>
  </>;
}

function SocialIcon({ label }: { label: string }) {
  if (label === 'Facebook') return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M14 21v-8h3l.5-3H14V8c0-.9.3-1.5 1.6-1.5H18V3.8c-.4-.1-1.8-.2-3-.2-3 0-5 1.8-5 5V10H7v3h3v8z" /></svg>;
  if (label === 'Instagram') return <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23 22h-6.2l-4.9-7.4L5.4 22H2.2l7.2-8.3L1 2h6.4l4.4 6.8L18.9 2zM17.7 20h1.7L6.3 3.9H4.5L17.7 20z" /></svg>;
}

function WhatsAppIcon({ size = 25 }: { size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.149-.173.198-.297.298-.495.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.075-.792.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.9 6.99c-.002 5.45-4.437 9.884-9.892 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.3-1.654a11.882 11.882 0 0 0 5.69 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>;
}

export function Footer() {
  const displayPhone = site.phone === '+919944942223' ? '+91 99449 42223' : site.phone;
  return <>
    <footer className="footer legacy-footer" data-site-footer><div className="site-container">
      <Reveal className="footer-intro"><div><span className="footer-kicker"><Route size={16} /> Travel across South India</span><h2>Your Journey.<br /><span className="cyan">Our Priority.</span></h2><p>Intercity One Way Taxi connects major cities with dependable doorstep pickups, transparent estimates, experienced drivers and well-maintained cabs.</p></div><div className="footer-actions"><a href={`tel:${site.phone}`} className="button"><Phone size={17} /> Call to book</a><Link href="/#start-journey" className="button button-outline">Get fare estimate <ArrowUpRight size={17} /></Link></div></Reveal>
      <section className="footer-cities" aria-labelledby="footer-routes-title"><Reveal><div className="footer-city-heading"><div><span className="eyebrow light">SERVICE CITIES</span><h2 id="footer-routes-title">Book from a major city</h2></div><p>Select your pickup city to begin.</p></div></Reveal><div className="footer-city-grid">{footerCities.map((city, index) => <Reveal key={city.name} delay={index * 0.04}><Link href={bookingLink(city.pickup)}><div><span className="footer-city-index">0{index + 1}</span><h3>{city.name}</h3><p>One-way taxis from {city.name}</p></div><ArrowUpRight size={20} /></Link></Reveal>)}</div></section>
      <div className="footer-grid legacy-footer-grid"><Reveal><Link href="/" aria-label="Intercity Riders home"><Logo /></Link><p>Comfortable one-way, outstation and airport taxi journeys across Tamil Nadu and neighbouring cities.</p><div className="footer-assurances"><span><ShieldCheck size={16} /> Verified drivers</span><span><Clock3 size={16} /> 24/7 assistance</span></div></Reveal><Reveal><h3>Explore</h3>{[['About us', '/about-us'], ['Our services', '/services'], ['Taxi tariff', '/tariff'], ['All routes', '/service-routes'], ['Contact us', '/contact-us']].map(([name, href]) => <Link href={href} key={href}>{name}</Link>)}</Reveal><Reveal><h3>Booking desk</h3><a href={`tel:${site.phone}`}><Phone size={16} /> {displayPhone}</a><a href={`mailto:${site.email}`}><Mail size={16} /> {site.email}</a><a href="https://www.google.com/maps/dir/?api=1&destination=11.0168%2C76.9558" target="_blank" rel="noreferrer"><MapPin size={17} /> Coimbatore Dispatch Centre</a></Reveal><Reveal><h3>Follow us</h3><div className="footer-socials">{socialLinks.map(link => <a key={link.label} href={link.href} target="_blank" rel="noreferrer" aria-label={link.label}><SocialIcon label={link.label} /></a>)}</div><Link href="/privacy" className="footer-privacy">Privacy policy <ArrowUpRight size={14} /></Link></Reveal></div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Intercity One Way Taxi. All rights reserved.</span><span>Designed and developed by <a href="https://wexoraa.com/" target="_blank" rel="noreferrer">Wexoraa Infotech</a></span></div>
    </div></footer>
    <div className="floating-contacts"><a href={`tel:${site.phone}`} className="floating-phone" aria-label="Call Intercity One Way Taxi"><Phone size={22} /></a><a href={`https://wa.me/${site.phone.replace(/\D/g, '')}`} className="floating-whatsapp" target="_blank" rel="noreferrer" aria-label="Message Intercity One Way Taxi on WhatsApp"><WhatsAppIcon /></a></div>
  </>;
}
