"use client";

import { Card } from "@/components/ui/card";
import { Settings, Construction } from "lucide-react";

export default function GenericPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Hero Banners</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage home page banners and featured promotions.</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl flex flex-col items-center justify-center p-24 text-center min-h-[400px]">
        <div className="h-20 w-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
          <Construction className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Module Under Construction</h2>
        <p className="text-slate-500 max-w-md mx-auto">
          We are currently building out the <strong>Hero Banners</strong> module. This section will feature full CRUD capabilities and data tables soon.
        </p>
      </Card>
    </div>
  );
}
