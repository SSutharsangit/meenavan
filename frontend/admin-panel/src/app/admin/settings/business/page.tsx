"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, Store, Phone, Mail, Coins, Loader2, Image } from "lucide-react";
import { ADMIN_CURRENCY_SYMBOL } from "@/lib/admin-config";
import { SettingsService, BusinessSettings } from "./_utils/api-service";
import { useBusinessSettings } from "@/providers/BusinessSettingsProvider";
import { toast } from "react-hot-toast";
import PageHeader from "@/components/common/PageHeader";

export default function BusinessProfilePage() {
  const { refreshSettings } = useBusinessSettings();
  const [settings, setSettings] = useState<BusinessSettings>({
    business_name: "",
    business_phone: "",
    business_email: "",
    currency_symbol: ADMIN_CURRENCY_SYMBOL,
    business_logo: "",
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
      setSettings({
        business_name: data.business_name || "",
        business_phone: data.business_phone || "",
        business_email: data.business_email || "",
        currency_symbol: data.currency_symbol || ADMIN_CURRENCY_SYMBOL,
        business_logo: data.business_logo || "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to load business settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Use toast.promise for premium save experience
    const promise = SettingsService.updateBusinessSettings(settings)
      .then(() => refreshSettings());

    await toast.promise(promise, {
      loading: "Saving business settings...",
      success: "Business profile updated successfully! 🎉",
      error: (err) => err?.message || "Failed to update settings ❌",
    });

    setSaving(false);
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
      <PageHeader
        title="Business Profile"
        subtitle="Manage your organization's primary information and preferences."
        icon={Store}
      />

      <Card className="border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8">
        <div className="space-y-8">
          
          {/* Business Name */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-start">
            <div className="md:col-span-1 space-y-1">
              <Label className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-500" />
                Business Name
              </Label>
              <p className="text-sm text-slate-500">The public name of your business as it appears to customers.</p>
            </div>
            <div className="md:col-span-2">
              <Input 
                name="business_name"
                value={settings.business_name}
                onChange={handleChange}
                placeholder="e.g. Northwind Commerce"
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
                placeholder="e.g. support@example.com"
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
                placeholder="e.g. $ or EUR"
                className="max-w-[120px] h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="w-full h-px bg-slate-100"></div>

          {/* Business Logo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-start">
            <div className="md:col-span-1 space-y-1">
              <Label className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Image className="w-4 h-4 text-pink-500" />
                Business Logo
              </Label>
              <p className="text-sm text-slate-500">Upload a logo for your store branding. Recommended format: PNG/JPG.</p>
            </div>
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-inner">
                  {settings.business_logo ? (
                    <img src={settings.business_logo} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl">🐟</span>
                  )}
                </div>
                <div>
                  <input 
                    type="file" 
                    id="logo-upload"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        const file = e.target.files[0];
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setSettings((prev) => ({ ...prev, business_logo: reader.result as string }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="flex items-center gap-3">
                    <Label 
                      htmlFor="logo-upload" 
                      className="inline-flex h-10 items-center justify-center rounded-xl bg-blue-50 px-4 text-sm font-semibold text-blue-700 hover:bg-blue-100 cursor-pointer transition-all border border-blue-100 active:scale-95 whitespace-nowrap"
                    >
                      Choose Logo File
                    </Label>
                    {settings.business_logo && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50 hover:text-red-700 h-9 rounded-xl"
                        onClick={() => setSettings((prev) => ({ ...prev, business_logo: "" }))}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Maximum size: 2MB. Recommended dimensions: square or circle.</p>
                </div>
              </div>
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
