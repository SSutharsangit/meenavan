import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { ADMIN_PANEL_NAME } from "@/lib/admin-config";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: ADMIN_PANEL_NAME,
  description: "Reusable commerce operations admin panel",
};

import { BusinessSettingsProvider } from "@/providers/BusinessSettingsProvider";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} h-full antialiased font-sans`}
    >
      <body className="min-h-full flex flex-col">
        <BusinessSettingsProvider>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'rounded-xl shadow-xl border border-slate-100 bg-white text-slate-800 font-sans text-sm font-medium p-4',
              duration: 4000,
            }}
          />
        </BusinessSettingsProvider>
      </body>
    </html>
  );
}
