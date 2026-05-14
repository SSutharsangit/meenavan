"use client";

import { useState, useEffect } from "react";
import { Loader2, Package, AlertCircle, AlertTriangle, Layers } from "lucide-react";
import { apiGetInventoryInsights } from "./_utils/api-service";

export default function InventoryInsightsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await apiGetInventoryInsights();
      if (res.is_success) setData(res.result);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;
  if (!data) return <div className="text-center text-red-500 p-8">Failed to load inventory data.</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Inventory Insights</h1>
        <p className="text-slate-500 mt-1 font-medium">Monitor stock levels and category distribution.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Products</div>
            <div className="text-2xl font-black text-slate-900">{data.overview.total_products}</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Layers className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Active Products</div>
            <div className="text-2xl font-black text-slate-900">{data.overview.active_products}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Low Stock</div>
            <div className="text-2xl font-black text-slate-900">{data.overview.low_stock}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Out of Stock</div>
            <div className="text-2xl font-black text-slate-900">{data.overview.out_of_stock}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Needs Attention */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Needs Attention (Low/Out of Stock)</h2>
          <div className="space-y-4">
            {data.needs_attention.length === 0 ? (
              <div className="text-slate-400 text-sm py-4">All products have sufficient stock.</div>
            ) : (
              data.needs_attention.map((item: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">{item.name_en}</span>
                    <span className="text-xs text-slate-500">Rs. {item.price_per_kg}/kg</span>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-sm font-bold ${Number(item.stock_quantity) <= 0 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    {Number(item.stock_quantity).toFixed(2)} kg
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Stock by Category</h2>
          <div className="space-y-4">
            {data.by_category.length === 0 ? (
              <div className="text-slate-400 text-sm py-4">No category data available.</div>
            ) : (
              data.by_category.map((cat: any, i: number) => {
                const totalStockAll = data.by_category.reduce((sum: number, c: any) => sum + c.stock, 0);
                const percent = totalStockAll > 0 ? (cat.stock / totalStockAll) * 100 : 0;
                return (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-700">{cat.category}</span>
                      <span className="text-slate-500">{Number(cat.stock).toFixed(2)} kg ({cat.products} items)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
