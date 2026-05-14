const API_BASE = 'http://127.0.0.1:8000/api';

export const handleApiError = (error: any) => ({
  is_success: false,
  message: error.message || 'An unexpected error occurred',
  result: null,
});

export const apiGetAllCategories = async (page: number = 1, search?: string) => {
  try {
    const params = new URLSearchParams({ page: page.toString() });
    if (search) params.append('search', search);
    const res = await fetch(`${API_BASE}/categories?${params.toString()}`);
    const json = await res.json();
    return { is_success: json.is_success, result: json.result ?? json, message: json.message || '' };
  } catch (err) { return handleApiError(err); }
};

export const apiCreateCategory = async (payload: FormData) => {
  try {
    const res = await fetch(`${API_BASE}/admin/categories`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: payload,
    });
    const json = await res.json();
    return { is_success: res.ok || json.is_success, result: json.result ?? json, message: json.message || 'Created successfully' };
  } catch (err) { return handleApiError(err); }
};

export const apiUpdateCategory = async (id: number, payload: FormData) => {
  try {
    const res = await fetch(`${API_BASE}/admin/categories/${id}?_method=PUT`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: payload,
    });
    const json = await res.json();
    return { is_success: res.ok || json.is_success, result: json.result ?? json, message: json.message || 'Updated successfully' };
  } catch (err) { return handleApiError(err); }
};

export const apiDeleteCategory = async (id: number) => {
  try {
    const res = await fetch(`${API_BASE}/admin/categories/${id}`, {
      method: 'DELETE', headers: { 'Accept': 'application/json' },
    });
    const json = await res.json();
    return { is_success: res.ok || json.is_success, result: json.result ?? json, message: json.message || 'Deleted successfully' };
  } catch (err) { return handleApiError(err); }
};
