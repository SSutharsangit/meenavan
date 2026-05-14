"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Store, Phone, Mail, Coins, Loader2 } from "lucide-react";
import { SettingsService, BusinessSettings } from "./_utils/api-service";

export default function BusinessProfilePage() {
  const [settings, setSettings] = useState<BusinessSettings>({
    business_name: "",
    business_phone: "",
    business_email: "",
    currency_symbol: "Rs.",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await SettingsService.getBusinessSettings();
      setSettings(data);
    } catch (error: any) {
      alert(error.message || "Failed to load business settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await SettingsService.updateBusinessSettings(settings);
      alert("Business profile updated successfully");
    } catch (error: any) {
      alert(error.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Business Profile</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage your store's primary information and preferences.</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8">
        <div className="space-y-8">
          
          {/* Business Name */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-start">
            <div className="md:col-span-1 space-y-1">
              <Label className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-500" />
                Store Name
              </Label>
              <p className="text-sm text-slate-500">The public name of your business as it appears to customers.</p>
            </div>
            <div className="md:col-span-2">
              <Input 
                name="business_name"
                value={settings.business_name}
                onChange={handleChange}
                placeholder="e.g. Meenavan"
                className="max-w-md h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="w-full h-px bg-slate-100"></div>

          {/* Contact Phone */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-start">
            <div className="md:col-span-1 space-y-1">
              <Label className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-500" />
                Contact Phone
              </Label>
              <p className="text-sm text-slate-500">Primary phone number for customer inquiries.</p>
            </div>
            <div className="md:col-span-2">
              <Input 
                name="business_phone"
                value={settings.business_phone}
                onChange={handleChange}
                placeholder="e.g. 0712341017"
                className="max-w-md h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="w-full h-px bg-slate-100"></div>

          {/* Contact Email */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-start">
            <div className="md:col-span-1 space-y-1">
              <Label className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-500" />
                Support Email
              </Label>
              <p className="text-sm text-slate-500">Email address where order notifications and support requests are sent.</p>
            </div>
            <div className="md:col-span-2">
              <Input 
                name="business_email"
                type="email"
                value={settings.business_email}
                onChange={handleChange}
                placeholder="e.g. info@meenavan.lk"
                className="max-w-md h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="w-full h-px bg-slate-100"></div>

          {/* Currency Symbol */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-start">
            <div className="md:col-span-1 space-y-1">
              <Label className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Coins className="w-4 h-4 text-purple-500" />
                Currency Symbol
              </Label>
              <p className="text-sm text-slate-500">The symbol used when displaying prices in the app.</p>
            </div>
            <div className="md:col-span-2">
              <Input 
                name="currency_symbol"
                value={settings.currency_symbol}
                onChange={handleChange}
                placeholder="e.g. Rs. or $"
                className="max-w-[120px] h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>
          </div>

        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="h-11 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
