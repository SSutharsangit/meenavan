import { adminApiUrl } from "@/lib/admin-api";

export interface WeeklySales {
  label: string;
  amount: number;
}

export interface TopProduct {
  name: string;
  sales: number;
  color: string;
}

export interface DashboardStats {
  today_sales: number;
  today_transactions: number;
  gross_profit: number;
  low_stock_items: number;
  weekly_sales: WeeklySales[];
  top_products: TopProduct[];
  recent_orders: any[]; // Using any[] for simplicity, you can define an Order interface if needed
}

export const DashboardService = {
  getStats: async (range: string = "today"): Promise<DashboardStats> => {
    const res = await fetch(adminApiUrl(`dashboard/stats?range=${range}`));
    const data = await res.json();
    
    if (data.is_success) {
      return data.result as DashboardStats;
    }
    
    throw new Error(data.message || 'Failed to fetch dashboard stats');
  }
};
