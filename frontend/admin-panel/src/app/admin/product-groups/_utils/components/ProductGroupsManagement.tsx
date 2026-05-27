"use client";

import { useEffect, useState } from "react";
import { Plus, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  PaginatedResult,
  ProductGroup,
  ProductOption,
  apiDeleteProductGroup,
  apiGetAllProductGroups,
  apiGetProductOptions,
} from "../api-service";
import ListProductGroup from "./ListProductGroup";
import ProductGroupFormModal from "./ProductGroupFormModal";
import PageHeader from "@/components/common/PageHeader";

export default function ProductGroupsManagement() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [data, setData] = useState<ProductGroup[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginatedResult<ProductGroup> | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProductGroup | null>(null);

  const fetchData = async (page = 1, nextSearch?: string) => {
    try {
      setLoading(true);
      const res = await apiGetAllProductGroups(page, nextSearch);

      if (res.is_success && res.result) {
        setData(res.result.data || []);
        setPagination(res.result);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchData(1, debouncedSearch || undefined);
    }, 0);

    return () => clearTimeout(timeout);
  }, [debouncedSearch]);

  useEffect(() => {
    const loadProducts = async () => {
      const res = await apiGetProductOptions();
      if (res.is_success && res.result) {
        setProducts(res.result);
      }
    };

    void loadProducts();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedItem(null);
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (item: ProductGroup) => {
    setIsEditing(true);
    setSelectedItem(item);
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product group?")) return;

    const res = await apiDeleteProductGroup(id);
    if (res.is_success) {
      void fetchData(pagination?.current_page || 1, debouncedSearch || undefined);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Groups"
        subtitle="Create one group and link multiple products together."
        buttonLabel="Add Product Group"
        buttonOnClick={handleOpenCreate}
        icon={Layers}
      />

      <ListProductGroup
        data={data}
        loading={loading}
        pagination={pagination}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
        searchValue={search}
        onSearchChange={setSearch}
        onPageChange={(page) => void fetchData(page, debouncedSearch || undefined)}
      />

      {isSheetOpen && (
        <ProductGroupFormModal
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          isEditing={isEditing}
          item={selectedItem}
          products={products}
          onSuccess={() => void fetchData(pagination?.current_page || 1, debouncedSearch || undefined)}
        />
      )}
    </div>
  );
}
