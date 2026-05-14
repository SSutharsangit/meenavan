export const handleApiError = (error: any) => {
  return {
    is_success: false,
    message: error.message || 'An unexpected error occurred',
    result: null,
  };
};

export interface ProductFilters {
  search?: string;
  category_id?: string;
  is_available?: string;
  stock_status?: string;
}

export const apiGetAllProducts = async (page: number = 1, filters?: ProductFilters) => {
  try {
    const params = new URLSearchParams({ page: page.toString() });
    
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category_id) params.append('category_id', filters.category_id);
    if (filters?.is_available !== undefined && filters.is_available !== '') params.append('is_available', filters.is_available);
    if (filters?.stock_status) params.append('stock_status', filters.stock_status);

    const res = await fetch(`http://127.0.0.1:8000/api/products?${params.toString()}`);
    const json = await res.json();
    return {
      is_success: json.is_success,
      result: json.result !== undefined ? json.result : json,
      message: json.message || '',
    };
  } catch (err) {
    return handleApiError(err);
  }
};

export const apiGetCategories = async () => {
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/categories`);
    const json = await res.json();
    return {
      is_success: json.is_success,
      result: json.result !== undefined ? json.result : json,
      message: json.message || '',
    };
  } catch (err) {
    return handleApiError(err);
  }
};

export const apiCreateProduct = async (payload: FormData) => {
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/admin/products`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: payload,
    });
    const json = await res.json();
    return {
      is_success: res.ok || json.is_success,
      result: json.result !== undefined ? json.result : json,
      message: json.message || 'Created successfully',
    };
  } catch (err) {
    return handleApiError(err);
  }
};

export const apiUpdateProduct = async (id: number, payload: FormData) => {
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/admin/products/${id}?_method=PUT`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
      },
      body: payload,
    });
    const json = await res.json();
    return {
      is_success: res.ok || json.is_success,
      result: json.result !== undefined ? json.result : json,
      message: json.message || 'Updated successfully',
    };
  } catch (err) {
    return handleApiError(err);
  }
};

export const apiDeleteProduct = async (id: number) => {
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      },
    });
    const json = await res.json();
    return {
      is_success: res.ok || json.is_success,
      result: json.result !== undefined ? json.result : json,
      message: json.message || 'Deleted successfully',
    };
  } catch (err) {
    return handleApiError(err);
  }
};
