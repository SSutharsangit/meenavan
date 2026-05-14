import { BUSINESS } from "../data";
import type { CartItem } from "../store/cartStore";

interface WhatsAppOrderData {
  items: CartItem[];
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  deliverySlot?: string;
  paymentMethod?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  offerCode?: string;
}

/**
 * Generates a formatted WhatsApp message for an order
 */
export function generateOrderMessage(data: WhatsAppOrderData): string {
  const lines: string[] = [];

  lines.push("*MEENAVAN | \u0BAE\u0BC0\u0BA9\u0BB5\u0BA9\u0BCD*");
  lines.push("*New Order*");
  lines.push("---");
  lines.push("");

  // Customer details
  if (data.customerName) {
    lines.push("*Customer:* " + data.customerName);
  }
  if (data.customerPhone) {
    lines.push("*Phone:* " + data.customerPhone);
  }
  if (data.deliveryAddress) {
    lines.push("*Address:* " + data.deliveryAddress);
  }
  if (data.deliverySlot) {
    lines.push("*Delivery Slot:* " + data.deliverySlot);
  }
  lines.push("");

  // Order items
  lines.push("*Order Items:*");
  lines.push("---");
  data.items.forEach((item, i) => {
    lines.push((i + 1) + ". " + item.name + " (" + item.nameTA + ")");
    lines.push("   " + item.quantity + " x Rs. " + item.price + " = *Rs. " + (item.price * item.quantity) + "*");
    lines.push("   " + item.unit);
  });
  lines.push("");

  // Price breakdown
  lines.push("---");
  lines.push("Subtotal: Rs. " + data.subtotal);
  lines.push("Delivery: " + (data.deliveryFee === 0 ? "FREE" : "Rs. " + data.deliveryFee));
  if (data.offerCode) {
    lines.push("Coupon: " + data.offerCode);
  }
  lines.push("---");
  lines.push("*Total: Rs. " + data.total + "*");
  lines.push("");

  // Payment method
  if (data.paymentMethod) {
    lines.push("*Payment:* " + data.paymentMethod);
  }
  lines.push("");
  lines.push("Thank you for ordering from Meenavan!");

  return lines.join("\n");
}

/**
 * Generates a WhatsApp message for a single product inquiry
 */
export function generateProductMessage(product: {
  name: string;
  nameTA: string;
  price: number;
  unit: string;
}): string {
  const lines = [
    "Hi Meenavan!",
    "",
    "I'm interested in ordering:",
    "*" + product.name + "* (" + product.nameTA + ")",
    "Rs. " + product.price + " / " + product.unit,
    "",
    "Please let me know about availability and delivery. Thank you!",
  ];
  return lines.join("\n");
}

/**
 * Opens WhatsApp with a pre-filled message
 */
export function openWhatsApp(message: string): void {
  const encoded = encodeURIComponent(message);
  const url = "https://wa.me/" + BUSINESS.whatsapp + "?text=" + encoded;
  window.open(url, "_blank");
}

/**
 * Opens WhatsApp with order details
 */
export function sendOrderViaWhatsApp(data: WhatsAppOrderData): void {
  const message = generateOrderMessage(data);
  openWhatsApp(message);
}

/**
 * Opens WhatsApp with a product inquiry
 */
export function sendProductInquiry(product: {
  name: string;
  nameTA: string;
  price: number;
  unit: string;
}): void {
  const message = generateProductMessage(product);
  openWhatsApp(message);
}

/**
 * Opens WhatsApp with a generic greeting
 */
export function openWhatsAppChat(): void {
  openWhatsApp("Hi Meenavan! I'd like to place an order.");
}
