<?php

namespace App\Http\Controllers;

use App\Models\Banner;
use Illuminate\Http\Request;

class BannerController extends Controller
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
        $data = Banner::latest()->paginate(10);
        $result = [
            'data' => $data->items(),
            'current_page' => $data->currentPage(),
            'total_records' => $data->total(),
            'total_pages' => $data->lastPage(),
            'per_page' => $data->perPage(),
        ];
        return $this->formatResponse(true, 'Banners retrieved successfully', $result);
    }

    public function store(Request $request)
    {
        $item = Banner::create($request->all());
        return $this->formatResponse(true, 'Banner created successfully', $item);
    }

    public function show($id)
    {
        $item = Banner::findOrFail($id);
        return $this->formatResponse(true, 'Banner retrieved successfully', $item);
    }

    public function update(Request $request, $id)
    {
        $item = Banner::findOrFail($id);
        $item->update($request->all());
        return $this->formatResponse(true, 'Banner updated successfully', $item);
    }

    public function destroy($id)
    {
        Banner::destroy($id);
        return $this->formatResponse(true, 'Banner deleted successfully');
    }

    public function active()
    {
        $data = Banner::where('is_active', true)->paginate(10);
        $result = [
            'data' => $data->items(),
            'current_page' => $data->currentPage(),
            'total_records' => $data->total(),
            'total_pages' => $data->lastPage(),
            'per_page' => $data->perPage(),
        ];
        return $this->formatResponse(true, 'Active Banners retrieved successfully', $result);
    }
}
