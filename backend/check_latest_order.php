<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $orders = App\Models\Order::orderBy('id', 'desc')->get();
    echo "TOTAL ORDERS COUNT: " . $orders->count() . "\n\n";
    foreach ($orders as $order) {
        echo "Order ID: {$order->id} | Number: {$order->order_number} | Customer: {$order->customer_name} | Created: {$order->created_at} | Total: {$order->total_amount} | Payment: {$order->payment_method} / {$order->payment_status}\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}

