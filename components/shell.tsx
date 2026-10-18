'use client';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X, Phone, MapPin, Mail, ShieldCheck, Clock3, Route, MessageCircle } from 'lucide-react';
import { navigation, site, footerCities, socialLinks, bookingLink } from '@/lib/site';
import { Reveal } from './motion';

export function Logo() {
  return <span className="brand-logo"><Image src="/images/car-logo3.png" alt="Intercity Riders — The one you can trust" width={3692} height={1120} sizes="(max-width: 640px) 164px, 204px" priority /></span>;
}

export function Header() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  const active = (href: string) => pathname === href || ({ '/about': '/about-us', '/contact': '/contact-us', '/routes': '/service-routes' } as Record<string, string>)[pathname] === href;
  return <>
    <div className="topbar"><div className="site-container"><span><span className="status-dot" /> YOUR NEXT CHAPTER STARTS ON THE ROAD</span><Link href="/contact-us">Let’s plan your journey <ArrowUpRight size={12} /></Link></div></div>
    <header className="header"><div className="site-container header-inner">
      <Link href="/" aria-label="Intercity Riders home"><Logo /></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{navigation.map(([name, href]) => <Link key={href} href={href} aria-current={active(href) ? 'page' : undefined} className={active(href) ? 'active' : ''}>{name}</Link>)}</nav>
      <a href={`tel:${site.phone}`} className="button button-small header-cta"><Phone size={16} /> Call us</a>
      <button className="icon-button menu-toggle" aria-label="Open navigation" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}><Menu /></button>
    </div></header>
    <dialog className="mobile-menu" ref={dialog} aria-label="Site navigation"><div className="mobile-menu-top"><Logo /><button className="icon-button" aria-label="Close navigation" onClick={() => dialog.current?.close()}><X /></button></div><nav aria-label="Mobile navigation">{navigation.map(([name, href]) => <Link key={href} href={href} aria-current={active(href) ? 'page' : undefined} onClick={() => dialog.current?.close()}>{name}<ArrowUpRight size={20} /></Link>)}</nav><a href={`tel:${site.phone}`} className="button mobile-call"><Phone size={17} /> Call us</a><p>Your journey. Our priority.</p></dialog>
  </>;
}

function SocialIcon({ label }: { label: string }) {
  if (label === 'Facebook') return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M14 21v-8h3l.5-3H14V8c0-.9.3-1.5 1.6-1.5H18V3.8c-.4-.1-1.8-.2-3-.2-3 0-5 1.8-5 5V10H7v3h3v8z" /></svg>;
  if (label === 'Instagram') return <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>;
  return <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M18.9 2H22l-6.8 7.8L23 22h-6.2l-4.9-7.4L5.4 22H2.2l7.2-8.3L1 2h6.4l4.4 6.8L18.9 2zM17.7 20h1.7L6.3 3.9H4.5L17.7 20z" /></svg>;
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
    <div className="floating-contacts"><a href={`tel:${site.phone}`} className="floating-phone" aria-label="Call Intercity One Way Taxi"><Phone size={22} /></a><a href={`https://wa.me/${site.phone.replace(/\D/g, '')}`} className="floating-whatsapp" target="_blank" rel="noreferrer" aria-label="Message Intercity One Way Taxi on WhatsApp"><MessageCircle size={24} /></a></div>
  </>;
}

type InstallEvent = Event & { prompt: () => Promise<void> };
export function InstallPrompt() {
  const [prompt, setPrompt] = useState<InstallEvent | null>(null);
  useEffect(() => {
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
    const handler = (event: Event) => { event.preventDefault(); setPrompt(event as InstallEvent); };
    window.addEventListener('beforeinstallprompt', handler); return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  return prompt ? <button className="install-prompt" onClick={async () => { await prompt.prompt(); setPrompt(null); }}>Add Riders to your home screen <ArrowUpRight size={15} /></button> : null;
}
