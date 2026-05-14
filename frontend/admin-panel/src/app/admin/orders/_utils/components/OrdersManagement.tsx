"use client";

import { useState, useEffect } from "react";
import { apiGetAllOrders, apiDeleteOrder, apiUpdateOrderStatus, OrderFilters } from "../api-service";
import ListOrder from "./ListOrder";
import OrderFilterPanel from "./OrderFilterPanel";

interface Props {
  defaultStatus?: string;
  title?: string;
  subtitle?: string;
}

export default function OrdersManagement({ defaultStatus = "", title = "Orders", subtitle = "Track and manage all customer orders." }: Props) {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const [filters, setFilters] = useState({ 
    status: defaultStatus, 
    payment_status: "", 
    start_date: today, 
    end_date: today 
  });
  const activeFilterCount = [filters.status, filters.payment_status, filters.start_date, filters.end_date].filter(Boolean).length;

  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(search), 400); return () => clearTimeout(t); }, [search]);
  useEffect(() => { fetchData(1); }, [debouncedSearch, filters]);

  const fetchData = async (page = 1) => {
    try {
      setLoading(true);
      const apiFilters: OrderFilters = {
        search: debouncedSearch || undefined,
        status: filters.status || undefined,
        payment_status: filters.payment_status || undefined,
        start_date: filters.start_date || undefined,
        end_date: filters.end_date || undefined,
      };
      const res = await apiGetAllOrders(page, apiFilters);
      if (res.is_success) {
        setData(res.result.data || []);
        setPagination({ current_page: res.result.current_page, total_records: res.result.total_records, total_pages: res.result.total_pages, per_page: res.result.per_page });
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try { const res = await apiDeleteOrder(id); if (res.is_success) fetchData(pagination?.current_page || 1); } catch (e) { console.error(e); }
  };

  const handleUpdateStatus = async (id: number, status?: string, payment_status?: string) => {
    try {
      const res = await apiUpdateOrderStatus(id, status, payment_status);
      if (res.is_success) {
        fetchData(pagination?.current_page || 1);
      } else {
        alert(res.message || "Failed to update status");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while updating status");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{title}</h1>
        <p className="text-slate-500 mt-1 font-medium">{subtitle}</p>
      </div>
      <ListOrder data={data} loading={loading} pagination={pagination} onDelete={handleDelete} onUpdateStatus={handleUpdateStatus} searchValue={search} onSearchChange={setSearch} hasActiveFilters={activeFilterCount > 0} onFilterClick={() => setIsFilterOpen(true)} onPageChange={(p) => fetchData(p)} />
      <OrderFilterPanel isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} filters={filters} onFilterChange={setFilters} />
    </div>
  );
}
