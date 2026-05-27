import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DataTable, { Column } from "@/components/common/DataTable";
import { formatCurrency, formatQuantity } from "@/lib/admin-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ListProductProps {
  products: any[];
  loading: boolean;
  pagination: any;
  onEdit: (product: any) => void;
  onDelete: (id: number) => void;
  // DataTable toolbar props
  searchValue: string;
  onSearchChange: (val: string) => void;
  hasActiveFilters: boolean;
  onFilterClick: () => void;
  onPageChange: (page: number) => void;
}

const getStatusBadge = (stock: number, isAvailable: number | boolean) => {
  if (!isAvailable) {
    return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 shadow-none">Unavailable</Badge>;
  }
  if (stock <= 0) {
    return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 shadow-none">Out of Stock</Badge>;
  }
  if (stock < 10) {
    return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200 shadow-none">Low Stock</Badge>;
  }
  return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 shadow-none">In Stock</Badge>;
};

export default function ListProduct({ 
  products, loading, pagination, onEdit, onDelete,
  searchValue, onSearchChange, hasActiveFilters, onFilterClick, onPageChange 
}: ListProductProps) {

  const columns: Column<any>[] = [
    {
      key: "primary_image",
      label: "Image",
      render: (row) => (
        <div className="h-11 w-11 rounded-xl bg-slate-100 flex items-center justify-center text-lg border border-slate-200 overflow-hidden shrink-0">
          {row.primary_image ? (
            <img src={row.primary_image} alt={row.name_en} className="w-full h-full object-cover" />
          ) : (
            "🐟"
          )}
        </div>
      ),
    },
    {
      key: "name_en",
      label: "Product Name",
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.name_en}</div>
          <div className="text-xs text-slate-500">{row.name_ta}</div>
        </div>
      ),
    },
    {
      key: "price_per_kg",
      label: "Unit Price",
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{formatCurrency(row.price_per_kg)}</div>
          {row.discount_percentage > 0 && (
            <div className="text-xs text-red-500 line-through">-{row.discount_percentage}%</div>
          )}
        </div>
      ),
    },
    {
      key: "stock_quantity",
      label: "Available Units",
      render: (row) => (
        <span className="text-slate-600 font-medium">{formatQuantity(row.stock_quantity)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => getStatusBadge(Number(row.stock_quantity), row.is_available),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right" as const,
      render: (row) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-md border-slate-200">
              <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(row)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700" onClick={() => onDelete(row.id)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={products}
      loading={loading}
      total={pagination?.total_records || 0}
      currentPage={pagination?.current_page || 1}
      perPage={pagination?.per_page || 10}
      onPageChange={onPageChange}
      searchPlaceholder="Search products..."
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      hasActiveFilters={hasActiveFilters}
      onFilterClick={onFilterClick}
      emptyMessage="No products found. Try adjusting your search or filters, or add a new product."
    />
  );
}
