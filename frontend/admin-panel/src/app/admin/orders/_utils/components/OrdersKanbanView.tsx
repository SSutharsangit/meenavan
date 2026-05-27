"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import {
  CalendarDays,
  Clock,
  CreditCard,
  GripVertical,
  Loader2,
  MapPin,
  MessageSquare,
  Phone,
  RefreshCw,
  ShoppingBag,
  Truck,
  User,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/admin-config";
import {
  apiGetAllOrders,
  apiUpdateOrderStatus,
} from "../api-service";
import OrderDetailSidebar from "./OrderDetailSidebar";
import DatePicker from "@/components/common/DatePicker";

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
}

const ORDER_COLUMNS = [
  {
    key: "pending",
    label: "Pending",
    gradient: "from-amber-500 to-orange-500",
    lightBg: "bg-amber-50",
    dotColor: "bg-amber-400",
  },
  {
    key: "confirmed",
    label: "Confirmed",
    gradient: "from-blue-500 to-cyan-500",
    lightBg: "bg-blue-50",
    dotColor: "bg-blue-400",
  },
  {
    key: "processing",
    label: "Processing",
    gradient: "from-indigo-500 to-violet-500",
    lightBg: "bg-indigo-50",
    dotColor: "bg-indigo-400",
  },
  {
    key: "out_for_delivery",
    label: "Out for Delivery",
    gradient: "from-purple-500 to-fuchsia-500",
    lightBg: "bg-purple-50",
    dotColor: "bg-purple-400",
  },
  {
    key: "delivered",
    label: "Delivered",
    gradient: "from-emerald-500 to-teal-500",
    lightBg: "bg-emerald-50",
    dotColor: "bg-emerald-400",
  },
  {
    key: "cancelled",
    label: "Cancelled",
    gradient: "from-red-500 to-rose-500",
    lightBg: "bg-red-50",
    dotColor: "bg-red-400",
  },
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



export default function OrdersKanbanView() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [draggedOrder, setDraggedOrder] = useState<OrderItem | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const dragCounter = useRef<Record<string, number>>({});

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // Helper to calculate before 7 days and next 7 days date range (14 days gap)
  const getInitialDates = () => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 7);
    const end = new Date(today);
    end.setDate(today.getDate() + 7);
    return {
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
    };
  };

  const initialRange = getInitialDates();
  const [startDate, setStartDate] = useState<string>(initialRange.start_date);
  const [endDate, setEndDate] = useState<string>(initialRange.end_date);



  const getActiveRangeDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  const fetchOrders = async (start = startDate, end = endDate) => {
    try {
      setLoading(true);
      const filters: any = { per_page: 100 };
      if (start) filters.start_date = start;
      if (end) filters.end_date = end;
      
      const res = await apiGetAllOrders(1, filters);
      if (res.is_success) {
        setOrders(res.result.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      void fetchOrders(startDate, endDate);
    }, 0);
    return () => clearTimeout(timeout);
  }, [startDate, endDate]);

  const handleStatusChange = useCallback(
    async (orderId: number, newStatus: string) => {
      const updatePromise = (async () => {
        const res = await apiUpdateOrderStatus(orderId, newStatus);
        if (!res.is_success) {
          throw new Error(res.message || "Failed to update order status");
        }
        return res;
      })();

      toast.promise(updatePromise, {
        loading: `Moving order to ${newStatus}...`,
        success: `Order successfully moved to ${newStatus}!`,
        error: (err: any) => err.message || "Failed to update order status."
      });

      try {
        setUpdatingId(orderId);
        await updatePromise;
        setOrders((current) =>
          current.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } catch (error) {
        console.error(error);
      } finally {
        setUpdatingId(null);
      }
    },
    []
  );

  // ─── Open sidebar ─────────────────────────────────────────
  const openOrderSidebar = (order: OrderItem) => {
    setSelectedOrderId(order.id);
    setSidebarOpen(true);
  };

  // ─── Drag & Drop handlers ────────────────────────────────
  const handleDragStart = (e: React.DragEvent, order: OrderItem) => {
    setDraggedOrder(order);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", order.id.toString());
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.4";
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1";
    }
    setDraggedOrder(null);
    setDragOverColumn(null);
    dragCounter.current = {};
  };

  const handleDragEnter = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    dragCounter.current[columnKey] = (dragCounter.current[columnKey] || 0) + 1;
    setDragOverColumn(columnKey);
  };

  const handleDragLeave = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    dragCounter.current[columnKey] = (dragCounter.current[columnKey] || 0) - 1;
    if (dragCounter.current[columnKey] <= 0) {
      dragCounter.current[columnKey] = 0;
      if (dragOverColumn === columnKey) {
        setDragOverColumn(null);
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    dragCounter.current = {};
    if (draggedOrder && (draggedOrder.status || "pending") !== columnKey) {
      void handleStatusChange(draggedOrder.id, columnKey);
    }
    setDraggedOrder(null);
  };

  // ─── Grouped orders ──────────────────────────────────────
  const groupedOrders = ORDER_COLUMNS.reduce<Record<string, OrderItem[]>>(
    (acc, column) => {
      acc[column.key] = orders.filter(
        (order) => (order.status || "pending") === column.key
      );
      return acc;
    },
    {}
  );

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Orders Kanban View
          </h1>
          <p className="mt-1 font-medium text-slate-500">
            Drag &amp; drop orders between columns to update status instantly.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl border-slate-200"
          onClick={() => void fetchOrders()}
          disabled={loading}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Date Filters: Before 7 and Next 7 Days (14 Days Range) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:px-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
              <CalendarDays className="h-5 w-5 shrink-0" />
            </div>
            <div>
              <span className="font-bold text-slate-800 text-sm block">Date Range Filter</span>
              <span className="text-xs text-slate-500">Filters orders inside a 14-day dynamic gap</span>
            </div>
          </div>
          <div className="flex items-center gap-2 relative z-30">
            <DatePicker
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
              className="w-40"
            />
            <span className="text-slate-400 mt-4 px-1 font-semibold">—</span>
            <DatePicker
              label="End Date"
              value={endDate}
              onChange={setEndDate}
              className="w-40"
              align="right"
            />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => {
              const range = getInitialDates();
              setStartDate(range.start_date);
              setEndDate(range.end_date);
              toast.success("Filters reset to default 14-day gap!");
            }}
            className="text-xs text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100/80 px-3 font-semibold h-9"
          >
            Reset Range
          </Button>
          <div className="h-5 w-px bg-slate-200"></div>
          <Badge className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-50 font-semibold px-3 py-1.5 rounded-xl text-xs pointer-events-none shadow-sm transition-all duration-200">
            Active Filter Range: {getActiveRangeDays()} {getActiveRangeDays() === 1 ? 'Day' : 'Days'}
          </Badge>
        </div>
      </div>

      {/* Board */}
      {loading ? (
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {ORDER_COLUMNS.map((column) => {
            const isOver =
              dragOverColumn === column.key &&
              draggedOrder &&
              (draggedOrder.status || "pending") !== column.key;

            return (
              <section
                key={column.key}
                className={`flex min-w-[280px] max-w-[320px] flex-1 flex-col rounded-2xl border transition-all duration-200 ${
                  isOver
                    ? "border-blue-400 bg-blue-50/40 shadow-lg shadow-blue-100 ring-2 ring-blue-300/50"
                    : "border-slate-200 bg-white shadow-sm"
                }`}
                onDragEnter={(e) => handleDragEnter(e, column.key)}
                onDragLeave={(e) => handleDragLeave(e, column.key)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.key)}
              >
                {/* Column header with gradient accent */}
                <div className="relative overflow-hidden rounded-t-2xl border-b border-slate-100 px-5 py-4">
                  <div
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${column.gradient}`}
                  />
                  <div className="flex items-center justify-between gap-3 pt-1">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`inline-block h-2.5 w-2.5 rounded-full ${column.dotColor}`}
                      />
                      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">
                        {column.label}
                      </h2>
                    </div>
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-600 shadow-none"
                    >
                      {groupedOrders[column.key]?.length || 0}
                    </Badge>
                  </div>
                </div>

                {/* Drop zone indicator */}
                <AnimatePresence>
                  {isOver && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 48 }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mx-4 mt-3 flex items-center justify-center rounded-xl border-2 border-dashed border-blue-400 bg-blue-50 text-xs font-semibold text-blue-600"
                    >
                      Drop here to move
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Cards area */}
                <div
                  className="flex-1 space-y-3 overflow-y-auto p-4"
                  style={{ maxHeight: "calc(100vh - 260px)" }}
                >
                  {groupedOrders[column.key]?.length ? (
                    <AnimatePresence mode="popLayout">
                      {groupedOrders[column.key].map((order) => (
                        <motion.article
                          key={order.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{
                            opacity: updatingId === order.id ? 0.5 : 1,
                            y: 0,
                          }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{
                            layout: {
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            },
                            opacity: { duration: 0.2 },
                          }}
                          draggable
                          onDragStart={(e) =>
                            handleDragStart(
                              e as unknown as React.DragEvent,
                              order
                            )
                          }
                          onDragEnd={(e) =>
                            handleDragEnd(e as unknown as React.DragEvent)
                          }
                          onClick={() => void openOrderSidebar(order)}
                          className={`group relative cursor-grab rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md active:cursor-grabbing ${
                            draggedOrder?.id === order.id
                              ? "border-blue-300 ring-2 ring-blue-200"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {/* Grip handle + order number */}
                          <div className="flex items-center gap-2 mb-3">
                            <GripVertical className="h-4 w-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
                            <span className="font-mono text-xs font-bold text-blue-600 tracking-wide">
                              {order.order_number}
                            </span>
                          </div>

                          {/* Customer info */}
                          <div className="space-y-2.5">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100">
                                <User className="h-4 w-4 text-slate-500" />
                              </div>
                              <h3 className="text-sm font-semibold text-slate-900 leading-tight">
                                {order.customer_name}
                              </h3>
                            </div>

                            <div className="flex items-center gap-2 text-xs text-slate-500">
                              <Phone className="h-3.5 w-3.5 shrink-0" />
                              <span>{order.customer_phone}</span>
                            </div>

                            {/* Amount + date row */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              <div className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                                <ShoppingBag className="h-3.5 w-3.5 text-slate-400" />
                                {formatCurrency(order.total_amount || 0)}
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                <CalendarDays className="h-3 w-3" />
                                {order.created_at
                                  ? new Date(
                                      order.created_at
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : "-"}
                              </div>
                            </div>
                          </div>

                          {/* Loading overlay */}
                          {updatingId === order.id && (
                            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm">
                              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                            </div>
                          )}
                        </motion.article>
                      ))}
                    </AnimatePresence>
                  ) : (
                    <div className="flex h-full min-h-32 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 text-center text-sm text-slate-400">
                      No orders here
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <OrderDetailSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        orderId={selectedOrderId}
        onOrderUpdated={fetchOrders}
        initialEditMode={true}
      />
    </div>
  );
}
