"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Printer, 
  Plus, 
  Save, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  RefreshCw, 
  Loader2, 
  Settings2,
  FileCode,
  AlertTriangle,
  Eye
} from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BillTemplatesService } from "./_utils/api-service";
import { DEFAULT_TEMPLATES, BillTemplate } from "./_utils/default-template";
import { useBusinessSettings } from "@/providers/BusinessSettingsProvider";
import { toast } from "react-hot-toast";

// Live interactive Mock Order for Receipt Previews
const MOCK_ORDER = {
  order_number: "ORD-20260527-0042",
  created_at: new Date().toISOString(),
  delivery_person_name: "Rahul Sharma",
  delivery_person_phone: "+91 98765 43210",
  customer_name: "Sutharsan G.",
  customer_phone: "+91 99944 88811",
  customer_email: "suthar@meenavan.com",
  delivery_address: "123 Ocean Drive, Seaside Town",
  landmark: "Near Lighthouse",
  delivery_area_name: "Zone A",
  subtotal: 2450.00,
  delivery_charge: 150.00,
  discount_amount: 200.00,
  total_amount: 2400.00,
  payment_method: "online",
  payment_status: "paid",
  status: "confirmed",
  order_items: [
    { product_name_en: "Yellow Fin Tuna (Clean Cut)", weight_kg: 1.5, quantity: 1, unit_price: 1200, discount_percentage: 10, subtotal: 1620.00, free_qty: 0 },
    { product_name_en: "Mud Crab (Medium Size)", weight_kg: 1.0, quantity: 1, unit_price: 900, discount_percentage: 0, subtotal: 900.00, free_qty: 1 },
    { product_name_en: "Anchovy (Free Pack)", weight_kg: 0.5, quantity: 1, unit_price: 130, discount_percentage: 100, subtotal: 0.00, free_qty: 1 }
  ]
};

export default function BillTemplatesPage() {
  const { settings } = useBusinessSettings();
  const [templates, setTemplates] = useState<BillTemplate[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form sheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<BillTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    printer_type: "Thermal" as "Thermal" | "Standard",
    jsonString: ""
  });

  // Preview sheet state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<BillTemplate | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await BillTemplatesService.getTemplates();
      
      if (data.templates.length === 0) {
        setTemplates(DEFAULT_TEMPLATES);
        setActiveId(DEFAULT_TEMPLATES[0].id);
        await BillTemplatesService.saveTemplates(DEFAULT_TEMPLATES, DEFAULT_TEMPLATES[0].id);
      } else {
        setTemplates(data.templates);
        setActiveId(data.activeTemplateId);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load templates.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetActive = async (id: number) => {
    try {
      setSaving(true);
      await BillTemplatesService.saveTemplates(templates, id);
      setActiveId(id);
      toast.success("Main printing template updated successfully! 🧾");
    } catch (e: any) {
      toast.error(e.message || "Failed to set active template.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (!confirm("Are you sure you want to reset all templates to system defaults? Custom templates will be deleted.")) return;
    
    try {
      setSaving(true);
      await BillTemplatesService.saveTemplates(DEFAULT_TEMPLATES, DEFAULT_TEMPLATES[0].id);
      setTemplates(DEFAULT_TEMPLATES);
      setActiveId(DEFAULT_TEMPLATES[0].id);
      toast.success("Templates reset to system defaults. 🔄");
    } catch (e: any) {
      toast.error(e.message || "Failed to reset templates.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingTemplate(null);
    setFormData({
      name: "",
      printer_type: "Thermal",
      jsonString: JSON.stringify(DEFAULT_TEMPLATES[0].json, null, 2)
    });
    setSheetOpen(true);
  };

  const handleOpenEdit = (template: BillTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      printer_type: template.printer_type,
      jsonString: JSON.stringify(template.json, null, 2)
    });
    setSheetOpen(true);
  };

  const handleOpenPreview = (template: BillTemplate) => {
    setPreviewTemplate(template);
    setPreviewOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this bill layout template?")) return;
    
    try {
      setSaving(true);
      const remaining = templates.filter(t => t.id !== id);
      let newActive = activeId;
      
      if (activeId === id) {
        newActive = remaining.length > 0 ? remaining[0].id : null;
      }
      
      await BillTemplatesService.saveTemplates(remaining, newActive);
      setTemplates(remaining);
      setActiveId(newActive);
      toast.success("Template deleted successfully.");
    } catch (e: any) {
      toast.error(e.message || "Failed to delete template.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveForm = async () => {
    if (!formData.name.trim()) {
      toast.error("Template name is required.");
      return;
    }

    let parsedJson: any;
    try {
      parsedJson = JSON.parse(formData.jsonString);
    } catch (e) {
      toast.error("Invalid JSON format. Please verify the config syntax.");
      return;
    }

    try {
      setSaving(true);
      let updatedTemplates = [...templates];
      let newActiveId = activeId;

      if (editingTemplate) {
        updatedTemplates = templates.map(t => 
          t.id === editingTemplate.id 
            ? { ...t, name: formData.name, printer_type: formData.printer_type, json: parsedJson }
            : t
        );
      } else {
        const newId = templates.length > 0 ? Math.max(...templates.map(t => t.id)) + 1 : 1;
        const newTemplate: BillTemplate = {
          id: newId,
          name: formData.name,
          printer_type: formData.printer_type,
          json: parsedJson
        };
        updatedTemplates.push(newTemplate);
        if (!newActiveId) {
          newActiveId = newId;
        }
      }

      await BillTemplatesService.saveTemplates(updatedTemplates, newActiveId);
      setTemplates(updatedTemplates);
      setActiveId(newActiveId);
      setSheetOpen(false);
      toast.success(editingTemplate ? "Template layout updated! 📑" : "New template created! 📑");
    } catch (e: any) {
      toast.error(e.message || "Failed to save template.");
    } finally {
      setSaving(false);
    }
  };

  // Dynamic template rendering compiler for visual print preview
  const compilePreview = (template: BillTemplate) => {
    const currency = settings.currency_symbol || "Rs";
    const order = MOCK_ORDER;

    const formatOrderCurrency = (val: number | string) => {
      const num = typeof val === "string" ? parseFloat(val) : val;
      return `${currency} ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    try {
      const colWeights: Record<string, number> = {
        no: 1.5,
        name: 6,
        qty: 2.5,
        free_qty: 2,
        price: 2.5,
        discount: 2,
        total: 3.5,
      };

      const colAlignments: Record<string, string> = {
        no: "left",
        name: "left",
        qty: "right",
        free_qty: "right",
        price: "right",
        discount: "right",
        total: "right",
      };

      const getColStyle = (key: string, allKeys: string[]) => {
        const activeWeights = allKeys.map(k => colWeights[k] || 2);
        const totalWeight = activeWeights.reduce((a, b) => a + b, 0);
        const weight = colWeights[key] || 2;
        const pct = ((weight / totalWeight) * 100).toFixed(1) + "%";
        return {
          width: pct,
          alignment: colAlignments[key] || "left"
        };
      };

      let sectionsHtml = template.json.sections.map((section: any) => {
        const rowStyle = Object.entries(section.style || {})
          .map(([k, v]) => `${k.replace(/[A-Z]/g, m => "-" + m.toLowerCase())}: ${typeof v === 'number' ? v + 'px' : v}`)
          .join('; ');

        const childrenHtml = (section.children || []).map((child: any) => {
          const childStyle = Object.entries(child.style || {})
            .map(([k, v]) => `${k.replace(/[A-Z]/g, m => "-" + m.toLowerCase())}: ${typeof v === 'number' ? v + 'px' : v}`)
            .join('; ');

          if (child.type === "items") {
            const items = order.order_items || [];
            const keys = child.key || ["no", "name", "qty", "free_qty", "price", "discount", "total"];
            
            const rowsHtml = items.map((item: any, idx: number) => {
              const totalItem = (item.subtotal != null) ? Number(item.subtotal) : (Number(item.unit_price || 0) * (item.weight_kg || item.quantity || 1));
              return `
                <tr style="font-size: 15px; border-bottom: 1px dashed #ccc; vertical-align: top;">
                  ${keys.map((key: string) => {
                    const colStyle = getColStyle(key, keys);
                    let cellVal = "";
                    if (key === "no") cellVal = String(idx + 1);
                    else if (key === "name") cellVal = item.product_name_en;
                    else if (key === "qty") cellVal = `${item.weight_kg || item.quantity} kg`;
                    else if (key === "free_qty") cellVal = Number(item.free_qty) > 0 ? String(item.free_qty) : "—";
                    else if (key === "price") cellVal = Number(item.unit_price || 0).toFixed(2);
                    else if (key === "discount") cellVal = Number(item.discount_percentage) > 0 ? `${item.discount_percentage}%` : "—";
                    else if (key === "total") cellVal = Number(totalItem).toFixed(2);

                    return `<td style="padding: 6px 0; vertical-align: top; text-align: ${colStyle.alignment}; width: ${colStyle.width}; ${key === 'name' ? 'font-weight: bold; white-space: normal; word-break: break-word;' : 'white-space: nowrap;'} ${key === 'total' ? 'font-weight: bold;' : ''}">${cellVal}</td>`;
                  }).join('')}
                </tr>
              `;
            }).join('');

            const headersHtml = keys.map((key: string) => {
              let label = key.toUpperCase();
              if (key === "no") label = "No";
              if (key === "name") label = "Item";
              if (key === "qty") label = "Qty";
              if (key === "free_qty") label = "Free";
              if (key === "price") label = "Price";
              if (key === "discount") label = "Disc";
              if (key === "total") label = "Total";
              
              const colStyle = getColStyle(key, keys);
              return `<th style="text-align: ${colStyle.alignment}; width: ${colStyle.width}; font-size: 15px; font-weight: bold; border-bottom: 1.5px solid #000; padding: 4px 0;">${label}</th>`;
            }).join('');

            return `
              <table style="width: 100%; border-collapse: collapse; margin: 8px 0; font-family: monospace;">
                <thead>
                  <tr>
                    ${headersHtml}
                  </tr>
                </thead>
                <tbody>
                  ${rowsHtml}
                </tbody>
              </table>
            `;
          }

          let text = child.placeholder || "";
          text = text
            .replace(/{{businessLogo}}/gi, settings.business_logo ? `<img src="${settings.business_logo}" style="max-height: 50px; max-width: 150px; object-fit: contain; display: block; margin: 0 auto 5px auto;" />` : "")
            .replace(/{{shopName}}/gi, settings.business_name || "Business Panel")
            .replace(/{{billNumber}}/gi, order.order_number)
            .replace(/{{transactionDate}}/gi, order.created_at ? new Date(order.created_at).toLocaleDateString() : '—')
            .replace(/{{cashierName}}/gi, order.delivery_person_name || "System Cashier")
            .replace(/{{time}}/gi, order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—')
            .replace(/{{subtotal}}/gi, formatOrderCurrency(order.subtotal))
            .replace(/{{shippingFee}}/gi, formatOrderCurrency(order.delivery_charge))
            .replace(/{{totalDiscount}}/gi, formatOrderCurrency(order.discount_amount))
            .replace(/{{totalAmount}}/gi, formatOrderCurrency(order.total_amount))
            .replace(/{{lastPaymentReceived}}/gi, formatOrderCurrency(order.total_amount))
            .replace(/{{lastAmountWallet}}/gi, `${currency} 0.00`)
            .replace(/{{lastPaymentBalance}}/gi, `${currency} 0.00`)
            .replace(/{{paymentMethod}}/gi, order.payment_method || "online")
            .replace(/{{brandName}}/gi, settings.business_name || "Meenavan");

          return `<div style="${childStyle}">${text}</div>`;
        }).join('');

        const hasDisplay = section.style && (section.style.display || section.style.flexDirection || section.style["flex-direction"]);
        const defaultFlex = hasDisplay ? "" : "display: flex; flex-direction: row; ";
        return `<div style="${defaultFlex}${rowStyle}">${childrenHtml}</div>`;
      }).join('');

      // Smart dynamic logo fallback check: if business logo exists but was NOT placed or replaced anywhere in the sections, prepend it to the top!
      if (settings.business_logo && !sectionsHtml.includes(settings.business_logo)) {
        sectionsHtml = `
          <div style="text-align: center; margin-bottom: 15px; width: 100%;">
            <img src="${settings.business_logo}" style="max-height: 50px; max-width: 150px; object-fit: contain; display: block; margin: 0 auto;" />
          </div>
        ` + sectionsHtml;
      }

      return sectionsHtml;
    } catch (err: any) {
      return `<div class="p-4 text-red-600 font-mono text-sm border-red-200 border rounded bg-red-50">Error rendering preview: ${err.message}</div>`;
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
    <div className="space-y-6 max-w-6xl">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Bill Templates</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage and configure thermal receipt layouts or standard invoices.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={handleResetToDefaults}
            disabled={saving}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 h-10 px-4"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Defaults
          </Button>
          <Button 
            onClick={handleOpenAdd}
            disabled={saving}
            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-10 px-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Layout
          </Button>
        </div>
      </div>

      {/* Templates List */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => {
          const isActive = template.id === activeId;

          return (
            <Card 
              key={template.id} 
              className={`border rounded-2xl overflow-hidden hover:shadow-md transition-shadow relative flex flex-col justify-between ${
                isActive ? "border-blue-500 ring-1 ring-blue-500/30" : "border-slate-200"
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-500" />
              )}
              
              <CardContent className="p-6 flex flex-col justify-between flex-1 min-h-[190px]">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 shadow-none font-semibold rounded-lg px-2.5 py-1 flex items-center gap-1.5">
                      <Printer className="w-3.5 h-3.5" />
                      {template.printer_type}
                    </Badge>

                    {isActive ? (
                      <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-50 shadow-none font-bold rounded-lg px-2.5 py-1 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 fill-emerald-600 text-white" />
                        Main Active
                      </Badge>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400">ID: {template.id}</span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-slate-800 line-clamp-1">{template.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Contains {template.json.sections?.length || 0} formatting blocks, calibrated for max width of {template.json.printer_config?.max_label_width || 540}px.
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-100">
                  {isActive ? (
                    <Button 
                      onClick={() => handleOpenPreview(template)}
                      variant="outline"
                      className="flex-1 rounded-xl border-emerald-200 text-emerald-700 bg-emerald-50/50 hover:bg-emerald-100/50 font-bold h-9 text-xs flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview active
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleSetActive(template.id)}
                      disabled={saving}
                      variant="outline" 
                      className="flex-1 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 h-9 text-xs font-semibold"
                    >
                      {saving ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : null}
                      Use Template
                    </Button>
                  )}
                  
                  {!isActive && (
                    <Button 
                      onClick={() => handleOpenPreview(template)}
                      title="Quick Preview"
                      size="icon" 
                      variant="outline" 
                      className="rounded-xl border-slate-200 hover:bg-slate-50 w-9 h-9 text-slate-500"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                  
                  <Button 
                    onClick={() => handleOpenEdit(template)}
                    disabled={saving}
                    size="icon" 
                    variant="outline" 
                    title="Edit layout schema"
                    className="rounded-xl border-slate-200 hover:bg-slate-50 w-9 h-9 text-slate-500"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  
                  {!isActive && (
                    <Button 
                      onClick={() => handleDelete(template.id)}
                      disabled={saving}
                      size="icon" 
                      variant="outline" 
                      title="Delete template"
                      className="rounded-xl border-slate-200 hover:bg-red-50 text-slate-400 hover:text-red-600 w-9 h-9"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {templates.length === 0 && (
          <div className="col-span-full border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center text-slate-500">
            <Settings2 className="w-10 h-10 mx-auto text-slate-300 mb-4" />
            <h4 className="font-bold text-slate-800">No print layouts configured</h4>
            <p className="text-xs text-slate-500 mt-1">Add a custom print layout to configure thermal invoice designs.</p>
          </div>
        )}
      </div>

      {/* Dynamic Visual Print Preview Sheet */}
      <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
        <SheetContent className="sm:max-w-2xl w-full bg-slate-100 flex flex-col h-full p-0">
          <div className="overflow-y-auto flex-1 p-6">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-500" />
                Live Print Preview
              </SheetTitle>
              <SheetDescription className="text-slate-500">
                Visualizing layout <strong className="text-slate-800">"{previewTemplate?.name}"</strong> calibrated with mock order transactions.
              </SheetDescription>
            </SheetHeader>

            {previewTemplate && (
              <div className="flex justify-center items-start py-6">
                {previewTemplate.printer_type === "Thermal" ? (
                  /* Virtual Monospace Receipt paper roll */
                  <div 
                    className="bg-white border border-slate-200 shadow-xl rounded p-6 leading-relaxed relative"
                    style={{ 
                      width: `${previewTemplate.json.printer_config?.max_label_width || 440}px`,
                      fontFamily: "monospace",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
                      borderTop: "8px dashed #475569",
                      borderBottom: "8px dashed #475569"
                    }}
                  >
                    <div 
                      className="receipt-content"
                      dangerouslySetInnerHTML={{ __html: compilePreview(previewTemplate) }}
                    />
                  </div>
                ) : (
                  /* Virtual Standard A4/A5 sheet mock paper */
                  <div 
                    className="bg-white border border-slate-200 shadow-xl rounded-xl p-10 leading-normal"
                    style={{ 
                      width: "100%",
                      maxWidth: "640px",
                      fontFamily: "sans-serif",
                      minHeight: "750px",
                      boxShadow: "0 20px 40px rgba(0,0,0,0.08)"
                    }}
                  >
                    <div 
                      className="invoice-content"
                      dangerouslySetInnerHTML={{ __html: compilePreview(previewTemplate) }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-slate-200 bg-white flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => setPreviewOpen(false)}
              className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 h-11 px-6 text-sm"
            >
              Close Preview
            </Button>
            {previewTemplate && activeId !== previewTemplate.id && (
              <Button 
                onClick={() => {
                  handleSetActive(previewTemplate.id);
                  setPreviewOpen(false);
                }}
                disabled={saving}
                className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-11 px-6 text-sm font-semibold"
              >
                Set as Active Layout
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Editor Drawer Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-2xl w-full bg-white border-slate-200 flex flex-col h-full p-0">
          <div className="overflow-y-auto flex-1 p-6">
            <SheetHeader className="mb-6">
              <SheetTitle className="text-xl font-bold text-slate-900">
                {editingTemplate ? "Modify Layout Schema" : "Define New Bill Layout"}
              </SheetTitle>
              <SheetDescription className="text-slate-500">
                Define dynamic POS layout components and map them to order details.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold text-sm">Template Name</Label>
                <Input 
                  placeholder="e.g. Sales Receipt (Thermal)"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="rounded-xl border-slate-200"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-700 font-semibold text-sm">Printer Category</Label>
                <Select 
                  value={formData.printer_type} 
                  onValueChange={(val: any) => setFormData({...formData, printer_type: val})}
                >
                  <SelectTrigger className="rounded-xl border-slate-200 bg-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-md">
                    <SelectItem value="Thermal">Thermal Receipt (58mm/80mm)</SelectItem>
                    <SelectItem value="Standard">Standard Invoice (A4 / A5 Layout)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 flex-1 flex flex-col">
                <div className="flex justify-between items-center">
                  <Label className="text-slate-700 font-semibold text-sm flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-blue-500" />
                    Layout Schema (JSON)
                  </Label>
                  <span className="text-[10px] text-slate-400 font-mono">Format validated on save</span>
                </div>
                
                <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 mt-1">
                  <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/30" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/30" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/30" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">bill_layout.json</span>
                  </div>
                  <Textarea 
                    rows={18}
                    value={formData.jsonString}
                    onChange={(e) => setFormData({...formData, jsonString: e.target.value})}
                    placeholder="Enter configuration JSON"
                    className="font-mono text-xs text-slate-100 bg-transparent border-0 ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-none w-full p-4 resize-none leading-relaxed"
                  />
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800">
                <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-bold">Placeholder Variables Tip:</span>
                  <p className="text-amber-700 font-medium">
                    You can map database details inside text headers/footers using double curly brackets: 
                    <code className="bg-amber-100/70 px-1 py-0.5 rounded mx-1 font-semibold">{"{{shopName}}"}</code>, 
                    <code className="bg-amber-100/70 px-1 py-0.5 rounded mx-1 font-semibold">{"{{billNumber}}"}</code>, 
                    <code className="bg-amber-100/70 px-1 py-0.5 rounded mx-1 font-semibold">{"{{items}}"}</code>,
                    <code className="bg-amber-100/70 px-1 py-0.5 rounded mx-1 font-semibold">{"{{totalAmount}}"}</code> etc.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-white">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md h-12" 
              onClick={handleSaveForm}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
              {editingTemplate ? "Apply Template Changes" : "Save and Install Template"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
