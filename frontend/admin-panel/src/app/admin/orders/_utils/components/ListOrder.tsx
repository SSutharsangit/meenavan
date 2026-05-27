import { Eye, Edit2, Trash2, MoreHorizontal, Printer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DataTable, { Column } from "@/components/common/DataTable";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatCurrency } from "@/lib/admin-config";
import { useBusinessSettings } from "@/providers/BusinessSettingsProvider";
import { apiGetOrder } from "../api-service";
import { BillTemplatesService } from "@/app/admin/settings/templates/_utils/api-service";
import { BillTemplate } from "@/app/admin/settings/templates/_utils/default-template";
import { toast } from "react-hot-toast";

interface Props {
  data: any[]; loading: boolean; pagination: any;
  onDelete: (id: number) => void;
  onUpdateStatus?: (id: number, status?: string, payment_status?: string) => void;
  onViewDetail?: (order: any) => void;
  onEditDetail?: (order: any) => void;
  searchValue: string; onSearchChange: (val: string) => void;
  hasActiveFilters: boolean; onFilterClick: () => void;
  onPageChange: (page: number) => void;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-700 border-blue-200",
  processing: "bg-indigo-100 text-indigo-700 border-indigo-200",
  out_for_delivery: "bg-purple-100 text-purple-700 border-purple-200",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  refunded: "bg-slate-100 text-slate-700 border-slate-200",
};

const paymentColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
  failed: "bg-red-100 text-red-700 border-red-200",
  refunded: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function ListOrder({ data, loading, pagination, onDelete, onUpdateStatus, onViewDetail, onEditDetail, searchValue, onSearchChange, hasActiveFilters, onFilterClick, onPageChange }: Props) {
  const { settings } = useBusinessSettings();

  const handlePrint = async (row: any) => {
    const printPromise = (async () => {
      // 1. Fetch detailed order with items
      const res = await apiGetOrder(row.id);
      if (!res.is_success) {
        throw new Error(res.message || "Failed to load order items.");
      }
      const detailedOrder = res.result;

      // 2. Fetch templates
      let activeTemplate: BillTemplate | null = null;
      try {
        const { templates: dbTemplates, activeTemplateId } = await BillTemplatesService.getTemplates();
        if (activeTemplateId) {
          activeTemplate = dbTemplates.find(t => t.id === activeTemplateId) || null;
        }
      } catch (err) {
        console.warn("Could not load templates from settings.", err);
      }

      // 3. Compile invoice HTML
      if (activeTemplate) {
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

        let sectionsHtml = activeTemplate.json.sections.map((section: any) => {
          const rowStyle = Object.entries(section.style || {})
            .map(([k, v]) => `${k.replace(/[A-Z]/g, m => "-" + m.toLowerCase())}: ${typeof v === 'number' ? v + 'px' : v}`)
            .join('; ');

          const childrenHtml = (section.children || []).map((child: any) => {
            const childStyle = Object.entries(child.style || {})
              .map(([k, v]) => `${k.replace(/[A-Z]/g, m => "-" + m.toLowerCase())}: ${typeof v === 'number' ? v + 'px' : v}`)
              .join('; ');

            if (child.type === "items") {
              const items = detailedOrder.order_items || [];
              const keys = child.key || ["no", "name", "qty", "free_qty", "price", "discount", "total"];
              
              const rowsHtml = items.map((item: any, idx: number) => {
                const totalItem = (item.subtotal != null) ? Number(item.subtotal) : ((item.unit_price || 0) * (item.weight_kg || item.quantity || 1));
                return `
                  <tr style="font-size: 18px; border-bottom: 1px dashed #ddd; vertical-align: top;">
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
                return `<th style="text-align: ${colStyle.alignment}; width: ${colStyle.width}; font-size: 18px; font-weight: bold; border-bottom: 1.5px solid #000; padding: 4px 0;">${label}</th>`;
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
              .replace(/{{billNumber}}/gi, detailedOrder.order_number)
              .replace(/{{transactionDate}}/gi, detailedOrder.created_at ? new Date(detailedOrder.created_at).toLocaleDateString() : '—')
              .replace(/{{cashierName}}/gi, detailedOrder.delivery_person_name || "System Cashier")
              .replace(/{{time}}/gi, detailedOrder.created_at ? new Date(detailedOrder.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—')
              .replace(/{{subtotal}}/gi, `${settings.currency_symbol || "Rs"} ${Number(detailedOrder.subtotal || 0).toFixed(2)}`)
              .replace(/{{shippingFee}}/gi, `${settings.currency_symbol || "Rs"} ${Number(detailedOrder.delivery_charge || 0).toFixed(2)}`)
              .replace(/{{totalDiscount}}/gi, `${settings.currency_symbol || "Rs"} ${Number(detailedOrder.discount_amount || 0).toFixed(2)}`)
              .replace(/{{totalAmount}}/gi, `${settings.currency_symbol || "Rs"} ${Number(detailedOrder.total_amount || 0).toFixed(2)}`)
              .replace(/{{lastPaymentReceived}}/gi, `${settings.currency_symbol || "Rs"} ${Number(detailedOrder.payment_status === 'paid' ? detailedOrder.total_amount : 0).toFixed(2)}`)
              .replace(/{{lastAmountWallet}}/gi, `${settings.currency_symbol || "Rs"} 0.00`)
              .replace(/{{lastPaymentBalance}}/gi, `${settings.currency_symbol || "Rs"} ${Number(detailedOrder.payment_status === 'paid' ? 0 : detailedOrder.total_amount).toFixed(2)}`)
              .replace(/{{paymentMethod}}/gi, detailedOrder.payment_method || "—")
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

        const maxLabelWidth = activeTemplate.json.printer_config?.max_label_width || 540;
        const fontFamily = activeTemplate.printer_type === "Thermal" ? "monospace" : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        const compileHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invoice - ${detailedOrder.order_number}</title>
              <style>
                body {
                  font-family: ${fontFamily};
                  color: #000;
                  margin: 0;
                  padding: 10px;
                  width: ${maxLabelWidth}px;
                  box-sizing: border-box;
                }
                @media print {
                  body {
                    padding: 0;
                    margin: 0;
                    width: 100%;
                  }
                }
              </style>
            </head>
            <body>
              <div style="width: 100%; max-width: ${maxLabelWidth}px; margin: 0 auto;">
                ${sectionsHtml}
              </div>
            </body>
          </html>
        `;

        triggerPrintFrame(compileHtml);
      } else {
        // Fallback to our stunning full standard A4 invoice
        const currency = settings.currency_symbol || "Rs";
        const logo = settings.business_logo;

        const formatDate = (dateStr?: string) => {
          if (!dateStr) return "—";
          return new Date(dateStr).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          });
        };

        const formatOrderCurrency = (val: number | string) => {
          const num = typeof val === "string" ? parseFloat(val) : val;
          return `${currency} ${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        };

        const items = detailedOrder.order_items || [];
        const itemsRowsHtml = items.map((item: any, idx: number) => {
          const totalItem = (item.subtotal != null) ? Number(item.subtotal) : ((item.unit_price || 0) * (item.weight_kg || item.quantity || 1));
          return `
            <tr>
              <td style="padding: 12px; border-bottom: 1px solid #f1f5f9;">${idx + 1}</td>
              <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; font-weight: 600;">${item.product_name_en}</td>
              <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right;">${item.weight_kg || item.quantity} kg</td>
              <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right;">${formatOrderCurrency(item.unit_price || 0)}</td>
              <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right;">${item.discount_percentage || '0'}%</td>
              <td style="padding: 12px; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 600; color: #0f172a;">${formatOrderCurrency(totalItem)}</td>
            </tr>
          `;
        }).join('');

        const standardHtml = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invoice - ${detailedOrder.order_number}</title>
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                  color: #334155;
                  margin: 0;
                  padding: 40px;
                  font-size: 14px;
                  line-height: 1.5;
                }
                .invoice-card {
                  max-width: 800px;
                  margin: 0 auto;
                }
                .header {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                  border-bottom: 2px solid #f1f5f9;
                  padding-bottom: 24px;
                  margin-bottom: 24px;
                }
                .business-info h1 {
                  font-size: 24px;
                  font-weight: 800;
                  color: #0f172a;
                  margin: 0 0 6px 0;
                  letter-spacing: -0.025em;
                }
                .business-info p {
                  margin: 2px 0;
                  color: #64748b;
                }
                .invoice-details {
                  text-align: right;
                }
                .invoice-details h2 {
                  font-size: 20px;
                  font-weight: 800;
                  color: #2563eb;
                  margin: 0 0 6px 0;
                }
                .invoice-details p {
                  margin: 2px 0;
                  font-size: 13px;
                }
                .invoice-details span {
                  font-weight: 600;
                  color: #0f172a;
                }
                .details-grid {
                  display: grid;
                  grid-template-cols: 1fr 1fr;
                  gap: 24px;
                  margin-bottom: 30px;
                }
                .details-box {
                  background-color: #f8fafc;
                  border: 1px solid #e2e8f0;
                  border-radius: 12px;
                  padding: 16px;
                }
                .details-box h3 {
                  font-size: 12px;
                  font-weight: 700;
                  text-transform: uppercase;
                  color: #64748b;
                  margin: 0 0 10px 0;
                  letter-spacing: 0.05em;
                }
                .details-box p {
                  margin: 4px 0;
                  font-size: 13.5px;
                }
                .details-box span {
                  font-weight: 600;
                  color: #0f172a;
                }
                .items-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-bottom: 30px;
                }
                .items-table th {
                  font-size: 11px;
                  font-weight: 700;
                  text-transform: uppercase;
                  letter-spacing: 0.05em;
                  color: #64748b;
                  text-align: left;
                  border-bottom: 2px solid #e2e8f0;
                  padding: 10px 12px;
                  background-color: #f8fafc;
                }
                .items-table th.right {
                  text-align: right;
                }
                .totals-section {
                  display: flex;
                  justify-content: flex-end;
                  margin-top: 10px;
                }
                .totals-table {
                  width: 300px;
                  border-collapse: collapse;
                }
                .totals-table td {
                  padding: 8px 12px;
                  font-size: 13.5px;
                }
                .totals-table td.label {
                  color: #64748b;
                  text-align: left;
                }
                .totals-table td.value {
                  text-align: right;
                  font-weight: 600;
                  color: #334155;
                }
                .totals-table tr.total-row td {
                  border-top: 2px solid #e2e8f0;
                  padding-top: 12px;
                }
                .totals-table tr.total-row td.value {
                  font-size: 18px;
                  font-weight: 800;
                  color: #0f172a;
                }
                .badge {
                  display: inline-block;
                  font-size: 11px;
                  font-weight: 600;
                  padding: 2px 8px;
                  border-radius: 9999px;
                  text-transform: capitalize;
                }
                .badge-success { background-color: #dcfce7; color: #166534; }
                .badge-warning { background-color: #fef9c3; color: #854d0e; }
                .badge-danger { background-color: #fee2e2; color: #991b1b; }
                .badge-info { background-color: #dbeafe; color: #1e40af; }
                
                .footer {
                  margin-top: 60px;
                  text-align: center;
                  border-top: 1px solid #e2e8f0;
                  padding-top: 20px;
                  color: #94a3b8;
                  font-size: 12px;
                }
              </style>
            </head>
            <body>
              <div class="invoice-card">
                <div class="header">
                  <div class="business-info">
                    ${logo ? `<img src="${logo}" style="max-height: 50px; margin-bottom: 10px; display: block;" />` : ''}
                    <h1>${settings.business_name || 'Business Panel'}</h1>
                    ${settings.business_phone ? `<p>Phone: ${settings.business_phone}</p>` : ''}
                    ${settings.business_email ? `<p>Email: ${settings.business_email}</p>` : ''}
                  </div>
                  <div class="invoice-details">
                    <h2>INVOICE</h2>
                    <p>Invoice No: <span>${detailedOrder.order_number}</span></p>
                    <p>Date: <span>${detailedOrder.created_at ? new Date(detailedOrder.created_at).toLocaleDateString() : '—'}</span></p>
                    <p>Status: <span class="badge ${
                      detailedOrder.status === 'delivered' ? 'badge-success' : 
                      detailedOrder.status === 'cancelled' ? 'badge-danger' : 
                      detailedOrder.status === 'pending' ? 'badge-warning' : 'badge-info'
                    }">${(detailedOrder.status || 'pending').replace(/_/g, ' ')}</span></p>
                  </div>
                </div>
                
                <div class="details-grid">
                  <div class="details-box">
                    <h3>Customer Details</h3>
                    <p>Name: <span>${detailedOrder.customer_name}</span></p>
                    <p>Phone: <span>${detailedOrder.customer_phone}</span></p>
                    ${detailedOrder.customer_email ? `<p>Email: <span>${detailedOrder.customer_email}</span></p>` : ''}
                  </div>
                  <div class="details-box">
                    <h3>Delivery Details</h3>
                    ${detailedOrder.delivery_address ? `<p>Address: <span>${detailedOrder.delivery_address}</span></p>` : ''}
                    ${detailedOrder.landmark ? `<p>Landmark: <span>${detailedOrder.landmark}</span></p>` : ''}
                    ${detailedOrder.delivery_area_name ? `<p>Area: <span>${detailedOrder.delivery_area_name}</span></p>` : ''}
                    ${detailedOrder.estimated_delivery_time ? `<p>Est. Time: <span>${formatDate(detailedOrder.estimated_delivery_time)}</span></p>` : ''}
                  </div>
                </div>

                <table class="items-table">
                  <thead>
                    <tr>
                      <th style="width: 5%">#</th>
                      <th style="width: 45%">Item Description</th>
                      <th style="width: 15%; text-align: right;">Quantity</th>
                      <th style="width: 15%; text-align: right;">Unit Price</th>
                      <th style="width: 10%; text-align: right;">Discount</th>
                      <th style="width: 15%; text-align: right;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsRowsHtml}
                  </tbody>
                </table>

                <table class="items-table" style="margin-top: 20px;">
                  <thead>
                    <tr>
                      <th>Order Overview</th>
                      <th class="right">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="font-weight: 600;">Payment Method</td>
                      <td class="right capitalize">${(detailedOrder.payment_method || 'COD').replace(/_/g, ' ')}</td>
                    </tr>
                    <tr>
                      <td style="font-weight: 600;">Payment Status</td>
                      <td class="right">
                        <span class="badge ${
                          detailedOrder.payment_status === 'paid' ? 'badge-success' :
                          detailedOrder.payment_status === 'failed' ? 'badge-danger' : 'badge-warning'
                        }">${detailedOrder.payment_status || 'pending'}</span>
                      </td>
                    </tr>
                    ${detailedOrder.delivery_person_name ? `
                    <tr>
                      <td style="font-weight: 600;">Delivery Agent</td>
                      <td class="right">${detailedOrder.delivery_person_name} ${detailedOrder.delivery_person_phone ? `(${detailedOrder.delivery_person_phone})` : ''}</td>
                    </tr>` : ''}
                  </tbody>
                </table>

                <div class="totals-section">
                  <table class="totals-table">
                    ${detailedOrder.subtotal != null ? `
                    <tr>
                      <td class="label">Subtotal</td>
                      <td class="value">${formatOrderCurrency(detailedOrder.subtotal)}</td>
                    </tr>` : ''}
                    ${(detailedOrder.delivery_charge ?? 0) > 0 ? `
                    <tr>
                      <td class="label">Delivery Charge</td>
                      <td class="value">${formatOrderCurrency(detailedOrder.delivery_charge)}</td>
                    </tr>` : ''}
                    ${(detailedOrder.discount_amount ?? 0) > 0 ? `
                    <tr>
                      <td class="label">Discount</td>
                      <td class="value text-emerald-600">-${formatOrderCurrency(detailedOrder.discount_amount)}</td>
                    </tr>` : ''}
                    <tr class="total-row">
                      <td class="label" style="font-weight: 700; color: #0f172a;">Total</td>
                      <td class="value">${formatOrderCurrency(detailedOrder.total_amount || 0)}</td>
                    </tr>
                  </table>
                </div>

                <div class="footer">
                  <p>Thank you for choosing ${settings.business_name || 'us'}!</p>
                  <p>This is a computer-generated invoice and requires no signature.</p>
                </div>
              </div>
            </body>
          </html>
        `;

        triggerPrintFrame(standardHtml);
      }
    })();

    toast.promise(printPromise, {
      loading: "Preparing invoice layout and items... 📑",
      success: "Invoice sent to print queue! 🖨️",
      error: (err: any) => err.message || "Failed to prepare print view."
    });
  };

  const triggerPrintFrame = (html: string) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 500);
      }, 250);
    }
  };

  const columns: Column<any>[] = [
    { key: "order_number", label: "Order #", render: (row) => <button onClick={() => onViewDetail?.(row)} className="font-bold text-blue-700 hover:text-blue-800 hover:underline font-mono cursor-pointer text-left focus:outline-none">{row.order_number}</button> },
    { key: "customer_name", label: "Customer", render: (row) => (
      <div><div className="font-bold text-slate-900">{row.customer_name}</div><div className="text-xs text-slate-500">{row.customer_phone}</div></div>
    )},
    { key: "total_amount", label: "Total", render: (row) => <span className="font-bold text-slate-900">{formatCurrency(row.total_amount || 0)}</span> },
    { key: "status", label: "Status", render: (row) => (
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none cursor-pointer" onClick={(e) => e.stopPropagation()}>
          <Badge className={`${statusColors[row.status] || statusColors.pending} hover:opacity-80 shadow-none capitalize transition-opacity`}>{(row.status || 'pending').replace(/_/g, ' ')}</Badge>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 rounded-xl shadow-md border-slate-200 p-1">
          {Object.keys(statusColors).map(status => {
            const isActive = row.status === status || (!row.status && status === 'pending');
            const colorClass = statusColors[status].split(' ')[1]; // extracts text color
            return (
              <DropdownMenuItem 
                key={status} 
                className={`cursor-pointer flex items-center justify-between rounded-lg px-3 py-2.5 my-0.5 transition-colors ${isActive ? 'bg-slate-50 font-semibold' : 'hover:bg-slate-50'}`}
                onClick={() => onUpdateStatus && onUpdateStatus(row.id, status, undefined)}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${colorClass.replace('text', 'bg')}`} />
                  <span className="capitalize text-slate-700">{status.replace(/_/g, ' ')}</span>
                </div>
                {isActive && <div className={`w-1.5 h-1.5 rounded-full ${colorClass.replace('text', 'bg')}`} />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )},
    { key: "payment_status", label: "Payment", render: (row) => (
      <DropdownMenu>
        <DropdownMenuTrigger className="focus:outline-none cursor-pointer" onClick={(e) => e.stopPropagation()}>
          <Badge className={`${paymentColors[row.payment_status] || paymentColors.pending} hover:opacity-80 shadow-none capitalize transition-opacity`}>{row.payment_status || 'pending'}</Badge>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48 rounded-xl shadow-md border-slate-200 p-1">
          {Object.keys(paymentColors).map(status => {
            const isActive = row.payment_status === status || (!row.payment_status && status === 'pending');
            const colorClass = paymentColors[status].split(' ')[1]; // extracts text color
            return (
              <DropdownMenuItem 
                key={status} 
                className={`cursor-pointer flex items-center justify-between rounded-lg px-3 py-2.5 my-0.5 transition-colors ${isActive ? 'bg-slate-50 font-semibold' : 'hover:bg-slate-50'}`}
                onClick={() => onUpdateStatus && onUpdateStatus(row.id, undefined, status)}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${colorClass.replace('text', 'bg')}`} />
                  <span className="capitalize text-slate-700">{status.replace(/_/g, ' ')}</span>
                </div>
                {isActive && <div className={`w-1.5 h-1.5 rounded-full ${colorClass.replace('text', 'bg')}`} />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )},
    { key: "created_at", label: "Date", render: (row) => <span className="text-slate-500 text-sm">{row.created_at ? new Date(row.created_at).toLocaleDateString() : "—"}</span> },
    {
      key: "actions", label: "Actions", align: "right" as const,
      render: (row) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 transition-colors focus:outline-none" onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-md border-slate-200">
              <DropdownMenuItem className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onViewDetail?.(row); }}><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={(e) => { e.stopPropagation(); onEditDetail?.(row); }}><Edit2 className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer" onClick={(e) => { e.stopPropagation(); handlePrint(row); }}><Printer className="mr-2 h-4 w-4" /> Print</DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700" onClick={(e) => { e.stopPropagation(); onDelete(row.id); }}><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <DataTable columns={columns} data={data} loading={loading} total={pagination?.total_records || 0} currentPage={pagination?.current_page || 1} perPage={pagination?.per_page || 10} onPageChange={onPageChange} searchPlaceholder="Search by order # or customer..." searchValue={searchValue} onSearchChange={onSearchChange} hasActiveFilters={hasActiveFilters} onFilterClick={onFilterClick} emptyMessage="No orders found. Orders will appear here when customers place them." onRowClick={(row) => onViewDetail?.(row)} />
  );
}
