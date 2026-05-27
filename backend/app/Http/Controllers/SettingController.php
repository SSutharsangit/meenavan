<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
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
        if ($request->has('group')) {
            $settings = Setting::where('group_name', $request->query('group'))->get();
            return $this->formatResponse(true, 'Settings retrieved successfully', $settings);
        }

        $data = Setting::latest()->paginate(10);
        $result = [
            'data' => $data->items(),
            'current_page' => $data->currentPage(),
            'total_records' => $data->total(),
            'total_pages' => $data->lastPage(),
            'per_page' => $data->perPage(),
        ];
        return $this->formatResponse(true, 'Settings retrieved successfully', $result);
    }

    public function store(Request $request)
    {
        $item = Setting::create($request->all());
        return $this->formatResponse(true, 'Setting created successfully', $item);
    }

    public function show($id)
    {
        $item = Setting::findOrFail($id);
        return $this->formatResponse(true, 'Setting retrieved successfully', $item);
    }

    public function update(Request $request, $id)
    {
        $item = Setting::findOrFail($id);
        $item->update($request->all());
        return $this->formatResponse(true, 'Setting updated successfully', $item);
    }

    public function destroy($id)
    {
        Setting::destroy($id);
        return $this->formatResponse(true, 'Setting deleted successfully');
    }

    public function bulkUpdate(Request $request)
    {
        $settings = $request->input('settings', []);
        
        foreach ($settings as $key => $value) {
            \App\Models\Setting::updateOrCreate(
                ['key_name' => $key],
                ['value' => $value, 'group_name' => 'business', 'is_public' => true]
            );
        }
        
        return $this->formatResponse(true, 'Settings updated successfully');
    }
}
