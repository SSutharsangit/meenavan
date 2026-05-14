<?php

namespace App\Http\Controllers;

use App\Models\DeliveryCharge;
use Illuminate\Http\Request;

class DeliveryChargeController extends Controller
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
        $query = DeliveryCharge::with('deliveryArea');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->whereHas('deliveryArea', function ($q) use ($search) {
                $q->where('name_en', 'like', "%{$search}%")
                  ->orWhere('name_ta', 'like', "%{$search}%");
            });
        }

        $data = $query->latest()->paginate(10);
        $result = [
            'data' => $data->items(),
            'current_page' => $data->currentPage(),
            'total_records' => $data->total(),
            'total_pages' => $data->lastPage(),
            'per_page' => $data->perPage(),
        ];
        return $this->formatResponse(true, 'DeliveryCharges retrieved successfully', $result);
    }

    public function store(Request $request)
    {
        $item = DeliveryCharge::create($request->all());
        return $this->formatResponse(true, 'DeliveryCharge created successfully', $item);
    }

    public function show($id)
    {
        $item = DeliveryCharge::findOrFail($id);
        return $this->formatResponse(true, 'DeliveryCharge retrieved successfully', $item);
    }

    public function update(Request $request, $id)
    {
        $item = DeliveryCharge::findOrFail($id);
        $item->update($request->all());
        return $this->formatResponse(true, 'DeliveryCharge updated successfully', $item);
    }

    public function destroy($id)
    {
        DeliveryCharge::destroy($id);
        return $this->formatResponse(true, 'DeliveryCharge deleted successfully');
    }
}
