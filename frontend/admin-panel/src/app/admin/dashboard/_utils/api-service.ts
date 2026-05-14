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

const API_BASE_URL = 'http://localhost:8000/api/admin';

export const DashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`);
    const data = await res.json();
    
    if (data.is_success) {
      return data.result as DashboardStats;
    }
    
    throw new Error(data.message || 'Failed to fetch dashboard stats');
  }
};
