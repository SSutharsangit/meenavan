"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/admin-config";
import { 
  DollarSign, 
  ShoppingCart, 
  TrendingUp, 
  AlertTriangle,
  Loader2,
  LayoutDashboard
} from "lucide-react";
import { DashboardService, DashboardStats } from "./_utils/api-service";
import PageHeader from "@/components/common/PageHeader";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<"today" | "week" | "month">("today");

  useEffect(() => {
    fetchStats(range);
  }, [range]);

  const fetchStats = async (currentRange: string) => {
    try {
      setLoading(true);
      const data = await DashboardService.getStats(currentRange);
      setStats(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load dashboard stats");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Calculate chart metrics
  const maxWeeklySales = Math.max(...(stats?.weekly_sales.map((s) => s.amount) || [0]));
  const yAxisLabels = [
    maxWeeklySales,
    maxWeeklySales * 0.75,
    maxWeeklySales * 0.5,
    maxWeeklySales * 0.25,
    0
  ].map(v => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v.toFixed(0));

  return (
    <div className="space-y-6">
      {/* Header section */}
      <PageHeader
        title="Dashboard"
        subtitle={`Welcome back. Here's your business overview for ${
          range === "today" ? "today" : range === "week" ? "this week" : "this month"
        }.`}
        icon={LayoutDashboard}
      >
        <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
          {(["today", "week", "month"] as const).map((r) => {
            const isActive = range === r;
            const label = r === "today" ? "Today" : r === "week" ? "This Week" : "This Month";
            return (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-4 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                  isActive
                    ? "bg-blue-50 text-blue-700 font-semibold dark:bg-slate-700 dark:text-blue-200"
                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </PageHeader>

      {/* Stat Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Today's Sales */}
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden relative border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {range === "today" ? "Today's Sales" : range === "week" ? "Weekly Sales" : "Monthly Sales"}
                </p>
                <h3 className="text-2xl font-extrabold text-emerald-500">{formatCurrency(stats.today_sales)}</h3>
              </div>
              <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden relative border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {range === "today" ? "Today's Transactions" : range === "week" ? "Weekly Transactions" : "Monthly Transactions"}
                </p>
                <h3 className="text-2xl font-extrabold text-blue-600">{stats.today_transactions}</h3>
              </div>
              <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                <ShoppingCart className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm font-medium text-slate-600">
              Avg basket: {formatCurrency(stats.today_transactions > 0 ? stats.today_sales / stats.today_transactions : 0)}
            </div>
          </CardContent>
        </Card>

        {/* Gross Profit */}
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden relative border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Est. Gross Profit</p>
                <h3 className="text-2xl font-extrabold text-purple-600">{formatCurrency(stats.gross_profit)}</h3>
              </div>
              <div className="h-10 w-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm font-medium text-slate-600">
              <TrendingUp className="h-4 w-4 mr-1.5 text-slate-400" />
              Margin: 16.2%
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Items */}
        <Card className="border-slate-200 shadow-sm rounded-2xl overflow-hidden relative border-l-4 border-l-orange-400 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Low Stock Items</p>
                <h3 className="text-2xl font-extrabold text-orange-500">{stats.low_stock_items}</h3>
              </div>
              <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-slate-200 shadow-sm rounded-2xl">
          <div className="p-6 pb-2">
            <h3 className="text-lg font-bold text-slate-800">
              {range === "month" ? "14-Day Sales Chart" : "Weekly Sales Chart"}
            </h3>
          </div>
          <CardContent className="p-6 pt-0">
            {/* Visual representation of the bar chart */}
            <div className="h-[250px] w-full flex items-end justify-between gap-2 mt-4 relative">
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-[10px] text-slate-400 font-medium pb-8 w-8">
                {yAxisLabels.map((lbl, idx) => <span key={idx}>{lbl}</span>)}
              </div>
              
              {/* Grid lines */}
              <div className="absolute left-8 right-0 top-0 h-[calc(100%-32px)] flex flex-col justify-between z-0">
                <div className="w-full border-t border-dashed border-slate-200 h-0" />
                <div className="w-full border-t border-dashed border-slate-200 h-0" />
                <div className="w-full border-t border-dashed border-slate-200 h-0" />
                <div className="w-full border-t border-dashed border-slate-200 h-0" />
                <div className="w-full border-t border-slate-200 h-0" />
              </div>

              {/* Bars */}
              <div className="w-full pl-10 flex items-end justify-around h-[calc(100%-32px)] z-10 pb-1">
                {stats.weekly_sales.map((item, i) => {
                  const heightPercentage = maxWeeklySales > 0 ? (item.amount / maxWeeklySales) * 100 : 0;
                  return (
                    <div key={i} className="flex flex-col items-center w-full group relative">
                      {/* Tooltip */}
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap transition-opacity pointer-events-none z-20">
                        {formatCurrency(item.amount, 0)}
                      </div>
                      <div 
                        className="w-12 rounded-t-sm bg-gradient-to-t from-blue-600 to-blue-400 group-hover:from-blue-500 group-hover:to-blue-300 transition-colors cursor-pointer" 
                        style={{ height: `${heightPercentage}%`, minHeight: heightPercentage > 0 ? '4px' : '0' }}
                      />
                      <span className="text-[11px] font-medium text-slate-500 mt-4">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 border-slate-200 shadow-sm rounded-2xl">
          <div className="p-6 pb-2 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Top Products</h3>
          </div>
          <CardContent className="p-0">
            <div className="flex flex-col h-[280px] overflow-y-auto no-scrollbar">
              {stats.top_products.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full bg-${product.color}-500 flex-shrink-0`} />
                    <span className="text-sm font-semibold text-slate-700 truncate max-w-[150px]">{product.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded-md text-slate-600">{product.sales} sales</span>
                  </div>
                </div>
              ))}
              {stats.top_products.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">No products found</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
