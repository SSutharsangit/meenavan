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

        $data = $query->latest()->paginate(10);
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
        $item = Order::create($request->all());
        return $this->formatResponse(true, 'Order created successfully', $item);
    }

    public function show($id)
    {
        $item = Order::findOrFail($id);
        return $this->formatResponse(true, 'Order retrieved successfully', $item);
    }

    public function update(Request $request, $id)
    {
        $item = Order::findOrFail($id);
        $item->update($request->all());
        return $this->formatResponse(true, 'Order updated successfully', $item);
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
