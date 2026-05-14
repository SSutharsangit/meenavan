"use client";

import { motion } from "framer-motion";
import { Search, Package, Truck, MapPin, Clock, Check, ArrowRight } from "lucide-react";
import { useState } from "react";

const sampleTracking = {
  orderId: "MNV-2026-8742",
  status: "out_for_delivery",
  estimatedTime: "12:30 PM",
  items: 3,
  total: 2650,
  steps: [
    { label: "Order Placed", time: "Today, 8:15 AM", done: true },
    { label: "Order Confirmed", time: "Today, 8:16 AM", done: true },
    { label: "Being Prepared", time: "Today, 9:00 AM", done: true },
    { label: "Out for Delivery", time: "Today, 10:45 AM", done: true },
    { label: "Delivered", time: "Est. 12:30 PM", done: false },
  ],
};

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [tracking, setTracking] = useState<typeof sampleTracking | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = () => {
    setLoading(true);
    setTimeout(() => { setTracking(sampleTracking); setLoading(false); }, 1200);
  };

  return (
    <>
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-2">Real-time Updates</p>
            <h1 className="text-4xl md:text-5xl font-black text-white">Track Your Order</h1>
            <p className="text-slate-400 mt-3">Enter your order ID to see real-time delivery updates</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-slate-50 min-h-screen">
        <div className="container mx-auto px-6 max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-8">
            <label className="text-sm font-bold text-slate-700 block mb-3">Order ID</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input type="text" placeholder="E.g., MNV-2026-8742" value={orderId} onChange={(e) => setOrderId(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                  className="w-full pl-12 pr-4 py-3.5 border border-slate-200 rounded-xl outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-sm font-medium" />
              </div>
              <button onClick={handleTrack} disabled={loading}
                className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-60 flex items-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Track <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </motion.div>

          {tracking && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 bg-gradient-to-r from-cyan-600 to-blue-700 text-white">
                <div className="flex items-center justify-between">
                  <div><p className="text-cyan-200 text-xs uppercase tracking-wider">Order ID</p><p className="text-xl font-black mt-0.5">{tracking.orderId}</p></div>
                  <div className="text-right"><p className="text-cyan-200 text-xs uppercase tracking-wider">ETA</p><p className="text-xl font-black mt-0.5 flex items-center gap-1"><Clock className="w-5 h-5" /> {tracking.estimatedTime}</p></div>
                </div>
                <div className="flex gap-6 mt-4 pt-4 border-t border-white/20">
                  <div><span className="text-cyan-200 text-xs">Items</span><div className="font-bold">{tracking.items}</div></div>
                  <div><span className="text-cyan-200 text-xs">Total</span><div className="font-bold">Rs. {tracking.total}</div></div>
                  <div><span className="text-cyan-200 text-xs">Status</span><div className="font-bold flex items-center gap-1"><Truck className="w-4 h-4" /> Out for Delivery</div></div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-bold text-slate-900 mb-6">Delivery Progress</h3>
                {tracking.steps.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${step.done ? "bg-green-500 text-white" : "bg-slate-100 text-slate-400"}`}>
                        {step.done ? <Check className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                      </div>
                      {i < tracking.steps.length - 1 && <div className={`w-0.5 h-12 ${step.done ? "bg-green-500" : "bg-slate-200"}`} />}
                    </div>
                    <div className="pb-10"><div className={`font-bold text-sm ${step.done ? "text-slate-900" : "text-slate-400"}`}>{step.label}</div><div className="text-xs text-slate-400 mt-0.5">{step.time}</div></div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {!tracking && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4"><Package className="w-8 h-8 text-slate-300" /></div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Enter your order ID above</h3>
              <p className="text-slate-500 text-sm">We&apos;ll show you the real-time status of your delivery</p>
            </motion.div>
          )}
        </div>
      </section>
      <div className="h-20 bg-white" />
    </>
  );
}
