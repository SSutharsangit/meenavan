<?php

namespace App\Http\Controllers;

use App\Models\Stock;
use Illuminate\Http\Request;

class StockController extends Controller
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
        $data = Stock::latest()->paginate(10);
        $result = [
            'data' => $data->items(),
            'current_page' => $data->currentPage(),
            'total_records' => $data->total(),
            'total_pages' => $data->lastPage(),
            'per_page' => $data->perPage(),
        ];
        return $this->formatResponse(true, 'Stocks retrieved successfully', $result);
    }

    public function store(Request $request)
    {
        $item = Stock::create($request->all());
        return $this->formatResponse(true, 'Stock created successfully', $item);
    }

    public function show($id)
    {
        $item = Stock::findOrFail($id);
        return $this->formatResponse(true, 'Stock retrieved successfully', $item);
    }

    public function update(Request $request, $id)
    {
        $item = Stock::findOrFail($id);
        $item->update($request->all());
        return $this->formatResponse(true, 'Stock updated successfully', $item);
    }

    public function destroy($id)
    {
        Stock::destroy($id);
        return $this->formatResponse(true, 'Stock deleted successfully');
    }
}
