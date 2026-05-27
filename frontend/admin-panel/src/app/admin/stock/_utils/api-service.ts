import { adminApiUrl, defaultHeaders, jsonHeaders } from "@/lib/admin-api";

export const handleApiError = (error: any) => ({ is_success: false, message: error.message || 'An unexpected error occurred', result: null });

export const apiGetAllStocks = async (page: number = 1, search?: string) => {
  try {
    const params = new URLSearchParams({ page: page.toString() });
    if (search) params.append('search', search);
    const res = await fetch(adminApiUrl(`stocks?${params.toString()}`));
    const json = await res.json();
    return { is_success: json.is_success, result: json.result ?? json, message: json.message || '' };
  } catch (err) { return handleApiError(err); }
};

export const apiCreateStock = async (payload: Record<string, any>) => {
  try {
    const res = await fetch(adminApiUrl("stocks"), { method: 'POST', headers: jsonHeaders, body: JSON.stringify(payload) });
    const json = await res.json();
    return { is_success: res.ok || json.is_success, result: json.result ?? json, message: json.message || 'Created' };
  } catch (err) { return handleApiError(err); }
};

export const apiDeleteStock = async (id: number) => {
  try {
    const res = await fetch(adminApiUrl(`stocks/${id}`), { method: 'DELETE', headers: defaultHeaders });
    const json = await res.json();
    return { is_success: res.ok || json.is_success, result: json.result ?? json, message: json.message || 'Deleted' };
  } catch (err) { return handleApiError(err); }
};
