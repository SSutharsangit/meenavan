"use client";

import { Fish, Phone, Mail, MapPin, Clock, ChevronRight, ArrowUp } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8">
      <div className="container mx-auto px-6">
        {/* Newsletter */}
        <div className="bg-gradient-to-r from-cyan-600 to-blue-700 rounded-2xl p-8 md:p-10 -mt-28 mb-16 relative overflow-hidden shadow-2xl shadow-cyan-900/30">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl font-black">Get Fresh Deals 🐟</h3>
              <p className="text-cyan-100 text-sm mt-1">Subscribe for exclusive offers and morning catch alerts</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input type="email" placeholder="Enter your email" 
                className="flex-1 md:w-72 px-5 py-3 rounded-l-full bg-white/20 backdrop-blur text-white placeholder:text-cyan-200 outline-none border border-white/20 border-r-0" />
              <button className="px-6 py-3 bg-white text-cyan-700 rounded-r-full font-bold hover:bg-cyan-50 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-slate-800">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Fish className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xl font-black">MEENAVAN</div>
                <div className="text-[10px] text-slate-500">மீனவன்</div>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Premium seafood delivery platform serving the freshest catch from Jaffna&apos;s finest coastal harbors.
            </p>
            <div className="flex items-center gap-3">
              {["facebook", "instagram", "twitter", "youtube"].map(social => (
                <button key={social} className="w-9 h-9 rounded-full bg-slate-800 hover:bg-cyan-600 flex items-center justify-center transition-colors text-slate-400 hover:text-white text-xs font-bold uppercase">
                  {social[0]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { label: "Home", href: "/" },
                { label: "Products", href: "/products" },
                { label: "Categories", href: "/categories" },
                { label: "Offers", href: "/offers" },
                { label: "Track Order", href: "/track-order" },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-slate-400 text-sm hover:text-cyan-400 transition-colors flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" />{l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm">Customer Service</h4>
            <ul className="space-y-2">
              {[
                { label: "Contact Us", href: "/contact" },
                { label: "About Us", href: "/about" },
                { label: "FAQ", href: "/contact#faq" },
                { label: "Shipping Policy", href: "/about#shipping" },
                { label: "Return Policy", href: "/about#returns" },
                { label: "Privacy Policy", href: "/about#privacy" },
              ].map(l => (
                <li key={l.label}>
                  <Link href={l.href} className="text-slate-400 text-sm hover:text-cyan-400 transition-colors flex items-center gap-1">
                    <ChevronRight className="w-3 h-3" />{l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400 text-sm">0712341017</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400 text-sm">info@meenavan.lk</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400 text-sm">Jaffna, Sri Lanka</span>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                <span className="text-slate-400 text-sm">Mon–Sun: 7AM – 9PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© 2026 Meenavan. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="text-slate-600 text-xs">We accept</span>
            <div className="flex items-center gap-2">
              {["COD", "Online", "Bank Transfer"].map(m => (
                <span key={m} className="px-3 py-1 bg-slate-800 rounded-md text-xs text-slate-400 font-medium">{m}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
