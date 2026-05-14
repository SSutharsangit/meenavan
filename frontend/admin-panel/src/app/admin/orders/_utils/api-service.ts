const API_BASE = 'http://127.0.0.1:8000/api';

export const handleApiError = (error: any) => ({
  is_success: false, message: error.message || 'An unexpected error occurred', result: null,
});

export interface OrderFilters {
  search?: string;
  status?: string;
  payment_status?: string;
  start_date?: string;
  end_date?: string;
}

export const apiGetAllOrders = async (page: number = 1, filters?: OrderFilters) => {
  try {
    const params = new URLSearchParams({ page: page.toString() });
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.payment_status) params.append('payment_status', filters.payment_status);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    const res = await fetch(`${API_BASE}/admin/orders?${params.toString()}`);
    const json = await res.json();
    return { is_success: json.is_success, result: json.result ?? json, message: json.message || '' };
  } catch (err) { return handleApiError(err); }
};

export const apiUpdateOrderStatus = async (id: number, status?: string, payment_status?: string) => {
  try {
    const body: any = {};
    if (status) body.status = status;
    if (payment_status) body.payment_status = payment_status;
    
    const res = await fetch(`${API_BASE}/admin/orders/${id}/status`, {
      method: 'PATCH', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    return { is_success: res.ok || json.is_success, result: json.result ?? json, message: json.message || 'Status updated' };
  } catch (err) { return handleApiError(err); }
};

export const apiDeleteOrder = async (id: number) => {
  try {
    const res = await fetch(`${API_BASE}/admin/orders/${id}`, {
      method: 'DELETE', headers: { 'Accept': 'application/json' },
    });
    const json = await res.json();
    return { is_success: res.ok || json.is_success, result: json.result ?? json, message: json.message || 'Deleted successfully' };
  } catch (err) { return handleApiError(err); }
};
