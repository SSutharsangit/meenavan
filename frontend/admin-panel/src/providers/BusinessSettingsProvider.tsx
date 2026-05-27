"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { SettingsService, BusinessSettings } from "@/app/admin/settings/business/_utils/api-service";
import { setAdminCurrencySymbol } from "@/lib/admin-config";

interface BusinessSettingsContextType {
  settings: BusinessSettings & { business_logo?: string };
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const BusinessSettingsContext = createContext<BusinessSettingsContextType | undefined>(undefined);

export function BusinessSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<BusinessSettings & { business_logo?: string }>({
    business_name: "",
    business_phone: "",
    business_email: "",
    currency_symbol: "Rs",
    business_logo: "",
  });
  const [loading, setLoading] = useState(true);

  const refreshSettings = async () => {
    try {
      const data = await SettingsService.getBusinessSettings();
      let logoVal = "";
      if (data) {
        // Apply the fetched currency symbol globally to formatting utilities
        setAdminCurrencySymbol(data.currency_symbol || "Rs");
        
        // SettingsService.getBusinessSettings might not parse logo if not in static type, so we fetch group settings
        const fetchRaw = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api"}/admin/settings?group=business`
        );
        const json = await fetchRaw.json();
        if (json.is_success && Array.isArray(json.result)) {
          const logoSetting = json.result.find((s: any) => s.key_name === "business_logo");
          if (logoSetting) {
            logoVal = logoSetting.value || "";
          }
        }

        setSettings({
          business_name: data.business_name || "",
          business_phone: data.business_phone || "",
          business_email: data.business_email || "",
          currency_symbol: data.currency_symbol || "Rs",
          business_logo: logoVal,
        });
      }
    } catch (error) {
      console.error("Failed to load business settings in provider:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshSettings();
  }, []);

  return (
    <BusinessSettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </BusinessSettingsContext.Provider>
  );
}

export function useBusinessSettings() {
  const context = useContext(BusinessSettingsContext);
  if (context === undefined) {
    throw new Error("useBusinessSettings must be used within a BusinessSettingsProvider");
  }
  return context;
}
