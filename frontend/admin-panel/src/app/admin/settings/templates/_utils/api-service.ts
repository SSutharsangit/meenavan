import { adminApiUrl, jsonHeaders } from "@/lib/admin-api";
import { BillTemplate } from "./default-template";

export const BillTemplatesService = {
  getTemplates: async (): Promise<{ templates: BillTemplate[]; activeTemplateId: number | null }> => {
    const res = await fetch(adminApiUrl("settings?group=templates"));
    const data = await res.json();
    
    if (data.is_success) {
      let templates: BillTemplate[] = [];
      let activeTemplateId: number | null = null;
      
      const templatesSetting = data.result.find((s: any) => s.key_name === "bill_templates");
      const activeSetting = data.result.find((s: any) => s.key_name === "active_bill_template_id");
      
      if (templatesSetting) {
        try {
          templates = typeof templatesSetting.value === "string" 
            ? JSON.parse(templatesSetting.value) 
            : templatesSetting.value;
        } catch (e) {
          console.error("Error parsing bill templates:", e);
        }
      }
      
      if (activeSetting) {
        activeTemplateId = templatesSetting ? Number(activeSetting.value) : null;
      }
      
      return { templates, activeTemplateId };
    }
    
    throw new Error(data.message || 'Failed to fetch templates');
  },

  saveTemplates: async (templates: BillTemplate[], activeTemplateId: number | null): Promise<void> => {
    // Fetch current settings to check if they exist or get their IDs
    const getRes = await fetch(adminApiUrl("settings?group=templates"));
    const getData = await getRes.json();
    
    if (!getData.is_success) {
      throw new Error(getData.message || 'Failed to check templates state');
    }
    
    const templatesSetting = getData.result.find((s: any) => s.key_name === "bill_templates");
    const activeSetting = getData.result.find((s: any) => s.key_name === "active_bill_template_id");
    
    const templatesValue = JSON.stringify(templates);
    const activeValue = activeTemplateId?.toString() || "";
    
    // Save/Update templates
    if (templatesSetting) {
      const updateRes = await fetch(adminApiUrl(`settings/${templatesSetting.id}`), {
        method: 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify({ value: templatesValue }),
      });
      const updateData = await updateRes.json();
      if (!updateData.is_success) throw new Error(updateData.message || 'Failed to update templates');
    } else {
      const createRes = await fetch(adminApiUrl("settings"), {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({
          key_name: "bill_templates",
          value: templatesValue,
          group_name: "templates",
          is_public: true
        }),
      });
      const createData = await createRes.json();
      if (!createData.is_success) throw new Error(createData.message || 'Failed to save templates');
    }
    
    // Save/Update active setting
    if (activeSetting) {
      const updateRes = await fetch(adminApiUrl(`settings/${activeSetting.id}`), {
        method: 'PUT',
        headers: jsonHeaders,
        body: JSON.stringify({ value: activeValue }),
      });
      const updateData = await updateRes.json();
      if (!updateData.is_success) throw new Error(updateData.message || 'Failed to update active template selection');
    } else {
      const createRes = await fetch(adminApiUrl("settings"), {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({
          key_name: "active_bill_template_id",
          value: activeValue,
          group_name: "templates",
          is_public: true
        }),
      });
      const createData = await createRes.json();
      if (!createData.is_success) throw new Error(createData.message || 'Failed to save active template selection');
    }
  }
};
