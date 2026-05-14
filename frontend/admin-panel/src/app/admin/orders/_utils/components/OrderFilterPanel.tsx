import { ShoppingBag, Package, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Props {
  isOpen: boolean; onClose: () => void;
  filters: { status: string; payment_status: string; start_date?: string; end_date?: string };
  onFilterChange: (f: { status: string; payment_status: string; start_date?: string; end_date?: string }) => void;
}

export default function OrderFilterPanel({ isOpen, onClose, filters, onFilterChange }: Props) {
  const handleChange = (key: string, value: string) => onFilterChange({ ...filters, [key]: value });
  
  const today = new Date().toISOString().split('T')[0];
  const handleReset = () => onFilterChange({ status: "", payment_status: "", start_date: today, end_date: today });
  
  const activeCount = [filters.status, filters.payment_status, filters.start_date, filters.end_date].filter(Boolean).length;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-sm w-full bg-white border-slate-200 flex flex-col h-full p-0">
        <div className="overflow-y-auto flex-1 p-6">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Filters {activeCount > 0 && <Badge className="bg-blue-100 text-blue-700 border-blue-200 shadow-none text-xs">{activeCount} active</Badge>}
            </SheetTitle>
            <SheetDescription className="text-slate-500">Filter orders by status, payment or date range.</SheetDescription>
          </SheetHeader>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold text-xs">Start Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                  <Input type="date" className="pl-9 rounded-xl border-slate-200" value={filters.start_date || ""} onChange={(e) => handleChange("start_date", e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold text-xs">End Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                  <Input type="date" className="pl-9 rounded-xl border-slate-200" value={filters.end_date || ""} onChange={(e) => handleChange("end_date", e.target.value)} />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold text-xs">Order Status</Label>
              <div className="relative">
                <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                <Select value={filters.status || "all"} onValueChange={(v) => handleChange("status", v === "all" ? "" : v)}>
                  <SelectTrigger className="w-full pl-9 rounded-xl border-slate-200"><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-md">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold text-xs">Payment Status</Label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                <Select value={filters.payment_status || "all"} onValueChange={(v) => handleChange("payment_status", v === "all" ? "" : v)}>
                  <SelectTrigger className="w-full pl-9 rounded-xl border-slate-200"><SelectValue placeholder="All" /></SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-md">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-white flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl border-slate-200 text-slate-600 h-12" onClick={handleReset}><RotateCcw className="h-4 w-4 mr-2" /> Reset</Button>
          <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md h-12" onClick={onClose}>Apply Filters</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
