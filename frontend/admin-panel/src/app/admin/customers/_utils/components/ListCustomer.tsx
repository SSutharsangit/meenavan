import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DataTable, { Column } from "@/components/common/DataTable";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Props {
  data: any[]; loading: boolean; pagination: any;
  onEdit: (item: any) => void; onDelete: (id: number) => void;
  searchValue: string; onSearchChange: (val: string) => void; onPageChange: (page: number) => void;
}

export default function ListCustomer({ data, loading, pagination, onEdit, onDelete, searchValue, onSearchChange, onPageChange }: Props) {
  const columns: Column<any>[] = [
    { key: "name", label: "Name", render: (row) => <span className="font-bold text-slate-900">{row.name}</span> },
    { key: "phone", label: "Phone", render: (row) => <span className="text-slate-600 font-medium">{row.phone}</span> },
    { key: "email", label: "Email", render: (row) => <span className="text-slate-500 text-sm">{row.email || "—"}</span> },
    { key: "total_orders", label: "Orders", render: (row) => <span className="font-bold text-slate-900">{row.total_orders}</span> },
    { key: "total_spent", label: "Total Spent", render: (row) => <span className="font-bold text-slate-900">Rs. {Number(row.total_spent || 0).toFixed(2)}</span> },
    {
      key: "is_active", label: "Status",
      render: (row) => row.is_active
        ? <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200 shadow-none">Active</Badge>
        : <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 shadow-none">Inactive</Badge>,
    },
    {
      key: "actions", label: "Actions", align: "right" as const,
      render: (row) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors focus:outline-none">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-md border-slate-200">
              <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(row)}><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700" onClick={() => onDelete(row.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <DataTable columns={columns} data={data} loading={loading} total={pagination?.total_records || 0} currentPage={pagination?.current_page || 1} perPage={pagination?.per_page || 10} onPageChange={onPageChange} searchPlaceholder="Search customers..." searchValue={searchValue} onSearchChange={onSearchChange} emptyMessage="No customers found. Customers will appear here when they place orders." />
  );
}
