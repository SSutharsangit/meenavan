import { adminApiUrl, defaultHeaders, jsonHeaders } from "@/lib/admin-api";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An unexpected error occurred";

export const handleApiError = (error: unknown) => ({
  is_success: false, message: getErrorMessage(error), result: null,
});

export interface OrderFilters {
  search?: string;
  status?: string;
  payment_status?: string;
  start_date?: string;
  end_date?: string;
  per_page?: number;
}

export const apiGetAllOrders = async (page: number = 1, filters?: OrderFilters) => {
  try {
    const params = new URLSearchParams({ page: page.toString() });
    if (filters?.search) params.append('search', filters.search);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.payment_status) params.append('payment_status', filters.payment_status);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.per_page) params.append('per_page', filters.per_page.toString());
    const res = await fetch(adminApiUrl(`orders?${params.toString()}`));
    const json = await res.json();
    return { is_success: json.is_success, result: json.result ?? json, message: json.message || '' };
  } catch (err) { return handleApiError(err); }
};

export const apiUpdateOrderStatus = async (id: number, status?: string, payment_status?: string) => {
  try {
    const body: Record<string, string> = {};
    if (status) body.status = status;
    if (payment_status) body.payment_status = payment_status;
    
    const res = await fetch(adminApiUrl(`orders/${id}/status`), {
      method: 'PATCH', headers: jsonHeaders,
      body: JSON.stringify(body),
    });
    const json = await res.json();
    return { is_success: res.ok || json.is_success, result: json.result ?? json, message: json.message || 'Status updated' };
  } catch (err) { return handleApiError(err); }
};

export const apiUpdateOrder = async (id: number, data: any) => {
  try {
    const res = await fetch(adminApiUrl(`orders/${id}`), {
      method: 'PUT', headers: jsonHeaders,
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return { is_success: res.ok || json.is_success, result: json.result ?? json, message: json.message || 'Order updated successfully' };
  } catch (err) { return handleApiError(err); }
};

export const apiCreateOrder = async (data: any) => {
  try {
    const res = await fetch(adminApiUrl('orders'), {
      method: 'POST', headers: jsonHeaders,
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return { is_success: res.ok || json.is_success, result: json.result ?? json, message: json.message || 'Order created successfully' };
  } catch (err) { return handleApiError(err); }
};

export const apiGetOrder = async (id: number) => {
  try {
    const res = await fetch(adminApiUrl(`orders/${id}`), { headers: defaultHeaders });
    const json = await res.json();
    return { is_success: res.ok || json.is_success, result: json.result ?? json, message: json.message || '' };
  } catch (err) { return handleApiError(err); }
};

export const apiDeleteOrder = async (id: number) => {
  try {
    const res = await fetch(adminApiUrl(`orders/${id}`), {
      method: 'DELETE', headers: defaultHeaders,
    });
    const json = await res.json();
    return { is_success: res.ok || json.is_success, result: json.result ?? json, message: json.message || 'Deleted successfully' };
  } catch (err) { return handleApiError(err); }
};
