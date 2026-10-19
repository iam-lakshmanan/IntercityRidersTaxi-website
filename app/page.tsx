import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck, CarFront, Headphones, Route, Quote } from 'lucide-react';
import { BookingForm } from '@/components/booking-form';
import { Reveal } from '@/components/motion';
import { ServicesSection, Fleet, RoutesSection, WhyUs, Process, Faq } from '@/components/sections';
import { HomeHeroCarousel } from '@/components/home-hero-carousel';
export const metadata: Metadata = { title: 'Intercity Riders | A better way to get there', alternates: { canonical: '/' } };
export default function Home() {
  return <>
    <HomeHeroCarousel />
    <section className="home-booking-section attached-booking-section soft-bg" id="start-journey"><div className="site-container"><div className="home-booking-centered"><Reveal><BookingForm /></Reveal></div><div className="trust-strip">{[{ Icon: ShieldCheck, title: 'Clear, upfront fares', text: 'Know what goes into your trip' }, { Icon: CarFront, title: 'Comfort comes along', text: 'A choice of cars for your plans' }, { Icon: Route, title: 'Your route. Your pace.', text: 'One-way, return & airport rides' }, { Icon: Headphones, title: 'A team that listens', text: 'Help with the details that matter' }].map(({ Icon, title, text }) => <div key={title}><Icon size={27} strokeWidth={1.5} /><span><strong>{title}</strong><small>{text}</small></span></div>)}</div></div></section>
    <ServicesSection /><RoutesSection /><div className="brand-ribbon"><span>MORE THAN A DESTINATION</span><span className="ribbon-star">✳</span><span>A BETTER WAY TO GET THERE</span><span className="ribbon-star">✳</span><span>MAKE ROOM FOR THE JOURNEY</span></div><Fleet /><WhyUs /><Process />
    <section className="section story-section"><div className="site-container story-grid"><Reveal><span className="eyebrow light">THE MILES THAT MATTER</span><h2>Homecomings.<br />New beginnings.<br /><span className="cyan">Everything between.</span></h2></Reveal><Reveal><Quote size={46} className="cyan" strokeWidth={1} /><p className="story-quote">Behind every destination is a reason to go. We’re here for yours.</p><p>From family reunions to a fresh start in a new city, a comfortable journey makes room for what matters.</p><Link href="/#start-journey" className="text-link light-link">Make your next plan <ArrowUpRight size={18} /></Link></Reveal></div></section><Faq />
    <section className="traveller-stories"><div className="site-container"><Reveal><span className="eyebrow">TRAVELLER STORIES</span><h2>Good journeys are worth sharing.</h2><p>Travelled with us? We’d love to hear what made your journey memorable.</p><Link href="/contact-us" className="text-link">Share your experience <ArrowUpRight size={17} /></Link></Reveal></div></section>
  </>;
}
