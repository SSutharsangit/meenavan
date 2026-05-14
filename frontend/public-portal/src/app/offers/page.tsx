"use client";

import { motion } from "framer-motion";
import { Copy, Tag, Clock, ChevronRight, Sparkles } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { offers } from "../data";

export default function OffersPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <p className="text-amber-400 font-semibold text-sm uppercase tracking-wider">Special Deals</p>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white">Offers & Deals</h1>
            <p className="text-slate-400 mt-3 max-w-xl">Save big on premium seafood with our exclusive offers and coupon codes.</p>
          </motion.div>
        </div>
      </section>

      {/* Offers Grid */}
      <section className="py-16 bg-slate-50 min-h-screen">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {offers.map((offer, i) => (
              <motion.div key={offer.id}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all"
              >
                <div className={`bg-gradient-to-r ${offer.gradient} p-8 text-white relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                  <div className="relative z-10">
                    <div className="text-5xl mb-3">{offer.icon}</div>
                    <h2 className="text-2xl font-black">{offer.title}</h2>
                    <p className="text-white/90 text-lg mt-1">{offer.subtitle}</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Tag className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-500">Coupon Code</span>
                      </div>
                      <div className="font-mono text-lg font-black text-slate-900 bg-slate-50 px-4 py-2 rounded-lg border-2 border-dashed border-slate-200">
                        {offer.code}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <button onClick={() => copyCode(offer.code)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                          copiedCode === offer.code
                            ? "bg-green-500 text-white"
                            : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100"
                        }`}>
                        <Copy className="w-4 h-4" />
                        {copiedCode === offer.code ? "Copied!" : "Copy Code"}
                      </button>
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="w-3 h-3" /> {offer.validUntil}
                      </div>
                    </div>
                  </div>
                  <Link href="/products" className="mt-4 flex items-center gap-1 text-cyan-700 font-semibold text-sm hover:text-cyan-800 transition-colors">
                    Shop Now <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>

          {/* How to use */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-16 bg-white rounded-3xl p-8 md:p-12 border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">How to Use Coupon Codes</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Browse & Add", desc: "Browse our fresh catch and add your favorites to cart" },
                { step: "2", title: "Apply Code", desc: "Enter the coupon code at checkout to get your discount" },
                { step: "3", title: "Save & Enjoy", desc: "Complete your order and enjoy premium seafood at great prices" },
              ].map(s => (
                <div key={s.step} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-lg mx-auto mb-4">
                    {s.step}
                  </div>
                  <h3 className="font-bold text-slate-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-slate-500">{s.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <div className="h-20 bg-white" />
    </>
  );
}
