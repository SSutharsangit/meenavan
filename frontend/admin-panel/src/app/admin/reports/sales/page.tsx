"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp, ShoppingBag, CheckCircle, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/admin-config";
import { apiGetSalesAnalytics } from "./_utils/api-service";
import PageHeader from "@/components/common/PageHeader";

export default function SalesAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const res = await apiGetSalesAnalytics();
      if (res.is_success) setData(res.result);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;
  if (!data) return <div className="text-center text-red-500 p-8">Failed to load sales data.</div>;

  const maxRevenue = Math.max(...data.last_7_days.map((d: any) => d.revenue), 1);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Analytics"
        subtitle="Overview of revenue and order performance."
        icon={TrendingUp}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Revenue</div>
            <div className="text-2xl font-black text-slate-900">{formatCurrency(data.overview.total_revenue, 0)}</div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Total Orders</div>
            <div className="text-2xl font-black text-slate-900">{data.overview.total_orders}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Delivered</div>
            <div className="text-2xl font-black text-slate-900">{data.overview.delivered_orders}</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Avg Order Value</div>
            <div className="text-2xl font-black text-slate-900">{formatCurrency(data.overview.average_order_value, 0)}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Last 7 Days Revenue</h2>
          <div className="h-64 flex items-end justify-between gap-2">
            {data.last_7_days.map((day: any, i: number) => {
              const height = `${(day.revenue / maxRevenue) * 100}%`;
              return (
                <div key={i} className="flex flex-col items-center flex-1 group">
                  <div className="relative w-full flex justify-center h-full items-end pb-2">
                    <div className="w-10 bg-blue-100 rounded-t-lg transition-all duration-300 group-hover:bg-blue-200 relative" style={{ height: height || '4px' }}>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {formatCurrency(day.revenue, 0)}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-semibold text-slate-500 mt-2">{day.date}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Orders by Status</h2>
          <div className="flex-1 space-y-4">
            {data.by_status.length === 0 ? (
              <div className="text-slate-400 text-sm text-center py-8">No order data available.</div>
            ) : (
              data.by_status.map((statusItem: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-slate-700 capitalize">{statusItem.status.replace('_', ' ')}</span>
                  </div>
                  <div className="text-sm font-bold text-slate-900">{statusItem.count} <span className="text-slate-400 font-normal">orders</span></div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
