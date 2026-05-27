import { adminApiUrl, defaultHeaders, jsonHeaders } from "@/lib/admin-api";

export interface ProductOption {
  id: number;
  name_en: string;
  slug: string;
  primary_image?: string | null;
}

export interface ProductGroup {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  display_order?: number;
  is_active: boolean;
  products_count?: number;
  products?: ProductOption[];
}

export interface PaginatedResult<T> {
  data: T[];
  current_page: number;
  total_records: number;
  total_pages: number;
  per_page: number;
}

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "An unexpected error occurred";

export const handleApiError = (error: unknown) => ({
  is_success: false,
  message: getErrorMessage(error),
  result: null,
});

export const apiGetAllProductGroups = async (page: number = 1, search?: string) => {
  try {
    const params = new URLSearchParams({ page: page.toString() });
    if (search) params.append("search", search);

    const res = await fetch(adminApiUrl(`product-groups?${params.toString()}`));
    const json = await res.json();

    return {
      is_success: json.is_success,
      result: (json.result ?? json) as PaginatedResult<ProductGroup>,
      message: json.message || "",
    };
  } catch (err) {
    return handleApiError(err);
  }
};

export const apiGetProductOptions = async () => {
  try {
    const res = await fetch(adminApiUrl("product-groups/product-options"));
    const json = await res.json();

    return {
      is_success: json.is_success,
      result: (json.result ?? []) as ProductOption[],
      message: json.message || "",
    };
  } catch (err) {
    return handleApiError(err);
  }
};

export const apiCreateProductGroup = async (payload: Record<string, unknown>) => {
  try {
    const res = await fetch(adminApiUrl("product-groups"), {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    return {
      is_success: res.ok || json.is_success,
      result: (json.result ?? json) as ProductGroup,
      message: json.message || "Created successfully",
    };
  } catch (err) {
    return handleApiError(err);
  }
};

export const apiUpdateProductGroup = async (id: number, payload: Record<string, unknown>) => {
  try {
    const res = await fetch(adminApiUrl(`product-groups/${id}`), {
      method: "PUT",
      headers: jsonHeaders,
      body: JSON.stringify(payload),
    });
    const json = await res.json();

    return {
      is_success: res.ok || json.is_success,
      result: (json.result ?? json) as ProductGroup,
      message: json.message || "Updated successfully",
    };
  } catch (err) {
    return handleApiError(err);
  }
};

export const apiDeleteProductGroup = async (id: number) => {
  try {
    const res = await fetch(adminApiUrl(`product-groups/${id}`), {
      method: "DELETE",
      headers: defaultHeaders,
    });
    const json = await res.json();

    return {
      is_success: res.ok || json.is_success,
      result: json.result ?? json,
      message: json.message || "Deleted successfully",
    };
  } catch (err) {
    return handleApiError(err);
  }
};
