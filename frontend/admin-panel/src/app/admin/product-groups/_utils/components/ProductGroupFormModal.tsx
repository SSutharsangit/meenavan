import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Layers3, Loader2, Save, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ProductGroup, ProductOption, apiCreateProductGroup, apiUpdateProductGroup } from "../api-service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  item: ProductGroup | null;
  products: ProductOption[];
  onSuccess: () => void;
}

interface FormState {
  name: string;
  description: string;
  display_order: string;
  is_active: boolean;
  product_ids: number[];
}

const buildInitialState = (isEditing: boolean, item: ProductGroup | null): FormState => ({
  name: isEditing && item ? item.name || "" : "",
  description: isEditing && item ? item.description || "" : "",
  display_order: isEditing && item ? item.display_order?.toString() || "0" : "0",
  is_active: isEditing && item ? item.is_active : true,
  product_ids: isEditing && item ? (item.products || []).map((product) => Number(product.id)) : [],
});

export default function ProductGroupFormModal({
  isOpen,
  onClose,
  isEditing,
  item,
  products,
  onSuccess,
}: Props) {
  const [saving, setSaving] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [formData, setFormData] = useState<FormState>(() => buildInitialState(isEditing, item));

  const filteredProducts = useMemo(() => {
    const term = productSearch.trim().toLowerCase();
    if (!term) return products;

    return products.filter((product) =>
      product.name_en?.toLowerCase().includes(term) ||
      product.slug?.toLowerCase().includes(term)
    );
  }, [productSearch, products]);

  const toggleProduct = (productId: number) => {
    setFormData((prev) => ({
      ...prev,
      product_ids: prev.product_ids.includes(productId)
        ? prev.product_ids.filter((id) => id !== productId)
        : [...prev.product_ids, productId],
    }));
  };

  const handleSave = async () => {
    const savePromise = (async () => {
      const payload = {
        name: formData.name,
        description: formData.description,
        display_order: Number(formData.display_order || 0),
        is_active: formData.is_active,
        product_ids: formData.product_ids,
      };

      const res = isEditing && item
        ? await apiUpdateProductGroup(item.id, payload)
        : await apiCreateProductGroup(payload);

      if (!res.is_success) {
        throw new Error(res.message || "Failed to save product group.");
      }
      return res;
    })();

    toast.promise(savePromise, {
      loading: isEditing ? "Updating product group..." : "Creating product group...",
      success: isEditing ? "Product group updated successfully!" : "Product group created successfully!",
      error: (err: any) => err.message || "An error occurred while saving."
    });

    try {
      setSaving(true);
      await savePromise;
      onClose();
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full bg-white border-slate-200 flex flex-col h-full p-0 sm:max-w-2xl">
        <div className="flex-1 overflow-y-auto p-6">
          <SheetHeader className="mb-6 px-0">
            <SheetTitle className="text-xl font-bold text-slate-900">
              {isEditing ? "Edit Product Group" : "Create Product Group"}
            </SheetTitle>
            <SheetDescription className="text-slate-500">
              Group multiple products together so they can be managed as one collection.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-slate-700">Group Name</Label>
              <Input
                placeholder="e.g. Weekend Specials"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="rounded-xl border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Description</Label>
              <Textarea
                placeholder="Add a short note about this product group..."
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                className="min-h-24 rounded-xl border-slate-200"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-slate-700">Display Order</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.display_order}
                  onChange={(e) => setFormData((prev) => ({ ...prev, display_order: e.target.value }))}
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <Label className="text-slate-900 font-semibold">Active</Label>
                  <p className="text-xs text-slate-500">Show this group in the admin list.</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(value) => setFormData((prev) => ({ ...prev, is_active: value }))}
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-slate-700">Products in this group</Label>
                  <p className="text-xs text-slate-500 mt-1">
                    Select one or more products to include in this group.
                  </p>
                </div>
                <div className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {formData.product_ids.length} selected
                </div>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="rounded-xl border-slate-200 pl-9"
                />
              </div>

              <div className="max-h-80 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                {filteredProducts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-500">
                    No products match your search.
                  </div>
                ) : (
                  filteredProducts.map((product) => {
                    const isSelected = formData.product_ids.includes(Number(product.id));

                    return (
                      <label
                        key={product.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition-colors ${
                          isSelected
                            ? "border-blue-200 bg-blue-50"
                            : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleProduct(Number(product.id))}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100 text-[11px] font-bold text-slate-400">
                          {product.primary_image ? (
                            <img
                              src={product.primary_image}
                              alt={product.name_en}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Layers3 className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold text-slate-900">{product.name_en}</div>
                          <div className="truncate text-xs text-slate-500">{product.slug}</div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 bg-white p-6">
          <Button
            className="h-12 w-full rounded-xl bg-blue-600 text-white shadow-md hover:bg-blue-700"
            onClick={handleSave}
            disabled={saving || !formData.name || formData.product_ids.length === 0}
          >
            {saving ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Save className="mr-2 h-5 w-5" />
            )}
            {isEditing ? "Save Group" : "Create Group"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
