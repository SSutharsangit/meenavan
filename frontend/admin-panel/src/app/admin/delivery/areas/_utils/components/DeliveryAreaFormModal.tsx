import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Loader2, Save, MapPin, Hash, Clock, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { apiCreateDeliveryArea, apiUpdateDeliveryArea } from "../api-service";

interface Props { isOpen: boolean; onClose: () => void; isEditing: boolean; item: any; onSuccess: () => void; }

export default function DeliveryAreaFormModal({ isOpen, onClose, isEditing, item, onSuccess }: Props) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ 
    name_en: "", name_ta: "", postal_codes: "", landmarks: "", 
    delivery_time_min: 30, delivery_time_max: 60, display_order: 0, is_active: true 
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing && item) {
        setFormData({ 
          name_en: item.name_en || "", name_ta: item.name_ta || "", 
          postal_codes: Array.isArray(item.postal_codes) ? item.postal_codes.join(", ") : (item.postal_codes || ""), 
          landmarks: item.landmarks || "", 
          delivery_time_min: item.delivery_time_min || 30, 
          delivery_time_max: item.delivery_time_max || 60, 
          display_order: item.display_order || 0,
          is_active: item.is_active !== undefined ? !!item.is_active : true 
        });
      } else {
        setFormData({ name_en: "", name_ta: "", postal_codes: "", landmarks: "", delivery_time_min: 30, delivery_time_max: 60, display_order: 0, is_active: true });
      }
    }
  }, [isOpen, isEditing, item]);

  const handleSave = async () => {
    const savePromise = (async () => {
      const payload = {
        ...formData,
        postal_codes: formData.postal_codes.split(",").map(s => s.trim()).filter(Boolean),
        delivery_time_min: Number(formData.delivery_time_min),
        delivery_time_max: Number(formData.delivery_time_max),
        display_order: Number(formData.display_order),
      };
      const res = isEditing ? await apiUpdateDeliveryArea(item.id, payload) : await apiCreateDeliveryArea(payload);
      if (!res.is_success) {
        throw new Error(res.message || "Failed to save.");
      }
      return res;
    })();

    toast.promise(savePromise, {
      loading: isEditing ? "Saving delivery area..." : "Creating delivery area...",
      success: isEditing ? "Delivery area saved successfully!" : "Delivery area created successfully!",
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
            <SheetTitle className="text-xl font-bold text-slate-900">{isEditing ? "Edit Delivery Area" : "Add Delivery Area"}</SheetTitle>
            <SheetDescription className="text-slate-500">{isEditing ? "Update area details." : "Define a new delivery zone."}</SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700">Area Name (English)</Label>
              <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="e.g. Downtown" className="pl-9 rounded-xl border-slate-200" value={formData.name_en} onChange={(e) => setFormData({...formData, name_en: e.target.value})} /></div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Area Name (Tamil)</Label>
              <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="e.g. நகர்ப்புறம்" className="pl-9 rounded-xl border-slate-200" value={formData.name_ta} onChange={(e) => setFormData({...formData, name_ta: e.target.value})} /></div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Postal Codes (comma separated)</Label>
              <div className="relative"><Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="e.g. 40001, 40002" className="pl-9 rounded-xl border-slate-200" value={formData.postal_codes} onChange={(e) => setFormData({...formData, postal_codes: e.target.value})} /></div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Landmarks</Label>
              <div className="relative"><Map className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><textarea placeholder="Notable landmarks..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.landmarks} onChange={(e) => setFormData({...formData, landmarks: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700">Min Time (mins)</Label>
                <div className="relative"><Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input type="number" className="pl-9 rounded-xl border-slate-200" value={formData.delivery_time_min} onChange={(e) => setFormData({...formData, delivery_time_min: Number(e.target.value)})} /></div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Max Time (mins)</Label>
                <div className="relative"><Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input type="number" className="pl-9 rounded-xl border-slate-200" value={formData.delivery_time_max} onChange={(e) => setFormData({...formData, delivery_time_max: Number(e.target.value)})} /></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50 mt-4">
              <div className="space-y-0.5"><Label className="text-slate-900 font-semibold">Active</Label><div className="text-xs text-slate-500">Enable delivery for this area.</div></div>
              <Switch checked={formData.is_active} onCheckedChange={(val) => setFormData({...formData, is_active: val})} />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-white">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md h-12" onClick={handleSave} disabled={saving || !formData.name_en}>
            {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
            {isEditing ? "Save Changes" : "Create Area"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
