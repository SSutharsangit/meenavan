"use client";

import { motion } from "framer-motion";
import { Star, Heart, Minus, Plus, ShoppingBag, Truck, ShieldCheck, RotateCcw, Check, ChevronRight, Fish, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { cuttingOptions } from "../../data";
import { fetchProductById, fetchProducts } from "../../utils/api";
import ProductCard from "../../components/ProductCard";
import { useCartStore } from "../../store/cartStore";
import { sendProductInquiry } from "../../utils/whatsapp";



export default function ProductDetailPage() {
  const params = useParams();
  const productId = String(params.id);
  const addItem = useCartStore(s => s.addItem);

  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [qty, setQty] = useState(1);
  const [selectedCut, setSelectedCut] = useState("whole");
  const [activeImage, setActiveImage] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetchProductById(productId).then(data => {
      setProduct(data);
      if (data) {
        fetchProducts({ category_id: data.categoryId }).then(all => {
          setRelatedProducts(all.filter((p: any) => p.id !== data.id).slice(0, 4));
        });
      }
      setLoading(false);
    });
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-slate-500">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🐟</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Product not found</h1>
          <Link href="/products" className="text-cyan-600 font-semibold hover:text-cyan-700">← Back to Products</Link>
        </div>
      </div>
    );
  }

  const discount = Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) || 0;

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) {
      addItem({ id: product.id, name: product.name, nameTA: product.nameTA, price: product.price, oldPrice: product.oldPrice, unit: product.unit, image: product.image });
    }
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-slate-50 border-b border-slate-100">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-cyan-600 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/products" className="hover:text-cyan-600 transition-colors">Products</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900 font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Detail */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              <div className="relative aspect-square bg-slate-50 rounded-3xl overflow-hidden border border-slate-100">
                <Image src={product.image} alt={product.name} fill className="object-cover" priority />
                {product.badge && (
                  <span className="absolute top-4 left-4 px-4 py-1.5 bg-cyan-600 text-white text-sm font-bold rounded-full">{product.badge}</span>
                )}
                {discount > 0 && (
                  <span className="absolute top-4 right-4 px-3 py-1.5 bg-red-500 text-white text-sm font-bold rounded-full">-{discount}%</span>
                )}
              </div>
              {/* Thumbnail strip */}
              <div className="flex gap-3">
                {[product.image, product.image, product.image].map((img, i) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? "border-cyan-500" : "border-slate-200 hover:border-slate-300"}`}>
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Product Info */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div>
                <div className="flex items-center gap-2 text-sm mb-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span className="font-bold">{product.rating}</span>
                  </div>
                  <span className="text-slate-400">({product.reviews} reviews)</span>
                  {product.inStock ? (
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-bold rounded-full">In Stock</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-red-50 text-red-700 text-xs font-bold rounded-full">Out of Stock</span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-slate-900">{product.name}</h1>
                <p className="text-slate-400 text-lg mt-1">{product.nameTA}</p>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-slate-900">Rs. {product.price}</span>
                <span className="text-xl text-slate-400 line-through">Rs. {product.oldPrice}</span>
                {discount > 0 && <span className="text-green-600 font-bold text-sm">Save Rs. {product.oldPrice - product.price}</span>}
              </div>

              <p className="text-slate-600 leading-relaxed">{product.description}</p>

              {/* Product meta */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Weight", value: product.weight },
                  { label: "Origin", value: product.origin },
                  { label: "Freshness", value: product.freshness },
                ].map(m => (
                  <div key={m.label} className="bg-slate-50 rounded-xl p-3 text-center">
                    <div className="text-xs text-slate-400 mb-1">{m.label}</div>
                    <div className="text-sm font-bold text-slate-900">{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Cutting Options */}
              <div>
                <label className="text-sm font-bold text-slate-700 block mb-3">Cutting Preference</label>
                <div className="flex flex-wrap gap-2">
                  {cuttingOptions.map(opt => (
                    <button key={opt.value} onClick={() => setSelectedCut(opt.value)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        selectedCut === opt.value
                          ? "bg-cyan-600 text-white shadow-md shadow-cyan-200"
                          : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-cyan-300"
                      }`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-11 h-11 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 h-11 flex items-center justify-center font-bold text-slate-900 border-x border-slate-200">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-11 h-11 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  disabled={!product.inStock}
                  onClick={handleAddToCart}
                  className={`flex-1 py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    added
                      ? "bg-green-500 text-white"
                      : "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5"
                  }`}
                >
                  {added ? <><Check className="w-5 h-5" /> Added to Cart!</> : <><ShoppingBag className="w-5 h-5" /> Add to Cart • Rs. {product.price * qty}</>}
                </button>

                <button className="w-11 h-11 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-colors">
                  <Heart className="w-5 h-5" />
                </button>
              </div>

              {/* WhatsApp Order */}
              <button
                onClick={() => sendProductInquiry({
                  name: product.name,
                  nameTA: product.nameTA,
                  price: product.price,
                  unit: product.unit,
                })}
                className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-100 hover:border-green-300 transition-all"
              >
                <MessageCircle className="w-5 h-5" /> Order via WhatsApp
              </button>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                {[
                  { icon: <Truck className="w-5 h-5 text-cyan-600" />, label: "Free delivery above Rs. 2,000" },
                  { icon: <ShieldCheck className="w-5 h-5 text-cyan-600" />, label: "Quality guaranteed" },
                  { icon: <RotateCcw className="w-5 h-5 text-cyan-600" />, label: "Easy returns" },
                ].map(b => (
                  <div key={b.label} className="flex items-center gap-2 text-xs text-slate-500">
                    {b.icon} <span>{b.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="container mx-auto px-6">
            <h2 className="text-2xl font-black text-slate-900 mb-8">You Might Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p.id} {...p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Spacer for footer newsletter */}
      <div className="h-20 bg-white" />
    </>
  );
}
