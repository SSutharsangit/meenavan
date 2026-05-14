"use client";

import { motion } from "framer-motion";
import { CreditCard, MapPin, Phone, User, ChevronRight, ShieldCheck, Truck, Clock, Check, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCartStore } from "../store/cartStore";
import { sendOrderViaWhatsApp } from "../utils/whatsapp";

const paymentMethods = [
  { id: "cod", label: "Cash on Delivery", icon: "💵", desc: "Pay when delivered" },
  { id: "online", label: "Online Payment", icon: "💳", desc: "Card or bank transfer" },
  { id: "bank_transfer", label: "Bank Transfer", icon: "🏦", desc: "Direct bank transfer" },
];

const timeSlots = [
  "7:00 AM - 9:00 AM",
  "9:00 AM - 11:00 AM",
  "11:00 AM - 1:00 PM",
  "2:00 PM - 4:00 PM",
  "4:00 PM - 6:00 PM",
  "6:00 PM - 8:00 PM",
];

export default function CheckoutPage() {
  const { items, getTotal, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [selectedSlot, setSelectedSlot] = useState(timeSlots[0]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [city, setCity] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);

  const total = getTotal();
  const deliveryFee = total >= 2000 ? 0 : 100;
  const grandTotal = total + deliveryFee;

  if (items.length === 0) {
    return (
      <section className="py-20 min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">No items to checkout</h1>
          <p className="text-slate-500 mb-6">Add some items to your cart first</p>
          <Link href="/products" className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-full font-bold">
            Browse Products
          </Link>
        </div>
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
            <h1 className="text-3xl md:text-4xl font-black text-white">Checkout</h1>
            <p className="text-slate-400 mt-2">Complete your order in just a few steps</p>
          </motion.div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-8">
            {["Delivery", "Payment", "Confirm"].map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step > i + 1 ? "bg-green-500 text-white" : step === i + 1 ? "bg-cyan-500 text-white" : "bg-white/10 text-white/50"
                }`}>
                  {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium ${step >= i + 1 ? "text-white" : "text-white/40"}`}>{s}</span>
                {i < 2 && <ChevronRight className="w-4 h-4 text-white/30 mx-2" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 bg-slate-50 min-h-screen">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel */}
            <div className="lg:col-span-2">
              {/* Step 1: Delivery Details */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-cyan-600" /> Delivery Details
                    </h2>
                  </div>
                  <div className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Full Name *</label>
                        <input type="text" placeholder="Enter your full name"
                          value={customerName} onChange={e => setCustomerName(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-sm" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">Phone Number *</label>
                        <input type="tel" placeholder="0712345678"
                          value={customerPhone} onChange={e => setCustomerPhone(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-1.5">Address *</label>
                      <textarea rows={3} placeholder="Enter your delivery address"
                        value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-sm resize-none" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">City *</label>
                        <input type="text" placeholder="City"
                          value={city} onChange={e => setCity(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-sm" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">State *</label>
                        <input type="text" value="Northern Province" readOnly
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none bg-slate-50 text-sm" />
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-slate-700 block mb-1.5">PIN Code *</label>
                        <input type="text" placeholder="600001"
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-sm" />
                      </div>
                    </div>

                    {/* Delivery Time Slot */}
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-3">
                        <Clock className="w-4 h-4 inline mr-1 text-cyan-600" /> Preferred Delivery Slot
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {timeSlots.map(slot => (
                          <button key={slot} onClick={() => setSelectedSlot(slot)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                              selectedSlot === slot
                                ? "bg-cyan-600 text-white shadow-md shadow-cyan-200"
                                : "bg-slate-50 text-slate-600 border border-slate-200 hover:border-cyan-300"
                            }`}>
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-1.5">Delivery Instructions (Optional)</label>
                      <input type="text" placeholder="E.g., Ring doorbell, leave at gate..."
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-sm" />
                    </div>

                    <button onClick={() => setStep(2)}
                      className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all">
                      Continue to Payment
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-cyan-600" /> Payment Method
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {paymentMethods.map(method => (
                      <button key={method.id} onClick={() => setSelectedPayment(method.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                          selectedPayment === method.id
                            ? "border-cyan-500 bg-cyan-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}>
                        <span className="text-2xl">{method.icon}</span>
                        <div className="flex-1">
                          <div className="font-bold text-slate-900 text-sm">{method.label}</div>
                          <div className="text-xs text-slate-400">{method.desc}</div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedPayment === method.id ? "border-cyan-500 bg-cyan-500" : "border-slate-300"
                        }`}>
                          {selectedPayment === method.id && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    ))}

                    <div className="flex gap-3 pt-4">
                      <button onClick={() => setStep(1)}
                        className="px-6 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
                        Back
                      </button>
                      <button onClick={() => setStep(3)}
                        className="flex-1 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all">
                        Review Order
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Confirm */}
              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-cyan-600" /> Review & Confirm
                    </h2>
                  </div>
                  <div className="p-6 space-y-6">
                    {/* Items review */}
                    <div className="space-y-3">
                      {items.map(item => (
                        <div key={item.id} className="flex items-center gap-3 py-2 border-b border-slate-50">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-50 flex-shrink-0">
                            <Image src={item.image} alt={item.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-slate-900 truncate">{item.name}</div>
                            <div className="text-xs text-slate-400">Qty: {item.quantity} × Rs. {item.price}</div>
                          </div>
                          <div className="font-bold text-slate-900 text-sm">Rs. {item.price * item.quantity}</div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Delivery Slot</span><span className="font-medium">{selectedSlot}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-slate-500">Payment</span><span className="font-medium">{paymentMethods.find(m => m.id === selectedPayment)?.label}</span></div>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setStep(2)}
                        className="px-6 py-3.5 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
                        Back
                      </button>
                      <button
                        onClick={() => {
                          sendOrderViaWhatsApp({
                            items,
                            customerName,
                            customerPhone,
                            deliveryAddress: `${deliveryAddress}, ${city}`,
                            deliverySlot: selectedSlot,
                            paymentMethod: paymentMethods.find(m => m.id === selectedPayment)?.label,
                            subtotal: total,
                            deliveryFee,
                            total: grandTotal,
                          });
                          setOrderPlaced(true);
                          clearCart();
                        }}
                        className="flex-1 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-green-500/20 hover:shadow-green-500/40 transition-all flex items-center justify-center gap-2">
                        <MessageCircle className="w-5 h-5" /> Place Order via WhatsApp • Rs. {grandTotal}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Panel — Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm sticky top-24">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-black text-slate-900">Order Summary</h2>
                </div>
                <div className="p-6 space-y-3">
                  {items.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-slate-500 truncate max-w-[60%]">{item.name} × {item.quantity}</span>
                      <span className="font-semibold text-slate-900">Rs. {item.price * item.quantity}</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Subtotal</span>
                      <span className="font-semibold">Rs. {total}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Delivery</span>
                      <span className={`font-semibold ${deliveryFee === 0 ? "text-green-600" : ""}`}>{deliveryFee === 0 ? "FREE" : `Rs. ${deliveryFee}`}</span>
                    </div>
                    <div className="pt-3 border-t border-slate-100 flex justify-between">
                      <span className="font-bold">Total</span>
                      <span className="text-xl font-black text-slate-900">Rs. {grandTotal}</span>
                    </div>
                  </div>
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
