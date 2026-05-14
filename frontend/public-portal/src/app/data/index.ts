export const categories = [
  { id: 1, name: "Fish", nameTA: "மீன்", icon: "🐟", count: 45, color: "from-cyan-500 to-blue-500", desc: "Fresh water & sea fish varieties" },
  { id: 2, name: "Prawns", nameTA: "இறால்", icon: "🦐", count: 12, color: "from-orange-400 to-red-500", desc: "Tiger, white & flower prawns" },
  { id: 3, name: "Crabs", nameTA: "நண்டு", icon: "🦀", count: 8, color: "from-red-400 to-rose-500", desc: "Fresh mud & sea crabs" },
  { id: 4, name: "Lobster", nameTA: "கடல் நண்டு", icon: "🦞", count: 5, color: "from-amber-400 to-orange-500", desc: "Premium live lobsters" },
  { id: 5, name: "Squid", nameTA: "கணவாய்", icon: "🦑", count: 10, color: "from-purple-400 to-indigo-500", desc: "Cleaned & ready to cook" },
  { id: 6, name: "Shell Fish", nameTA: "சிப்பி மீன்", icon: "🐚", count: 6, color: "from-teal-400 to-emerald-500", desc: "Mussels, clams & oysters" },
];

export const products = [
  { id: 1, name: "Yellow Fin Tuna", nameTA: "மஞ்சள் துடுப்பு சூரை", price: 1200, oldPrice: 1400, unit: "1 kg", rating: 4.9, reviews: 128, image: "/images/seer-fish.png", badge: "Bestseller", inStock: true, categoryId: 1, description: "Premium Yellow Fin Tuna with firm texture and rich flavor. Ideal for frying, curry or steaks. Sourced fresh from Jaffna's coastal waters.", weight: "1 kg", origin: "Jaffna Harbor", freshness: "Caught today morning" },
  { id: 2, name: "Tiger Prawns", nameTA: "இறால்", price: 850, oldPrice: 950, unit: "500g", rating: 4.8, reviews: 96, image: "/images/tiger-prawns.png", badge: "Popular", inStock: true, categoryId: 2, description: "Jumbo tiger prawns with a sweet, delicate flavor. Perfect for grilling, stir-fry, or traditional prawn curry. Cleaned and deveined on request.", weight: "500g", origin: "Jaffna", freshness: "Caught today morning" },
  { id: 3, name: "Crab (Nandu)", nameTA: "நண்டு", price: 600, oldPrice: 700, unit: "1 kg", rating: 4.7, reviews: 84, image: "/images/crab.png", badge: null, inStock: true, categoryId: 3, description: "Fresh mud crabs packed with succulent meat. A staple in Jaffna cuisine. Best for crab masala, pepper crab, or crab rasam.", weight: "1 kg", origin: "Jaffna Lagoon", freshness: "Caught today morning" },
  { id: 4, name: "Pomfret (Vavval)", nameTA: "வவ்வால்", price: 950, oldPrice: 1100, unit: "1 kg", rating: 4.9, reviews: 112, image: "/images/pomfret.png", badge: "Premium", inStock: true, categoryId: 1, description: "Silver pomfret with delicate white flesh. Premium quality fish prized for its sweet, mild taste. Excellent for fry, tandoori, or steaming.", weight: "1 kg", origin: "Jaffna Harbor", freshness: "Caught this morning" },
  { id: 5, name: "Squid (Kanava)", nameTA: "கணவாய்", price: 450, oldPrice: 550, unit: "500g", rating: 4.6, reviews: 67, image: "/images/squid.png", badge: null, inStock: true, categoryId: 5, description: "Fresh squid cleaned and ready to cook. Tender and versatile – perfect for calamari rings, stir-fry, or squid masala.", weight: "500g", origin: "Point Pedro", freshness: "Caught yesterday evening" },
  { id: 6, name: "Red Snapper (Sankara)", nameTA: "சங்கரா", price: 780, oldPrice: 900, unit: "1 kg", rating: 4.8, reviews: 91, image: "/images/red-snapper.png", badge: "Fresh Today", inStock: true, categoryId: 1, description: "Vibrant red snapper with firm, moist flesh. One of the most popular fish varieties in Jaffna. Great for curry, fry, or grilling.", weight: "1 kg", origin: "Karainagar", freshness: "Caught today morning" },
  { id: 7, name: "Lobster", nameTA: "கடல் நண்டு", price: 2200, oldPrice: 2500, unit: "1 pc", rating: 5.0, reviews: 45, image: "/images/lobster.png", badge: "Premium", inStock: false, categoryId: 4, description: "Live premium lobster, the ultimate luxury seafood. Rich, tender meat perfect for grilling, butter garlic preparation, or traditional recipes.", weight: "1 pc (~500g)", origin: "Delft Island", freshness: "Pre-order required" },
  { id: 8, name: "Seer Fish (Vanjiram)", nameTA: "வஞ்சிரம் ஸ்டீக்", price: 1350, oldPrice: 1500, unit: "1 kg", rating: 4.9, reviews: 73, image: "/images/seer-fish.png", badge: "Cut Ready", inStock: true, categoryId: 1, description: "Pre-cut seer fish steaks, marination-ready. Uniform thickness for even cooking. Ideal for pan-frying, grilling, or making fish tikka.", weight: "1 kg (6-8 steaks)", origin: "Jaffna Harbor", freshness: "Caught today, cut fresh" },
];

export const testimonials = [
  { name: "Priya M.", text: "The freshest seafood I've ever ordered online. Tuna was absolutely divine!", rating: 5, location: "Jaffna Town" },
  { name: "Karthik R.", text: "Amazing quality prawns, perfectly cleaned and delivered on time. Will order again!", rating: 5, location: "Nallur" },
  { name: "Deepa S.", text: "Love the custom cutting option. Makes cooking so much easier. Great service!", rating: 5, location: "Chunnakam" },
  { name: "Rajesh K.", text: "Lobster was incredibly fresh and the delivery was super quick. Best seafood store online!", rating: 5, location: "Kokuvil" },
  { name: "Anitha V.", text: "Been ordering weekly for 6 months. Quality has been consistently excellent.", rating: 5, location: "Kondavil" },
  { name: "Suresh P.", text: "The pomfret was restaurant-quality. My family loved the crab masala too!", rating: 5, location: "Nallur" },
];

export const offers = [
  { id: 1, title: "Weekend Special", subtitle: "20% OFF on all Prawns", code: "PRAWN20", validUntil: "Every Sat & Sun", gradient: "from-orange-500 to-red-500", icon: "🦐" },
  { id: 2, title: "First Order Bonus", subtitle: "Rs. 150 OFF on orders above Rs. 2000", code: "FIRST10", validUntil: "For new customers", gradient: "from-cyan-500 to-blue-600", icon: "🎉" },
  { id: 3, title: "Premium Bundle", subtitle: "Buy 2 kg Tuna, Get 500g Prawns FREE", code: "BUNDLE22", validUntil: "Limited stock", gradient: "from-purple-500 to-indigo-600", icon: "🐟" },
  { id: 4, title: "Family Pack", subtitle: "Flat Rs. 200 OFF on orders above Rs. 3000", code: "FAMILY200", validUntil: "All week", gradient: "from-emerald-500 to-teal-600", icon: "👨‍👩‍👧‍👦" },
];

export const deliveryAreas = [
  { id: 1, name: "Jaffna Town", nameTA: "யாழ்ப்பாணம் நகரம்", timeMin: 20, timeMax: 40, charge: 100, freeAbove: 2000 },
  { id: 2, name: "Nallur", nameTA: "நல்லூர்", timeMin: 25, timeMax: 45, charge: 150, freeAbove: 2500 },
  { id: 3, name: "Chunnakam", nameTA: "சுன்னாகம்", timeMin: 30, timeMax: 50, charge: 200, freeAbove: 3000 },
  { id: 4, name: "Kokuvil", nameTA: "கொக்குவில்", timeMin: 35, timeMax: 55, charge: 200, freeAbove: 3000 },
  { id: 5, name: "Kondavil", nameTA: "கொண்டாவில்", timeMin: 30, timeMax: 50, charge: 200, freeAbove: 3000 },
];

export const cuttingOptions = [
  { label: "Whole (முழுமையாக)", value: "whole" },
  { label: "Curry Cut (குழம்பு வெட்டு)", value: "curry_cut" },
  { label: "Fry Cut (பொரியல் வெட்டு)", value: "fry_cut" },
  { label: "Cleaned (சுத்தம் செய்யப்பட்ட)", value: "cleaned" },
  { label: "Skin Removed (தோல் நீக்கப்பட்ட)", value: "skin_removed" },
];

// Business constants from settings
export const BUSINESS = {
  name: "Meenavan | மீனவன்",
  phone: "0712341017",
  email: "info@meenavan.lk",
  whatsapp: "94712341017",
  currency: "Rs.",
  minOrder: 500,
  freeDeliveryAbove: 2000,
  location: "Jaffna, Sri Lanka",
  deliveryHours: "7AM – 9PM",
  domain: "meenavan.lk",
};
