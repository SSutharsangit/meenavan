"use client";

import { motion } from "framer-motion";
import { SlidersHorizontal, Search, ChevronDown, Grid3X3, List, X } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import ProductCard from "../components/ProductCard";
import { fetchProducts, fetchCategories } from "../utils/api";

const sortOptions = [
  { label: "Popularity", value: "popular" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Rating", value: "rating" },
  { label: "Newest", value: "newest" },
];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("popular");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts().then(setProducts);
    fetchCategories().then(setCategories);
  }, []);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.nameTA.includes(q));
    }

    if (selectedCategory) {
      filtered = filtered.filter(p => p.categoryId === selectedCategory);
    }

    if (inStockOnly) {
      filtered = filtered.filter(p => p.inStock);
    }

    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case "price_asc": filtered.sort((a, b) => a.price - b.price); break;
      case "price_desc": filtered.sort((a, b) => b.price - a.price); break;
      case "rating": filtered.sort((a, b) => b.rating - a.rating); break;
      default: filtered.sort((a, b) => b.reviews - a.reviews);
    }

    return filtered;
  }, [search, selectedCategory, sortBy, priceRange, inStockOnly]);

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
            <p className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-2">Fresh from the Ocean</p>
            <h1 className="text-4xl md:text-5xl font-black text-white">Our Fresh Catch</h1>
            <p className="text-slate-400 mt-3 max-w-xl">Browse our premium selection of seafood, sourced daily from the finest harbors across Jaffna.</p>
          </motion.div>
        </div>
      </section>

      {/* Filters + Products */}
      <section className="py-10 bg-slate-50 min-h-screen">
        <div className="container mx-auto px-6">
          {/* Search and Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search fish, prawns, crabs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-slate-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none text-sm transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-medium transition-all ${
                  showFilters ? "bg-cyan-50 border-cyan-300 text-cyan-700" : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-3 bg-white rounded-2xl border border-slate-200 text-sm font-medium text-slate-600 outline-none focus:border-cyan-400 cursor-pointer"
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !selectedCategory ? "bg-cyan-600 text-white shadow-md shadow-cyan-200" : "bg-white text-slate-600 border border-slate-200 hover:border-cyan-300"
              }`}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat.id ? "bg-cyan-600 text-white shadow-md shadow-cyan-200" : "bg-white text-slate-600 border border-slate-200 hover:border-cyan-300"
                }`}
              >
                <span>{cat.icon}</span> {cat.name}
              </button>
            ))}
          </div>

          {/* Expandable Filters */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Price Range</label>
                  <div className="flex items-center gap-3">
                    <input type="number" value={priceRange[0]} onChange={e => setPriceRange([+e.target.value, priceRange[1]])}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-cyan-400" placeholder="Min" />
                    <span className="text-slate-400">–</span>
                    <input type="number" value={priceRange[1]} onChange={e => setPriceRange([priceRange[0], +e.target.value])}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-cyan-400" placeholder="Max" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Availability</label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-10 h-6 rounded-full transition-colors relative ${inStockOnly ? "bg-cyan-600" : "bg-slate-200"}`}
                      onClick={() => setInStockOnly(!inStockOnly)}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${inStockOnly ? "left-5" : "left-1"}`} />
                    </div>
                    <span className="text-sm text-slate-600">In stock only</span>
                  </label>
                </div>
              </div>
            </motion.div>
          )}

          {/* Results Count */}
          <p className="text-sm text-slate-500 mb-6">
            Showing <span className="font-bold text-slate-900">{filteredProducts.length}</span> products
            {selectedCategory && <span> in <span className="font-semibold text-cyan-700">{categories.find(c => c.id === selectedCategory)?.name}</span></span>}
          </p>

          {/* Products Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((p, i) => (
                <ProductCard key={p.id} {...p} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🐟</div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
              <p className="text-slate-500 mb-6">Try adjusting your filters or search term</p>
              <button onClick={() => { setSearch(""); setSelectedCategory(null); setPriceRange([0, 3000]); setInStockOnly(false); }}
                className="px-6 py-3 bg-cyan-600 text-white rounded-full font-semibold hover:bg-cyan-700 transition-colors">
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
