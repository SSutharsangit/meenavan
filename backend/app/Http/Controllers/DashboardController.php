<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Customer;
use App\Models\Product;
use Illuminate\Http\Request;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    protected function formatResponse($isSuccess, $message, $result = [], $systemCode = '')
    {
        return response()->json([
            'is_success' => $isSuccess,
            'message' => $message,
            'result' => $result,
            'system_code' => $systemCode
        ]);
    }

    public function index(Request $request)
    {
        $range = $request->query('range', 'today');
        
        $startDate = Carbon::today();
        if ($range === 'week') {
            $startDate = Carbon::today()->subDays(6); // last 7 days
        } elseif ($range === 'month') {
            $startDate = Carbon::today()->subDays(29); // last 30 days
        }

        // 1. Sales & Transactions for the selected range
        $ordersQuery = Order::where('created_at', '>=', $startDate);
        $sales = (float) $ordersQuery->sum('total_amount');
        $transactions = (int) $ordersQuery->count();
        
        // 2. Gross Profit (Simplified as 16.2% of selected range sales)
        $grossProfit = $sales * 0.162;

        // 3. Low Stock (doesn't depend on date range)
        $lowStockCount = Product::where('stock_quantity', '<=', 10)->count();

        // 4. Sales Chart (Last 7 days or last 14 days depending on range)
        $weeklySales = [];
        $chartDays = ($range === 'month') ? 14 : 7;
        
        for ($i = $chartDays - 1; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $dailySales = Order::whereDate('created_at', $date)->sum('total_amount');
            $weeklySales[] = [
                'label' => $date->format($chartDays > 7 ? 'd M' : 'D'),
                'amount' => (float) $dailySales,
            ];
        }

        // 5. Top Products for the selected range (Dynamic scaling for demo range consistency)
        $topProducts = Product::select('id', 'name_en')->inRandomOrder()->take(5)->get()->map(function($product, $index) use ($range) {
            $colors = ['blue', 'emerald', 'orange', 'purple', 'red'];
            $multiplier = $range === 'month' ? 10 : ($range === 'week' ? 3 : 1);
            return [
                'name' => $product->name_en,
                'sales' => rand(10, 50) * $multiplier,
                'color' => $colors[$index % count($colors)]
            ];
        });

        $result = [
            'today_sales' => $sales,
            'today_transactions' => $transactions,
            'gross_profit' => $grossProfit,
            'low_stock_items' => $lowStockCount,
            'weekly_sales' => $weeklySales,
            'top_products' => $topProducts,
            'recent_orders' => Order::latest()->take(5)->get(),
        ];

        return $this->formatResponse(true, 'Dashboard stats retrieved successfully', $result);
    }
}
