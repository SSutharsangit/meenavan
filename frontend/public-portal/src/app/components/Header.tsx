"use client";

import { Fish, Clock, Phone, MapPin, Search, Heart, ShoppingBag, Menu, X, User, ChevronDown } from "lucide-react";
import { BUSINESS } from "../data";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useCartStore } from "../store/cartStore";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Fresh Catch", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "Offers", href: "/offers" },
  { label: "Track Order", href: "/track-order" },
];

export default function Header() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.items.length);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-slate-900 text-white text-xs py-2 px-6">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> Delivery: {BUSINESS.deliveryHours}
            </span>
            <span className="hidden md:flex items-center gap-1">
              <Phone className="w-3 h-3" /> {BUSINESS.phone}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" /> {BUSINESS.location}
            </span>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-32">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center px-6 py-4 border-b border-slate-100">
              <Search className="w-5 h-5 text-slate-400 mr-3" />
              <input
                autoFocus
                type="text"
                placeholder="Search for fish, prawns, crabs..."
                className="flex-1 text-lg outline-none text-slate-900 placeholder:text-slate-300"
              />
              <button onClick={() => setSearchOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-3">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {["Tuna", "Prawns", "Crab", "Pomfret", "Squid", "Red Snapper"].map(term => (
                  <Link key={term} href={`/products?search=${term}`} onClick={() => setSearchOpen(false)}
                    className="px-4 py-2 bg-slate-50 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700 rounded-full text-sm font-medium transition-colors">
                    {term}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Fish className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-xl font-black text-slate-900 leading-none">MEENAVAN</div>
              <div className="text-[10px] text-slate-400 font-medium tracking-wider">மீனவன் • FRESH SEAFOOD</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-1 bg-slate-50 rounded-full px-2 py-1.5">
            {navLinks.map(item => (
              <Link key={item.label} href={item.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  pathname === item.href
                    ? "bg-white text-cyan-700 shadow-sm"
                    : "text-slate-600 hover:text-cyan-700 hover:bg-white"
                }`}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setSearchOpen(true)} className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors">
              <Search className="w-5 h-5 text-slate-600" />
            </button>
            <Link href="/cart" className="w-10 h-10 rounded-full bg-cyan-600 hover:bg-cyan-700 flex items-center justify-center transition-colors relative">
              <ShoppingBag className="w-5 h-5 text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link href="/account" className="hidden md:flex w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 items-center justify-center transition-colors">
              <User className="w-5 h-5 text-slate-600" />
            </Link>
            <button className="md:hidden w-10 h-10 flex items-center justify-center" onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="md:hidden border-t border-slate-100 bg-white">
            <div className="container mx-auto px-6 py-4 space-y-1">
              {navLinks.map(item => (
                <Link key={item.label} href={item.href} onClick={() => setMobileMenu(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    pathname === item.href
                      ? "bg-cyan-50 text-cyan-700"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}>
                  {item.label}
                </Link>
              ))}
              <Link href="/account" onClick={() => setMobileMenu(false)}
                className="block px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50">
                My Account
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
