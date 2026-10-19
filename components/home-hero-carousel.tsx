'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const slides = [
  {
    eyebrow: 'DOORSTEP TRAVEL MADE SIMPLE',
    title: 'Your city. Your pickup.',
    accent: 'One smooth ride.',
    text: 'Book a comfortable intercity cab from your doorstep. Travel directly to the destination that matters.',
  },
  {
    eyebrow: 'ONE-WAY TRAVEL, YOUR WAY',
    title: 'One city to the next.',
    accent: 'Simple from the start.',
    text: 'Choose your pickup, destination, and preferred car. We’ll help make the miles between feel effortless.',
  },
  {
    eyebrow: 'AIRPORT RIDES WITHOUT THE RUSH',
    title: 'Door to terminal.',
    accent: 'Comfortably on time.',
    text: 'Plan a calm airport transfer with a direct pickup and the space you need for every traveller and bag.',
  },
] as const;

export function HomeHeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStart = useRef<number | null>(null);

  const goTo = (index: number) => setActive((index + slides.length) % slides.length);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setActive(current => (current + 1) % slides.length), 3000);
    return () => window.clearInterval(timer);
  }, [paused]);

  const finishSwipe = (endX: number) => {
    if (touchStart.current === null) return;
    const distance = endX - touchStart.current;
    if (Math.abs(distance) > 50) goTo(active + (distance < 0 ? 1 : -1));
    touchStart.current = null;
  };

  return <section
    className="hero hero-carousel original-image-hero home-hero-with-form"
    aria-roledescription="carousel"
    aria-label="Intercity Riders services"
    onMouseEnter={() => setPaused(true)}
    onMouseLeave={() => setPaused(false)}
    onFocus={() => setPaused(true)}
    onBlur={() => setPaused(false)}
    onTouchStart={event => { touchStart.current = event.touches[0]?.clientX ?? null; }}
    onTouchEnd={event => finishSwipe(event.changedTouches[0]?.clientX ?? 0)}
  >
    <div className="hero-carousel-viewport">
      <div className="hero-carousel-track" style={{ transform: 'translate3d(-' + (active * 100) + '%,0,0)' }}>
        {slides.map((slide, index) => <article
          className="hero-carousel-slide"
          key={slide.eyebrow}
          aria-roledescription="slide"
          aria-label={(index + 1) + ' of ' + slides.length}
          aria-hidden={active !== index}
        >
          <Image src="/images/BANNERIMAGE.jpg" alt="Intercity Riders taxi fleet" fill priority={index === 0} sizes="100vw" className="hero-image" />
          <div className="hero-shade" />
          <div className="site-container hero-content">
            <div className="hero-slide-copy">
              <span className="hero-eyebrow"><span /> {slide.eyebrow}</span>
              <h1>{slide.title}<br /><span>{slide.accent}</span></h1>
              <p>{slide.text}</p>
              <div className="hero-links">
                <a href="#start-journey" className="hero-book-link">Plan your journey <ArrowDown size={17} /></a>
                <Link href="/services">Explore our services <ArrowUpRight size={17} /></Link>
              </div>
            </div>
          </div>
        </article>)}
      </div>
    </div>
    <div className="site-container hero-carousel-controls">
      <div className="hero-carousel-dots" role="tablist" aria-label="Choose a hero slide">
        {slides.map((slide, index) => <button
          key={slide.eyebrow}
          type="button"
          className={active === index ? 'active' : ''}
          onClick={() => goTo(index)}
          aria-label={'Show slide ' + (index + 1)}
          aria-selected={active === index}
          role="tab"
        />)}
      </div>
      <div className="hero-carousel-arrows">
        <button type="button" onClick={() => goTo(active - 1)} aria-label="Previous slide"><ArrowLeft size={20} /></button>
        <button type="button" onClick={() => goTo(active + 1)} aria-label="Next slide"><ArrowRight size={20} /></button>
      </div>
    </div>
  </section>;
}
