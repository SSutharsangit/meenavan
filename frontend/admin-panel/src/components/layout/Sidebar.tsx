"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Fish, 
  Grid3X3, 
  Package, 
  PlusCircle, 
  ShoppingBag, 
  ClipboardList, 
  Timer, 
  CheckCircle2, 
  MessageCircle, 
  Users, 
  Percent, 
  Image as ImageIcon, 
  Truck, 
  MapPin, 
  Wallet, 
  BarChart3, 
  Settings, 
  Building2, 
  ShieldCheck 
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminMenus = [
  {
    id: "dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/admin/dashboard",
  },
  {
    id: "products",
    icon: Fish,
    label: "Products",
    path: "/admin/products",
    subMenus: [
      { label: "All Products", path: "/admin/products", icon: Fish },
      { label: "Categories", path: "/admin/categories", icon: Grid3X3 },
      { label: "Stock", path: "/admin/stock", icon: Package },
    ],
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
      { label: "WhatsApp Orders", path: "/admin/orders/whatsapp", icon: MessageCircle },
    ],
  },
  {
    id: "customers",
    icon: Users,
    label: "Customers",
    path: "/admin/customers",
  },
  {
    id: "offers",
    icon: Percent,
    label: "Offers & Banners",
    path: "/admin/offers",
    subMenus: [
      { label: "Offers", path: "/admin/offers", icon: Percent },
      { label: "Hero Banners", path: "/admin/banners", icon: ImageIcon },
    ],
  },
  {
    id: "delivery",
    icon: Truck,
    label: "Delivery",
    path: "/admin/delivery",
    subMenus: [
      { label: "Delivery Areas", path: "/admin/delivery/areas", icon: MapPin },
      { label: "Charges", path: "/admin/delivery/charges", icon: Wallet },
    ],
  },
  {
    id: "reports",
    icon: BarChart3,
    label: "Reports",
    path: "/admin/reports",
    subMenus: [
      { label: "Sales Analytics", path: "/admin/reports/sales", icon: BarChart3 },
      { label: "Inventory Insights", path: "/admin/reports/inventory", icon: Package },
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
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  // Find the active primary menu based on the current pathname.
  const activeMenu = adminMenus.find(menu => {
    // Check if the current pathname matches the parent path exactly
    if (pathname === menu.path) return true;
    
    // Check if the current pathname matches any submenu path
    if (menu.subMenus?.some(sub => pathname.startsWith(sub.path))) {
      return true;
    }
    
    // Otherwise check if it starts with the parent path (for nested routes under the parent)
    // We only do this if it's not the root admin/dashboard to avoid matching everything
    if (menu.path !== "/admin/dashboard" && pathname.startsWith(menu.path)) {
      return true;
    }
    
    return false;
  }) || adminMenus[0]; // Default to first menu (Dashboard) if nothing matches

  const hasSubMenus = activeMenu.subMenus && activeMenu.subMenus.length > 0;

  return (
    <div className="flex h-full border-r border-slate-200">
      {/* Primary Sidebar */}
      <div className="w-24 bg-white flex flex-col items-center py-6 border-r border-slate-100 z-20 shrink-0">
        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
          <span className="text-xl font-bold">SG</span>
        </div>
        
        <nav className="flex-1 w-full space-y-2 flex flex-col items-center overflow-y-auto no-scrollbar pb-4">
          {adminMenus.map((menu) => {
            const isActive = activeMenu.id === menu.id;
            return (
              <Link
                key={menu.id}
                href={menu.path}
                className={cn(
                  "group relative flex flex-col items-center justify-center w-full py-4 transition-all",
                  isActive 
                    ? "text-blue-600" 
                    : "text-slate-500 hover:text-slate-800"
                )}
                title={menu.label}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
                )}
                <menu.icon className={cn("h-6 w-6 mb-1.5", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} strokeWidth={isActive ? 2.5 : 2} />
                <span className={cn(
                  "text-[11px] font-bold text-center leading-tight px-1",
                  isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                )}>
                  {menu.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile Avatar at bottom */}
        <div className="mt-auto pt-4 flex items-center justify-center w-full">
          <div className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm cursor-pointer hover:bg-slate-800 transition-colors">
            N
          </div>
        </div>
      </div>

      {/* Secondary Sidebar */}
      <div 
        className={cn(
          "bg-slate-50/50 flex flex-col z-10 transition-all duration-300 ease-in-out overflow-hidden",
          hasSubMenus ? "w-64 border-r border-slate-200" : "w-0 opacity-0 border-0"
        )}
      >
        <div className="pt-8 pb-6 px-8 shrink-0">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap">{activeMenu.label}</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto py-2 px-4 w-64">
          <nav className="space-y-1">
            {(activeMenu.subMenus || [{ label: activeMenu.label, path: activeMenu.path, icon: activeMenu.icon }]).map((sub) => {
              // Exact match or active sub path
              const isSubActive = pathname === sub.path || (pathname.startsWith(sub.path) && sub.path !== activeMenu.path);
              
              return (
                <Link
                  key={sub.label}
                  href={sub.path}
                  className={cn(
                    "relative flex items-center rounded-xl px-4 py-3 text-[14px] font-bold transition-colors w-full",
                    isSubActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                  )}
                >
                  {isSubActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full" />
                  )}
                  <sub.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
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
