<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;

class CustomerController extends Controller
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
        $query = Customer::query();

        if ($request->has('search') && $request->search !== '') {
            $searchTerm = '%' . $request->search . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', $searchTerm)
                  ->orWhere('phone', 'like', $searchTerm)
                  ->orWhere('email', 'like', $searchTerm);
            });
        }

        $perPage = min(max((int) $request->input('per_page', 10), 1), 100);
        $data = $query->latest()->paginate($perPage);

        $result = [
            'data' => $data->items(),
            'current_page' => $data->currentPage(),
            'total_records' => $data->total(),
            'total_pages' => $data->lastPage(),
            'per_page' => $data->perPage(),
        ];
        return $this->formatResponse(true, 'Customers retrieved successfully', $result);
    }

    public function store(Request $request)
    {
        $item = Customer::create($request->all());
        return $this->formatResponse(true, 'Customer created successfully', $item);
    }

    public function show($id)
    {
        $item = Customer::findOrFail($id);
        return $this->formatResponse(true, 'Customer retrieved successfully', $item);
    }

    public function update(Request $request, $id)
    {
        $item = Customer::findOrFail($id);
        $item->update($request->all());
        return $this->formatResponse(true, 'Customer updated successfully', $item);
    }

    public function destroy($id)
    {
        Customer::destroy($id);
        return $this->formatResponse(true, 'Customer deleted successfully');
    }
}
