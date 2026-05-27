"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  CalendarDays,
  Clock,
  CreditCard,
  Edit2,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  Save,
  ShoppingBag,
  Truck,
  User,
  X,
  Plus,
  Trash2,
  Search,
} from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DetailRow } from "@/components/common/DetailRow";
import { formatCurrency } from "@/lib/admin-config";
import { apiGetOrder, apiUpdateOrder, apiUpdateOrderStatus, apiCreateOrder } from "../api-service";
import { apiGetAllProducts } from "@/app/admin/products/_utils/api-service";
import { apiGetAllCustomers } from "@/app/admin/customers/_utils/api-service";

interface OrderItem {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  total_amount: number;
  subtotal?: number;
  delivery_charge?: number;
  discount_amount?: number;
  delivery_address?: string;
  landmark?: string;
  delivery_area_name?: string;
  delivery_notes?: string;
  delivery_person_name?: string;
  delivery_person_phone?: string;
  admin_notes?: string;
  status?: string;
  payment_status?: string;
  payment_method?: string;
  cancellation_reason?: string;
  estimated_delivery_time?: string;
  confirmed_at?: string;
  processing_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  created_at?: string;
  updated_at?: string;
  order_items?: any[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  orderId: number | null;
  onOrderUpdated: () => void;
  initialEditMode?: boolean;
}

const ORDER_COLUMNS = [
  { key: "pending", label: "Pending", gradient: "from-amber-500 to-orange-500", dotColor: "bg-amber-400" },
  { key: "confirmed", label: "Confirmed", gradient: "from-blue-500 to-cyan-500", dotColor: "bg-blue-400" },
  { key: "processing", label: "Processing", gradient: "from-indigo-500 to-violet-500", dotColor: "bg-indigo-400" },
  { key: "out_for_delivery", label: "Out for Delivery", gradient: "from-purple-500 to-fuchsia-500", dotColor: "bg-purple-400" },
  { key: "delivered", label: "Delivered", gradient: "from-emerald-500 to-teal-500", dotColor: "bg-emerald-400" },
  { key: "cancelled", label: "Cancelled", gradient: "from-red-500 to-rose-500", dotColor: "bg-red-400" },
] as const;

const statusColors: Record<string, string> = {
  pending: "border-yellow-300 bg-yellow-100 text-yellow-800",
  confirmed: "border-blue-300 bg-blue-100 text-blue-800",
  processing: "border-indigo-300 bg-indigo-100 text-indigo-800",
  out_for_delivery: "border-purple-300 bg-purple-100 text-purple-800",
  delivered: "border-emerald-300 bg-emerald-100 text-emerald-800",
  cancelled: "border-red-300 bg-red-100 text-red-800",
  refunded: "border-slate-300 bg-slate-100 text-slate-700",
};

const paymentStatusColors: Record<string, string> = {
  pending: "border-yellow-300 bg-yellow-100 text-yellow-800",
  paid: "border-emerald-300 bg-emerald-100 text-emerald-800",
  failed: "border-red-300 bg-red-100 text-red-800",
  refunded: "border-slate-300 bg-slate-100 text-slate-700",
};

const CUTTING_PREFERENCES = [
  { id: 1, name_en: "Whole", name_ta: "முழுமையாக", code: "whole" },
  { id: 2, name_en: "Curry Cut", name_ta: "குழம்பு வெட்டு", code: "curry_cut" },
  { id: 3, name_en: "Fry Cut", name_ta: "பொரியல் வெட்டு", code: "fry_cut" },
  { id: 4, name_en: "Cleaned", name_ta: "சுத்தம் செய்யப்பட்ட", code: "cleaned" },
  { id: 5, name_en: "Skin Removed", name_ta: "தோல் நீக்கப்பட்ட", code: "skin_removed" },
];

export default function OrderDetailSidebar({ isOpen, onClose, orderId, onOrderUpdated, initialEditMode = false }: Props) {
  const [order, setOrder] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(initialEditMode);

  // Products and edit-mode item management states
  const [editedItems, setEditedItems] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Customer autocomplete states
  const [customerSuggestions, setCustomerSuggestions] = useState<any[]>([]);
  const [customerSuggestionsLoading, setCustomerSuggestionsLoading] = useState(false);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [activeSearchField, setActiveSearchField] = useState<"name" | "phone" | null>(null);

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
    setFormData((prev) => ({
      ...prev,
      customer_name: customer.name || "",
      customer_phone: customer.phone || "",
      customer_email: customer.email || "",
      delivery_address: customer.default_address || "",
      landmark: customer.landmark || "",
    }));
    setShowCustomerDropdown(false);
    setCustomerSuggestions([]);
    toast.success(`Loaded details for customer: ${customer.name}! ✨`, {
      icon: "👤",
    });
  };

  // Click away listener for customer suggestion dropdown
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

  const filteredProducts = allProducts.filter(p => 
    (p.name_en || "").toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.name_ta || "").toLowerCase().includes(productSearch.toLowerCase())
  );

  // Form Fields
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    delivery_address: "",
    landmark: "",
    delivery_notes: "",
    delivery_person_name: "",
    delivery_person_phone: "",
    admin_notes: "",
    cancellation_reason: "",
    subtotal: "0",
    delivery_charge: "0",
    discount_amount: "0",
    payment_method: "cod",
    payment_status: "pending",
    estimated_delivery_time: "",
  });

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await apiGetAllProducts(1, { per_page: -1 } as any);
      if (res.is_success && res.result) {
        const list = Array.isArray(res.result) 
          ? res.result 
          : (res.result.data || []);
        setAllProducts(list);
      }
    } catch (e) {
      console.error("Failed to load products list:", e);
    } finally {
      setProductsLoading(false);
    }
  };

  const recalculateTotals = (itemsList: any[], delivery: string, discount: string) => {
    const sub = itemsList.reduce((acc, item) => {
      const w = parseFloat(item.weight_kg) || 0;
      const q = parseInt(item.quantity) || 0;
      const qty = (w > 0 ? w : 1) * (q > 0 ? q : 1);
      
      const price = parseFloat(item.unit_price) || 0;
      const disc = parseFloat(item.discount_percentage) || 0;
      const itemSub = price * qty * (1 - disc / 100);
      return acc + itemSub;
    }, 0);
    
    setFormData((prev) => ({
      ...prev,
      subtotal: sub.toFixed(2),
      delivery_charge: delivery,
      discount_amount: discount,
    }));
  };

  const updateItemField = (idx: number, field: string, value: any) => {
    const updated = [...editedItems];
    updated[idx] = {
      ...updated[idx],
      [field]: value,
    };
    
    // Recalculate item subtotal
    const w = parseFloat(updated[idx].weight_kg) || 0;
    const q = parseInt(updated[idx].quantity) || 0;
    const qty = (w > 0 ? w : 1) * (q > 0 ? q : 1);
    
    const price = parseFloat(updated[idx].unit_price) || 0;
    const disc = parseFloat(updated[idx].discount_percentage) || 0;
    updated[idx].subtotal = (price * qty * (1 - disc / 100)).toFixed(2);
    
    setEditedItems(updated);
    recalculateTotals(updated, formData.delivery_charge, formData.discount_amount);
  };

  const fetchOrderDetail = async (id: number) => {
    try {
      setLoading(true);
      const res = await apiGetOrder(id);
      if (res.is_success && res.result) {
        setOrder(res.result);
        populateForm(res.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (orderId) {
        setIsEditMode(initialEditMode);
        void fetchOrderDetail(orderId);
        void fetchProducts();
      } else {
        setIsEditMode(true);
        setOrder(null);
        setEditedItems([]);
        setProductSearch("");
        setShowProductDropdown(false);
        setFormData({
          customer_name: "",
          customer_phone: "",
          customer_email: "",
          delivery_address: "",
          landmark: "",
          delivery_notes: "",
          delivery_person_name: "",
          delivery_person_phone: "",
          admin_notes: "",
          cancellation_reason: "",
          subtotal: "0",
          delivery_charge: "0",
          discount_amount: "0",
          payment_method: "cod",
          payment_status: "pending",
          estimated_delivery_time: "",
        });
        void fetchProducts();
      }
    } else {
      setOrder(null);
      setEditedItems([]);
      setProductSearch("");
      setShowProductDropdown(false);
      setShowCustomerDropdown(false);
      setCustomerSuggestions([]);
    }
  }, [isOpen, orderId, initialEditMode]);

  const populateForm = (data: OrderItem) => {
    // Format timestamp for datetime-local input
    let estTime = "";
    if (data.estimated_delivery_time) {
      const date = new Date(data.estimated_delivery_time);
      // offset timezone to match local timezone value format
      const tzOffset = date.getTimezoneOffset() * 60000;
      estTime = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    }

    setFormData({
      customer_name: data.customer_name || "",
      customer_phone: data.customer_phone || "",
      customer_email: data.customer_email || "",
      delivery_address: data.delivery_address || "",
      landmark: data.landmark || "",
      delivery_notes: data.delivery_notes || "",
      delivery_person_name: data.delivery_person_name || "",
      delivery_person_phone: data.delivery_person_phone || "",
      admin_notes: data.admin_notes || "",
      cancellation_reason: data.cancellation_reason || "",
      subtotal: data.subtotal?.toString() || "0",
      delivery_charge: data.delivery_charge?.toString() || "0",
      discount_amount: data.discount_amount?.toString() || "0",
      payment_method: data.payment_method || "cod",
      payment_status: data.payment_status || "pending",
      estimated_delivery_time: estTime,
    });

    setEditedItems(data.order_items || []);
    setProductSearch("");
    setShowProductDropdown(false);
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!order) return;
    const updatePromise = (async () => {
      const res = await apiUpdateOrderStatus(order.id, newStatus);
      if (!res.is_success) {
        throw new Error(res.message || "Failed to update status");
      }
      return res;
    })();

    toast.promise(updatePromise, {
      loading: `Updating order status to ${newStatus}...`,
      success: `Order status updated to ${newStatus}!`,
      error: (err: any) => err.message || "Failed to update status."
    });

    try {
      setSaving(true);
      await updatePromise;
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      onOrderUpdated();
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveOrder = async () => {
    if (!orderId) {
      if (!formData.customer_name.trim()) {
        toast.error("Customer name is required.");
        return;
      }
      if (!formData.customer_phone.trim()) {
        toast.error("Customer phone is required.");
        return;
      }
      if (editedItems.length === 0) {
        toast.error("Please add at least one item to the order.");
        return;
      }

      const savePromise = (async () => {
        const subtotalVal = parseFloat(formData.subtotal) || 0;
        const deliveryVal = parseFloat(formData.delivery_charge) || 0;
        const discountVal = parseFloat(formData.discount_amount) || 0;
        const totalVal = subtotalVal + deliveryVal - discountVal;

        const payload = {
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone,
          customer_email: formData.customer_email || null,
          delivery_address: formData.delivery_address || null,
          landmark: formData.landmark || null,
          delivery_notes: formData.delivery_notes || null,
          delivery_person_name: formData.delivery_person_name || null,
          delivery_person_phone: formData.delivery_person_phone || null,
          admin_notes: formData.admin_notes || null,
          cancellation_reason: null,
          subtotal: subtotalVal,
          delivery_charge: deliveryVal,
          discount_amount: discountVal,
          total_amount: totalVal,
          payment_method: formData.payment_method,
          payment_status: formData.payment_status,
          status: "pending",
          estimated_delivery_time: formData.estimated_delivery_time ? new Date(formData.estimated_delivery_time).toISOString() : null,
          items: editedItems.map((item) => ({
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
          })),
        };

        const res = await apiCreateOrder(payload);
        if (!res.is_success) {
          throw new Error(res.message || "Failed to create order");
        }
        return res;
      })();

      toast.promise(savePromise, {
        loading: "Creating new order...",
        success: "Order created successfully! 📦",
        error: (err: any) => err.message || "Failed to create order."
      });

      try {
        setSaving(true);
        await savePromise;
        onClose();
        onOrderUpdated();
      } catch (e) {
        console.error(e);
      } finally {
        setSaving(false);
      }
      return;
    }

    if (!order) return;
    const savePromise = (async () => {
      const subtotalVal = parseFloat(formData.subtotal) || 0;
      const deliveryVal = parseFloat(formData.delivery_charge) || 0;
      const discountVal = parseFloat(formData.discount_amount) || 0;
      const totalVal = subtotalVal + deliveryVal - discountVal;

      const payload = {
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email || null,
        delivery_address: formData.delivery_address || null,
        landmark: formData.landmark || null,
        delivery_notes: formData.delivery_notes || null,
        delivery_person_name: formData.delivery_person_name || null,
        delivery_person_phone: formData.delivery_person_phone || null,
        admin_notes: formData.admin_notes || null,
        cancellation_reason: formData.cancellation_reason || null,
        subtotal: subtotalVal,
        delivery_charge: deliveryVal,
        discount_amount: discountVal,
        total_amount: totalVal,
        payment_method: formData.payment_method,
        payment_status: formData.payment_status,
        estimated_delivery_time: formData.estimated_delivery_time ? new Date(formData.estimated_delivery_time).toISOString() : null,
        items: editedItems.map((item) => ({
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
        })),
      };

      const res = await apiUpdateOrder(order.id, payload);
      if (!res.is_success) {
        throw new Error(res.message || "Failed to update order details");
      }
      return res;
    })();

    toast.promise(savePromise, {
      loading: "Saving order details...",
      success: "Order details updated successfully!",
      error: (err: any) => err.message || "Failed to save order details."
    });

    try {
      setSaving(true);
      await savePromise;
      setIsEditMode(false);
      onOrderUpdated();
      // Reload fresh order details
      void fetchOrderDetail(order.id);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full sm:!max-w-[50vw] overflow-y-auto p-0 border-slate-200">
        {loading && !order && orderId !== null ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
          </div>
        ) : (order || orderId === null) ? (
          <div className="flex flex-col h-full bg-white dark:bg-slate-950">
            {/* Sidebar header */}
            <SheetHeader className="border-b border-slate-100 dark:border-slate-800 px-6 py-5">
              <div className="flex items-start justify-between">
                <div>
                  <SheetTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {order ? order.order_number : "Create New Order"}
                  </SheetTitle>
                  <SheetDescription className="mt-1 text-slate-500 dark:text-slate-400">
                    {order ? (
                      <>
                        Placed{" "}
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </>
                    ) : (
                      "Set up customer details and products to create a new POS order."
                    )}
                  </SheetDescription>
                </div>
                
                {/* Actions at Header */}
                <div className="flex items-center gap-2 pr-6">
                  {order && !isEditMode ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 h-9"
                      onClick={() => setIsEditMode(true)}
                    >
                      <Edit2 className="h-3.5 w-3.5 mr-1.5" />
                      Edit Order
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 h-9"
                        onClick={() => {
                          if (!orderId) {
                            onClose();
                          } else {
                            setIsEditMode(false);
                            if (order) populateForm(order);
                          }
                        }}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white h-9"
                        onClick={() => void handleSaveOrder()}
                        disabled={saving}
                      >
                        {saving ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                        ) : (
                          <Save className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        Save
                      </Button>
                    </div>
                  )}
                </div>
              </div>
 
              {/* Status & Payment badges */}
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge
                  className={`${
                    statusColors[order ? (order.status || "pending") : "pending"]
                  } shadow-none capitalize text-xs px-2.5 py-1`}
                >
                  {(order ? (order.status || "pending") : "pending").replace(/_/g, " ")}
                </Badge>
                <Badge
                  className={`${
                    paymentStatusColors[order ? (order.payment_status || "pending") : "pending"]
                  } shadow-none capitalize text-xs px-2.5 py-1`}
                >
                  Payment: {(order ? (order.payment_status || "pending") : "pending").replace(/_/g, " ")}
                </Badge>
              </div>
            </SheetHeader>

            {/* Sidebar body */}
            <div className="flex-1 overflow-y-auto">
              {saving && !isEditMode && (
                <div className="flex justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                </div>
              )}

              {(isEditMode || !order) ? (
                /* ─── EDIT MODE FORM ──────────────────────────────── */
                <div className="p-6 space-y-6">
                  {/* Customer details edit */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Customer Info
                    </h3>
                    <div className="space-y-3">
                      <div className="relative">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Customer Name</label>
                        <div className="relative">
                          <Input
                            value={formData.customer_name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData({ ...formData, customer_name: val });
                              void fetchCustomerSuggestions(val, "name");
                            }}
                            onFocus={() => {
                              if (formData.customer_name.length >= 2) {
                                void fetchCustomerSuggestions(formData.customer_name, "name");
                              }
                            }}
                            placeholder="Name"
                            className="rounded-xl border-slate-200 focus-visible:ring-blue-500 pr-8"
                          />
                          {customerSuggestionsLoading && activeSearchField === "name" && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                            </div>
                          )}
                        </div>
                        {/* Dropdown for Name */}
                        {showCustomerDropdown && activeSearchField === "name" && (
                          <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60">
                            {customerSuggestions.map((cust) => (
                              <button
                                key={cust.id}
                                type="button"
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-805/40 transition-colors flex flex-col gap-0.5"
                                onClick={() => handleSelectCustomer(cust)}
                              >
                                <span className="font-bold text-slate-900 dark:text-white">{cust.name}</span>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <span>📞 {cust.phone}</span>
                                  {cust.email && <span>• ✉️ {cust.email}</span>}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="relative">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Phone Number</label>
                        <div className="relative">
                          <Input
                            value={formData.customer_phone}
                            onChange={(e) => {
                              const val = e.target.value;
                              setFormData({ ...formData, customer_phone: val });
                              void fetchCustomerSuggestions(val, "phone");
                            }}
                            onFocus={() => {
                              if (formData.customer_phone.length >= 2) {
                                void fetchCustomerSuggestions(formData.customer_phone, "phone");
                              }
                            }}
                            placeholder="Phone"
                            className="rounded-xl border-slate-200 focus-visible:ring-blue-500 pr-8"
                          />
                          {customerSuggestionsLoading && activeSearchField === "phone" && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                            </div>
                          )}
                        </div>
                        {/* Dropdown for Phone */}
                        {showCustomerDropdown && activeSearchField === "phone" && (
                          <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-60 overflow-y-auto overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/60">
                            {customerSuggestions.map((cust) => (
                              <button
                                key={cust.id}
                                type="button"
                                className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-805/40 transition-colors flex flex-col gap-0.5"
                                onClick={() => handleSelectCustomer(cust)}
                              >
                                <span className="font-bold text-slate-900 dark:text-white">{cust.name}</span>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <span>📞 {cust.phone}</span>
                                  {cust.email && <span>• ✉️ {cust.email}</span>}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Email (Optional)</label>
                        <Input
                          value={formData.customer_email}
                          onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                          placeholder="Email"
                          className="rounded-xl border-slate-200"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Delivery details edit */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Delivery Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Address</label>
                        <Textarea
                          value={formData.delivery_address}
                          onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })}
                          placeholder="Full Address"
                          className="rounded-xl border-slate-200 min-h-[70px]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Landmark</label>
                        <Input
                          value={formData.landmark}
                          onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                          placeholder="e.g. Near bus stand"
                          className="rounded-xl border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Delivery Notes</label>
                        <Textarea
                          value={formData.delivery_notes}
                          onChange={(e) => setFormData({ ...formData, delivery_notes: e.target.value })}
                          placeholder="Special instructions"
                          className="rounded-xl border-slate-200 min-h-[60px]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Estimated Delivery Date & Time</label>
                        <Input
                          type="datetime-local"
                          value={formData.estimated_delivery_time}
                          onChange={(e) => setFormData({ ...formData, estimated_delivery_time: e.target.value })}
                          className="rounded-xl border-slate-200"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Rider Name</label>
                          <Input
                            value={formData.delivery_person_name}
                            onChange={(e) => setFormData({ ...formData, delivery_person_name: e.target.value })}
                            placeholder="Rider Name"
                            className="rounded-xl border-slate-200"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Rider Phone</label>
                          <Input
                            value={formData.delivery_person_phone}
                            onChange={(e) => setFormData({ ...formData, delivery_person_phone: e.target.value })}
                            placeholder="Rider Phone"
                            className="rounded-xl border-slate-200"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Editor (Edit Mode) */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Products in Order
                      </h3>
                      <Badge className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/60 shadow-none font-semibold text-xs px-2.5 py-0.5">
                        {editedItems.length} {editedItems.length === 1 ? "Product" : "Products"}
                      </Badge>
                    </div>
                    <div className="overflow-x-auto rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800/80 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            <th className="p-3 pl-4">Product</th>
                            <th className="p-3 w-[100px]">Weight (kg)</th>
                            <th className="p-3 w-[90px]">Qty (units)</th>
                            <th className="p-3 w-[110px]">Price (Rs)</th>
                            <th className="p-3 w-[80px]">Disc (%)</th>
                            <th className="p-3 w-[160px]">Cutting & Notes</th>
                            <th className="p-3 text-right">Subtotal</th>
                            <th className="p-3 w-[45px] text-center"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                          {editedItems.map((item, idx) => {
                            const qty = item.weight_kg || item.quantity || 1;
                            const subtotalVal = item.subtotal != null ? Number(item.subtotal) : ((item.unit_price || 0) * qty);
                            
                            return (
                              <tr key={idx} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/10 transition-colors">
                                {/* Name column */}
                                <td className="p-3 pl-4">
                                  <div className="font-bold text-slate-900 dark:text-white leading-tight">
                                    {item.product_name_en}
                                  </div>
                                  {item.product_name_ta && (
                                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                                      {item.product_name_ta}
                                    </div>
                                  )}
                                </td>
                                
                                {/* Weight column */}
                                <td className="p-3">
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={item.weight_kg != null ? item.weight_kg : ""}
                                    onChange={(e) => {
                                      const val = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                                      updateItemField(idx, "weight_kg", val);
                                    }}
                                    className="h-8 rounded-xl border-slate-200 text-xs text-center px-1"
                                  />
                                </td>
                                
                                {/* Quantity column */}
                                <td className="p-3">
                                  <Input
                                    type="number"
                                    value={item.quantity != null ? item.quantity : ""}
                                    onChange={(e) => {
                                      const val = e.target.value === "" ? 0 : parseInt(e.target.value) || 0;
                                      updateItemField(idx, "quantity", val);
                                    }}
                                    className="h-8 rounded-xl border-slate-200 text-xs text-center px-1"
                                  />
                                </td>
                                
                                {/* Unit Price column */}
                                <td className="p-3">
                                  <Input
                                    type="number"
                                    value={item.unit_price != null ? item.unit_price : ""}
                                    onChange={(e) => {
                                      const val = e.target.value === "" ? 0 : parseFloat(e.target.value) || 0;
                                      updateItemField(idx, "unit_price", val);
                                    }}
                                    className="h-8 rounded-xl border-slate-200 text-xs px-2"
                                  />
                                </td>
                                
                                {/* Discount percentage column */}
                                <td className="p-3">
                                  <Input
                                    type="number"
                                    value={item.discount_percentage != null ? item.discount_percentage : ""}
                                    onChange={(e) => {
                                      const val = e.target.value === "" ? 0 : parseInt(e.target.value) || 0;
                                      updateItemField(idx, "discount_percentage", val);
                                    }}
                                    className="h-8 rounded-xl border-slate-200 text-xs text-center px-1"
                                  />
                                </td>
                                
                                {/* Cutting & Notes column */}
                                <td className="p-3 space-y-1">
                                  <Select
                                    value={item.cutting_option_id?.toString() || "none"}
                                    onValueChange={(val) => {
                                      if (val === "none") {
                                        updateItemField(idx, "cutting_option_id", null);
                                        updateItemField(idx, "cutting_option_name", null);
                                      } else {
                                        const opt = CUTTING_PREFERENCES.find(o => o.id.toString() === val);
                                        if (opt) {
                                          updateItemField(idx, "cutting_option_id", opt.id);
                                          updateItemField(idx, "cutting_option_name", opt.name_en);
                                        }
                                      }
                                    }}
                                  >
                                    <SelectTrigger className="w-full rounded-xl border-slate-200 text-[10px] h-7 px-2 focus:ring-0">
                                      <SelectValue placeholder="Cutting" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200 shadow-md">
                                      <SelectItem value="none">Default / None</SelectItem>
                                      {CUTTING_PREFERENCES.map(opt => (
                                        <SelectItem key={opt.id} value={opt.id.toString()}>
                                          {opt.name_en}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    value={item.special_instructions || ""}
                                    onChange={(e) => updateItemField(idx, "special_instructions", e.target.value)}
                                    placeholder="Note..."
                                    className="h-7 rounded-xl border-slate-200 text-[10px] px-2"
                                  />
                                </td>
                                
                                {/* Row Subtotal column */}
                                <td className="p-3 text-right font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                                  {formatCurrency(subtotalVal)}
                                </td>
                                
                                {/* Action column */}
                                <td className="p-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const list = editedItems.filter((_, i) => i !== idx);
                                      setEditedItems(list);
                                      recalculateTotals(list, formData.delivery_charge, formData.discount_amount);
                                    }}
                                    className="h-7 w-7 rounded-lg inline-flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border-0 bg-transparent cursor-pointer"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {editedItems.length === 0 && (
                        <div className="text-center py-8 text-slate-400 italic text-sm">
                          No products selected. Search and add products below.
                        </div>
                      )}
                    </div>

                    {/* Add Product Search Input */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 relative">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5 block">
                        Add Product to Order
                      </label>
                      <div className="relative">
                        <Input
                          placeholder="Search product by name..."
                          value={productSearch}
                          onChange={(e) => {
                            setProductSearch(e.target.value);
                            setShowProductDropdown(true);
                          }}
                          onFocus={() => setShowProductDropdown(true)}
                          className="rounded-xl border-slate-200 pr-9 h-9 text-sm"
                        />
                        <Search className="absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
                      </div>

                      {/* Dropdown list */}
                      {showProductDropdown && productSearch.trim() !== "" && (
                        <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg p-1.5 space-y-1">
                          {filteredProducts.length > 0 ? (
                            filteredProducts.map((prod) => (
                              <button
                                key={prod.id}
                                type="button"
                                onClick={() => {
                                  const alreadyInOrder = editedItems.find(item => item.product_id === prod.id);
                                  if (alreadyInOrder) {
                                    toast.error(`${prod.name_en} is already in the order.`);
                                    return;
                                  }
                                  
                                  const newItem = {
                                    product_id: prod.id,
                                    product_name_en: prod.name_en,
                                    product_name_ta: prod.name_ta,
                                    product_image: prod.primary_image || null,
                                    weight_kg: parseFloat(prod.min_order_quantity) || 1.0,
                                    quantity: 1,
                                    cutting_option_id: null,
                                    cutting_option_name: null,
                                    unit_price: parseFloat(prod.price_per_kg) || 0,
                                    discount_percentage: parseInt(prod.discount_percentage) || 0,
                                    subtotal: ((parseFloat(prod.price_per_kg) || 0) * (parseFloat(prod.min_order_quantity) || 1.0) * (1 - (parseInt(prod.discount_percentage) || 0) / 100)).toFixed(2),
                                    special_instructions: "",
                                  };
                                  
                                  const newList = [...editedItems, newItem];
                                  setEditedItems(newList);
                                  recalculateTotals(newList, formData.delivery_charge, formData.discount_amount);
                                  setProductSearch("");
                                  setShowProductDropdown(false);
                                  toast.success(`Added ${prod.name_en} to order!`);
                                }}
                                className="w-full flex items-center gap-3 p-2 rounded-lg text-left hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer border-0 bg-transparent"
                              >
                                {prod.primary_image ? (
                                  <img src={prod.primary_image} alt={prod.name_en} className="w-9 h-9 rounded-md object-cover border border-slate-100" />
                                ) : (
                                  <div className="w-9 h-9 rounded-md bg-slate-100 flex items-center justify-center"><ShoppingBag className="w-4 h-4 text-slate-400" /></div>
                                )}
                                <div>
                                  <div className="font-bold text-xs text-slate-900 dark:text-white leading-normal">{prod.name_en}</div>
                                  <div className="text-[10px] text-slate-400 font-medium leading-none">{prod.name_ta}</div>
                                  <div className="text-[10px] text-slate-500 font-bold mt-0.5">{formatCurrency(prod.price_per_kg)}/kg</div>
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="text-center py-3 text-xs text-slate-400 italic">No products match search term.</div>
                          )}
                        </div>
                      )}
                      
                      {showProductDropdown && productSearch.trim() === "" && (
                        <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-lg p-1.5 space-y-1">
                          <div className="text-center py-3 text-xs text-slate-400 italic">Type to search for products...</div>
                        </div>
                      )}

                      {/* Dropdown background click handler to close it */}
                      {showProductDropdown && (
                        <div 
                          className="fixed inset-0 z-40 bg-transparent" 
                          onClick={() => setShowProductDropdown(false)}
                        />
                      )}
                    </div>
                  </div>

                  {/* Pricing details edit */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Pricing & Costs
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Subtotal (Rs)</label>
                        <Input
                          type="number"
                          value={formData.subtotal}
                          onChange={(e) => setFormData({ ...formData, subtotal: e.target.value })}
                          className="rounded-xl border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Delivery (Rs)</label>
                        <Input
                          type="number"
                          value={formData.delivery_charge}
                          onChange={(e) => setFormData({ ...formData, delivery_charge: e.target.value })}
                          className="rounded-xl border-slate-200"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Discount (Rs)</label>
                        <Input
                          type="number"
                          value={formData.discount_amount}
                          onChange={(e) => setFormData({ ...formData, discount_amount: e.target.value })}
                          className="rounded-xl border-slate-200 text-emerald-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment edit */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Payment info
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Payment Method</label>
                        <Select
                          value={formData.payment_method}
                          onValueChange={(val) => setFormData({ ...formData, payment_method: val || "cod" })}
                        >
                          <SelectTrigger className="w-full rounded-xl border-slate-200">
                            <SelectValue placeholder="Method" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200 shadow-md">
                            <SelectItem value="cod">Cash on Delivery</SelectItem>
                            <SelectItem value="online">Online Payment</SelectItem>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Payment Status</label>
                        <Select
                          value={formData.payment_status}
                          onValueChange={(val) => setFormData({ ...formData, payment_status: val || "pending" })}
                        >
                          <SelectTrigger className="w-full rounded-xl border-slate-200">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-slate-200 shadow-md">
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                            <SelectItem value="refunded">Refunded</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Notes edit */}
                  <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Notes & Cancellations
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Admin Notes</label>
                        <Textarea
                          value={formData.admin_notes}
                          onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                          placeholder="Admin notes (not visible to customer)"
                          className="rounded-xl border-slate-200 min-h-[60px]"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1 block">Cancellation Reason</label>
                        <Input
                          value={formData.cancellation_reason}
                          onChange={(e) => setFormData({ ...formData, cancellation_reason: e.target.value })}
                          placeholder="Why was this order cancelled?"
                          className="rounded-xl border-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* ─── READ-ONLY VIEW MODE ─────────────────────────── */
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {/* Update Status Dropdown */}
                  <div className="px-6 py-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Update Status
                    </h4>
                    <Select
                      value={order.status || "pending"}
                      onValueChange={(val) => {
                      if (val) void handleStatusChange(val);
                    }}
                      disabled={saving}
                    >
                      <SelectTrigger className="w-full rounded-xl border-slate-200 bg-white dark:bg-slate-900 text-sm">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-md">
                        {ORDER_COLUMNS.map((col) => (
                          <SelectItem key={col.key} value={col.key}>
                            {col.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Customer Row */}
                  <div className="px-6 py-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Customer
                    </h4>
                    <DetailRow icon={User} label="Name" value={order.customer_name} />
                    <DetailRow icon={Phone} label="Phone" value={order.customer_phone} />
                    {order.customer_email && (
                      <DetailRow icon={User} label="Email" value={order.customer_email} />
                    )}
                  </div>

                  {/* Delivery Row */}
                  {(order.delivery_address || order.delivery_area_name) && (
                    <div className="px-6 py-5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Delivery
                      </h4>
                      <DetailRow icon={MapPin} label="Address" value={order.delivery_address} />
                      {order.landmark && (
                        <DetailRow icon={MapPin} label="Landmark" value={order.landmark} />
                      )}
                      {order.delivery_area_name && (
                        <DetailRow icon={Truck} label="Delivery Area" value={order.delivery_area_name} />
                      )}
                      {order.delivery_notes && (
                        <DetailRow icon={MessageSquare} label="Delivery Notes" value={order.delivery_notes} />
                      )}
                      {order.delivery_person_name && (
                        <DetailRow
                          icon={Truck}
                          label="Delivery Person"
                          value={`${order.delivery_person_name}${
                            order.delivery_person_phone
                              ? ` • ${order.delivery_person_phone}`
                              : ""
                          }`}
                        />
                      )}
                      {order.estimated_delivery_time && (
                        <DetailRow
                          icon={Clock}
                          label="Estimated Delivery"
                          value={formatDate(order.estimated_delivery_time)}
                        />
                      )}
                    </div>
                  )}

                  {/* Order Items Row */}
                  <div className="px-6 py-5">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Items Ordered
                      </h4>
                      <Badge className="bg-slate-100 text-slate-700 shadow-none border-0 text-xs">
                        {order.order_items?.length || 0} { (order.order_items?.length === 1) ? 'Item' : 'Items' }
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {order.order_items && order.order_items.length > 0 ? (
                        order.order_items.map((item, idx) => {
                          const qty = item.weight_kg || item.quantity || 1;
                          const total = item.subtotal != null ? Number(item.subtotal) : ((item.unit_price || 0) * qty);
                          return (
                            <div key={idx} className="flex items-start justify-between gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition-colors">
                              <div className="flex gap-3">
                                {item.product_image ? (
                                  <img 
                                    src={item.product_image} 
                                    alt={item.product_name_en} 
                                    className="w-12 h-12 rounded-xl object-cover border border-slate-200/60 shadow-sm"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center border border-blue-100 dark:border-blue-900">
                                    <ShoppingBag className="w-5 h-5 text-blue-500" />
                                  </div>
                                )}
                                <div className="space-y-1">
                                  <div className="font-bold text-sm text-slate-900 dark:text-white leading-tight">
                                    {item.product_name_en}
                                  </div>
                                  {item.product_name_ta && (
                                    <div className="text-xs text-slate-400 font-medium">
                                      {item.product_name_ta}
                                    </div>
                                  )}
                                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                                      {qty} {item.weight_kg ? 'kg' : 'qty'}
                                    </span>
                                    <span className="text-slate-300">•</span>
                                    <span>{formatCurrency(item.unit_price || 0)}</span>
                                    {item.cutting_option_name && (
                                      <>
                                        <span className="text-slate-300">•</span>
                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-semibold shadow-none rounded-md">
                                          {item.cutting_option_name}
                                        </Badge>
                                      </>
                                    )}
                                  </div>
                                  {item.special_instructions && (
                                    <div className="text-[11px] text-amber-600 dark:text-amber-500 bg-amber-50/40 dark:bg-amber-950/20 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-900/40 flex items-center gap-1 mt-1">
                                      <MessageSquare className="w-3 h-3 flex-shrink-0" />
                                      <span className="italic leading-normal font-medium">{item.special_instructions}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-sm text-slate-900 dark:text-white">
                                  {formatCurrency(total)}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-sm text-slate-400 italic text-center py-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                          No items in this order.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing Row */}
                  <div className="px-6 py-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Pricing
                    </h4>
                    <div className="space-y-2">
                      {order.subtotal != null && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Subtotal</span>
                          <span className="font-medium text-slate-700 dark:text-slate-350">
                            {formatCurrency(order.subtotal)}
                          </span>
                        </div>
                      )}
                      {(order.delivery_charge ?? 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Delivery Charge</span>
                          <span className="font-medium text-slate-700 dark:text-slate-350">
                            {formatCurrency(order.delivery_charge || 0)}
                          </span>
                        </div>
                      )}
                      {(order.discount_amount ?? 0) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500">Discount</span>
                          <span className="font-medium text-emerald-600 dark:text-emerald-500">
                            -{formatCurrency(order.discount_amount || 0)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2 text-sm">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Total</span>
                        <span className="font-bold text-slate-900 dark:text-white text-base">
                          {formatCurrency(order.total_amount || 0)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Row */}
                  <div className="px-6 py-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                      Payment
                    </h4>
                    <DetailRow
                      icon={CreditCard}
                      label="Method"
                      value={
                        order.payment_method
                          ? order.payment_method
                              .replace(/_/g, " ")
                              .replace(/\b\w/g, (c) => c.toUpperCase())
                          : "COD"
                      }
                    />
                    <DetailRow
                      icon={CreditCard}
                      label="Payment Status"
                      value={
                        <Badge
                          className={`${
                            paymentStatusColors[order.payment_status || "pending"]
                          } shadow-none capitalize text-xs`}
                        >
                          {order.payment_status || "pending"}
                        </Badge>
                      }
                    />
                  </div>

                  {/* Timeline Row */}
                  <div className="px-6 py-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Timeline
                    </h4>
                    <div className="space-y-0">
                      {[
                        { label: "Order Placed", date: order.created_at, color: "bg-blue-500" },
                        { label: "Confirmed", date: order.confirmed_at, color: "bg-cyan-500" },
                        { label: "Processing", date: order.processing_at, color: "bg-indigo-500" },
                        { label: "Delivered", date: order.delivered_at, color: "bg-emerald-500" },
                        { label: "Cancelled", date: order.cancelled_at, color: "bg-red-500" },
                      ]
                        .filter((item) => item.date)
                        .map((item, idx) => (
                          <div key={idx} className="flex gap-3 items-start py-2">
                            <div className="flex flex-col items-center mt-1">
                              <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                              <div className="w-px flex-1 bg-slate-200 dark:bg-slate-800 mt-1" />
                            </div>
                            <div className="pb-2">
                              <div className="text-sm font-semibold text-slate-700 dark:text-slate-350">
                                {item.label}
                              </div>
                              <div className="text-xs text-slate-400">
                                {formatDate(item.date)}
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Notes Row */}
                  {(order.admin_notes || order.cancellation_reason) && (
                    <div className="px-6 py-5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                        Notes
                      </h4>
                      {order.admin_notes && (
                        <DetailRow icon={MessageSquare} label="Admin Notes" value={order.admin_notes} />
                      )}
                      {order.cancellation_reason && (
                        <DetailRow icon={X} label="Cancellation Reason" value={order.cancellation_reason} />
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
