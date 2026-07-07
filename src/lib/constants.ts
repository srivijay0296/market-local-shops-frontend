export const HERO_IMAGES = [
  "/images/bargur-textile-market.jpg"
];


// Market images
export const MARKET_IMAGES: Record<string, string> = {

  'a1-market': 'https://d64gsuwffb70l.cloudfront.net/699bdbf17b51ed955f62bf79_1771822217098_87aca72e.png',

  'mahalakshmi-market': 'https://d64gsuwffb70l.cloudfront.net/699bdbf17b51ed955f62bf79_1771822234307_5b15348f.png',

  'kalignar-market': 'https://d64gsuwffb70l.cloudfront.net/699bdbf17b51ed955f62bf79_1771822214021_555ef34e.jpg',

  'surat-market': 'https://d64gsuwffb70l.cloudfront.net/699bdbf17b51ed955f62bf79_1771822214425_c860c85a.jpg',

  'ayyapa-market': 'https://d64gsuwffb70l.cloudfront.net/699bdbf17b51ed955f62bf79_1771822215937_b64822df.jpg',

  'abc-market': 'https://d64gsuwffb70l.cloudfront.net/699bdbf17b51ed955f62bf79_1771822217034_11973657.jpg',

  // ✅ NEW MARKET
  'balaji-textile-market': '/images/balaji-textile-market.jpg'
};


// Market metadata
export const MARKET_META: Record<string, { shops: number; lat: number; lng: number }> = {

  'a1-market': { shops: 45, lat: 12.2833, lng: 78.3667 },

  'mahalakshmi-market': { shops: 60, lat: 12.2845, lng: 78.3680 },

  'kalignar-market': { shops: 35, lat: 12.2820, lng: 78.3655 },

  'surat-market': { shops: 50, lat: 12.2850, lng: 78.3690 },

  'ayyapa-market': { shops: 30, lat: 12.2815, lng: 78.3645 },

  'bt-market': { shops: 40, lat: 12.2860, lng: 78.3700 },

  'abc-market': { shops: 25, lat: 12.2825, lng: 78.3660 },

  // ✅ NEW MARKET
  'balaji-textile-market': { shops: 20, lat: 12.2870, lng: 78.3710 }
};


// Textile categories
export const CATEGORIES = [

  { name: 'Silk Sarees', icon: 'Shirt', color: 'bg-pink-100 text-pink-700' },

  { name: 'Cotton Sarees', icon: 'ShoppingBag', color: 'bg-yellow-100 text-yellow-700' },

  { name: 'Kids Wear', icon: 'Baby', color: 'bg-green-100 text-green-700' },

  { name: 'Mens Shirts', icon: 'Shirt', color: 'bg-blue-100 text-blue-700' },

  { name: 'Dress Materials', icon: 'Sparkles', color: 'bg-purple-100 text-purple-700' },

  { name: 'Textile Fabrics', icon: 'Layers', color: 'bg-orange-100 text-orange-700' },

  { name: 'Readymade Garments', icon: 'Shirt', color: 'bg-red-100 text-red-700' },

  { name: 'Branded Textile Items', icon: 'Package', color: 'bg-gray-100 text-gray-700' },

];


// Shipping rule
export const SHIPPING_RULES =
  'Bulk orders available for wholesale textile buyers';


// Stripe placeholder
export const STRIPE_ACCOUNT_ID = 'STRIPE_ACCOUNT_ID';


// Price formatter - Localized for INR without scale division (storing in Rupees)
export const formatPrice = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};