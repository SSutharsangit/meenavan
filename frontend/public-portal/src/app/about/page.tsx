"use client";

import { motion } from "framer-motion";
import { Fish, Anchor, Truck, ShieldCheck, Users, Award, Heart, Clock } from "lucide-react";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5 } };

const stats = [
  { value: "500+", label: "Products", icon: <Fish className="w-6 h-6" /> },
  { value: "10,000+", label: "Happy Customers", icon: <Users className="w-6 h-6" /> },
  { value: "15+", label: "Harbors Connected", icon: <Anchor className="w-6 h-6" /> },
  { value: "2 hrs", label: "Avg Delivery Time", icon: <Clock className="w-6 h-6" /> },
];

const values = [
  { icon: <Fish className="w-7 h-7 text-cyan-600" />, title: "Freshness First", desc: "Every product is sourced daily from coastal harbors, never frozen or stored." },
  { icon: <ShieldCheck className="w-7 h-7 text-cyan-600" />, title: "Quality Assured", desc: "Rigorous quality checks at every step from harbor to your doorstep." },
  { icon: <Truck className="w-7 h-7 text-cyan-600" />, title: "Cold Chain Delivery", desc: "Temperature-controlled delivery ensuring freshness is maintained throughout." },
  { icon: <Heart className="w-7 h-7 text-cyan-600" />, title: "Customer Love", desc: "We treat every customer like family. Your satisfaction is our mission." },
  { icon: <Award className="w-7 h-7 text-cyan-600" />, title: "Premium Selection", desc: "Only the finest catch makes it to our platform. We never compromise." },
  { icon: <Users className="w-7 h-7 text-cyan-600" />, title: "Community Support", desc: "Direct sourcing supports local fishing communities across Jaffna." },
];

export default function AboutPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-6 relative z-10 text-center max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-2">Our Story</p>
            <h1 className="text-4xl md:text-5xl font-black text-white">About Meenavan</h1>
            <p className="text-slate-400 mt-4 text-lg leading-relaxed">
              Born from a passion for fresh seafood and a mission to connect Jaffna&apos;s coastal treasures directly to your kitchen.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white relative -mt-8">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <motion.div key={s.label} {...fadeUp} transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 text-center shadow-lg border border-slate-100">
                <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600 mx-auto mb-3">{s.icon}</div>
                <div className="text-2xl font-black text-slate-900">{s.value}</div>
                <div className="text-sm text-slate-500">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div {...fadeUp} className="text-center space-y-6">
            <h2 className="text-3xl font-black text-slate-900">From the Harbor to Your Home</h2>
            <p className="text-slate-600 leading-relaxed text-lg">
              Meenavan (மீனவன்) means &quot;Fisherman&quot; in Tamil — and that&apos;s exactly who we represent. We started with a simple idea: what if you could get the same quality seafood that fishing families enjoy, delivered fresh to your doorstep?
            </p>
            <p className="text-slate-600 leading-relaxed text-lg">
              Today, we work directly with fishing communities across Jaffna&apos;s coastal harbors, ensuring fair prices for fishermen and unmatched freshness for our customers. Every order is cleaned, cut to your preference, and delivered in temperature-controlled packaging within hours of being caught.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section id="values" className="py-20 bg-slate-50">
        <div className="container mx-auto px-6">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="text-cyan-600 font-bold text-sm uppercase tracking-wider">What Drives Us</span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">Our Values</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <motion.div key={v.title} {...fadeUp} transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl p-6 border border-slate-100 hover:border-cyan-200 shadow-sm hover:shadow-lg transition-all">
                <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center mb-4">{v.icon}</div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{v.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Shipping & Returns */}
      <section id="shipping" className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-4xl">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900">Shipping & Returns</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 rounded-2xl p-8">
              <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2"><Truck className="w-5 h-5 text-cyan-600" /> Shipping Policy</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>• Free delivery on orders above Rs. 2,000</li>
                <li>• Delivery charge: Rs. 100–200 based on area</li>
                <li>• Delivery hours: 7:00 AM – 9:00 PM</li>
                <li>• Temperature-controlled packaging for all orders</li>
                <li>• Currently serving Jaffna Town, Nallur, Chunnakam, Kokuvil & Kondavil</li>
              </ul>
            </div>
            <div id="returns" className="bg-slate-50 rounded-2xl p-8">
              <h3 className="font-bold text-slate-900 text-lg mb-4 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-cyan-600" /> Return Policy</h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>• Full refund if quality is not satisfactory</li>
                <li>• Report issues within 2 hours of delivery</li>
                <li>• Photo evidence required for quality claims</li>
                <li>• Replacement or refund processed within 24 hours</li>
                <li>• No questions asked for first-time complaints</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="h-20 bg-white" />
    </>
  );
}
