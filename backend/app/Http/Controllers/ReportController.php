<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
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

    public function salesAnalytics(Request $request)
    {
        // 1. High-level stats
        $totalRevenue = Order::where('status', 'delivered')->sum('total_amount');
        $totalOrders = Order::count();
        $deliveredOrders = Order::where('status', 'delivered')->count();
        $averageOrderValue = $deliveredOrders > 0 ? $totalRevenue / $deliveredOrders : 0;

        // 2. Last 7 days revenue
        $last7Days = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $revenue = Order::where('status', 'delivered')
                ->whereDate('created_at', $date)
                ->sum('total_amount');
            
            $last7Days[] = [
                'date' => $date->format('M d'),
                'revenue' => (float) $revenue,
                'orders' => Order::whereDate('created_at', $date)->count()
            ];
        }

        // 3. Sales by status
        $salesByStatus = Order::select('status', DB::raw('count(*) as count'), DB::raw('sum(total_amount) as total'))
            ->groupBy('status')
            ->get();

        $result = [
            'overview' => [
                'total_revenue' => round($totalRevenue, 2),
                'total_orders' => $totalOrders,
                'delivered_orders' => $deliveredOrders,
                'average_order_value' => round($averageOrderValue, 2)
            ],
            'last_7_days' => $last7Days,
            'by_status' => $salesByStatus
        ];

        return $this->formatResponse(true, 'Sales analytics retrieved successfully', $result);
    }

    public function inventoryInsights(Request $request)
    {
        // 1. High-level stats
        $totalProducts = Product::count();
        $activeProducts = Product::where('is_active', true)->count();
        $outOfStock = Product::where('stock_quantity', '<=', 0)->count();
        $lowStock = Product::where('stock_quantity', '>', 0)->where('stock_quantity', '<', 10)->count();

        // 2. Stock distribution by Category
        $stockByCategory = Product::with('category:id,name_en')
            ->select('category_id', DB::raw('count(*) as product_count'), DB::raw('sum(stock_quantity) as total_stock'))
            ->groupBy('category_id')
            ->get()
            ->map(function ($item) {
                return [
                    'category' => $item->category ? $item->category->name_en : 'Unknown',
                    'products' => $item->product_count,
                    'stock' => (float) $item->total_stock
                ];
            });

        // 3. Products needing attention (low/out of stock)
        $needsAttention = Product::select('id', 'name_en', 'stock_quantity', 'price_per_kg', 'is_active')
            ->where('stock_quantity', '<', 10)
            ->orderBy('stock_quantity', 'asc')
            ->limit(10)
            ->get();

        $result = [
            'overview' => [
                'total_products' => $totalProducts,
                'active_products' => $activeProducts,
                'out_of_stock' => $outOfStock,
                'low_stock' => $lowStock
            ],
            'by_category' => $stockByCategory,
            'needs_attention' => $needsAttention
        ];

        return $this->formatResponse(true, 'Inventory insights retrieved successfully', $result);
    }
}

