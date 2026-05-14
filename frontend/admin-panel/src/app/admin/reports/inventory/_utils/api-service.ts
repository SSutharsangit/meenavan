const API_BASE = 'http://127.0.0.1:8000/api';

export const apiGetInventoryInsights = async () => {
  try {
    const res = await fetch(`${API_BASE}/admin/reports/inventory`);
    const json = await res.json();
    return { is_success: json.is_success, result: json.result, message: json.message || '' };
  } catch (err: any) { 
    return { is_success: false, message: err.message, result: null }; 
  }
};
