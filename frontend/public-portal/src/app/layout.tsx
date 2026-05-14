import type { Metadata } from "next";
import { Lexend_Deca } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import WhatsAppFloat from "./components/WhatsAppFloat";

const lexendDeca = Lexend_Deca({
  subsets: ["latin"],
  variable: "--font-lexend",
});

export const metadata: Metadata = {
  title: {
    default: "Meenavan – Premium Fresh Seafood Delivery",
    template: "%s | Meenavan",
  },
  description: "Order the freshest seafood from Jaffna's finest coastal harbors. Premium fish, prawns, crabs & more delivered to your doorstep within hours.",
  keywords: ["seafood", "fish delivery", "fresh fish", "prawns", "Jaffna", "Sri Lanka", "Meenavan"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${lexendDeca.variable} antialiased font-sans bg-white text-slate-900 min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer />
        <WhatsAppFloat />
      </body>
    </html>
  );
}
