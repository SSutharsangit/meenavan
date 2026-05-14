"use client";

import { motion } from "framer-motion";
import { ArrowRight, Fish, ShieldCheck, Truck, Ship, Star, Phone, ChevronRight, MessageCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "./components/ProductCard";
import { categories, products, testimonials } from "./data";
import { openWhatsAppChat } from "./utils/whatsapp";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/hero.png" alt="Fresh Seafood" fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent" />
        </div>
        <div className="container mx-auto px-6 relative z-10 flex items-center min-h-[600px]">
          <div className="max-w-2xl space-y-8">
            <motion.div {...fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-cyan-300 font-semibold text-sm border border-white/10">
              <Ship className="w-4 h-4" /> Fresh Morning Catch • Order Before 10AM
            </motion.div>
            <motion.h1 {...fadeUp} transition={{ delay: 0.1 }} className="text-5xl md:text-7xl font-black text-white leading-[1.1]">
              Ocean Fresh, <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">Delivered to Your Door.</span>
            </motion.h1>
            <motion.p {...fadeUp} transition={{ delay: 0.2 }} className="text-lg text-slate-300 max-w-lg">
              Premium seafood sourced directly from Jaffna&apos;s finest coastal harbors. Cleaned, cut to your preference, and delivered fresh within hours.
            </motion.p>
            <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="flex flex-wrap gap-4">
              <Link href="/products" className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-bold shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:-translate-y-1 transition-all flex items-center gap-2">
                Order Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/categories" className="px-8 py-4 bg-white/10 backdrop-blur text-white rounded-full font-bold border border-white/20 hover:bg-white/20 transition-all">
                Browse Categories
              </Link>
            </motion.div>
            <motion.div {...fadeUp} transition={{ delay: 0.4 }} className="flex items-center gap-6 pt-4">
              {[["156+", "Products"], ["1,200+", "Customers"], ["4.9★", "Rating"]].map(([val, label]) => (
                <div key={label} className="text-center"><div className="text-2xl font-black text-white">{val}</div><div className="text-xs text-slate-400">{label}</div></div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900">Shop by Category</h2>
            <p className="text-slate-500 mt-2">Find your favorite seafood quickly</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, i) => (
              <motion.div key={cat.name} {...fadeUp} transition={{ delay: i * 0.05 }}>
                <Link href={`/products?category=${cat.id}`}
                  className="group block cursor-pointer bg-white rounded-2xl p-5 text-center shadow-sm hover:shadow-lg border border-slate-100 hover:border-cyan-200 transition-all hover:-translate-y-1">
                  <div className="text-4xl mb-3">{cat.icon}</div>
                  <div className="font-bold text-slate-900 text-sm">{cat.name}</div>
                  <div className="text-xs text-slate-400 mt-1">{cat.count} items</div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div {...fadeUp} className="flex items-end justify-between mb-12">
            <div>
              <span className="text-cyan-600 font-bold text-sm uppercase tracking-wider">Fresh Arrivals</span>
              <h2 className="text-3xl font-black text-slate-900 mt-1">Today&apos;s Special Catch</h2>
            </div>
            <Link href="/products" className="hidden md:flex items-center gap-1 text-cyan-700 font-semibold hover:text-cyan-800">View All <ChevronRight className="w-4 h-4" /></Link>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((p, i) => (
              <ProductCard key={p.id} {...p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Banner */}
      <section className="py-16 bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: <Fish className="w-8 h-8" />, title: "100% Fresh Catch", desc: "Sourced daily from local harbors" },
              { icon: <ShieldCheck className="w-8 h-8" />, title: "Custom Cleaning & Cutting", desc: "Prepared exactly to your liking" },
              { icon: <Truck className="w-8 h-8" />, title: "Express Cold Delivery", desc: "Temperature controlled, within 2 hours" },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">{f.icon}</div>
                <div><h3 className="font-bold text-lg">{f.title}</h3><p className="text-cyan-100 text-sm mt-1">{f.desc}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="text-cyan-600 font-bold text-sm uppercase tracking-wider">Testimonials</span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">What Our Customers Say</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((t, i) => (
              <motion.div key={i} {...fadeUp} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="flex gap-1">{Array(t.rating).fill(0).map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
                <p className="text-slate-600 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">{t.name[0]}</div>
                  <div><div className="font-bold text-slate-900 text-sm">{t.name}</div><div className="text-xs text-slate-400">{t.location}</div></div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA — extra bottom padding for footer newsletter overlap */}
      <section className="py-20 pb-36 bg-white">
        <div className="container mx-auto px-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
            <div className="relative z-10 max-w-xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-4xl font-black text-white">Order via WhatsApp</h2>
              <p className="text-slate-400">Can&apos;t find what you need? Send us your order directly on WhatsApp and we&apos;ll handle the rest!</p>
              <button onClick={() => openWhatsAppChat()} className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold shadow-lg shadow-green-500/30 hover:scale-105 transition-all flex items-center gap-2 mx-auto">
                <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
