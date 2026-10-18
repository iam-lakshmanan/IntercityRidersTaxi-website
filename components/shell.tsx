'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, CarFront, Menu, X, Phone, ArrowRight, MapPin } from 'lucide-react';
import { navigation, site } from '@/lib/site';
export function Logo() { return <span className="logo"><span className="logo-icon"><CarFront size={30} strokeWidth={1.65} /></span><span>Intercity<span className="cyan">Riders<span className="logo-dot">.</span></span><small>GOOD ROADS. GREAT JOURNEYS.</small></span></span>; }
export function Header() {
  const pathname = usePathname();
  const dialog = useRef<HTMLDialogElement>(null);
  return <>
    <div className="topbar"><div className="container"><span><span className="status-dot" /> YOUR NEXT CHAPTER STARTS ON THE ROAD</span><Link href="/contact">Let’s plan your journey <ArrowUpRight size={12} /></Link></div></div>
    <header className="header"><div className="container header-inner">
      <Link href="/" aria-label="Intercity Riders home"><Logo /></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{navigation.map(([name, href]) => <Link key={href} href={href} className={pathname === href ? 'active' : ''}>{name}</Link>)}</nav>
      <Link href="/booking" className="button button-small header-cta">Book your ride <ArrowUpRight size={16} /></Link>
      <button className="icon-button menu-toggle" aria-label="Open navigation" onClick={() => dialog.current?.showModal()}><Menu /></button>
    </div></header>
    <dialog className="mobile-menu" ref={dialog}><div className="mobile-menu-top"><Logo /><button className="icon-button" aria-label="Close navigation" onClick={() => dialog.current?.close()}><X /></button></div><nav aria-label="Mobile navigation">{[...navigation, ['Service areas', '/service-areas'], ['Contact', '/contact'], ['Book a ride', '/booking']].map(([name, href]) => <Link key={href} href={href} onClick={() => dialog.current?.close()}>{name}<ArrowUpRight size={20} /></Link>)}</nav><p>Your journey. At your pace.</p></dialog>
  </>;
}
export function Footer() {
  return <footer className="footer"><div className="container">
    <div className="footer-top"><div><span className="eyebrow light">LESS PLANNING. MORE LIVING.</span><h2>Where are we<br />taking you <span className="cyan">next?</span></h2></div><Link href="/booking" className="button">Find your next ride <ArrowUpRight size={19} /></Link></div>
    <div className="footer-grid"><div><Link href="/"><Logo /></Link><p>Thoughtful journeys. Comfortable miles.<br />One destination at a time.</p><span className="footer-location"><MapPin size={15} /> {site.location}</span></div><div><h3>Explore</h3><Link href="/services">Outstation journeys</Link><Link href="/airport-transfers">Airport transfers</Link><Link href="/routes">Popular routes</Link><Link href="/service-areas">Service areas</Link></div><div><h3>Good to know</h3><Link href="/tariff">Fares & inclusions</Link><Link href="/about">Our approach</Link><Link href="/contact">Contact us</Link><Link href="/privacy">Privacy policy</Link></div><div><h3>Let’s talk travel</h3><p>Need a hand with your journey?</p>{site.phone && <a href={`tel:${site.phone}`}><Phone size={14} /> {site.phone}</a>}{site.email && <a href={`mailto:${site.email}`}>{site.email}</a>}<Link className="footer-contact" href="/contact">Speak with our team <ArrowRight size={16} /></Link></div></div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} {site.name}. All rights reserved.</span><span>Made for the miles that matter <span className="cyan">↗</span></span></div>
  </div></footer>;
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
