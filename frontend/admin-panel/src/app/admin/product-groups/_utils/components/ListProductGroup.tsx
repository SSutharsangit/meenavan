import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import DataTable, { Column } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PaginatedResult, ProductGroup } from "../api-service";

interface Props {
  data: ProductGroup[];
  loading: boolean;
  pagination: PaginatedResult<ProductGroup> | null;
  onEdit: (item: ProductGroup) => void;
  onDelete: (id: number) => void;
  searchValue: string;
  onSearchChange: (val: string) => void;
  onPageChange: (page: number) => void;
}

export default function ListProductGroup({
  data,
  loading,
  pagination,
  onEdit,
  onDelete,
  searchValue,
  onSearchChange,
  onPageChange,
}: Props) {
  const columns: Column<ProductGroup>[] = [
    {
      key: "name",
      label: "Group Name",
      render: (row) => (
        <div>
          <div className="font-bold text-slate-900">{row.name}</div>
          <div className="font-mono text-xs text-slate-500">{row.slug}</div>
        </div>
      ),
    },
    {
      key: "description",
      label: "Description",
      render: (row) => (
        <span className="text-sm text-slate-500">
          {row.description || "No description provided."}
        </span>
      ),
    },
    {
      key: "products",
      label: "Products",
      render: (row) => {
        const products = row.products || [];

        return (
          <div className="space-y-1">
            <div className="font-semibold text-slate-900">
              {row.products_count || products.length} linked products
            </div>
            <div className="text-xs text-slate-500">
              {products.slice(0, 3).map((product) => product.name_en).join(", ") || "No products linked"}
              {products.length > 3 ? "..." : ""}
            </div>
          </div>
        );
      },
    },
    {
      key: "is_active",
      label: "Status",
      render: (row) =>
        row.is_active ? (
          <Badge className="border-emerald-200 bg-emerald-100 text-emerald-700 shadow-none hover:bg-emerald-100">
            Active
          </Badge>
        ) : (
          <Badge className="border-red-200 bg-red-100 text-red-700 shadow-none hover:bg-red-100">
            Inactive
          </Badge>
        ),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right" as const,
      render: (row) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 focus:outline-none">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl border-slate-200 shadow-md">
              <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(row)}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
                onClick={() => onDelete(row.id)}
              >
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
      data={data}
      loading={loading}
      total={pagination?.total_records || 0}
      currentPage={pagination?.current_page || 1}
      perPage={pagination?.per_page || 10}
      onPageChange={onPageChange}
      searchPlaceholder="Search product groups..."
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      emptyMessage="No product groups found. Create a group to organize multiple products together."
    />
  );
}
