import { adminApiUrl, jsonHeaders } from "@/lib/admin-api";
import { ADMIN_CURRENCY_SYMBOL } from "@/lib/admin-config";

export interface Setting {
  id: number;
  key_name: string;
  value: string | number;
  type: string;
  group_name: string;
}

export interface BusinessSettings {
  business_name: string;
  business_phone: string;
  business_email: string;
  currency_symbol: string;
  business_logo?: string;
}

export const SettingsService = {
  getBusinessSettings: async (): Promise<BusinessSettings> => {
    const res = await fetch(adminApiUrl("settings?group=business"));
    const data = await res.json();
    
    if (data.is_success) {
      // Map array of settings to key-value object
      const settingsObj: Partial<BusinessSettings> = {};
      data.result.forEach((setting: Setting) => {
        // @ts-ignore
        settingsObj[setting.key_name] = setting.value;
      });
      
      // Default values if missing
      return {
        business_name: settingsObj.business_name || '',
        business_phone: settingsObj.business_phone || '',
        business_email: settingsObj.business_email || '',
        currency_symbol: settingsObj.currency_symbol || ADMIN_CURRENCY_SYMBOL,
        business_logo: settingsObj.business_logo || '',
      } as BusinessSettings;
    }
    
    throw new Error(data.message || 'Failed to fetch settings');
  },

  updateBusinessSettings: async (settings: Partial<BusinessSettings>): Promise<void> => {
    const res = await fetch(adminApiUrl("settings/bulk-update"), {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ settings }),
    });
    
    const data = await res.json();
    if (!data.is_success) {
      throw new Error(data.message || 'Failed to update settings');
    }
  },

  getWhatsAppSettings: async (): Promise<{ whatsapp_number: string }> => {
    const res = await fetch(adminApiUrl("settings?group=whatsapp"));
    const data = await res.json();
    
    if (data.is_success) {
      const settingsObj: any = {};
      data.result.forEach((setting: Setting) => {
        settingsObj[setting.key_name] = setting.value;
      });
      
      return {
        whatsapp_number: settingsObj.whatsapp_number || '',
      };
    }
    
    throw new Error(data.message || 'Failed to fetch WhatsApp settings');
  },

  updateWhatsAppSettings: async (settings: { whatsapp_number: string }): Promise<void> => {
    const res = await fetch(adminApiUrl("settings/bulk-update"), {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ settings }),
    });
    
    const data = await res.json();
    if (!data.is_success) {
      throw new Error(data.message || 'Failed to update settings');
    }
  }
};
