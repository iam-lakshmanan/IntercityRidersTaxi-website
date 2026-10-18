export const site = {
  name: 'Intercity Riders',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://intercityriders.example',
  phone: process.env.NEXT_PUBLIC_PHONE || '+919944942223',
  email: process.env.NEXT_PUBLIC_EMAIL || 'info@onewaytaxi.com',
  location: 'Tamil Nadu, India',
};
export const navigation = [
  ['HOME', '/'], ['ABOUT', '/about-us'], ['SERVICES', '/services'],
  ['TARIFF', '/tariff'], ['ROUTES', '/service-routes'], ['CONTACT US', '/contact-us'],
] as const;
export const journeys = [
  { from: 'Chennai', to: 'Bengaluru', note: 'City lights to new possibilities', tag: 'CITY TO CITY', image: '/images/destination-1.webp' },
  { from: 'Coimbatore', to: 'Ooty', note: 'Take the scenic way to slow down', tag: 'HILL ESCAPE', image: '/images/destination-2.webp' },
  { from: 'Madurai', to: 'Rameswaram', note: 'A journey with a little more meaning', tag: 'COAST & CULTURE', image: '/images/destination-3.webp' },
  { from: 'Chennai', to: 'Pondicherry', note: 'Sea breeze, French lanes, open roads', tag: 'WEEKEND AWAY', image: '/images/destination-4.webp' },
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
