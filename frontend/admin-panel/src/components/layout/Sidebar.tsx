"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Banknote,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardList,
  LayoutGrid,
  Layers,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Package,
  PackagePlus,
  Settings,
  ShoppingBag,
  Tag,
  Timer,
  TrendingUp,
  Users,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_PANEL_SHORT_NAME } from "@/lib/admin-config";
import { useBusinessSettings } from "@/providers/BusinessSettingsProvider";

const adminMenus = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/admin/dashboard",
  },
  {
    id: "pos",
    icon: Store,
    label: "POS",
    path: "/admin/pos",
  },
  {
    id: "customers",
    icon: Users,
    label: "Customers",
    path: "/admin/customers",
  },
  {
    id: "orders",
    icon: ShoppingBag,
    label: "Orders",
    path: "/admin/orders",
    subMenus: [
      { label: "All Orders", path: "/admin/orders", icon: ClipboardList },
      { label: "Pending", path: "/admin/orders/pending", icon: Timer },
      { label: "Completed", path: "/admin/orders/completed", icon: CheckCircle2 },
      { label: "Kanban View", path: "/admin/orders/kanban", icon: LayoutGrid },
    ],
  },
  {
    id: "products",
    icon: Package,
    label: "Products",
    path: "/admin/products",
    subMenus: [
      { label: "All Products", path: "/admin/products", icon: Package },
      { label: "Categories", path: "/admin/categories", icon: Tag },
      { label: "Product Groups", path: "/admin/product-groups", icon: PackagePlus },
    ],
  },
  {
    id: "reports",
    icon: BarChart3,
    label: "Reports",
    path: "/admin/reports",
    subMenus: [
      { label: "Sales", path: "/admin/reports/sales", icon: TrendingUp },
      { label: "Inventory", path: "/admin/reports/inventory", icon: Layers },
    ],
  },
  {
    id: "settings",
    icon: Settings,
    label: "Settings",
    path: "/admin/settings",
    subMenus: [
      { label: "Business Info", path: "/admin/settings/business", icon: Building2 },
      { label: "WhatsApp", path: "/admin/settings/whatsapp", icon: MessageCircle },
      { label: "Bill Templates", path: "/admin/settings/templates", icon: ClipboardList },
      { label: "Delivery Areas", path: "/admin/delivery/areas", icon: MapPin },
      { label: "Delivery Charges", path: "/admin/delivery/charges", icon: Banknote },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  const activeMenu =
    adminMenus.find((menu) => {
      if (pathname === menu.path) return true;

      if (menu.subMenus?.some((sub) => pathname.startsWith(sub.path))) {
        return true;
      }

      if (menu.path !== "/admin/dashboard" && pathname.startsWith(menu.path)) {
        return true;
      }

      return false;
    }) || adminMenus[0];

  const { settings } = useBusinessSettings();
  const hasSubMenus = activeMenu.subMenus && activeMenu.subMenus.length > 0;

  return (
    <div className="flex h-full border-r border-slate-200">
      <div className="z-20 flex w-24 shrink-0 flex-col items-center border-r border-slate-100 bg-white py-6">
        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden p-1 select-none">
          <img src="/meenavan_logo.png" alt="Meenavan Logo" className="h-full w-full object-contain" />
        </div>

        <nav className="no-scrollbar flex w-full flex-1 flex-col items-center space-y-2 overflow-y-auto pb-4">
          {adminMenus.map((menu) => {
            const isActive = activeMenu.id === menu.id;

            return (
              <Link
                key={menu.id}
                href={menu.path}
                className={cn(
                  "group relative flex w-full flex-col items-center justify-center py-4 transition-all",
                  isActive
                    ? "text-blue-600"
                    : "text-slate-500 hover:text-slate-800"
                )}
                title={menu.label}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-blue-600" />
                )}
                <menu.icon
                  className={cn(
                    "mb-1.5 h-6 w-6",
                    isActive
                      ? "text-blue-600"
                      : "text-slate-400 group-hover:text-slate-600"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={cn(
                    "px-1 text-center text-[11px] font-bold leading-tight",
                    isActive
                      ? "text-blue-600"
                      : "text-slate-400 group-hover:text-slate-600"
                  )}
                >
                  {menu.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex w-full items-center justify-center pt-4">
          <div className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white shadow-sm transition-colors hover:bg-slate-800">
            {ADMIN_PANEL_SHORT_NAME.slice(0, 1)}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "z-10 flex flex-col overflow-hidden bg-slate-50/50 transition-all duration-300 ease-in-out",
          hasSubMenus ? "w-64 border-r border-slate-200" : "w-0 border-0 opacity-0"
        )}
      >
        <div className="shrink-0 px-8 pb-6 pt-8">
          <h2 className="whitespace-nowrap text-xs font-bold uppercase tracking-widest text-slate-500">
            {activeMenu.label}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 w-64">
          <nav className="space-y-1">
            {(activeMenu.subMenus || [
              { label: activeMenu.label, path: activeMenu.path, icon: activeMenu.icon },
            ]).map((sub) => {
              const isSubActive =
                pathname === sub.path ||
                (pathname.startsWith(sub.path) && sub.path !== activeMenu.path);

              return (
                <Link
                  key={sub.label}
                  href={sub.path}
                  className={cn(
                    "relative flex w-full items-center rounded-xl px-4 py-3 text-[14px] font-bold transition-colors",
                    isSubActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:bg-slate-100/50 hover:text-slate-900"
                  )}
                >
                  {isSubActive && (
                    <div className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-blue-600" />
                  )}
                  <sub.icon
                    className={cn(
                      "mr-3 h-5 w-5 shrink-0",
                      isSubActive ? "text-blue-700" : "text-slate-400"
                    )}
                    strokeWidth={isSubActive ? 2.5 : 2}
                  />
                  {sub.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
