"use client";

import { motion } from "framer-motion";
import { Star, Heart, Plus, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "../store/cartStore";

interface ProductCardProps {
  id: number;
  name: string;
  nameTA: string;
  price: number;
  oldPrice: number;
  unit: string;
  rating: number;
  reviews: number;
  image: string;
  badge?: string | null;
  inStock: boolean;
  index?: number;
}

export default function ProductCard({ id, name, nameTA, price, oldPrice, unit, rating, reviews, image, badge, inStock, index = 0 }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem({ id, name, nameTA, price, oldPrice, unit, image });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const discount = Math.round(((oldPrice - price) / oldPrice) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:border-cyan-200 shadow-sm hover:shadow-xl transition-all"
    >
      <Link href={`/products/${id}`}>
        <div className="relative aspect-square bg-slate-50 overflow-hidden">
          <Image src={image} alt={name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
          {badge && (
            <span className="absolute top-3 left-3 px-3 py-1 bg-cyan-600 text-white text-xs font-bold rounded-full">
              {badge}
            </span>
          )}
          {discount > 0 && (
            <span className="absolute top-3 right-12 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full">
              -{discount}%
            </span>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
              <span className="px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-bold">Out of Stock</span>
            </div>
          )}
          <button className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
            <Heart className="w-4 h-4 text-slate-400 hover:text-red-500" />
          </button>
        </div>
      </Link>
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-1 text-xs text-amber-500">
          <Star className="w-3.5 h-3.5 fill-amber-400" />
          <span className="font-bold">{rating}</span>
          <span className="text-slate-400">({reviews})</span>
        </div>
        <Link href={`/products/${id}`}>
          <h3 className="font-bold text-slate-900 leading-tight hover:text-cyan-700 transition-colors">{name}</h3>
        </Link>
        <p className="text-xs text-slate-400">{nameTA} • {unit}</p>
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-slate-900">Rs. {price}</span>
            <span className="text-sm text-slate-400 line-through">Rs. {oldPrice}</span>
          </div>
          <button
            disabled={!inStock}
            onClick={handleAdd}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
              added
                ? "bg-green-500 text-white scale-110"
                : "bg-cyan-50 text-cyan-700 hover:bg-cyan-600 hover:text-white"
            }`}
          >
            {added ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
