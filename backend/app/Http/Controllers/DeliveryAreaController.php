<?php

namespace App\Http\Controllers;

use App\Models\DeliveryArea;
use Illuminate\Http\Request;

class DeliveryAreaController extends Controller
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

    public function index()
    {
        $data = DeliveryArea::latest()->paginate(10);
        $result = [
            'data' => $data->items(),
            'current_page' => $data->currentPage(),
            'total_records' => $data->total(),
            'total_pages' => $data->lastPage(),
            'per_page' => $data->perPage(),
        ];
        return $this->formatResponse(true, 'DeliveryAreas retrieved successfully', $result);
    }

    public function store(Request $request)
    {
        $item = DeliveryArea::create($request->all());
        return $this->formatResponse(true, 'DeliveryArea created successfully', $item);
    }

    public function show($id)
    {
        $item = DeliveryArea::findOrFail($id);
        return $this->formatResponse(true, 'DeliveryArea retrieved successfully', $item);
    }

    public function update(Request $request, $id)
    {
        $item = DeliveryArea::findOrFail($id);
        $item->update($request->all());
        return $this->formatResponse(true, 'DeliveryArea updated successfully', $item);
    }

    public function destroy($id)
    {
        DeliveryArea::destroy($id);
        return $this->formatResponse(true, 'DeliveryArea deleted successfully');
    }
}
