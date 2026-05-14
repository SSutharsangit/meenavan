import { Tags, Package, Eye, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  filters: {
    category_id: string;
    is_available: string;
    stock_status: string;
  };
  onFilterChange: (filters: { category_id: string; is_available: string; stock_status: string }) => void;
}

export default function FilterPanel({ isOpen, onClose, categories, filters, onFilterChange }: FilterPanelProps) {

  const handleChange = (key: string, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onFilterChange({ category_id: "", is_available: "", stock_status: "" });
  };

  const activeCount = [filters.category_id, filters.is_available, filters.stock_status].filter(Boolean).length;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-sm w-full bg-white border-slate-200 flex flex-col h-full p-0">
        
        <div className="overflow-y-auto flex-1 p-6">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Filters
              {activeCount > 0 && (
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 shadow-none text-xs">
                  {activeCount} active
                </Badge>
              )}
            </SheetTitle>
            <SheetDescription className="text-slate-500">
              Narrow down your product list by category, availability, or stock level.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-5">
            {/* Category Filter */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Category</Label>
              <div className="relative">
                <Tags className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                <Select 
                  value={filters.category_id} 
                  onValueChange={(val) => handleChange("category_id", val === "all" ? "" : val)}
                >
                  <SelectTrigger className="w-full pl-9 rounded-xl border-slate-200 focus:ring-blue-500">
                    <SelectValue placeholder="All Categories">
                      {filters.category_id
                        ? categories.find(c => c.id.toString() === filters.category_id)?.name_en || "All Categories"
                        : "All Categories"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-md">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name_en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Availability Filter */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Availability</Label>
              <div className="relative">
                <Eye className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                <Select 
                  value={filters.is_available || "all"} 
                  onValueChange={(val) => handleChange("is_available", val === "all" ? "" : val)}
                >
                  <SelectTrigger className="w-full pl-9 rounded-xl border-slate-200 focus:ring-blue-500">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-md">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="1">Available</SelectItem>
                    <SelectItem value="0">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Stock Status Filter */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Stock Status</Label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                <Select 
                  value={filters.stock_status || "all"} 
                  onValueChange={(val) => handleChange("stock_status", val === "all" ? "" : val)}
                >
                  <SelectTrigger className="w-full pl-9 rounded-xl border-slate-200 focus:ring-blue-500">
                    <SelectValue placeholder="All" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-md">
                    <SelectItem value="all">All Stock Levels</SelectItem>
                    <SelectItem value="in_stock">In Stock (≥ 10)</SelectItem>
                    <SelectItem value="low_stock">Low Stock (1–9)</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock (0)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-white flex gap-3">
          <Button 
            variant="outline"
            className="flex-1 rounded-xl border-slate-200 text-slate-600 h-12"
            onClick={handleReset}
          >
            <RotateCcw className="h-4 w-4 mr-2" /> Reset
          </Button>
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md h-12"
            onClick={onClose}
          >
            Apply Filters
          </Button>
        </div>
        
      </SheetContent>
    </Sheet>
  );
}
