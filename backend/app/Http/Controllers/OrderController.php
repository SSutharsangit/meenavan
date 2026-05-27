<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;

class OrderController extends Controller
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
        $query = Order::query();
        $perPage = min(max((int) $request->input('per_page', 10), 1), 100);

        if ($request->has('status') && $request->status !== '') {
            $query->where('status', $request->status);
        }

        if ($request->has('payment_status') && $request->payment_status !== '') {
            $query->where('payment_status', $request->payment_status);
        }

        if ($request->has('search') && $request->search !== '') {
            $searchTerm = '%' . $request->search . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('order_number', 'like', $searchTerm)
                  ->orWhere('customer_name', 'like', $searchTerm)
                  ->orWhere('customer_phone', 'like', $searchTerm);
            });
        }

        if ($request->has('start_date') && $request->start_date !== '') {
            $query->whereDate('created_at', '>=', $request->start_date);
        }

        if ($request->has('end_date') && $request->end_date !== '') {
            $query->whereDate('created_at', '<=', $request->end_date);
        }

        $data = $query->latest()->paginate($perPage);
        $result = [
            'data' => $data->items(),
            'current_page' => $data->currentPage(),
            'total_records' => $data->total(),
            'total_pages' => $data->lastPage(),
            'per_page' => $data->perPage(),
        ];
        return $this->formatResponse(true, 'Orders retrieved successfully', $result);
    }

    public function store(Request $request)
    {
        \DB::beginTransaction();
        try {
            // Generate a unique order number if not provided
            $data = $request->except('items');
            if (empty($data['order_number'])) {
                $data['order_number'] = 'ORD-' . date('Ymd') . '-' . sprintf('%04d', rand(1, 9999));
            }

            // Find or create customer based on phone if customer_id not provided
            if (empty($data['customer_id']) && !empty($data['customer_phone'])) {
                $customer = \App\Models\Customer::where('phone', $data['customer_phone'])->first();
                if (!$customer) {
                    $customer = \App\Models\Customer::create([
                        'name' => $data['customer_name'] ?? 'POS Customer',
                        'phone' => $data['customer_phone'],
                        'email' => $data['customer_email'] ?? null,
                        'default_address' => $data['delivery_address'] ?? null,
                        'landmark' => $data['landmark'] ?? null,
                        'delivery_area_id' => $data['delivery_area_id'] ?? null,
                    ]);
                }
                $data['customer_id'] = $customer->id;
            }

            // Map payment method to supported database enum values
            if (isset($data['payment_method'])) {
                $pm = strtolower($data['payment_method']);
                if ($pm === 'cash') {
                    $data['payment_method'] = 'cod';
                } elseif ($pm === 'card') {
                    $data['payment_method'] = 'online';
                }
            }
            
            $item = Order::create($data);

            if ($request->has('items')) {
                foreach ($request->input('items') as $orderItemData) {
                    $item->orderItems()->create([
                        'product_id' => $orderItemData['product_id'],
                        'product_name_en' => $orderItemData['product_name_en'],
                        'product_name_ta' => $orderItemData['product_name_ta'],
                        'product_image' => $orderItemData['product_image'] ?? null,
                        'weight_kg' => $orderItemData['weight_kg'] ?? 0,
                        'quantity' => $orderItemData['quantity'] ?? 1,
                        'cutting_option_id' => $orderItemData['cutting_option_id'] ?? null,
                        'cutting_option_name' => $orderItemData['cutting_option_name'] ?? null,
                        'unit_price' => $orderItemData['unit_price'],
                        'discount_percentage' => $orderItemData['discount_percentage'] ?? 0,
                        'subtotal' => $orderItemData['subtotal'],
                        'special_instructions' => $orderItemData['special_instructions'] ?? null,
                    ]);

                    // Deduct stock for the new item
                    $product = \App\Models\Product::find($orderItemData['product_id']);
                    if ($product) {
                        $prevStock = $product->stock_quantity;
                        $qtyDeduct = $orderItemData['weight_kg'] > 0 ? floatval($orderItemData['weight_kg']) : (intval($orderItemData['quantity']) ?: 1.0);
                        
                        $product->stock_quantity -= $qtyDeduct;
                        $product->save();

                        // Log stock adjustment (deduction)
                        \App\Models\Stock::create([
                            'product_id' => $product->id,
                            'quantity_kg' => $qtyDeduct,
                            'type' => 'out',
                            'reason' => 'Order creation allocation',
                            'reference_type' => 'Order',
                            'reference_id' => $item->id,
                            'previous_quantity' => $prevStock,
                            'new_quantity' => $product->stock_quantity,
                            'created_by' => auth()->id() ?: 1,
                        ]);
                    }
                }
            }
            \DB::commit();
            return $this->formatResponse(true, 'Order created successfully', $item);
        } catch (\Exception $e) {
            \DB::rollBack();
            return $this->formatResponse(false, 'Failed to create order: ' . $e->getMessage(), null);
        }
    }

    public function show($id)
    {
        $item = Order::with('orderItems')->findOrFail($id);
        return $this->formatResponse(true, 'Order retrieved successfully', $item);
    }

    public function update(Request $request, $id)
    {
        \DB::beginTransaction();
        try {
            $item = Order::findOrFail($id);
            $data = $request->except('items');

            // Find or create customer based on phone if customer_id not provided
            if (empty($data['customer_id']) && !empty($data['customer_phone'])) {
                $customer = \App\Models\Customer::where('phone', $data['customer_phone'])->first();
                if (!$customer) {
                    $customer = \App\Models\Customer::create([
                        'name' => $data['customer_name'] ?? 'POS Customer',
                        'phone' => $data['customer_phone'],
                        'email' => $data['customer_email'] ?? null,
                        'default_address' => $data['delivery_address'] ?? null,
                        'landmark' => $data['landmark'] ?? null,
                        'delivery_area_id' => $data['delivery_area_id'] ?? null,
                    ]);
                }
                $data['customer_id'] = $customer->id;
            }

            // Map payment method to supported database enum values
            if (isset($data['payment_method'])) {
                $pm = strtolower($data['payment_method']);
                if ($pm === 'cash') {
                    $data['payment_method'] = 'cod';
                } elseif ($pm === 'card') {
                    $data['payment_method'] = 'online';
                }
            }

            $item->update($data);

            if ($request->has('items')) {
                // 1. Get old items and refund their stock
                $oldItems = $item->orderItems;
                foreach ($oldItems as $oldItem) {
                    $product = \App\Models\Product::find($oldItem->product_id);
                    if ($product) {
                        $prevStock = $product->stock_quantity;
                        $qtyRefund = $oldItem->weight_kg > 0 ? floatval($oldItem->weight_kg) : (intval($oldItem->quantity) ?: 1.0);
                        
                        $product->stock_quantity += $qtyRefund;
                        $product->save();

                        // Log stock adjustment (refund)
                        \App\Models\Stock::create([
                            'product_id' => $product->id,
                            'quantity_kg' => $qtyRefund,
                            'type' => 'in',
                            'reason' => 'Order edit refund',
                            'reference_type' => 'Order',
                            'reference_id' => $item->id,
                            'previous_quantity' => $prevStock,
                            'new_quantity' => $product->stock_quantity,
                            'created_by' => auth()->id() ?: 1,
                        ]);
                    }
                }

                // 2. Delete previous order items
                $item->orderItems()->delete();

                // 3. Create new order items and deduct their stock
                foreach ($request->input('items') as $orderItemData) {
                    $item->orderItems()->create([
                        'product_id' => $orderItemData['product_id'],
                        'product_name_en' => $orderItemData['product_name_en'],
                        'product_name_ta' => $orderItemData['product_name_ta'],
                        'product_image' => $orderItemData['product_image'] ?? null,
                        'weight_kg' => $orderItemData['weight_kg'] ?? 0,
                        'quantity' => $orderItemData['quantity'] ?? 1,
                        'cutting_option_id' => $orderItemData['cutting_option_id'] ?? null,
                        'cutting_option_name' => $orderItemData['cutting_option_name'] ?? null,
                        'unit_price' => $orderItemData['unit_price'],
                        'discount_percentage' => $orderItemData['discount_percentage'] ?? 0,
                        'subtotal' => $orderItemData['subtotal'],
                        'special_instructions' => $orderItemData['special_instructions'] ?? null,
                    ]);

                    // Deduct stock for the new/updated item
                    $product = \App\Models\Product::find($orderItemData['product_id']);
                    if ($product) {
                        $prevStock = $product->stock_quantity;
                        $qtyDeduct = $orderItemData['weight_kg'] > 0 ? floatval($orderItemData['weight_kg']) : (intval($orderItemData['quantity']) ?: 1.0);
                        
                        $product->stock_quantity -= $qtyDeduct;
                        $product->save();

                        // Log stock adjustment (deduction)
                        \App\Models\Stock::create([
                            'product_id' => $product->id,
                            'quantity_kg' => $qtyDeduct,
                            'type' => 'out',
                            'reason' => 'Order edit allocation',
                            'reference_type' => 'Order',
                            'reference_id' => $item->id,
                            'previous_quantity' => $prevStock,
                            'new_quantity' => $product->stock_quantity,
                            'created_by' => auth()->id() ?: 1,
                        ]);
                    }
                }
            }

            \DB::commit();
            
            // Reload the relation to return the full updated object if needed
            $item->load('orderItems');
            
            return $this->formatResponse(true, 'Order updated successfully', $item);
        } catch (\Exception $e) {
            \DB::rollBack();
            return $this->formatResponse(false, 'Failed to update order: ' . $e->getMessage(), null);
        }
    }

    public function destroy($id)
    {
        Order::destroy($id);
        return $this->formatResponse(true, 'Order deleted successfully');
    }

    public function updateStatus(Request $request, $id)
    {
        $item = Order::findOrFail($id);
        
        $updates = [];
        if ($request->has('status')) {
            $updates['status'] = $request->status;
        }
        if ($request->has('payment_status')) {
            $updates['payment_status'] = $request->payment_status;
        }
        
        if (!empty($updates)) {
            $item->update($updates);
        }
        
        return $this->formatResponse(true, 'Order updated successfully', $item);
    }
}
