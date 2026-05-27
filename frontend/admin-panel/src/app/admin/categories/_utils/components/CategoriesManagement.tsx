"use client";

import { useState, useEffect } from "react";
import { Plus, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiGetAllCategories, apiDeleteCategory } from "../api-service";
import ListCategory from "./ListCategory";
import CategoryFormModal from "./CategoryFormModal";
import PageHeader from "@/components/common/PageHeader";

export default function CategoriesManagement() {
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
      const res = await apiGetAllCategories(page, debouncedSearch || undefined);
      if (res.is_success) {
        setData(res.result.data || []);
        setPagination({ current_page: res.result.current_page, total_records: res.result.total_records, total_pages: res.result.total_pages, per_page: res.result.per_page });
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleOpenCreate = () => { setIsEditing(false); setSelectedItem(null); setIsSheetOpen(true); };
  const handleOpenEdit = (item: any) => { setIsEditing(true); setSelectedItem(item); setIsSheetOpen(true); };
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try { const res = await apiDeleteCategory(id); if (res.is_success) fetchData(pagination?.current_page || 1); } catch (e) { console.error(e); }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        subtitle="Organize your products into categories."
        buttonLabel="Add Category"
        buttonOnClick={handleOpenCreate}
        icon={FolderOpen}
      />
      <ListCategory data={data} loading={loading} pagination={pagination} onEdit={handleOpenEdit} onDelete={handleDelete} searchValue={search} onSearchChange={setSearch} onPageChange={(p) => fetchData(p)} />
      <CategoryFormModal isOpen={isSheetOpen} onClose={() => setIsSheetOpen(false)} isEditing={isEditing} item={selectedItem} onSuccess={() => fetchData(pagination?.current_page || 1)} />
    </div>
  );
}
