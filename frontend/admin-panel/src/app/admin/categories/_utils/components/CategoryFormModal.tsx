import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Loader2, Save, Type, Hash, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { apiCreateCategory, apiUpdateCategory } from "../api-service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isEditing: boolean;
  item: any;
  onSuccess: () => void;
}

export default function CategoryFormModal({ isOpen, onClose, isEditing, item, onSuccess }: Props) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name_en: "", name_ta: "", description: "", icon: "", is_active: true, display_order: "0",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (isEditing && item) {
        setFormData({
          name_en: item.name_en || "", name_ta: item.name_ta || "",
          description: item.description || "", icon: item.icon || "",
          is_active: item.is_active !== undefined ? !!item.is_active : true,
          display_order: item.display_order?.toString() || "0",
        });
        setImageFile(null);
        setImagePreview(item.image_url || null);
      } else {
        setFormData({ name_en: "", name_ta: "", description: "", icon: "", is_active: true, display_order: "0" });
        setImageFile(null);
        setImagePreview(null);
      }
    }
  }, [isOpen, isEditing, item]);

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
      payload.append("description", formData.description);
      payload.append("icon", formData.icon);
      payload.append("is_active", formData.is_active ? "1" : "0");
      payload.append("display_order", formData.display_order);

      if (imageFile) {
        payload.append("image", imageFile);
      }

      const res = isEditing ? await apiUpdateCategory(item.id, payload) : await apiCreateCategory(payload);
      if (!res.is_success) {
        throw new Error(res.message || "Failed to save.");
      }
      return res;
    })();

    toast.promise(savePromise, {
      loading: isEditing ? "Saving category..." : "Creating category...",
      success: isEditing ? "Category saved successfully!" : "Category created successfully!",
      error: (err: any) => err.message || "An error occurred while saving."
    });

    try {
      setSaving(true);
      await savePromise;
      onClose();
      onSuccess();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md w-full bg-white border-slate-200 flex flex-col h-full p-0">
        <div className="overflow-y-auto flex-1 p-6">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-bold text-slate-900">{isEditing ? "Edit Category" : "Add New Category"}</SheetTitle>
            <SheetDescription className="text-slate-500">{isEditing ? "Update the category details." : "Fill in the details to create a new category."}</SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="text-slate-700">Category Image</Label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl">{formData.icon || "📁"}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <input type="file" id="cat-image-upload" accept="image/*" onChange={handleImageChange} className="hidden" />
                  <div className="flex items-center gap-3">
                    <Label htmlFor="cat-image-upload" className="inline-flex h-9 items-center justify-center rounded-xl bg-blue-50 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer transition-colors whitespace-nowrap shrink-0">
                      Choose Image
                    </Label>
                    <span className="text-sm text-slate-500 truncate max-w-[120px]" title={imageFile?.name || ""}>
                      {imageFile ? imageFile.name : "No file chosen"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Recommended: Square image (400x400px). Max 2MB.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Name (English)</Label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="e.g. Featured Items" className="pl-9 rounded-xl border-slate-200" value={formData.name_en} onChange={(e) => setFormData({...formData, name_en: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Name (Tamil)</Label>
              <div className="relative">
                <Type className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input placeholder="e.g. புதிய மீன்" className="pl-9 rounded-xl border-slate-200" value={formData.name_ta} onChange={(e) => setFormData({...formData, name_ta: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Description</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <textarea placeholder="Optional description..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700">Icon</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input placeholder="e.g. 🐟" className="pl-9 rounded-xl border-slate-200" value={formData.icon} onChange={(e) => setFormData({...formData, icon: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Display Order</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input type="number" placeholder="0" className="pl-9 rounded-xl border-slate-200" value={formData.display_order} onChange={(e) => setFormData({...formData, display_order: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50 mt-4">
              <div className="space-y-0.5">
                <Label className="text-slate-900 font-semibold">Active</Label>
                <div className="text-xs text-slate-500">Show this category publicly.</div>
              </div>
              <Switch checked={formData.is_active} onCheckedChange={(val) => setFormData({...formData, is_active: val})} />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-white">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md h-12" onClick={handleSave} disabled={saving || !formData.name_en || !formData.name_ta}>
            {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
            {isEditing ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
