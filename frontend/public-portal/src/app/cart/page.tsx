"use client";

import { motion } from "framer-motion";
import { Minus, Plus, X, ShoppingBag, ArrowRight, Truck, ShieldCheck, Tag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "../store/cartStore";

export default function CartPage() {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const total = getTotal();
  const deliveryFee = total >= 2000 ? 0 : 100;
  const grandTotal = total + deliveryFee;

  if (items.length === 0) {
    return (
      <section className="py-20 min-h-screen flex items-center justify-center bg-slate-50">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md mx-auto px-6">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-10 h-10 text-slate-300" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Your cart is empty</h1>
          <p className="text-slate-500 mb-8">Looks like you haven&apos;t added any fresh catch yet. Browse our premium selection!</p>
          <Link href="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all">
            Start Shopping <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>
    );
  }

  return (
    <>
      {/* Page Header */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-3xl md:text-4xl font-black text-white">Shopping Cart</h1>
            <p className="text-slate-400 mt-2">{items.length} item{items.length > 1 ? "s" : ""} in your cart</p>
          </motion.div>
        </div>
      </section>

      <section className="py-10 bg-slate-50 min-h-screen">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, i) => (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-white rounded-2xl p-4 md:p-6 border border-slate-100 shadow-sm flex gap-4"
                >
                  <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-slate-50 flex-shrink-0">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Link href={`/products/${item.id}`} className="font-bold text-slate-900 hover:text-cyan-700 transition-colors">{item.name}</Link>
                        <p className="text-xs text-slate-400 mt-0.5">{item.nameTA} • {item.unit}</p>
                      </div>
                      <button onClick={() => removeItem(item.id)}
                        className="w-8 h-8 rounded-full bg-slate-50 hover:bg-red-50 flex items-center justify-center transition-colors flex-shrink-0">
                        <X className="w-4 h-4 text-slate-400 hover:text-red-500" />
                      </button>
                    </div>
                    <div className="flex items-end justify-between mt-4">
                      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 h-9 flex items-center justify-center font-bold text-sm text-slate-900 border-x border-slate-200">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-slate-900">Rs. {item.price * item.quantity}</div>
                        {item.quantity > 1 && <div className="text-xs text-slate-400">Rs. {item.price} each</div>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors">
                Clear entire cart
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm sticky top-24">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-black text-slate-900">Order Summary</h2>
                </div>

                {/* Coupon */}
                <div className="px-6 py-4 border-b border-slate-100">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input type="text" placeholder="Enter coupon code"
                        className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-cyan-400" />
                    </div>
                    <button className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors">Apply</button>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Subtotal</span>
                    <span className="font-semibold text-slate-900">Rs. {total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Delivery</span>
                    {deliveryFee === 0 ? (
                      <span className="font-semibold text-green-600">FREE</span>
                    ) : (
                      <span className="font-semibold text-slate-900">Rs. {deliveryFee}</span>
                    )}
                  </div>
                  {deliveryFee > 0 && (
                    <p className="text-xs text-cyan-600 bg-cyan-50 rounded-lg px-3 py-2">
                      Add Rs. {2000 - total} more for FREE delivery!
                    </p>
                  )}
                  <div className="pt-3 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-900">Total</span>
                      <span className="text-2xl font-black text-slate-900">Rs. {grandTotal}</span>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-6 space-y-3">
                  <Link href="/checkout"
                    className="block w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold text-center shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all">
                    Proceed to Checkout
                  </Link>
                  <Link href="/products"
                    className="block w-full py-3 bg-slate-50 text-slate-600 rounded-xl font-semibold text-center hover:bg-slate-100 transition-colors text-sm">
                    Continue Shopping
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="px-6 pb-6 space-y-2 border-t border-slate-100 pt-4">
                  {[
                    { icon: <Truck className="w-4 h-4 text-cyan-600" />, text: "Free delivery on orders above Rs. 2,000" },
                    { icon: <ShieldCheck className="w-4 h-4 text-cyan-600" />, text: "100% fresh quality guaranteed" },
                  ].map(b => (
                    <div key={b.text} className="flex items-center gap-2 text-xs text-slate-500">{b.icon} <span>{b.text}</span></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-20 bg-white" />
    </>
  );
}
