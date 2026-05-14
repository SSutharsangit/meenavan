"use client";

import { MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { openWhatsAppChat } from "../utils/whatsapp";
import { BUSINESS } from "../data";

export default function WhatsAppFloat() {
  const [tooltip, setTooltip] = useState(true);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
      {/* Tooltip */}
      {tooltip && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 max-w-[220px] animate-in relative">
          <button
            onClick={() => setTooltip(false)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center hover:bg-slate-300 transition-colors"
          >
            <X className="w-3 h-3 text-slate-500" />
          </button>
          <p className="text-sm text-slate-700 font-medium">
            Need help? Order directly via WhatsApp! 🐟
          </p>
        </div>
      )}

      {/* WhatsApp Button */}
      <button
        onClick={openWhatsAppChat}
        className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg shadow-green-500/30 hover:shadow-green-500/50 flex items-center justify-center transition-all hover:scale-110 group"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-7 h-7 text-white" />
        {/* Pulse ring */}
        <span className="absolute w-14 h-14 rounded-full bg-green-500 animate-ping opacity-20" />
      </button>
    </div>
  );
}
