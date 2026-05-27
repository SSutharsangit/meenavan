"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchCategories, fetchProducts } from "../utils/api";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchCategories().then(setCategories);
    fetchProducts().then(setProducts);
  }, []);

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
            <p className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-2">Explore</p>
            <h1 className="text-4xl md:text-5xl font-black text-white">Categories</h1>
            <p className="text-slate-400 mt-3 max-w-xl">Browse our fresh seafood collection organized by category</p>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 bg-slate-50 min-h-screen">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, i) => {
              const catProducts = products.filter(p => p.categoryId === cat.id);
              return (
                <motion.div key={cat.id} {...fadeUp} transition={{ delay: i * 0.08 }}>
                  <Link href={`/products?category=${cat.id}`}
                    className="group block bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-cyan-200 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                    {/* Category Header */}
                    <div className={`bg-gradient-to-br ${cat.color} p-8 text-white relative overflow-hidden`}>
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-xl" />
                      <div className="relative z-10">
                        <div className="text-6xl mb-3">{cat.icon}</div>
                        <h2 className="text-2xl font-black">{cat.name}</h2>
                        <p className="text-white/80 text-sm mt-1">{cat.desc}</p>
                      </div>
                    </div>
                    {/* Category Info */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-slate-500">{cat.count} items available</span>
                        <span className="text-cyan-600 text-sm font-semibold group-hover:translate-x-1 transition-transform">Browse →</span>
                      </div>
                      {/* Preview products */}
                      {catProducts.length > 0 && (
                        <div className="space-y-2">
                          {catProducts.slice(0, 3).map(p => (
                            <div key={p.id} className="flex items-center justify-between py-2 border-t border-slate-50">
                              <span className="text-sm text-slate-700 font-medium">{p.name}</span>
                              <span className="text-sm font-bold text-slate-900">Rs. {p.price}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Spacer for footer newsletter */}
      <div className="h-20 bg-white" />
    </>
  );
}
