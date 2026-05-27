"use client";

import { useState, useEffect } from "react";
import { Plus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiGetAllProducts, apiGetCategories, apiDeleteProduct, ProductFilters } from "../api-service";
import PageHeader from "@/components/common/PageHeader";
import ListProduct from "./ListProduct";
import ProductFormModal from "./ProductFormModal";
import FilterPanel from "./FilterPanel";

export default function ProductsManagement() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<any>(null);

  // Sheet State
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // Filter State
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    category_id: "",
    is_available: "",
    stock_status: "",
  });

  const activeFilterCount = [filters.category_id, filters.is_available, filters.stock_status].filter(Boolean).length;

  // Debounce search input (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Re-fetch whenever debounced search or filters change
  useEffect(() => {
    fetchProducts(1);
  }, [debouncedSearch, filters]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const apiFilters: ProductFilters = {
        search: debouncedSearch || undefined,
        category_id: filters.category_id || undefined,
        is_available: filters.is_available !== "" ? filters.is_available : undefined,
        stock_status: filters.stock_status || undefined,
      };
      const res = await apiGetAllProducts(page, apiFilters);
      if (res.is_success) {
        setProducts(res.result.data);
        setPagination({
          current_page: res.result.current_page,
          total_records: res.result.total_records,
          total_pages: res.result.total_pages,
          per_page: res.result.per_page,
        });
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await apiGetCategories();
      if (res.is_success) {
        setCategories(res.result.data || res.result); 
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedProduct(null);
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (product: any) => {
    setIsEditing(true);
    setSelectedProduct(product);
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await apiDeleteProduct(id);
      if (res.is_success) {
        fetchProducts(pagination?.current_page || 1);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleFilterChange = (newFilters: { category_id: string; is_available: string; stock_status: string }) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle="Manage your seafood catalog, pricing, and inventory."
        buttonLabel="Add Product"
        buttonOnClick={handleOpenCreate}
        icon={Package}
      />

      <ListProduct 
        products={products} 
        loading={loading} 
        pagination={pagination} 
        onEdit={handleOpenEdit} 
        onDelete={handleDelete} 
        searchValue={search}
        onSearchChange={setSearch}
        hasActiveFilters={activeFilterCount > 0}
        onFilterClick={() => setIsFilterOpen(true)}
        onPageChange={(page) => fetchProducts(page)}
      />

      <ProductFormModal 
        isOpen={isSheetOpen} 
        onClose={() => setIsSheetOpen(false)} 
        isEditing={isEditing} 
        product={selectedProduct} 
        categories={categories} 
        onSuccess={() => fetchProducts(pagination?.current_page || 1)} 
      />

      <FilterPanel 
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categories={categories}
        filters={filters}
        onFilterChange={handleFilterChange}
      />
    </div>
  );
}
