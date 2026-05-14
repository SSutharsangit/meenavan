import { Trash2, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DataTable, { Column } from "@/components/common/DataTable";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Props {
  data: any[]; loading: boolean; pagination: any; onDelete: (id: number) => void;
  searchValue: string; onSearchChange: (val: string) => void; onPageChange: (page: number) => void;
}

const typeColors: Record<string, string> = {
  in: "bg-emerald-100 text-emerald-700 border-emerald-200",
  out: "bg-red-100 text-red-700 border-red-200",
  adjustment: "bg-blue-100 text-blue-700 border-blue-200",
};

export default function ListStock({ data, loading, pagination, onDelete, searchValue, onSearchChange, onPageChange }: Props) {
  const columns: Column<any>[] = [
    { key: "product_id", label: "Product ID", render: (row) => <span className="font-bold text-slate-900">#{row.product_id}</span> },
    { key: "type", label: "Type", render: (row) => <Badge className={`${typeColors[row.type] || typeColors.adjustment} hover:bg-transparent shadow-none capitalize`}>{row.type}</Badge> },
    { key: "quantity_kg", label: "Qty (Kg)", render: (row) => <span className="font-bold text-slate-900">{Number(row.quantity_kg).toFixed(2)}</span> },
    { key: "reason", label: "Reason", render: (row) => <span className="text-slate-500 text-sm">{row.reason || "—"}</span> },
    { key: "created_at", label: "Date", render: (row) => <span className="text-slate-500 text-sm">{row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}</span> },
    {
      key: "actions", label: "Actions", align: "right" as const,
      render: (row) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors focus:outline-none"><MoreHorizontal className="h-4 w-4" /></DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-md border-slate-200">
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700" onClick={() => onDelete(row.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return <DataTable columns={columns} data={data} loading={loading} total={pagination?.total_records || 0} currentPage={pagination?.current_page || 1} perPage={pagination?.per_page || 10} onPageChange={onPageChange} searchPlaceholder="Search stock entries..." searchValue={searchValue} onSearchChange={onSearchChange} emptyMessage="No stock entries found. Add stock movements to track inventory." />;
}
