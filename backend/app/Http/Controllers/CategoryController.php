<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;

class CategoryController extends Controller
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
        $query = Category::query();

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
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
        return $this->formatResponse(true, 'Categories retrieved successfully', $result);
    }

    public function store(Request $request)
    {
        $data = $request->all();
        
        if (!isset($data['slug']) || empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name_en'] ?? 'category') . '-' . time();
        }

        if ($request->hasFile('image')) {
            $url = $this->uploadToCloudinary($request->file('image'));
            if ($url) {
                $data['image_url'] = $url;
            }
            unset($data['image']);
        }

        $item = Category::create($data);
        return $this->formatResponse(true, 'Category created successfully', $item);
    }

    public function show($id)
    {
        $item = Category::findOrFail($id);
        return $this->formatResponse(true, 'Category retrieved successfully', $item);
    }

    public function update(Request $request, $id)
    {
        $item = Category::findOrFail($id);
        $data = $request->all();

        if (isset($data['name_en'])) {
            $data['slug'] = Str::slug($data['name_en']) . '-' . time();
        }

        if ($request->hasFile('image')) {
            $url = $this->uploadToCloudinary($request->file('image'));
            if ($url) {
                $data['image_url'] = $url;
            }
            unset($data['image']);
        }

        $item->update($data);
        return $this->formatResponse(true, 'Category updated successfully', $item);
    }

    public function destroy($id)
    {
        Category::destroy($id);
        return $this->formatResponse(true, 'Category deleted successfully');
    }
}
