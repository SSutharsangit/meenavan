import { adminApiUrl } from "@/lib/admin-api";

export const apiGetInventoryInsights = async () => {
  try {
    const res = await fetch(adminApiUrl("reports/inventory"));
    const json = await res.json();
    return { is_success: json.is_success, result: json.result, message: json.message || '' };
  } catch (err: any) { 
    return { is_success: false, message: err.message, result: null }; 
  }
};
