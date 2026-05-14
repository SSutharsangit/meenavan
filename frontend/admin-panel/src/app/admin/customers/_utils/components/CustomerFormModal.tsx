import { useState, useEffect } from "react";
import { Loader2, Save, User, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { apiCreateCustomer, apiUpdateCustomer } from "../api-service";

interface Props { isOpen: boolean; onClose: () => void; isEditing: boolean; item: any; onSuccess: () => void; }

export default function CustomerFormModal({ isOpen, onClose, isEditing, item, onSuccess }: Props) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "", email: "", default_address: "", landmark: "", is_active: true });

  useEffect(() => {
    if (isOpen) {
      if (isEditing && item) {
        setFormData({ name: item.name || "", phone: item.phone || "", email: item.email || "", default_address: item.default_address || "", landmark: item.landmark || "", is_active: item.is_active !== undefined ? !!item.is_active : true });
      } else {
        setFormData({ name: "", phone: "", email: "", default_address: "", landmark: "", is_active: true });
      }
    }
  }, [isOpen, isEditing, item]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = isEditing ? await apiUpdateCustomer(item.id, formData) : await apiCreateCustomer(formData);
      if (res.is_success) { onClose(); onSuccess(); } else alert(res.message || "Failed to save.");
    } catch (e) { alert("An error occurred."); } finally { setSaving(false); }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md w-full bg-white border-slate-200 flex flex-col h-full p-0">
        <div className="overflow-y-auto flex-1 p-6">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-bold text-slate-900">{isEditing ? "Edit Customer" : "Add New Customer"}</SheetTitle>
            <SheetDescription className="text-slate-500">{isEditing ? "Update the customer details." : "Fill in the details to add a new customer."}</SheetDescription>
          </SheetHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-700">Full Name</Label>
              <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="e.g. John Doe" className="pl-9 rounded-xl border-slate-200" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Phone Number</Label>
              <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="e.g. +91 98765 43210" className="pl-9 rounded-xl border-slate-200" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} /></div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Email</Label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input type="email" placeholder="e.g. john@example.com" className="pl-9 rounded-xl border-slate-200" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} /></div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Default Address</Label>
              <div className="relative"><MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><textarea placeholder="Full delivery address..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm min-h-[80px] focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.default_address} onChange={(e) => setFormData({...formData, default_address: e.target.value})} /></div>
            </div>
            <div className="space-y-2">
              <Label className="text-slate-700">Landmark</Label>
              <div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input placeholder="e.g. Near temple" className="pl-9 rounded-xl border-slate-200" value={formData.landmark} onChange={(e) => setFormData({...formData, landmark: e.target.value})} /></div>
            </div>
            <div className="flex items-center justify-between p-4 border border-slate-100 rounded-xl bg-slate-50 mt-4">
              <div className="space-y-0.5"><Label className="text-slate-900 font-semibold">Active</Label><div className="text-xs text-slate-500">Customer can place orders.</div></div>
              <Switch checked={formData.is_active} onCheckedChange={(val) => setFormData({...formData, is_active: val})} />
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-white">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md h-12" onClick={handleSave} disabled={saving || !formData.name || !formData.phone}>
            {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
            {isEditing ? "Save Changes" : "Create Customer"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
