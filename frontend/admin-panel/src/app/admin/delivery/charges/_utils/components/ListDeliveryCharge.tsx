import { Edit, MoreHorizontal, Trash2 } from "lucide-react";
import DataTable, { Column } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/admin-config";

interface Props {
  data: any[];
  loading: boolean;
  pagination: any;
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
  searchValue: string;
  onSearchChange: (val: string) => void;
  onPageChange: (page: number) => void;
}

export default function ListDeliveryCharge({
  data,
  loading,
  pagination,
  onEdit,
  onDelete,
  searchValue,
  onSearchChange,
  onPageChange,
}: Props) {
  const columns: Column<any>[] = [
    {
      key: "area",
      label: "Delivery Area",
      render: (row) => (
        <span className="font-bold text-slate-900">
          {row.delivery_area?.name_en || `Area #${row.delivery_area_id}`}
        </span>
      ),
    },
    {
      key: "min_order_amount",
      label: "Min Order",
      render: (row) => (
        <span className="text-slate-600">
          {formatCurrency(row.min_order_amount)}
        </span>
      ),
    },
    {
      key: "charge_amount",
      label: "Delivery Charge",
      render: (row) => (
        <span className="font-bold text-slate-900">
          {formatCurrency(row.charge_amount)}
        </span>
      ),
    },
    {
      key: "is_free_above_amount",
      label: "Free Delivery Above",
      render: (row) =>
        row.is_free_above_amount ? (
          <span className="font-medium text-emerald-600">
            {formatCurrency(row.is_free_above_amount)}
          </span>
        ) : (
          <span className="text-slate-400">-</span>
        ),
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
            <DropdownMenuContent
              align="end"
              className="w-40 rounded-xl border-slate-200 shadow-md"
            >
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onEdit(row)}
              >
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
      searchPlaceholder="Search areas..."
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      emptyMessage="No delivery charges found. Set up your delivery pricing."
    />
  );
}
