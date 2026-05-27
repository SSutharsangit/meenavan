import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Loader2, Save, MapPin, DollarSign, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiCreateDeliveryCharge, apiUpdateDeliveryCharge } from "../api-service";

interface Props { isOpen: boolean; onClose: () => void; isEditing: boolean; item: any; areas: any[]; onSuccess: () => void; }

export default function DeliveryChargeFormModal({ isOpen, onClose, isEditing, item, areas, onSuccess }: Props) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ 
    delivery_area_id: "", min_order_amount: "", charge_amount: "", is_free_above_amount: "", is_active: true 
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing && item) {
        setFormData({ 
          delivery_area_id: item.delivery_area_id?.toString() || "", 
          min_order_amount: item.min_order_amount?.toString() || "0", 
          charge_amount: item.charge_amount?.toString() || "0", 
          is_free_above_amount: item.is_free_above_amount?.toString() || "", 
          is_active: item.is_active !== undefined ? !!item.is_active : true 
        });
      } else {
        setFormData({ delivery_area_id: "", min_order_amount: "0", charge_amount: "0", is_free_above_amount: "", is_active: true });
      }
    }
  }, [isOpen, isEditing, item]);

  const handleSave = async () => {
    const savePromise = (async () => {
      const payload = {
        delivery_area_id: Number(formData.delivery_area_id),
        min_order_amount: Number(formData.min_order_amount) || 0,
        charge_amount: Number(formData.charge_amount) || 0,
        is_free_above_amount: formData.is_free_above_amount ? Number(formData.is_free_above_amount) : null,
        is_active: formData.is_active,
      };
      const res = isEditing ? await apiUpdateDeliveryCharge(item.id, payload) : await apiCreateDeliveryCharge(payload);
      if (!res.is_success) {
        throw new Error(res.message || "Failed to save.");
      }
      return res;
    })();

    toast.promise(savePromise, {
      loading: isEditing ? "Saving delivery charge..." : "Creating delivery charge...",
      success: isEditing ? "Delivery charge saved successfully!" : "Delivery charge created successfully!",
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
            <SheetTitle className="text-xl font-bold text-slate-900">{isEditing ? "Edit Delivery Charge" : "Add Delivery Charge"}</SheetTitle>
            <SheetDescription className="text-slate-500">{isEditing ? "Update pricing rules." : "Set up pricing rules for an area."}</SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700">Delivery Area</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10 pointer-events-none" />
                <Select value={formData.delivery_area_id} onValueChange={(val) => setFormData({...formData, delivery_area_id: val || ""})}>
                  <SelectTrigger className="pl-9 rounded-xl border-slate-200">
                    <SelectValue placeholder="Select Area" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-md">
                    {areas.map((area: any) => (
                      <SelectItem key={area.id} value={area.id.toString()}>{area.name_en}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-slate-700">Delivery Charge (Rs)</Label>
              <div className="relative"><DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input type="number" className="pl-9 rounded-xl border-slate-200" value={formData.charge_amount} onChange={(e) => setFormData({...formData, charge_amount: e.target.value})} /></div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Minimum Order Amount (Rs)</Label>
              <div className="relative"><Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input type="number" className="pl-9 rounded-xl border-slate-200" value={formData.min_order_amount} onChange={(e) => setFormData({...formData, min_order_amount: e.target.value})} /></div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700">Free Delivery Above (Rs) (Optional)</Label>
              <div className="relative"><Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input type="number" placeholder="Leave empty if none" className="pl-9 rounded-xl border-slate-200" value={formData.is_free_above_amount} onChange={(e) => setFormData({...formData, is_free_above_amount: e.target.value})} /></div>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50 mt-4">
              <div className="space-y-0.5"><Label className="text-slate-900 font-semibold">Active</Label><div className="text-xs text-slate-500">Apply this delivery charge.</div></div>
              <Switch checked={formData.is_active} onCheckedChange={(val) => setFormData({...formData, is_active: val})} />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-white">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md h-12" onClick={handleSave} disabled={saving || !formData.delivery_area_id || !formData.charge_amount}>
            {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
            {isEditing ? "Save Changes" : "Create Charge"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
