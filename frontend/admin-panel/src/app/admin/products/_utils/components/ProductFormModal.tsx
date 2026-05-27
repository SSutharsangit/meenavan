import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Loader2, Save, Type, Coins, Percent, Package, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiCreateProduct, apiUpdateProduct } from "../api-service";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  product: any;
  categories: any[];
  onSuccess: () => void;
}

export default function ProductFormModal({ isOpen, onClose, isEditing, product, categories, onSuccess }: ProductFormModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name_en: "",
    name_ta: "",
    category_id: "",
    price_per_kg: "",
    discount_percentage: "0",
    stock_quantity: "",
    is_available: true,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && product) {
        setFormData({
          name_en: product.name_en,
          name_ta: product.name_ta || "",
          category_id: product.category_id?.toString() || "",
          price_per_kg: product.price_per_kg,
          discount_percentage: product.discount_percentage?.toString() || "0",
          stock_quantity: product.stock_quantity,
          is_available: !!product.is_available,
        });
        setImageFile(null);
        setImagePreview(product.primary_image || null);
      } else {
        setFormData({
          name_en: "",
          name_ta: "",
          category_id: "",
          price_per_kg: "",
          discount_percentage: "0",
          stock_quantity: "",
          is_available: true,
        });
        setImageFile(null);
        setImagePreview(null);
      }
    }
  }, [isOpen, isEditing, product]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    const savePromise = (async () => {
      const payload = new FormData();
      payload.append("name_en", formData.name_en);
      payload.append("name_ta", formData.name_ta);
      payload.append("category_id", formData.category_id);
      payload.append("price_per_kg", formData.price_per_kg);
      payload.append("discount_percentage", formData.discount_percentage);
      payload.append("stock_quantity", formData.stock_quantity);
      payload.append("is_available", formData.is_available ? "1" : "0");
      
      if (imageFile) {
        payload.append("image", imageFile);
      }

      const res = isEditing 
        ? await apiUpdateProduct(product.id, payload)
        : await apiCreateProduct(payload);

      if (!res.is_success) {
        throw new Error(res.message || "Failed to save product.");
      }
      return res;
    })();

    toast.promise(savePromise, {
      loading: isEditing ? "Updating product..." : "Creating product...",
      success: isEditing ? "Product updated successfully!" : "Product created successfully!",
      error: (err: any) => err.message || "An error occurred while saving."
    });

    try {
      setSaving(true);
      await savePromise;
      onClose();
      onSuccess();
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md w-full bg-white border-slate-200 flex flex-col h-full p-0">
        
        <div className="overflow-y-auto flex-1 p-6">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-bold text-slate-900">
              {isEditing ? "Edit Product" : "Add New Product"}
            </SheetTitle>
            <SheetDescription className="text-slate-500">
              {isEditing ? "Update the details for this product below." : "Fill in the details to add a new product to the catalog."}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700">Product Image</Label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl">🐟</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <input 
                    type="file" 
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    <Label 
                      htmlFor="image-upload" 
                      className="inline-flex h-9 items-center justify-center rounded-xl bg-blue-50 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer transition-colors whitespace-nowrap shrink-0"
                    >
                      Choose Image
                    </Label>
                    <span className="text-sm text-slate-500 truncate max-w-[120px]" title={imageFile?.name || ""}>
                      {imageFile ? imageFile.name : "No file chosen"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Recommended: Square image (500x500px). Max 2MB.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name_en" className="text-slate-700">Product Name (English)</Label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  id="name_en" 
                  placeholder="e.g. Premium Package" 
                  className="pl-9 rounded-xl border-slate-200 focus-visible:ring-blue-500"
                  value={formData.name_en}
                  onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name_ta" className="text-slate-700">Product Name (Tamil)</Label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  id="name_ta" 
                  placeholder="e.g. கெலவல்லா" 
                  className="pl-9 rounded-xl border-slate-200 focus-visible:ring-blue-500"
                  value={formData.name_ta}
                  onChange={(e) => setFormData({...formData, name_ta: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-slate-700">Category</Label>
              <div className="relative">
                <Tags className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none z-10" />
                <Select 
                  value={formData.category_id} 
                  onValueChange={(val) => setFormData({...formData, category_id: val || ""})}
                >
                  <SelectTrigger className="pl-9 rounded-xl border-slate-200 focus:ring-blue-500">
                    <SelectValue placeholder="Select a category">
                      {categories.find(c => c.id.toString() === formData.category_id)?.name_en || "Select a category"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-md">
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name_en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-slate-700">Unit Price</Label>
                <div className="relative">
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="price" 
                    type="number"
                    placeholder="e.g. 1200" 
                    className="pl-9 rounded-xl border-slate-200 focus-visible:ring-blue-500"
                    value={formData.price_per_kg}
                    onChange={(e) => setFormData({...formData, price_per_kg: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount" className="text-slate-700">Discount (%)</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="discount" 
                    type="number"
                    placeholder="e.g. 10" 
                    className="pl-9 rounded-xl border-slate-200 focus-visible:ring-blue-500"
                    value={formData.discount_percentage}
                    onChange={(e) => setFormData({...formData, discount_percentage: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="stock" className="text-slate-700">Available Quantity</Label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  id="stock" 
                  type="number"
                  step="0.1"
                  placeholder="e.g. 25.5" 
                  className="pl-9 rounded-xl border-slate-200 focus-visible:ring-blue-500"
                  value={formData.stock_quantity}
                  onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50 mt-4">
              <div className="space-y-0.5">
                <Label className="text-slate-900 font-semibold">Available Online</Label>
                <div className="text-xs text-slate-500">Show this product to customers.</div>
              </div>
              <Switch 
                checked={formData.is_available}
                onCheckedChange={(val) => setFormData({...formData, is_available: val})}
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white">
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md h-12"
            onClick={handleSave}
            disabled={saving || !formData.name_en || !formData.price_per_kg || !formData.category_id}
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
            {isEditing ? "Save Changes" : "Create Product"}
          </Button>
        </div>
        
      </SheetContent>
    </Sheet>
  );
}
