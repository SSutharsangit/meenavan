"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiGetAllDeliveryAreas, apiDeleteDeliveryArea } from "../api-service";
import ListDeliveryArea from "./ListDeliveryArea";
import DeliveryAreaFormModal from "./DeliveryAreaFormModal";

export default function DeliveryAreasManagement() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(search), 400); return () => clearTimeout(t); }, [search]);
  useEffect(() => { fetchData(1); }, [debouncedSearch]);

  const fetchData = async (page = 1) => {
    try {
      setLoading(true);
      const res = await apiGetAllDeliveryAreas(page, debouncedSearch || undefined);
      if (res.is_success) {
        setData(res.result.data || []);
        setPagination({ current_page: res.result.current_page, total_records: res.result.total_records, total_pages: res.result.total_pages, per_page: res.result.per_page });
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleOpenCreate = () => { setIsEditing(false); setSelectedItem(null); setIsSheetOpen(true); };
  const handleOpenEdit = (item: any) => { setIsEditing(true); setSelectedItem(item); setIsSheetOpen(true); };
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try { const res = await apiDeleteDeliveryArea(id); if (res.is_success) fetchData(pagination?.current_page || 1); } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Delivery Areas</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage supported delivery zones and postal codes.</p>
        </div>
        <Button onClick={handleOpenCreate} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm"><Plus className="mr-2 h-4 w-4" /> Add Area</Button>
      </div>
      <ListDeliveryArea data={data} loading={loading} pagination={pagination} onEdit={handleOpenEdit} onDelete={handleDelete} searchValue={search} onSearchChange={setSearch} onPageChange={(p) => fetchData(p)} />
      <DeliveryAreaFormModal isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} isEditing={isEditing} item={selectedItem} onSuccess={() => fetchData(pagination?.current_page || 1)} />
    </div>
  );
}
