'use client';
import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
export function ContactForm() {
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [sent, setSent] = useState(false);
  const requestId = useRef(''); const locked = useRef(false);
  return sent ? <div className="contact-success" role="status"><CheckCircle2 size={44} /><h2>Message received.</h2><p>Our team has received your message and will be in touch.</p><button className="text-link" onClick={() => { requestId.current = ''; setSent(false); }}>Send another message <ArrowUpRight size={17} /></button></div> : <form className="contact-form" onSubmit={async e => {
    e.preventDefault(); if (locked.current) return; locked.current = true; setBusy(true); setError('');
    const data = Object.fromEntries(new FormData(e.currentTarget));
    requestId.current ||= crypto.randomUUID();
    try { const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, requestId: requestId.current }), signal: AbortSignal.timeout(20000) }); const result = await res.json(); if (!res.ok || !result.delivered) throw new Error(result.error || 'Your message was not delivered.'); setSent(true); } catch (error) { setError(error instanceof Error ? error.message : 'Unable to send. Please retry.'); } finally { setBusy(false); locked.current = false; }
  }}><h2>A good journey starts<br />with a conversation.</h2><p>Tell us what you have in mind.</p><div className="form-grid"><div className="field"><label htmlFor="contact-name">Your name</label><input id="contact-name" name="name" required minLength={2} maxLength={100} autoComplete="name" placeholder="Full name" /></div><div className="field"><label htmlFor="contact-mobile">Mobile number</label><input id="contact-mobile" name="mobile" type="tel" required pattern="[6-9][0-9]{9}" autoComplete="tel-national" placeholder="10-digit Indian mobile" /></div><div className="field full-width"><label htmlFor="contact-email">Email (optional)</label><input id="contact-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" /></div><div className="field full-width"><label htmlFor="contact-message">Your message</label><textarea id="contact-message" name="message" required minLength={10} maxLength={2000} rows={5} placeholder="Your route, dates, or anything you’d like to ask…" /></div></div><div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>{error && <p className="error-message" role="alert">{error}</p>}<button type="submit" className="button" disabled={busy}>{busy ? 'Sending…' : 'Send your message'}<ArrowUpRight size={18} /></button><p className="privacy-note">By sending, you agree to our <Link href="/privacy">privacy policy</Link>.</p></form>;
}

