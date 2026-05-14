<?php

namespace App\Http\Controllers;

use App\Models\Offer;
use Illuminate\Http\Request;

class OfferController extends Controller
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
        $data = Offer::latest()->paginate(10);
        $result = [
            'data' => $data->items(),
            'current_page' => $data->currentPage(),
            'total_records' => $data->total(),
            'total_pages' => $data->lastPage(),
            'per_page' => $data->perPage(),
        ];
        return $this->formatResponse(true, 'Offers retrieved successfully', $result);
    }

    public function store(Request $request)
    {
        $item = Offer::create($request->all());
        return $this->formatResponse(true, 'Offer created successfully', $item);
    }

    public function show($id)
    {
        $item = Offer::findOrFail($id);
        return $this->formatResponse(true, 'Offer retrieved successfully', $item);
    }

    public function update(Request $request, $id)
    {
        $item = Offer::findOrFail($id);
        $item->update($request->all());
        return $this->formatResponse(true, 'Offer updated successfully', $item);
    }

    public function destroy($id)
    {
        Offer::destroy($id);
        return $this->formatResponse(true, 'Offer deleted successfully');
    }

    public function active()
    {
        $data = Offer::where('is_active', true)->paginate(10);
        $result = [
            'data' => $data->items(),
            'current_page' => $data->currentPage(),
            'total_records' => $data->total(),
            'total_pages' => $data->lastPage(),
            'per_page' => $data->perPage(),
        ];
        return $this->formatResponse(true, 'Active Offers retrieved successfully', $result);
    }
}
