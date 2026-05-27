<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;

class ProductController extends Controller
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

    private function uploadToCloudinary($file)
    {
        $cloudName = env('CLOUDINARY_CLOUD_NAME', 'duzuan5nn');
        $apiKey = env('CLOUDINARY_API_KEY', '563759941878522');
        $apiSecret = env('CLOUDINARY_API_SECRET', 'EBUw4dkmGJ36T3JmuGjs7CIu0jU');

        $timestamp = time();
        $signature = sha1('timestamp=' . $timestamp . $apiSecret);

        $response = Http::attach(
            'file', file_get_contents($file->getRealPath()), $file->getClientOriginalName()
        )->post("https://api.cloudinary.com/v1_1/{$cloudName}/image/upload", [
            'api_key' => $apiKey,
            'timestamp' => $timestamp,
            'signature' => $signature,
        ]);

        if ($response->successful()) {
            return $response->json('secure_url');
        }

        return null;
    }

    public function index(Request $request)
    {
        $query = Product::query();

        // Search by name
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name_en', 'like', "%{$search}%")
                  ->orWhere('name_ta', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // Filter by availability
        if ($request->has('is_available') && $request->is_available !== '') {
            $query->where('is_available', $request->is_available);
        }

        // Filter by stock status
        if ($request->filled('stock_status')) {
            if ($request->stock_status === 'in_stock') {
                $query->where('stock_quantity', '>=', 10);
            } elseif ($request->stock_status === 'low_stock') {
                $query->whereBetween('stock_quantity', [1, 9]);
            } elseif ($request->stock_status === 'out_of_stock') {
                $query->where('stock_quantity', '<=', 0);
            }
        }

        $perPage = (int) $request->input('per_page', 10);
        
        if ($perPage === -1) {
            $data = $query->latest()->get();
            $result = [
                'data' => $data,
                'current_page' => 1,
                'total_records' => $data->count(),
                'total_pages' => 1,
                'per_page' => $data->count(),
            ];
        } else {
            $perPage = min(max($perPage, 1), 500);
            $data = $query->latest()->paginate($perPage);
            $result = [
                'data' => $data->items(),
                'current_page' => $data->currentPage(),
                'total_records' => $data->total(),
                'total_pages' => $data->lastPage(),
                'per_page' => $data->perPage(),
            ];
        }
        return $this->formatResponse(true, 'Products retrieved successfully', $result);
    }

    public function store(Request $request)
    {
        $data = $request->all();
        if (isset($data['name_en'])) {
            $data['slug'] = Str::slug($data['name_en']) . '-' . time();
        }
        
        if ($request->hasFile('image')) {
            $url = $this->uploadToCloudinary($request->file('image'));
            if ($url) {
                $data['primary_image'] = $url;
            }
            unset($data['image']);
        }

        $item = Product::create($data);
        return $this->formatResponse(true, 'Product created successfully', $item);
    }

    public function show($id)
    {
        $item = Product::findOrFail($id);
        return $this->formatResponse(true, 'Product retrieved successfully', $item);
    }

    public function update(Request $request, $id)
    {
        $item = Product::findOrFail($id);
        $data = $request->all();
        if (isset($data['name_en'])) {
            $data['slug'] = Str::slug($data['name_en']) . '-' . time();
        }

        if ($request->hasFile('image')) {
            $url = $this->uploadToCloudinary($request->file('image'));
            if ($url) {
                $data['primary_image'] = $url;
            }
            unset($data['image']);
        }

        $item->update($data);
        return $this->formatResponse(true, 'Product updated successfully', $item);
    }

    public function destroy($id)
    {
        Product::destroy($id);
        return $this->formatResponse(true, 'Product deleted successfully');
    }
}
