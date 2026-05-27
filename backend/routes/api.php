<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Authentication routes
Route::post('/auth/login', [\App\Http\Controllers\AuthController::class, 'login']);
Route::post('/auth/admin/login', [\App\Http\Controllers\AuthController::class, 'adminLogin']);
Route::post('/auth/logout', [\App\Http\Controllers\AuthController::class, 'logout'])->middleware('auth:sanctum');

// Public endpoints (no auth needed for browsing)
Route::get('/categories', [\App\Http\Controllers\CategoryController::class, 'index']);
Route::get('/categories/{category}', [\App\Http\Controllers\CategoryController::class, 'show']);

Route::get('/products', [\App\Http\Controllers\ProductController::class, 'index']);
Route::get('/products/{product}', [\App\Http\Controllers\ProductController::class, 'show']);

Route::get('/offers', [\App\Http\Controllers\OfferController::class, 'active']);
Route::get('/banners', [\App\Http\Controllers\BannerController::class, 'active']);

Route::get('/delivery-areas', [\App\Http\Controllers\DeliveryAreaController::class, 'index']);

// Temporarily public Admin Routes for UI dev (re-enable auth:sanctum for production)
Route::prefix('admin')->group(function () {
    
    // Categories
    Route::apiResource('categories', \App\Http\Controllers\CategoryController::class)->except(['index', 'show']);
    
    // Products
    Route::apiResource('products', \App\Http\Controllers\ProductController::class)->except(['index', 'show']);
    Route::get('product-groups/product-options', [\App\Http\Controllers\ProductGroupController::class, 'productOptions']);
    Route::apiResource('product-groups', \App\Http\Controllers\ProductGroupController::class);

    // Orders
    Route::apiResource('orders', \App\Http\Controllers\OrderController::class);
    Route::patch('orders/{order}/status', [\App\Http\Controllers\OrderController::class, 'updateStatus']);
    
    // Customers
    Route::apiResource('customers', \App\Http\Controllers\CustomerController::class);
    
    // Stock & Inventory
    Route::apiResource('stocks', \App\Http\Controllers\StockController::class);
    
    // Delivery Configuration
    Route::apiResource('delivery-areas', \App\Http\Controllers\DeliveryAreaController::class)->except(['index']);
    Route::apiResource('delivery-charges', \App\Http\Controllers\DeliveryChargeController::class);
    
    // Marketing
    Route::apiResource('banners', \App\Http\Controllers\BannerController::class)->except(['index']);
    Route::apiResource('offers', \App\Http\Controllers\OfferController::class)->except(['index']);
    
    // Settings
    Route::post('settings/bulk-update', [\App\Http\Controllers\SettingController::class, 'bulkUpdate']);
    Route::apiResource('settings', \App\Http\Controllers\SettingController::class);
    
    // Reports
    Route::get('/reports/sales', [\App\Http\Controllers\ReportController::class, 'salesAnalytics']);
    Route::get('/reports/inventory', [\App\Http\Controllers\ReportController::class, 'inventoryInsights']);
    
    // Dashboard Stats
    Route::get('/dashboard/stats', [\App\Http\Controllers\DashboardController::class, 'index']);
});

// A fallback route to check user
Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});
