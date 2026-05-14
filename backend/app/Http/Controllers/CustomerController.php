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

    public function index()
    {
        $data = Customer::latest()->paginate(10);
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
