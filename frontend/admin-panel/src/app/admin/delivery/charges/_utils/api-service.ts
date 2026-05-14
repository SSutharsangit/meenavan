const API_BASE = 'http://127.0.0.1:8000/api';

export const handleApiError = (error: any) => ({
  is_success: false, message: error.message || 'An unexpected error occurred', result: null,
});

export const apiGetAllDeliveryCharges = async (page: number = 1, search?: string) => {
  try {
    const params = new URLSearchParams({ page: page.toString() });
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/admin/delivery-charges?${params.toString()}`);
    const json = await res.json();
    return { is_success: json.is_success, result: json.result ?? json, message: json.message || '' };
  } catch (err) { return handleApiError(err); }
};

export const apiGetDeliveryAreas = async () => {
  try {
    const res = await fetch(`${API_BASE}/admin/delivery-areas?page=1`);
    const json = await res.json();
    return { is_success: json.is_success, result: json.result?.data ?? json.result ?? json, message: json.message || '' };
  } catch (err) { return handleApiError(err); }
};

export const apiCreateDeliveryCharge = async (payload: Record<string, any>) => {
  try {
    const res = await fetch(`${API_BASE}/admin/delivery-charges`, {
      method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    return { is_success: res.ok || json.is_success, result: json.result ?? json, message: json.message || 'Created successfully' };
  } catch (err) { return handleApiError(err); }
};

export const apiUpdateDeliveryCharge = async (id: number, payload: Record<string, any>) => {
  try {
    const res = await fetch(`${API_BASE}/admin/delivery-charges/${id}`, {
      method: 'PUT', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    return { is_success: res.ok || json.is_success, result: json.result ?? json, message: json.message || 'Updated successfully' };
  } catch (err) { return handleApiError(err); }
};

export const apiDeleteDeliveryCharge = async (id: number) => {
  try {
    const res = await fetch(`${API_BASE}/admin/delivery-charges/${id}`, {
      method: 'DELETE', headers: { 'Accept': 'application/json' },
    });
    const json = await res.json();
    return { is_success: res.ok || json.is_success, result: json.result ?? json, message: json.message || 'Deleted successfully' };
  } catch (err) { return handleApiError(err); }
};
