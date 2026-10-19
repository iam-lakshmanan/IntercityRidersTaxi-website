export const site = {
  name: 'Intercity Riders',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://intercityonewaytaxi.in',
  phone: process.env.NEXT_PUBLIC_PHONE || '+919944942223',
  email: process.env.NEXT_PUBLIC_EMAIL || 'info@onewaytaxi.com',
  location: 'Tamil Nadu, India',
};
export const navigation = [
  ['HOME', '/'], ['ABOUT', '/about-us'], ['SERVICES', '/services'],
  ['TARIFF', '/tariff'], ['ROUTES', '/service-routes'], ['CONTACT US', '/contact-us'],
] as const;
export const journeys = [
  { from: 'Chennai', to: 'Bengaluru', note: 'City lights to new possibilities', tag: 'CITY TO CITY', image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?q=80&w=900&auto=format&fit=crop' },
  { from: 'Coimbatore', to: 'Ooty', note: 'Take the scenic way to slow down', tag: 'HILL ESCAPE', image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=900&auto=format&fit=crop' },
  { from: 'Madurai', to: 'Rameswaram', note: 'A journey with a little more meaning', tag: 'COAST & CULTURE', image: 'https://images.unsplash.com/photo-1592846433464-8e3dbfd559dc?q=80&w=900&auto=format&fit=crop' },
  { from: 'Chennai', to: 'Pondicherry', note: 'Sea breeze, French lanes, open roads', tag: 'WEEKEND AWAY', image: 'https://images.unsplash.com/photo-1597073642928-48c0971f7ded?q=80&w=900&auto=format&fit=crop' },
  { from: 'Coimbatore', to: 'Munnar', note: 'Misty tea gardens and winding hills', tag: 'NATURE RETREAT', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=900&auto=format&fit=crop' },
  { from: 'Coimbatore', to: 'Chennai', note: 'Cross-state connections & capital city', tag: 'CAPITAL CONNECTION', image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=900&auto=format&fit=crop' },
];
export const cities = ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tiruppur', 'Erode', 'Thanjavur', 'Vellore', 'Bengaluru', 'Pondicherry', 'Ooty'];
export function bookingLink(from?: string, to?: string, trip = 'oneway') {
  const search = new URLSearchParams({ trip });
  if (from) search.set('pickup', from);
  if (to) search.set('drop', to);
  return `/booking?${search}`;
}

export const footerCities = [
  { name: 'Chennai', pickup: 'Chennai, Tamil Nadu, India' },
  { name: 'Coimbatore', pickup: 'Coimbatore, Tamil Nadu, India' },
  { name: 'Bangalore', pickup: 'Bengaluru, Karnataka, India' },
  { name: 'Madurai', pickup: 'Madurai, Tamil Nadu, India' },
  { name: 'Trichy', pickup: 'Tiruchirappalli, Tamil Nadu, India' },
];
export const socialLinks = [
  { label: 'Facebook', href: 'https://facebook.com/onewaytaxi' },
  { label: 'Twitter', href: 'https://twitter.com/onewaytaxi' },
  { label: 'Instagram', href: 'https://instagram.com/onewaytaxi' },
];
