"use client";

import { useState, useEffect } from "react";
import { apiGetAllStocks, apiDeleteStock } from "../api-service";
import ListStock from "./ListStock";
import PageHeader from "@/components/common/PageHeader";
import { Boxes } from "lucide-react";

export default function StockManagement() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(search), 400); return () => clearTimeout(t); }, [search]);
  useEffect(() => { fetchData(1); }, [debouncedSearch]);

  const fetchData = async (page = 1) => {
    try {
      setLoading(true);
      const res = await apiGetAllStocks(page, debouncedSearch || undefined);
      if (res.is_success) {
        setData(res.result.data || []);
        setPagination({ current_page: res.result.current_page, total_records: res.result.total_records, total_pages: res.result.total_pages, per_page: res.result.per_page });
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try { const res = await apiDeleteStock(id); if (res.is_success) fetchData(pagination?.current_page || 1); } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Stock & Inventory"
        subtitle="Track all stock movements and adjustments."
        icon={Boxes}
      />
      <ListStock data={data} loading={loading} pagination={pagination} onDelete={handleDelete} searchValue={search} onSearchChange={setSearch} onPageChange={(p) => fetchData(p)} />
    </div>
  );
}
