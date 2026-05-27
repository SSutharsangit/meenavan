"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { 
  Calculator, 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Coins, 
  CreditCard, 
  Truck, 
  Printer, 
  Loader2, 
  RefreshCw, 
  UtensilsCrossed, 
  Sparkles,
  ClipboardList,
  Maximize2,
  Minimize2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBusinessSettings } from "@/providers/BusinessSettingsProvider";
import { apiGetAllProducts, apiGetCategories } from "@/app/admin/products/_utils/api-service";
import { apiGetAllCustomers } from "@/app/admin/customers/_utils/api-service";
import { apiCreateOrder } from "@/app/admin/orders/_utils/api-service";
import { BillTemplatesService } from "@/app/admin/settings/templates/_utils/api-service";
import { BillTemplate } from "@/app/admin/settings/templates/_utils/default-template";

const CUTTING_PREFERENCES = [
  { id: 1, name_en: "Whole", name_ta: "முழுமையாக", code: "whole" },
  { id: 2, name_en: "Curry Cut", name_ta: "குழம்பு வெட்டு", code: "curry_cut" },
  { id: 3, name_en: "Fry Cut", name_ta: "பொரியல் வெட்டு", code: "fry_cut" },
  { id: 4, name_en: "Cleaned", name_ta: "சுத்தம் செய்யப்பட்ட", code: "cleaned" },
  { id: 5, name_en: "Skin Removed", name_ta: "தோல் நீக்கப்பட்ட", code: "skin_removed" },
];

export default function PosPage() {
  const { settings } = useBusinessSettings();
  const currency = settings.currency_symbol || "Rs";

  // Full screen toggle states
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        void elem.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        void document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  };

  // Sync fullscreen state on Escape key or native browser change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Dynamically override admin max-width & padding rules when POS is mounted
  useEffect(() => {
    const style = document.createElement("style");
    style.id = "pos-layout-override";
    style.innerHTML = `
      main .max-w-7xl {
        max-width: 100% !important;
        width: 100% !important;
        padding-left: 0 !important;
        padding-right: 0 !important;
      }
      main {
        padding: 0 !important;
        height: 100vh !important;
        overflow: hidden !important;
      }
      .flex-col > header.flex.h-16 {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById("pos-layout-override");
      if (el) el.remove();
    };
  }, []);

  // Split pane resizable states
  const [cartWidth, setCartWidth] = useState(40); // percentage (e.g. 40%)
  const [activeTab, setActiveTab] = useState<"catalog" | "cart">("catalog");
  const [isMounted, setIsMounted] = useState(false);
  const isDragging = useRef(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.addEventListener("mousemove", resizePane);
    document.addEventListener("mouseup", stopResize);
  };

  const resizePane = (e: MouseEvent) => {
    if (!isDragging.current) return;
    const newCartPercent = ((window.innerWidth - e.clientX) / window.innerWidth) * 100;
    // Bounds check: keep cart width between 25% and 65% for proper usability
    if (newCartPercent > 25 && newCartPercent < 65) {
      setCartWidth(newCartPercent);
    }
  };

  const stopResize = () => {
    isDragging.current = false;
    document.removeEventListener("mousemove", resizePane);
    document.removeEventListener("mouseup", stopResize);
  };

  // Common Confirmation Modal state
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionLabel: string;
    variant: "danger" | "warning" | "info";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    actionLabel: "Confirm",
    variant: "warning",
    onConfirm: () => {},
  });

  const triggerConfirmation = (options: {
    title: string;
    message: string;
    actionLabel?: string;
    variant?: "danger" | "warning" | "info";
    onConfirm: () => void;
  }) => {
    setConfirmState({
      isOpen: true,
      title: options.title,
      message: options.message,
      actionLabel: options.actionLabel || "Confirm",
      variant: options.variant || "warning",
      onConfirm: () => {
        options.onConfirm();
        setConfirmState((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Data states
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Cart states
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [deliveryCharge, setDeliveryCharge] = useState<string>("0");
  const [discountAmount, setDiscountAmount] = useState<string>("0");

  // Customer states
  const [customerForm, setCustomerForm] = useState({
    id: null as number | null,
    deliveryAreaId: null as number | null,
    name: "",
    phone: "",
    email: "",
    address: "",
    landmark: "",
    deliveryNotes: "",
    estimatedDeliveryTime: "",
  });

  // Autocomplete states
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [customerSuggestionsLoading, setCustomerSuggestionsLoading] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [activeSearchField, setActiveSearchField] = useState<"name" | "phone" | null>(null);

  // Billing states
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [paymentStatus, setPaymentStatus] = useState("paid");

  // Load products & categories
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        apiGetAllProducts(1, { per_page: -1 } as any),
        apiGetCategories()
      ]);

      if (productsRes.is_success && productsRes.result) {
        const prodList = Array.isArray(productsRes.result) 
          ? productsRes.result 
          : (productsRes.result.data || []);
        setProducts(prodList);
      }
      if (categoriesRes.is_success && categoriesRes.result) {
        const catList = Array.isArray(categoriesRes.result)
          ? categoriesRes.result
          : (categoriesRes.result.data || []);
        setCategories(catList);
      }
    } catch (e) {
      console.error("Failed to load catalog data:", e);
      toast.error("Failed to load products. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInitialData();
  }, []);

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      (p.name_en || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.name_ta || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "all" || 
      p.category_id?.toString() === selectedCategory;

    return matchesSearch && matchesCategory && p.is_available;
  });

  // Cart operations
  const addToCart = (product: any) => {
    const existingIdx = cartItems.findIndex(item => item.product_id === product.id);
    if (existingIdx > -1) {
      const updated = [...cartItems];
      // Increment weight or quantity
      if (product.weight_kg !== undefined) {
        updated[existingIdx].weight_kg = (parseFloat(updated[existingIdx].weight_kg) + 1).toFixed(2);
      } else {
        updated[existingIdx].quantity = parseInt(updated[existingIdx].quantity) + 1;
      }
      // Recalculate item subtotal
      const w = parseFloat(updated[existingIdx].weight_kg) || 0;
      const q = parseInt(updated[existingIdx].quantity) || 0;
      const qty = (w > 0 ? w : 1) * (q > 0 ? q : 1);
      const price = parseFloat(updated[existingIdx].unit_price) || 0;
      const disc = parseFloat(updated[existingIdx].discount_percentage) || 0;
      updated[existingIdx].subtotal = (price * qty * (1 - disc / 100)).toFixed(2);
      setCartItems(updated);
    } else {
      const newCartItem = {
        product_id: product.id,
        product_name_en: product.name_en,
        product_name_ta: product.name_ta,
        product_image: product.image || null,
        weight_kg: product.stock_quantity > 0 ? "1.00" : "0.00",
        quantity: product.stock_quantity > 0 ? 1 : 1,
        cutting_option_id: null,
        cutting_option_name: null,
        unit_price: product.price_per_kg?.toString() || "0",
        discount_percentage: 0,
        subtotal: (product.price_per_kg || 0).toString(),
        special_instructions: "",
      };
      setCartItems([...cartItems, newCartItem]);
      toast.success(`${product.name_en} added to cart!`, { icon: "🛒", duration: 1500 });
    }
  };

  const updateCartItemField = (idx: number, field: string, value: any) => {
    const updated = [...cartItems];
    updated[idx] = {
      ...updated[idx],
      [field]: value
    };

    // Calculate subtotal
    const w = parseFloat(updated[idx].weight_kg) || 0;
    const q = parseInt(updated[idx].quantity) || 0;
    const qty = (w > 0 ? w : 1) * (q > 0 ? q : 1);
    const price = parseFloat(updated[idx].unit_price) || 0;
    const disc = parseFloat(updated[idx].discount_percentage) || 0;
    updated[idx].subtotal = (price * qty * (1 - disc / 100)).toFixed(2);
    setCartItems(updated);
  };

  const removeFromCart = (idx: number) => {
    const updated = [...cartItems];
    const removedItem = updated.splice(idx, 1)[0];
    setCartItems(updated);
    toast.error(`${removedItem.product_name_en} removed from cart.`, { duration: 1500 });
  };

  // Calculations
  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0);
  };

  const calculateGrandTotal = () => {
    const sub = calculateSubtotal();
    const del = parseFloat(deliveryCharge) || 0;
    const disc = parseFloat(discountAmount) || 0;
    return Math.max(0, sub + del - disc);
  };

  // Customer suggestions
  const fetchCustomerSuggestions = async (searchVal: string, field: "name" | "phone") => {
    if (!searchVal || searchVal.trim().length < 2) {
      setCustomerSuggestions([]);
      setShowCustomerDropdown(false);
      return;
    }
    try {
      setCustomerSuggestionsLoading(true);
      setActiveSearchField(field);
      const res = await apiGetAllCustomers(1, searchVal);
      if (res.is_success && res.result) {
        const list = Array.isArray(res.result)
          ? res.result
          : (res.result.data || []);
        setCustomerSuggestions(list);
        setShowCustomerDropdown(list.length > 0);
      }
    } catch (e) {
      console.error("Failed to load customer suggestions:", e);
    } finally {
      setCustomerSuggestionsLoading(false);
    }
  };

  const handleSelectCustomer = (customer: any) => {
    setCustomerForm((prev) => ({
      ...prev,
      id: customer.id || null,
      deliveryAreaId: customer.delivery_area_id || null,
      name: customer.name || "",
      phone: customer.phone || "",
      email: customer.email || "",
      address: customer.default_address || "",
      landmark: customer.landmark || "",
    }));
    setShowCustomerDropdown(false);
    setCustomerSuggestions([]);
    toast.success(`Selected customer: ${customer.name}! ✨`, { icon: "👤" });
  };

  // Click away suggestions listener
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".relative")) {
        setShowCustomerDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Print Compiled Receipt
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

  const handlePrintReceipt = async (placedOrderData: any) => {
    const printPromise = (async () => {
      let activeTemplate: BillTemplate | null = null;
      try {
        const { templates: dbTemplates, activeTemplateId } = await BillTemplatesService.getTemplates();
        if (activeTemplateId) {
          activeTemplate = dbTemplates.find(t => t.id === activeTemplateId) || null;
        }
      } catch (err) {
        console.warn("Could not load templates from settings.", err);
      }

      // Compile receipt template
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
              const items = placedOrderData.order_items || placedOrderData.items || cartItems;
              const keys = child.key || ["no", "name", "qty", "free_qty", "price", "discount", "total"];
              
              const rowsHtml = items.map((item: any, idx: number) => {
                const qtyVal = item.weight_kg || item.quantity || 1;
                const totalItem = item.subtotal != null ? Number(item.subtotal) : ((item.unit_price || 0) * qtyVal);
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
            let displayPaymentMethod = placedOrderData.payment_method || paymentMethod;
            if (displayPaymentMethod === "cod") {
              displayPaymentMethod = "Cash";
            } else if (displayPaymentMethod === "online") {
              displayPaymentMethod = "Card / Online";
            } else {
              displayPaymentMethod = displayPaymentMethod.charAt(0).toUpperCase() + displayPaymentMethod.slice(1);
            }

            text = text
              .replace(/{{businessLogo}}/gi, settings.business_logo ? `<img src="${settings.business_logo}" style="max-height: 50px; max-width: 150px; object-fit: contain; display: block; margin: 0 auto 5px auto;" />` : "")
              .replace(/{{shopName}}/gi, settings.business_name || "Business POS")
              .replace(/{{billNumber}}/gi, placedOrderData.order_number || "ORD-POS-TEMP")
              .replace(/{{transactionDate}}/gi, new Date().toLocaleDateString())
              .replace(/{{cashierName}}/gi, "POS Desk Cashier")
              .replace(/{{time}}/gi, new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))
              .replace(/{{subtotal}}/gi, `${currency} ${Number(placedOrderData.subtotal || calculateSubtotal()).toFixed(2)}`)
              .replace(/{{shippingFee}}/gi, `${currency} ${Number(placedOrderData.delivery_charge || deliveryCharge).toFixed(2)}`)
              .replace(/{{totalDiscount}}/gi, `${currency} ${Number(placedOrderData.discount_amount || discountAmount).toFixed(2)}`)
              .replace(/{{totalAmount}}/gi, `${currency} ${Number(placedOrderData.total_amount || calculateGrandTotal()).toFixed(2)}`)
              .replace(/{{lastPaymentReceived}}/gi, `${currency} ${Number(placedOrderData.payment_status === 'paid' ? (placedOrderData.total_amount || calculateGrandTotal()) : 0).toFixed(2)}`)
              .replace(/{{lastAmountWallet}}/gi, `${currency} 0.00`)
              .replace(/{{lastPaymentBalance}}/gi, `${currency} ${Number(placedOrderData.payment_status === 'paid' ? 0 : (placedOrderData.total_amount || calculateGrandTotal())).toFixed(2)}`)
              .replace(/{{paymentMethod}}/gi, displayPaymentMethod)
              .replace(/{{brandName}}/gi, settings.business_name || "Meenavan");

            return `<div style="${childStyle}">${text}</div>`;
          }).join('');

          const hasDisplay = section.style && (section.style.display || section.style.flexDirection || section.style["flex-direction"]);
          const defaultFlex = hasDisplay ? "" : "display: flex; flex-direction: row; ";
          return `<div style="${defaultFlex}${rowStyle}">${childrenHtml}</div>`;
        }).join('');

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
              <title>POS Invoice - ${placedOrderData.order_number || ''}</title>
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
        // Fallback standard receipt print format
        const items = placedOrderData.order_items || placedOrderData.items || cartItems;
        const fallbackHtml = `
          <html>
            <head>
              <title>POS Receipt</title>
              <style>
                body { font-family: monospace; font-size: 14px; padding: 20px; width: 300px; }
                .center { text-align: center; }
                .right { text-align: right; }
                .bold { font-weight: bold; }
                .separator { border-top: 1px dashed #000; margin: 10px 0; }
                table { width: 100%; border-collapse: collapse; }
              </style>
            </head>
            <body>
              <div class="center bold">${settings.business_name || 'MEENAVAN SEAFOOD'}</div>
              <div class="center">${settings.business_phone || ''}</div>
              <div class="separator"></div>
              <div>Bill: ${placedOrderData.order_number || 'TEMP'}</div>
              <div>Date: ${new Date().toLocaleString()}</div>
              <div class="separator"></div>
              <table>
                <thead>
                  <tr style="border-bottom: 1px solid #000;">
                    <th align="left">Item</th>
                    <th align="right">Qty</th>
                    <th align="right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map((item: any) => `
                    <tr>
                      <td>${item.product_name_en}</td>
                      <td align="right">${item.weight_kg > 0 ? item.weight_kg + 'kg' : item.quantity}</td>
                      <td align="right">${Number(item.subtotal).toFixed(2)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
              <div class="separator"></div>
              <div>Subtotal: <span style="float:right;">${currency} ${Number(placedOrderData.subtotal).toFixed(2)}</span></div>
              <div>Delivery: <span style="float:right;">${currency} ${Number(placedOrderData.delivery_charge).toFixed(2)}</span></div>
              <div>Discount: <span style="float:right;">-${currency} ${Number(placedOrderData.discount_amount).toFixed(2)}</span></div>
              <div class="bold" style="font-size: 16px;">Total: <span style="float:right;">${currency} ${Number(placedOrderData.total_amount).toFixed(2)}</span></div>
              <div class="separator"></div>
              <div style="font-size: 11px;">Payment Method: <span style="float:right; text-transform: uppercase;">${placedOrderData.payment_method === 'cod' ? 'CASH/COD' : (placedOrderData.payment_method === 'online' ? 'CARD' : placedOrderData.payment_method || paymentMethod)}</span></div>
              <div style="font-size: 11px;">Payment Status: <span style="float:right; text-transform: uppercase;">${placedOrderData.payment_status || paymentStatus}</span></div>
              <div class="separator"></div>
              <div class="center">Thank you for your catch! 🌊</div>
            </body>
          </html>
        `;
        triggerPrintFrame(fallbackHtml);
      }
    })();

    toast.promise(printPromise, {
      loading: "Preparing receipt print layout... 🖨️",
      success: "Invoice sent to printer! 📝",
      error: "Failed to load active print template."
    });
  };

  // Submit Order
  const handlePlaceOrder = async () => {
    if (!customerForm.name.trim()) {
      toast.error("Customer name is required.");
      return;
    }
    if (!customerForm.phone.trim()) {
      toast.error("Customer phone is required.");
      return;
    }
    if (cartItems.length === 0) {
      toast.error("Your cart is empty. Please click products in the catalog.");
      return;
    }

    const orderPromise = (async () => {
      const subtotalVal = calculateSubtotal();
      const deliveryVal = parseFloat(deliveryCharge) || 0;
      const discountVal = parseFloat(discountAmount) || 0;
      const totalVal = subtotalVal + deliveryVal - discountVal;

      // Map payment methods for API database compatibility
      let apiPaymentMethod = paymentMethod;
      if (paymentMethod === "cash") {
        apiPaymentMethod = "cod";
      } else if (paymentMethod === "card") {
        apiPaymentMethod = "online";
      }

      const payload = {
        customer_id: customerForm.id || null,
        delivery_area_id: customerForm.deliveryAreaId || null,
        customer_name: customerForm.name,
        customer_phone: customerForm.phone,
        customer_email: customerForm.email || null,
        delivery_address: customerForm.address || null,
        landmark: customerForm.landmark || null,
        delivery_notes: customerForm.deliveryNotes || null,
        subtotal: subtotalVal,
        delivery_charge: deliveryVal,
        discount_amount: discountVal,
        total_amount: totalVal,
        payment_method: apiPaymentMethod,
        payment_status: paymentStatus,
        status: "pending",
        estimated_delivery_time: customerForm.estimatedDeliveryTime ? new Date(customerForm.estimatedDeliveryTime).toISOString() : null,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          product_name_en: item.product_name_en,
          product_name_ta: item.product_name_ta,
          product_image: item.product_image || null,
          weight_kg: parseFloat(item.weight_kg) || 0,
          quantity: parseInt(item.quantity) || 1,
          cutting_option_id: item.cutting_option_id || null,
          cutting_option_name: item.cutting_option_name || null,
          unit_price: parseFloat(item.unit_price) || 0,
          discount_percentage: parseInt(item.discount_percentage) || 0,
          subtotal: parseFloat(item.subtotal) || 0,
          special_instructions: item.special_instructions || null,
        }))
      };

      const res = await apiCreateOrder(payload);
      if (!res.is_success) {
        throw new Error(res.message || "Failed to submit order");
      }
      return res.result;
    })();

    toast.promise(orderPromise, {
      loading: "Placing POS order...",
      success: "POS Order placed successfully! 🌊🐟",
      error: (err: any) => err.message || "An error occurred while creating order."
    });

    try {
      setPlacingOrder(true);
      const placedOrder = await orderPromise;
      
      // Auto-trigger invoice print dialog
      await handlePrintReceipt(placedOrder);
      
      // Reset POS Cart
      setCartItems([]);
      setDeliveryCharge("0");
      setDiscountAmount("0");
      setCustomerForm({
        id: null,
        deliveryAreaId: null,
        name: "",
        phone: "",
        email: "",
        address: "",
        landmark: "",
        deliveryNotes: "",
        estimatedDeliveryTime: "",
      });
      setPaymentMethod("cash");
      setPaymentStatus("paid");
    } catch (e) {
      console.error(e);
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleClearCart = () => {
    triggerConfirmation({
      title: "Empty Active Cart?",
      message: "Are you sure you want to empty all products from the active POS cart? This action cannot be undone.",
      actionLabel: "Clear Cart",
      variant: "danger",
      onConfirm: () => {
        setCartItems([]);
        toast.error("Cart cleared.");
      },
    });
  };

  return (
    <div className={`flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden select-none transition-all duration-300 ${
      isFullscreen 
        ? "fixed inset-0 z-[999] w-screen h-screen" 
        : "h-screen"
    }`}>
      
      {/* POS Top Header bar */}
      <header className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-md shadow-blue-500/20">
            <Calculator className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              Meenavan POS Terminal
              <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60 font-semibold px-2 py-0">Online</Badge>
            </h1>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">Quick order billing desk</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/50 hidden sm:inline-block">
            📅 {new Date().toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl border-slate-200 h-9 font-semibold text-slate-600 flex items-center gap-1.5 shadow-sm"
            onClick={() => void loadInitialData()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sync Catalog
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className={`rounded-xl h-9 font-semibold flex items-center gap-1.5 shadow-sm transition-all ${
              isFullscreen 
                ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 font-bold" 
                : "border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-4 w-4" />
                Exit Full Screen
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4 animate-pulse text-blue-600" />
                Full Screen
              </>
            )}
          </Button>
        </div>
      </header>

      {/* Mobile Tab Switcher (Only visible on tablet & mobile) */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 lg:hidden shrink-0 bg-white dark:bg-slate-900 p-2 gap-2">
        <Button
          variant={activeTab === "catalog" ? "default" : "ghost"}
          onClick={() => setActiveTab("catalog")}
          className="flex-1 rounded-xl text-xs font-bold"
        >
          🌊 Catalog Catches
        </Button>
        <Button
          variant={activeTab === "cart" ? "default" : "ghost"}
          onClick={() => setActiveTab("cart")}
          className="flex-1 rounded-xl text-xs font-bold relative"
        >
          🛒 Active Cart
          {cartItems.length > 0 && (
            <Badge className="ml-1.5 bg-blue-600 text-white border border-blue-500 scale-90">{cartItems.length}</Badge>
          )}
        </Button>
      </div>

      {/* POS Dual Pane Workspace */}
      <div className="flex-1 flex overflow-hidden relative flex-col lg:flex-row">
        
        {/* LEFT SECTION (Product catalog grid + Search + Categories) */}
        <section 
          style={{ width: isMounted && window.innerWidth >= 1024 ? `${100 - cartWidth}%` : undefined }}
          className={`flex flex-col h-full lg:border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 w-full lg:w-auto ${
            activeTab === "catalog" ? "flex" : "hidden lg:flex"
          }`}
        >
          
          {/* Search and category filter toolbar */}
          <div className="shrink-0 p-5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-850 space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search fresh seafood catches by english or tamil name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 rounded-xl border-slate-200 bg-slate-50/50 dark:bg-slate-950 focus-visible:ring-blue-500 transition-all font-semibold text-sm shadow-inner"
              />
            </div>
            
            {/* Category horizontal scroll pills */}
            <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5">
              <Button
                variant={selectedCategory === "all" ? "default" : "secondary"}
                onClick={() => setSelectedCategory("all")}
                className="h-8.5 rounded-xl text-xs px-4 font-bold shadow-sm transition-all"
              >
                All Catches 🌊
              </Button>
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id.toString() ? "default" : "secondary"}
                  onClick={() => setSelectedCategory(cat.id.toString())}
                  className="h-8.5 rounded-xl text-xs px-4 font-bold shadow-sm transition-all whitespace-nowrap"
                >
                  {cat.name_en} {cat.name_ta ? `(${cat.name_ta})` : ''}
                </Button>
              ))}
            </div>
          </div>

          {/* Product Catalog Grid Container */}
          <div className="flex-1 overflow-y-auto p-5 scroll-smooth">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-9 w-9 animate-spin text-blue-600" />
                  <span className="text-slate-400 font-bold text-sm">Fetching catalog...</span>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-400/80 p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl m-3 bg-white/40 dark:bg-slate-900/10">
                <UtensilsCrossed className="h-12 w-12 text-slate-300 mb-3" />
                <h3 className="font-black text-slate-700 dark:text-slate-300">No catches found</h3>
                <p className="text-xs text-slate-400 max-w-xs text-center mt-1">Try refining your search keyword or selecting a different category tab.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((prod) => {
                  const inCart = cartItems.find(item => item.product_id === prod.id);
                  const isOutOfStock = prod.stock_quantity <= 0;

                  return (
                    <article
                      key={prod.id}
                      onClick={() => !isOutOfStock && addToCart(prod)}
                      className={`group cursor-pointer bg-white dark:bg-slate-900 border rounded-2xl p-3 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 relative overflow-hidden select-none ${
                        inCart 
                          ? "border-blue-500 ring-2 ring-blue-500/20" 
                          : "border-slate-200 dark:border-slate-800"
                      } ${isOutOfStock ? "opacity-60 cursor-not-allowed border-slate-200" : ""}`}
                    >
                      {/* Ribbon banner for Cart item count */}
                      {inCart && (
                        <div className="absolute top-0 right-0 bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-bl-xl shadow-sm z-10 flex items-center gap-0.5">
                          <ShoppingCart className="h-2.5 w-2.5" />
                          {inCart.weight_kg > 0 ? `${inCart.weight_kg} kg` : inCart.quantity}
                        </div>
                      )}

                      {/* Image Thumbnail with fallback catch */}
                      <div className="h-24 w-full bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800/40 dark:to-slate-900/40 rounded-xl mb-3 overflow-hidden flex items-center justify-center relative border border-blue-100/40 dark:border-slate-800/60">
                        {prod.image ? (
                          <img src={prod.image} alt={prod.name_en} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-blue-500 dark:text-blue-400">
                            <span className="text-4xl filter drop-shadow-sm group-hover:scale-110 transition-transform duration-300">🐟</span>
                          </div>
                        )}
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                            <span className="text-[10px] uppercase font-black tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-full shadow-sm">Sold Out</span>
                          </div>
                        )}
                      </div>

                      {/* Product text details */}
                      <div className="space-y-1">
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 leading-tight truncate">
                          {prod.name_en}
                        </h4>
                        {prod.name_ta && (
                          <p className="text-[10px] font-semibold text-slate-400 leading-none truncate">{prod.name_ta}</p>
                        )}
                      </div>

                      {/* Footer: Price + stock */}
                      <div className="flex items-end justify-between mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                        <div>
                          <span className="text-xs text-slate-400 dark:text-slate-500 font-bold block leading-none">Price/kg</span>
                          <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                            {currency} {Number(prod.price_per_kg || 0).toFixed(2)}
                          </span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                          prod.stock_quantity > 5 
                            ? "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400" 
                            : "bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40"
                        }`}>
                          {prod.stock_quantity} kg left
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Resizable Divider (Only visible on desktop lg and up) */}
        <div 
          onMouseDown={startResize}
          className="hidden lg:flex w-1.5 h-full bg-slate-200 dark:bg-slate-800 hover:bg-blue-500 active:bg-blue-600 cursor-col-resize shrink-0 transition-colors z-20 items-center justify-center relative group"
        >
          <div className="w-0.5 h-6 bg-slate-400 dark:bg-slate-600 rounded-full group-hover:bg-white" />
        </div>

        {/* RIGHT SECTION (Checkout Cart list + Customer autocomplete form + Totals) */}
        <section 
          style={{ width: isMounted && window.innerWidth >= 1024 ? `${cartWidth}%` : undefined }}
          className={`flex flex-col h-full bg-white dark:bg-slate-900 shadow-xl relative z-10 w-full lg:w-auto ${
            activeTab === "cart" ? "flex" : "hidden lg:flex"
          }`}
        >
          
          {/* Cart Header */}
          <div className="shrink-0 p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                Active Order Cart
                <Badge className="bg-blue-600 text-white font-bold">{cartItems.length}</Badge>
              </h2>
            </div>
            {cartItems.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearCart}
                className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 h-8 rounded-xl px-2.5"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Empty Cart
              </Button>
            )}
          </div>

          {/* Cart items list drawer */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400/70 p-6">
                <ShoppingCart className="h-10 w-10 text-slate-300 mb-2" />
                <p className="text-sm font-bold text-slate-500">POS Cart is Empty</p>
                <p className="text-xs text-slate-400 text-center max-w-xs mt-1">Select fresh seafood from the catalog grid on the left to build the order.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 relative overflow-hidden group space-y-3 shadow-xs"
                  >
                    
                    {/* Title and price heading */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-tight">
                          {item.product_name_en}
                        </h4>
                        {item.product_name_ta && (
                          <p className="text-[10px] text-slate-400 font-semibold">{item.product_name_ta}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900 dark:text-slate-100">
                          {currency} {Number(item.subtotal).toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFromCart(idx)}
                          className="h-7 w-7 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Quantity controls grid */}
                    <div className="grid grid-cols-3 gap-2 items-center">
                      
                      {/* Weight (kg) control */}
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 block">Weight (kg)</label>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            value={item.weight_kg}
                            onChange={(e) => updateCartItemField(idx, "weight_kg", e.target.value)}
                            className="h-8.5 rounded-lg border-slate-200 text-xs px-2 shadow-xs"
                          />
                        </div>
                      </div>

                      {/* Quantity control */}
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 block">Units (qty)</label>
                        <div className="relative">
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateCartItemField(idx, "quantity", e.target.value)}
                            className="h-8.5 rounded-lg border-slate-200 text-xs px-2 shadow-xs"
                          />
                        </div>
                      </div>

                      {/* Cutting preferences selector */}
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 block">Cutting Prep</label>
                        <Select
                          value={item.cutting_option_id?.toString() || "none"}
                          onValueChange={(val) => {
                            if (val === "none") {
                              updateCartItemField(idx, "cutting_option_id", null);
                              updateCartItemField(idx, "cutting_option_name", null);
                            } else {
                              const opt = CUTTING_PREFERENCES.find(o => o.id.toString() === val);
                              if (opt) {
                                updateCartItemField(idx, "cutting_option_id", opt.id);
                                updateCartItemField(idx, "cutting_option_name", opt.name_en);
                              }
                            }
                          }}
                        >
                          <SelectTrigger className="h-8.5 rounded-lg border-slate-200 text-xs select-none">
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200 shadow-md">
                            <SelectItem value="none" className="text-xs">None</SelectItem>
                            {CUTTING_PREFERENCES.map(opt => (
                              <SelectItem key={opt.id} value={opt.id.toString()} className="text-xs">
                                {opt.name_en} {opt.name_ta ? `(${opt.name_ta})` : ''}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Unit price and discount inputs grid */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 block">Unit Price (Rs)</label>
                        <Input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) => updateCartItemField(idx, "unit_price", e.target.value)}
                          className="h-8 rounded-lg border-slate-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-0.5 block">Discount (%)</label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount_percentage}
                          onChange={(e) => updateCartItemField(idx, "discount_percentage", e.target.value)}
                          className="h-8 rounded-lg border-slate-200 text-xs text-center"
                        />
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* Customer Details Form Panel (Autofill integration) */}
            <div className="border-t border-slate-100 dark:border-slate-800/80 pt-5 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="h-4 w-4" />
                Customer & Billing details
              </h3>
              
              <div className="space-y-3">
                {/* Phone lookup field */}
                <div className="relative">
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">Phone Number <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      value={customerForm.phone}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomerForm({ ...customerForm, phone: val, id: null, deliveryAreaId: null });
                        void fetchCustomerSuggestions(val, "phone");
                      }}
                      onFocus={() => {
                        if (customerForm.phone.length >= 2) {
                          void fetchCustomerSuggestions(customerForm.phone, "phone");
                        }
                      }}
                      placeholder="Type phone to search or register..."
                      className="pl-9 h-9 rounded-xl border-slate-200 focus-visible:ring-blue-500 text-xs pr-8"
                    />
                    {customerSuggestionsLoading && activeSearchField === "phone" && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                      </div>
                    )}
                  </div>

                  {/* Phone dropdown search options */}
                  {showCustomerDropdown && activeSearchField === "phone" && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-48 overflow-y-auto overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60">
                      {customerSuggestions.map((cust) => (
                        <button
                          key={cust.id}
                          type="button"
                          className="w-full text-left px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-805/40 transition-colors flex flex-col gap-0.5"
                          onClick={() => handleSelectCustomer(cust)}
                        >
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{cust.name}</span>
                          <span className="text-[10px] text-slate-400">📞 {cust.phone} {cust.email ? `• ✉️ ${cust.email}` : ''}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Name lookup field */}
                <div className="relative">
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">Customer Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      value={customerForm.name}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCustomerForm({ ...customerForm, name: val, id: null, deliveryAreaId: null });
                        void fetchCustomerSuggestions(val, "name");
                      }}
                      onFocus={() => {
                        if (customerForm.name.length >= 2) {
                          void fetchCustomerSuggestions(customerForm.name, "name");
                        }
                      }}
                      placeholder="Type name to search..."
                      className="pl-9 h-9 rounded-xl border-slate-200 focus-visible:ring-blue-500 text-xs pr-8"
                    />
                    {customerSuggestionsLoading && activeSearchField === "name" && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                      </div>
                    )}
                  </div>

                  {/* Name dropdown search options */}
                  {showCustomerDropdown && activeSearchField === "name" && (
                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-48 overflow-y-auto overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60">
                      {customerSuggestions.map((cust) => (
                        <button
                          key={cust.id}
                          type="button"
                          className="w-full text-left px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-805/40 transition-colors flex flex-col gap-0.5"
                          onClick={() => handleSelectCustomer(cust)}
                        >
                          <span className="font-bold text-xs text-slate-900 dark:text-white">{cust.name}</span>
                          <span className="text-[10px] text-slate-400">📞 {cust.phone} {cust.email ? `• ✉️ ${cust.email}` : ''}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Email field */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">Email (Optional)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                      placeholder="Email"
                      className="pl-9 h-9 rounded-xl border-slate-200 text-xs"
                    />
                  </div>
                </div>

                {/* Address field */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">Delivery Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <Textarea
                      value={customerForm.address}
                      onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                      placeholder="Full shipping address..."
                      className="pl-9 min-h-[60px] rounded-xl border-slate-200 text-xs py-2 focus-visible:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Landmark field */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">Landmark</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      value={customerForm.landmark}
                      onChange={(e) => setCustomerForm({ ...customerForm, landmark: e.target.value })}
                      placeholder="e.g. Near bus stop, temple"
                      className="pl-9 h-9 rounded-xl border-slate-200 text-xs"
                    />
                  </div>
                </div>

                {/* Estimated Delivery Time */}
                <div>
                  <label className="text-[10px] font-bold text-slate-500 mb-1 block">Estimated Delivery Date & Time</label>
                  <Input
                    type="datetime-local"
                    value={customerForm.estimatedDeliveryTime}
                    onChange={(e) => setCustomerForm({ ...customerForm, estimatedDeliveryTime: e.target.value })}
                    className="h-9 rounded-xl border-slate-200 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* POS Bill summary & Submit section */}
          <div className="shrink-0 p-5 border-t border-slate-200 bg-slate-50/50 dark:bg-slate-900/60 space-y-4">
            
            {/* Real-time calculated amounts */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                <span>Cart Subtotal</span>
                <span>{currency} {calculateSubtotal().toFixed(2)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Delivery Fee ({currency})</label>
                  <Input
                    type="number"
                    value={deliveryCharge}
                    onChange={(e) => setDeliveryCharge(e.target.value)}
                    className="h-8 rounded-lg border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-0.5">Order Discount ({currency})</label>
                  <Input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    className="h-8 rounded-lg border-slate-200 text-xs text-right text-emerald-600 font-bold"
                  />
                </div>
              </div>

              {/* Total Row */}
              <div className="flex justify-between items-center pt-2 border-t border-dashed border-slate-200 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Amount Due</span>
                <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                  {currency} {calculateGrandTotal().toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment method selector & status */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 block">Payment Method</label>
                <div className="flex rounded-xl border border-slate-200 bg-white p-0.5 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-colors ${
                      paymentMethod === "cash" 
                        ? "bg-slate-900 text-white shadow-xs" 
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-colors ${
                      paymentMethod === "card" 
                        ? "bg-slate-900 text-white shadow-xs" 
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-colors ${
                      paymentMethod === "cod" 
                        ? "bg-slate-900 text-white shadow-xs" 
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    COD
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1 block">Payment Status</label>
                <div className="flex rounded-xl border border-slate-200 bg-white p-0.5 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setPaymentStatus("paid")}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-colors ${
                      paymentStatus === "paid" 
                        ? "bg-emerald-600 text-white shadow-xs" 
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Paid
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentStatus("pending")}
                    className={`flex-1 py-1.5 text-[10px] font-bold rounded-lg transition-colors ${
                      paymentStatus === "pending" 
                        ? "bg-amber-500 text-white shadow-xs" 
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    Pending
                  </button>
                </div>
              </div>
            </div>

            {/* Place Order & Billing Submit */}
            <Button
              onClick={() => void handlePlaceOrder()}
              disabled={placingOrder || cartItems.length === 0 || !customerForm.name || !customerForm.phone}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm rounded-xl shadow-md transition-transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
            >
              {placingOrder ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Coins className="h-5 w-5" />
              )}
              Place POS Order & Print Invoice
            </Button>

          </div>
        </section>

      </div>

      {/* Premium Common Confirmation Dialog Modal */}
      {confirmState.isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-sm w-full mx-4 space-y-4 animate-scale-in">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-2xl ${
                confirmState.variant === "danger" 
                  ? "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400" 
                  : confirmState.variant === "info"
                    ? "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400"
                    : "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400"
              }`}>
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-950 dark:text-white leading-tight">
                  {confirmState.title}
                </h3>
                <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                  Confirm action
                </p>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed">
              {confirmState.message}
            </p>
            
            <div className="flex items-center gap-2 pt-2">
              <Button
                variant="ghost"
                onClick={() => setConfirmState((prev) => ({ ...prev, isOpen: false }))}
                className="flex-1 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700 h-10"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmState.onConfirm}
                className={`flex-1 rounded-xl text-xs font-bold text-white shadow-sm h-10 ${
                  confirmState.variant === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : confirmState.variant === "info"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-amber-500 hover:bg-amber-600"
                }`}
              >
                {confirmState.actionLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
