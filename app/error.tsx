'use client';
export default function ErrorPage({ reset }: { reset: () => void }) { return <section className="section"><div className="site-container receipt"><h1>A small bump in the road.</h1><p>Please try loading this page again.</p><button className="button" onClick={reset}>Try again ↗</button></div></section>; }
