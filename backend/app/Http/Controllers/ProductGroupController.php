<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductGroup;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductGroupController extends Controller
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
        $query = ProductGroup::with(['products:id,name_en,slug,primary_image'])
            ->withCount('products');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $data = $query->orderBy('display_order')->latest()->paginate(10);

        $result = [
            'data' => $data->items(),
            'current_page' => $data->currentPage(),
            'total_records' => $data->total(),
            'total_pages' => $data->lastPage(),
            'per_page' => $data->perPage(),
        ];

        return $this->formatResponse(true, 'Product groups retrieved successfully', $result);
    }

    public function productOptions()
    {
        $products = Product::select('id', 'name_en', 'slug', 'primary_image')
            ->where('is_active', true)
            ->orderBy('name_en')
            ->get();

        return $this->formatResponse(true, 'Products retrieved successfully', $products);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'display_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
            'product_ids' => ['required', 'array', 'min:1'],
            'product_ids.*' => ['integer', 'exists:products,id'],
        ]);

        $group = ProductGroup::create([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']) . '-' . time(),
            'description' => $validated['description'] ?? null,
            'display_order' => $validated['display_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $group->products()->sync($this->buildSyncPayload($validated['product_ids']));
        $group->load(['products:id,name_en,slug,primary_image'])->loadCount('products');

        return $this->formatResponse(true, 'Product group created successfully', $group);
    }

    public function show($id)
    {
        $group = ProductGroup::with(['products:id,name_en,slug,primary_image'])
            ->withCount('products')
            ->findOrFail($id);

        return $this->formatResponse(true, 'Product group retrieved successfully', $group);
    }

    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'display_order' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
            'product_ids' => ['required', 'array', 'min:1'],
            'product_ids.*' => ['integer', 'exists:products,id'],
        ]);

        $group = ProductGroup::findOrFail($id);
        $group->update([
            'name' => $validated['name'],
            'slug' => Str::slug($validated['name']) . '-' . $group->id,
            'description' => $validated['description'] ?? null,
            'display_order' => $validated['display_order'] ?? 0,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $group->products()->sync($this->buildSyncPayload($validated['product_ids']));
        $group->load(['products:id,name_en,slug,primary_image'])->loadCount('products');

        return $this->formatResponse(true, 'Product group updated successfully', $group);
    }

    public function destroy($id)
    {
        ProductGroup::destroy($id);

        return $this->formatResponse(true, 'Product group deleted successfully');
    }

    private function buildSyncPayload(array $productIds): array
    {
        $syncData = [];

        foreach (array_values($productIds) as $index => $productId) {
            $syncData[$productId] = ['sort_order' => $index];
        }

        return $syncData;
    }
}
