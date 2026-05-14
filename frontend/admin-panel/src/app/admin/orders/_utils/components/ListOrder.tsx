import { Eye, Trash2, MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DataTable, { Column } from "@/components/common/DataTable";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface Props {
  data: any[]; loading: boolean; pagination: any;
  onDelete: (id: number) => void;
  onUpdateStatus?: (id: number, status?: string, payment_status?: string) => void;
  searchValue: string; onSearchChange: (val: string) => void;
  hasActiveFilters: boolean; onFilterClick: () => void;
  onPageChange: (page: number) => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  processing: "bg-indigo-100 text-indigo-700 border-indigo-200",
  out_for_delivery: "bg-purple-100 text-purple-700 border-purple-200",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  refunded: "bg-slate-100 text-slate-700 border-slate-200",
};

const paymentColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  failed: "bg-red-100 text-red-700 border-red-200",
  refunded: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function ListOrder({ data, loading, pagination, onDelete, onUpdateStatus, searchValue, onSearchChange, hasActiveFilters, onFilterClick, onPageChange }: Props) {
  const columns: Column<any>[] = [
    { key: "order_number", label: "Order #", render: (row) => <span className="font-bold text-blue-700 font-mono">{row.order_number}</span> },
    { key: "customer_name", label: "Customer", render: (row) => (
      <div><div className="font-bold text-slate-900">{row.customer_name}</div><div className="text-xs text-slate-500">{row.customer_phone}</div></div>
    )},
    { key: "total_amount", label: "Total", render: (row) => <span className="font-bold text-slate-900">Rs. {Number(row.total_amount || 0).toFixed(2)}</span> },
    { key: "status", label: "Status", render: (row) => (
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none cursor-pointer">
          <Badge className={`${statusColors[row.status] || statusColors.pending} hover:opacity-80 shadow-none capitalize transition-opacity`}>{(row.status || 'pending').replace(/_/g, ' ')}</Badge>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 rounded-xl shadow-md border-slate-200 p-1">
          {Object.keys(statusColors).map(status => {
            const isActive = row.status === status || (!row.status && status === 'pending');
            const colorClass = statusColors[status].split(' ')[1]; // extracts text color
            return (
              <DropdownMenuItem 
                key={status} 
                className={`cursor-pointer flex items-center justify-between rounded-lg px-3 py-2.5 my-0.5 transition-colors ${isActive ? 'bg-slate-50 font-semibold' : 'hover:bg-slate-50'}`}
                onClick={() => onUpdateStatus && onUpdateStatus(row.id, status, undefined)}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${colorClass.replace('text', 'bg')}`} />
                  <span className="capitalize text-slate-700">{status.replace(/_/g, ' ')}</span>
                </div>
                {isActive && <div className={`w-1.5 h-1.5 rounded-full ${colorClass.replace('text', 'bg')}`} />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )},
    { key: "payment_status", label: "Payment", render: (row) => (
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none cursor-pointer">
          <Badge className={`${paymentColors[row.payment_status] || paymentColors.pending} hover:opacity-80 shadow-none capitalize transition-opacity`}>{row.payment_status || 'pending'}</Badge>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 rounded-xl shadow-md border-slate-200 p-1">
          {Object.keys(paymentColors).map(status => {
            const isActive = row.payment_status === status || (!row.payment_status && status === 'pending');
            const colorClass = paymentColors[status].split(' ')[1]; // extracts text color
            return (
              <DropdownMenuItem 
                key={status} 
                className={`cursor-pointer flex items-center justify-between rounded-lg px-3 py-2.5 my-0.5 transition-colors ${isActive ? 'bg-slate-50 font-semibold' : 'hover:bg-slate-50'}`}
                onClick={() => onUpdateStatus && onUpdateStatus(row.id, undefined, status)}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${colorClass.replace('text', 'bg')}`} />
                  <span className="capitalize text-slate-700">{status.replace(/_/g, ' ')}</span>
                </div>
                {isActive && <div className={`w-1.5 h-1.5 rounded-full ${colorClass.replace('text', 'bg')}`} />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )},
    { key: "created_at", label: "Date", render: (row) => <span className="text-slate-500 text-sm">{row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}</span> },
    {
      key: "actions", label: "Actions", align: "right" as const,
      render: (row) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors focus:outline-none">
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-md border-slate-200">
              <DropdownMenuItem className="cursor-pointer"><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700" onClick={() => onDelete(row.id)}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <DataTable columns={columns} data={data} loading={loading} total={pagination?.total_records || 0} currentPage={pagination?.current_page || 1} perPage={pagination?.per_page || 10} onPageChange={onPageChange} searchPlaceholder="Search by order # or customer..." searchValue={searchValue} onSearchChange={onSearchChange} hasActiveFilters={hasActiveFilters} onFilterClick={onFilterClick} emptyMessage="No orders found. Orders will appear here when customers place them." />
  );
}
