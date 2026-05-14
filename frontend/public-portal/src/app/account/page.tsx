"use client";

import { motion } from "framer-motion";
import { User, Package, Heart, MapPin, Settings, LogOut, ChevronRight, Clock, Star } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const tabs = [
  { id: "orders", label: "My Orders", icon: <Package className="w-4 h-4" /> },
  { id: "wishlist", label: "Wishlist", icon: <Heart className="w-4 h-4" /> },
  { id: "addresses", label: "Addresses", icon: <MapPin className="w-4 h-4" /> },
  { id: "settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
];

const mockOrders = [
  { id: "MNV-2026-8742", date: "May 14, 2026", items: 3, total: 2650, status: "Out for Delivery", statusColor: "text-blue-600 bg-blue-50" },
  { id: "MNV-2026-8501", date: "May 12, 2026", items: 2, total: 1800, status: "Delivered", statusColor: "text-green-600 bg-green-50" },
  { id: "MNV-2026-8234", date: "May 9, 2026", items: 5, total: 4200, status: "Delivered", statusColor: "text-green-600 bg-green-50" },
  { id: "MNV-2026-7980", date: "May 5, 2026", items: 1, total: 1200, status: "Delivered", statusColor: "text-green-600 bg-green-50" },
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("orders");

  return (
    <>
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-2xl font-black">P</div>
            <div>
              <h1 className="text-2xl font-black text-white">Priya Menon</h1>
              <p className="text-slate-400 text-sm">priya.menon@email.com • Member since Jan 2026</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 bg-slate-50 min-h-screen">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-24">
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-5 py-4 text-sm font-medium transition-all text-left ${
                      activeTab === tab.id ? "bg-cyan-50 text-cyan-700 border-l-4 border-cyan-600" : "text-slate-600 hover:bg-slate-50 border-l-4 border-transparent"
                    }`}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
                <div className="border-t border-slate-100">
                  <button className="w-full flex items-center gap-3 px-5 py-4 text-sm font-medium text-red-500 hover:bg-red-50 transition-all text-left">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3">
              {activeTab === "orders" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-black text-slate-900 mb-6">My Orders</h2>
                  <div className="space-y-4">
                    {mockOrders.map(order => (
                      <div key={order.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{order.id}</div>
                            <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> {order.date}</div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.statusColor}`}>{order.status}</span>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                          <div className="flex gap-4 text-sm">
                            <span className="text-slate-500">{order.items} items</span>
                            <span className="font-bold text-slate-900">Rs. {order.total}</span>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/track-order`} className="px-4 py-2 bg-cyan-50 text-cyan-700 rounded-lg text-xs font-bold hover:bg-cyan-100 transition-colors">Track</Link>
                            <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors">Reorder</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "wishlist" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-black text-slate-900 mb-6">My Wishlist</h2>
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
                    <Heart className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <h3 className="font-bold text-slate-900 mb-2">Your wishlist is empty</h3>
                    <p className="text-slate-500 text-sm mb-6">Save your favorite items for later</p>
                    <Link href="/products" className="inline-flex px-6 py-3 bg-cyan-600 text-white rounded-xl font-bold text-sm hover:bg-cyan-700 transition-colors">
                      Browse Products
                    </Link>
                  </div>
                </motion.div>
              )}

              {activeTab === "addresses" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-slate-900">Saved Addresses</h2>
                    <button className="px-4 py-2 bg-cyan-600 text-white rounded-xl font-bold text-sm hover:bg-cyan-700 transition-colors">+ Add New</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { type: "Home", addr: "12, Hospital Road, Jaffna Town", isDefault: true },
                      { type: "Office", addr: "Main Street, Nallur, Jaffna", isDefault: false },
                    ].map(a => (
                      <div key={a.type} className={`bg-white rounded-2xl p-5 border-2 shadow-sm ${a.isDefault ? "border-cyan-500" : "border-slate-100"}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-slate-900 text-sm">{a.type}</span>
                          {a.isDefault && <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 text-xs font-bold rounded-full">Default</span>}
                        </div>
                        <p className="text-sm text-slate-500">{a.addr}</p>
                        <div className="flex gap-2 mt-4">
                          <button className="text-xs text-cyan-600 font-semibold hover:text-cyan-700">Edit</button>
                          <button className="text-xs text-red-500 font-semibold hover:text-red-600">Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "settings" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-black text-slate-900 mb-6">Account Settings</h2>
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="text-sm font-semibold text-slate-700 block mb-1.5">Full Name</label><input type="text" defaultValue="Priya Menon" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-cyan-400 text-sm" /></div>
                        <div><label className="text-sm font-semibold text-slate-700 block mb-1.5">Phone</label><input type="tel" defaultValue="0712341017" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-cyan-400 text-sm" /></div>
                      </div>
                      <div><label className="text-sm font-semibold text-slate-700 block mb-1.5">Email</label><input type="email" defaultValue="priya.menon@email.com" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-cyan-400 text-sm" /></div>
                      <button className="px-6 py-3 bg-cyan-600 text-white rounded-xl font-bold text-sm hover:bg-cyan-700 transition-colors">Save Changes</button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>
      <div className="h-20 bg-white" />
    </>
  );
}
