"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useBusinessSettings } from "@/providers/BusinessSettingsProvider";

const routeTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/pos": "POS Terminal",
  "/admin/customers": "Customers",
  "/admin/orders": "All Orders",
  "/admin/orders/pending": "Pending Orders",
  "/admin/orders/completed": "Completed Orders",
  "/admin/orders/kanban": "Kanban Board",
  "/admin/orders/whatsapp": "WhatsApp Orders",
  "/admin/products": "Products",
  "/admin/categories": "Categories",
  "/admin/product-groups": "Product Groups",
  "/admin/reports/sales": "Sales Report",
  "/admin/reports/inventory": "Inventory Report",
  "/admin/settings/business": "Business Settings",
  "/admin/settings/whatsapp": "WhatsApp Settings",
  "/admin/settings/templates": "Bill Templates",
  "/admin/delivery/areas": "Delivery Areas",
  "/admin/delivery/charges": "Delivery Charges",
};

export default function AdminMetadataUpdater() {
  const pathname = usePathname();
  const { settings } = useBusinessSettings();

  useEffect(() => {
    if (!pathname) return;

    // 1. Try to find the exact match in our predefined routeTitles
    let pageTitle = routeTitles[pathname];

    // 2. If no exact match, try prefix matching (e.g. nested detail pages)
    if (!pageTitle) {
      const sortedRoutes = Object.keys(routeTitles).sort((a, b) => b.length - a.length);
      const matchedRoute = sortedRoutes.find(route => pathname.startsWith(route));
      if (matchedRoute) {
        pageTitle = routeTitles[matchedRoute];
      }
    }

    // 3. Fallback to generating a title from the pathname segments
    if (!pageTitle) {
      const segments = pathname.split("/").filter(s => s && s !== "admin");
      if (segments.length > 0) {
        pageTitle = segments
          .map(s => s.charAt(0).toUpperCase() + s.slice(1).replace(/[-_]/g, " "))
          .join(" ");
      } else {
        pageTitle = "Admin";
      }
    }

    // 4. Update the browser document title
    const businessName = settings?.business_name || "Meenavan";
    document.title = `${pageTitle} | ${businessName}`;
  }, [pathname, settings?.business_name]);

  return null;
}
