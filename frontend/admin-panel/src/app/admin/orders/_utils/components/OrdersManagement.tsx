"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { apiGetAllOrders, apiDeleteOrder, apiUpdateOrderStatus, OrderFilters } from "../api-service";
import PageHeader from "@/components/common/PageHeader";
import ListOrder from "./ListOrder";
import OrderFilterPanel from "./OrderFilterPanel";
import OrderDetailSidebar from "./OrderDetailSidebar";
import { Button } from "@/components/ui/button";
import { Plus, ShoppingCart } from "lucide-react";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [sidebarEditMode, setSidebarEditMode] = useState(false);

  // Helper to calculate before 7 days and next 7 days date range (14 days gap)
  const getInitialDates = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 7);
    const end = new Date(today);
    end.setDate(today.getDate() + 7);
    return {
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
    };
  };

  const initialRange = getInitialDates();

  const [filters, setFilters] = useState({ 
    status: defaultStatus, 
    payment_status: "", 
    start_date: initialRange.start_date,
    end_date: initialRange.end_date
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
    const updatePromise = (async () => {
      const res = await apiUpdateOrderStatus(id, status, payment_status);
      if (!res.is_success) {
        throw new Error(res.message || "Failed to update status");
      }
      return res;
    })();

    toast.promise(updatePromise, {
      loading: "Updating status...",
      success: "Status updated successfully!",
      error: (err: any) => err.message || "An error occurred while updating status."
    });

    try {
      await updatePromise;
      fetchData(pagination?.current_page || 1);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle={subtitle}
        buttonLabel="Create Order"
        buttonOnClick={() => {
          setSelectedOrderId(null);
          setSidebarEditMode(true);
          setSidebarOpen(true);
        }}
        icon={ShoppingCart}
      />
      <ListOrder data={data} loading={loading} pagination={pagination} onDelete={handleDelete} onUpdateStatus={handleUpdateStatus} onViewDetail={(order) => {
        setSelectedOrderId(order.id);
        setSidebarEditMode(true);
        setSidebarOpen(true);
      }} onEditDetail={(order) => {
        setSelectedOrderId(order.id);
        setSidebarEditMode(true);
        setSidebarOpen(true);
      }} searchValue={search} onSearchChange={setSearch} hasActiveFilters={activeFilterCount > 0} onFilterClick={() => setIsFilterOpen(true)} onPageChange={(p) => fetchData(p)} />
      <OrderFilterPanel isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} filters={filters} onFilterChange={(f) => setFilters({
        status: f.status,
        payment_status: f.payment_status,
        start_date: f.start_date || "",
        end_date: f.end_date || "",
      })} />
      <OrderDetailSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} orderId={selectedOrderId} onOrderUpdated={() => fetchData(pagination?.current_page || 1)} initialEditMode={sidebarEditMode} />
    </div>
  );
}
