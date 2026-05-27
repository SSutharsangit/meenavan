"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save, MessageCircle, Loader2 } from "lucide-react";
import { SettingsService } from "../business/_utils/api-service";
import { toast } from "react-hot-toast";
import PageHeader from "@/components/common/PageHeader";

export default function WhatsAppSettingsPage() {
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await SettingsService.getWhatsAppSettings();
      setWhatsappNumber(data.whatsapp_number);
    } catch (error: any) {
      toast.error(error.message || "Failed to load WhatsApp settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const promise = SettingsService.updateWhatsAppSettings({ whatsapp_number: whatsappNumber });

    await toast.promise(promise, {
      loading: "Updating WhatsApp integration...",
      success: "WhatsApp settings updated successfully! 💬",
      error: (error: any) => error?.message || "Failed to update settings ❌",
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
        title="Messaging Integration"
        subtitle="Configure your primary messaging number for customer communication workflows."
        icon={MessageCircle}
      />

      <Card className="border-slate-200 shadow-sm rounded-2xl p-6 sm:p-8">
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 items-start">
            <div className="md:col-span-1 space-y-1">
              <Label className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-500" />
                Messaging Number
              </Label>
              <p className="text-sm text-slate-500">Include your country code without any + or spaces (e.g., 94712341017).</p>
            </div>
            <div className="md:col-span-2">
              <Input 
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="e.g. 94712341017"
                className="max-w-md h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
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
                Save Settings
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
