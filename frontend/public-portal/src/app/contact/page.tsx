"use client";

import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, Send, MessageCircle, ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  { q: "How fresh is your seafood?", a: "All our seafood is sourced daily from local harbors. Most products are caught the same morning and delivered within hours. We never sell frozen or stored fish." },
  { q: "What areas do you deliver to?", a: "We currently deliver to Jaffna Town, Nallur, Chunnakam, Kokuvil, and Kondavil. We're expanding to more areas across Northern Province soon." },
  { q: "Can I choose how my fish is cut?", a: "Yes! We offer multiple cutting options including whole, steaks, fillets, curry cut, and cleaned only. You can select your preference on the product page." },
  { q: "What is your delivery time?", a: "We deliver between 7 AM and 9 PM. You can choose your preferred time slot during checkout. Express delivery (within 2 hours) is available for most areas." },
  { q: "What if I'm not satisfied with the quality?", a: "We offer a 100% quality guarantee. If you're not satisfied, report the issue within 2 hours of delivery with photo evidence, and we'll provide a full refund or replacement." },
  { q: "Do you offer bulk orders for events?", a: "Absolutely! Contact us via WhatsApp or call for bulk orders. We offer special pricing for events, restaurants, and catering services." },
];

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <>
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-cyan-500 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-2">Get in Touch</p>
            <h1 className="text-4xl md:text-5xl font-black text-white">Contact Us</h1>
            <p className="text-slate-400 mt-3">We&apos;d love to hear from you. Reach out anytime!</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info Cards */}
            <div className="space-y-4">
              {[
                { icon: <Phone className="w-6 h-6 text-cyan-600" />, title: "Call Us", info: "0712341017", sub: "Mon–Sun, 7AM–9PM" },
                { icon: <Mail className="w-6 h-6 text-cyan-600" />, title: "Email Us", info: "info@meenavan.lk", sub: "We reply within 2 hours" },
                { icon: <MapPin className="w-6 h-6 text-cyan-600" />, title: "Visit Us", info: "Jaffna, Sri Lanka", sub: "Jaffna Fish Market" },
                { icon: <MessageCircle className="w-6 h-6 text-green-600" />, title: "WhatsApp", info: "+94 71 234 1017", sub: "Quick orders & support" },
              ].map(c => (
                <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-start gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center flex-shrink-0">{c.icon}</div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">{c.title}</div>
                    <div className="text-slate-700 font-medium text-sm mt-0.5">{c.info}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{c.sub}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h2 className="text-lg font-black text-slate-900">Send us a Message</h2>
                  <p className="text-sm text-slate-500 mt-1">Fill out the form and we&apos;ll get back to you shortly</p>
                </div>
                <div className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-1.5">Name *</label>
                      <input type="text" placeholder="Your name" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 block mb-1.5">Phone *</label>
                      <input type="tel" placeholder="0712345678" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">Email</label>
                    <input type="email" placeholder="your@email.com" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">Subject</label>
                    <select className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-cyan-400 text-sm text-slate-600">
                      <option>General Inquiry</option>
                      <option>Order Issue</option>
                      <option>Bulk Order</option>
                      <option>Partnership</option>
                      <option>Feedback</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-1.5">Message *</label>
                    <textarea rows={4} placeholder="How can we help you?" className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 text-sm resize-none" />
                  </div>
                  <button className="w-full py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" /> Send Message
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-cyan-600 font-bold text-sm uppercase tracking-wider">FAQ</span>
            <h2 className="text-3xl font-black text-slate-900 mt-1">Frequently Asked Questions</h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-5 text-left">
                  <span className="font-bold text-slate-900 text-sm pr-4">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 -mt-1">
                    <p className="text-sm text-slate-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-20 bg-white" />
    </>
  );
}
