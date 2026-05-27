export interface BillTemplate {
  id: number;
  name: string;
  printer_type: "Thermal" | "Standard";
  json: {
    name: string;
    sections: any[];
    printer_type: string;
    printer_config: {
      max_label_width: number;
      max_label_height: number;
    };
  };
}

export const DEFAULT_TEMPLATES: BillTemplate[] = [
  {
    id: 1,
    name: "SALES Bill Layout Free QTY",
    printer_type: "Thermal",
    json: {
      name: "SALES Bill Layout Free QTY",
      sections: [
        {
          id: "header-title",
          type: "row",
          style: {
            padding: "5px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%"
          },
          children: [
            {
              id: "logo-placeholder",
              type: "text",
              style: {
                textAlign: "center",
                marginBottom: "5px"
              },
              placeholder: "{{businessLogo}}"
            },
            {
              id: "dept-name",
              type: "text",
              style: {
                fontSize: "24px",
                textAlign: "center",
                fontWeight: "bold"
              },
              placeholder: "{{shopName}}"
            }
          ]
        },
        {
          id: "info-top-border",
          type: "row",
          style: {
            borderTop: "1.5px solid #000",
            marginTop: "5px",
            marginBottom: "5px"
          },
          children: []
        },
        {
          id: "bill-date-row",
          type: "row",
          style: {
            width: "100%",
            display: "flex",
            padding: "2px 0",
            justifyContent: "space-between"
          },
          children: [
            {
              type: "text",
              style: {
                fontSize: "22px",
                fontWeight: "bold"
              },
              placeholder: "Bill No: {{billNumber}}"
            },
            {
              type: "text",
              style: {
                fontSize: "22px",
                fontWeight: "bold"
              },
              placeholder: "Date: {{transactionDate}}"
            }
          ]
        },
        {
          id: "cashier-time-row-1",
          type: "row",
          style: {
            width: "100%",
            display: "flex",
            padding: "2px 0",
            justifyContent: "space-between"
          },
          children: [
            {
              type: "text",
              style: {
                fontSize: "22px",
                fontWeight: "bold"
              },
              placeholder: "Cashier: {{cashierName}}"
            }
          ]
        },
        {
          id: "cashier-time-row-2",
          type: "row",
          style: {
            width: "100%",
            display: "flex",
            padding: "2px 0",
            justifyContent: "space-between"
          },
          children: [
            {
              type: "text",
              style: {
                fontSize: "22px",
                fontWeight: "bold"
              },
              placeholder: "Time: {{time}}"
            }
          ]
        },
        {
          id: "info-bottom-border",
          type: "row",
          style: {
            borderTop: "1.5px solid #000",
            marginTop: "5px",
            marginBottom: "5px"
          },
          children: []
        },
        {
          id: "table-header",
          type: "row",
          style: {
            width: "100%",
            display: "flex",
            padding: "4px 0",
            borderBottom: "1.5px solid #000",
            justifyContent: "space-between"
          },
          children: [
            {
              type: "text",
              style: {
                width: "10%",
                fontSize: "20px",
                fontWeight: "bold"
              },
              placeholder: "No"
            },
            {
              type: "text",
              style: {
                width: "30%",
                fontSize: "20px",
                fontWeight: "bold"
              },
              placeholder: "Item"
            },
            {
              type: "text",
              style: {
                width: "10%",
                fontSize: "20px",
                textAlign: "right",
                fontWeight: "bold"
              },
              placeholder: "Qty"
            },
            {
              type: "text",
              style: {
                width: "15%",
                fontSize: "20px",
                textAlign: "right",
                fontWeight: "bold"
              },
              placeholder: "Free"
            },
            {
              type: "text",
              style: {
                width: "15%",
                fontSize: "20px",
                textAlign: "right",
                fontWeight: "bold"
              },
              placeholder: "Price"
            },
            {
              type: "text",
              style: {
                width: "20%",
                fontSize: "24px",
                textAlign: "right",
                fontWeight: "bold"
              },
              placeholder: "Total"
            }
          ]
        },
        {
          id: "items-list",
          type: "row",
          style: {
            width: "100%",
            padding: "5px 0"
          },
          children: [
            {
              id: "items",
              key: [
                "no",
                "name",
                "qty",
                "free_qty",
                "price",
                "discount",
                "total"
              ],
              type: "items",
              style: {
                width: "100%",
                fontSize: "20px"
              },
              placeholder: "{{items}}"
            }
          ]
        },
        {
          id: "totals-border",
          type: "row",
          style: {
            borderTop: "1.5px solid #000",
            marginTop: "5px",
            marginBottom: "10px"
          },
          children: []
        },
        {
          id: "net-total-row",
          type: "row",
          style: {
            width: "100%",
            display: "flex",
            padding: "4px 0",
            justifyContent: "space-between"
          },
          children: [
            {
              type: "text",
              style: {
                fontSize: "24px",
                fontWeight: "bold"
              },
              placeholder: "Net Total"
            },
            {
              type: "text",
              style: {
                fontSize: "24px",
                fontWeight: "bold"
              },
              placeholder: "{{totalAmount}}"
            }
          ]
        },
        {
          id: "discount-row",
          type: "row",
          style: {
            width: "100%",
            display: "flex",
            padding: "2px 0",
            justifyContent: "space-between"
          },
          children: [
            {
              type: "text",
              style: {
                fontSize: "24px"
              },
              placeholder: "Total Discount"
            },
            {
              type: "text",
              style: {
                fontSize: "24px"
              },
              placeholder: "{{totalDiscount}}"
            }
          ]
        },
        {
          id: "shipping-row",
          type: "row",
          style: {
            width: "100%",
            display: "flex",
            padding: "2px 0",
            justifyContent: "space-between"
          },
          children: [
            {
              type: "text",
              style: {
                fontSize: "24px"
              },
              placeholder: "Shipping Fee"
            },
            {
              type: "text",
              style: {
                fontSize: "24px"
              },
              placeholder: "{{shippingFee}}"
            }
          ]
        },
        {
          id: "received-row",
          type: "row",
          style: {
            width: "100%",
            display: "flex",
            padding: "2px 0",
            justifyContent: "space-between"
          },
          children: [
            {
              type: "text",
              style: {
                fontSize: "24px"
              },
              placeholder: "Received Amount"
            },
            {
              type: "text",
              style: {
                fontSize: "24px"
              },
              placeholder: "{{lastPaymentReceived}}"
            }
          ]
        },
        {
          id: "wallet-row",
          type: "row",
          style: {
            width: "100%",
            display: "flex",
            padding: "2px 0",
            justifyContent: "space-between"
          },
          children: [
            {
              type: "text",
              style: {
                fontSize: "24px"
              },
              placeholder: "Wallet"
            },
            {
              type: "text",
              style: {
                fontSize: "24px"
              },
              placeholder: "{{lastAmountWallet}}"
            }
          ]
        },
        {
          id: "balance-row",
          type: "row",
          style: {
            width: "100%",
            display: "flex",
            padding: "2px 0",
            justifyContent: "space-between"
          },
          children: [
            {
              type: "text",
              style: {
                fontSize: "24px"
              },
              placeholder: "Balance"
            },
            {
              type: "text",
              style: {
                fontSize: "24px"
              },
              placeholder: "{{lastPaymentBalance}}"
            }
          ]
        },
        {
          id: "footer-spacing",
          type: "row",
          style: {
            height: "20px"
          },
          children: []
        },
        {
          id: "footer",
          type: "row",
          style: {
            textAlign: "center"
          },
          children: [
            {
              id: "thankyou",
              type: "text",
              style: {
                color: "#666",
                fontSize: "24px",
                textAlign: "center"
              },
              placeholder: "Thank you | Powered by {{brandName}}"
            }
          ]
        }
      ],
      printer_type: "Thermal",
      printer_config: {
        max_label_width: 540,
        max_label_height: 0
      }
    }
  },
  {
    id: 2,
    name: "Elegant Minimalist Receipt",
    printer_type: "Thermal",
    json: {
      name: "Elegant Minimalist Receipt",
      sections: [
        {
          id: "header",
          type: "row",
          style: { textAlign: "center", paddingBottom: "10px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%" },
          children: [
            {
              type: "text",
              style: { textAlign: "center", marginBottom: "5px" },
              placeholder: "{{businessLogo}}"
            },
            {
              type: "text",
              style: { fontSize: "28px", fontWeight: "bold", letterSpacing: "1px" },
              placeholder: "{{shopName}}"
            }
          ]
        },
        {
          id: "divider-1",
          type: "row",
          style: { borderTop: "1px dashed #444", marginBottom: "8px" },
          children: []
        },
        {
          id: "meta-row-1",
          type: "row",
          style: { display: "flex", justifyContent: "space-between", fontSize: "18px" },
          children: [
            { type: "text", style: {}, placeholder: "Invoice #{{billNumber}}" },
            { type: "text", style: {}, placeholder: "{{transactionDate}}" }
          ]
        },
        {
          id: "divider-2",
          type: "row",
          style: { borderTop: "1px dashed #444", marginTop: "8px", marginBottom: "8px" },
          children: []
        },
        {
          id: "items-list",
          type: "row",
          style: { width: "100%" },
          children: [
            {
              id: "items",
              key: ["no", "name", "qty", "price", "discount", "total"],
              type: "items",
              style: { width: "100%", fontSize: "18px" },
              placeholder: "{{items}}"
            }
          ]
        },
        {
          id: "divider-3",
          type: "row",
          style: { borderTop: "1.5px solid #000", marginTop: "12px", marginBottom: "8px" },
          children: []
        },
        {
          id: "total-row",
          type: "row",
          style: { display: "flex", justifyContent: "space-between", fontWeight: "bold" },
          children: [
            { type: "text", style: { fontSize: "22px" }, placeholder: "TOTAL" },
            { type: "text", style: { fontSize: "22px" }, placeholder: "{{totalAmount}}" }
          ]
        },
        {
          id: "footer",
          type: "row",
          style: { textAlign: "center", marginTop: "30px" },
          children: [
            {
              type: "text",
              style: { fontSize: "16px", fontStyle: "italic" },
              placeholder: "Thank you for shopping with us! 🐠"
            }
          ]
        }
      ],
      printer_type: "Thermal",
      printer_config: {
        max_label_width: 440,
        max_label_height: 0
      }
    }
  },
  {
    id: 3,
    name: "Eco Compact Receipt",
    printer_type: "Thermal",
    json: {
      name: "Eco Compact Receipt",
      sections: [
        {
          id: "header",
          type: "row",
          style: { textAlign: "center", paddingBottom: "4px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%" },
          children: [
            {
              type: "text",
              style: { textAlign: "center", marginBottom: "3px" },
              placeholder: "{{businessLogo}}"
            },
            {
              type: "text",
              style: { fontSize: "20px", fontWeight: "bold" },
              placeholder: "{{shopName}}"
            }
          ]
        },
        {
          id: "meta",
          type: "row",
          style: { fontSize: "14px", textAlign: "center" },
          children: [
            { type: "text", style: {}, placeholder: "{{billNumber}} | {{transactionDate}}" }
          ]
        },
        {
          id: "divider",
          type: "row",
          style: { borderTop: "1px dotted #888", margin: "4px 0" },
          children: []
        },
        {
          id: "items-list",
          type: "row",
          style: { width: "100%" },
          children: [
            {
              id: "items",
              key: ["name", "qty", "price", "discount", "total"],
              type: "items",
              style: { width: "100%", fontSize: "14px" },
              placeholder: "{{items}}"
            }
          ]
        },
        {
          id: "divider-2",
          type: "row",
          style: { borderTop: "1px dotted #888", margin: "4px 0" },
          children: []
        },
        {
          id: "total",
          type: "row",
          style: { display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "16px" },
          children: [
            { type: "text", style: {}, placeholder: "Due amount:" },
            { type: "text", style: {}, placeholder: "{{totalAmount}}" }
          ]
        },
        {
          id: "footer",
          type: "row",
          style: { textAlign: "center", fontSize: "12px", marginTop: "15px" },
          children: [
            { type: "text", style: {}, placeholder: "Save paper, save trees." }
          ]
        }
      ],
      printer_type: "Thermal",
      printer_config: {
        max_label_width: 320,
        max_label_height: 0
      }
    }
  },
  {
    id: 4,
    name: "Premium Business Invoice",
    printer_type: "Standard",
    json: {
      name: "Premium Business Invoice",
      sections: [
        {
          id: "invoice-header",
          type: "row",
          style: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingBottom: "20px", borderBottom: "3px solid #3b82f6", width: "100%" },
          children: [
            {
              type: "text",
              style: { textAlign: "center", marginBottom: "5px" },
              placeholder: "{{businessLogo}}"
            },
            {
              type: "text",
              style: { fontSize: "36px", fontWeight: "bold", color: "#1e3a8a", textAlign: "center" },
              placeholder: "{{shopName}}"
            },
            {
              type: "text",
              style: { fontSize: "20px", fontWeight: "bold", color: "#64748b", marginTop: "5px", textTransform: "uppercase", letterSpacing: "2px" },
              placeholder: "TAX INVOICE"
            }
          ]
        },
        {
          id: "invoice-meta-grid",
          type: "row",
          style: { display: "flex", justifyContent: "space-between", marginTop: "24px" },
          children: [
            {
              type: "text",
              style: { fontSize: "14px", lineHeight: "1.6" },
              placeholder: "Invoice ID: <strong>{{billNumber}}</strong><br>Date: {{transactionDate}}<br>Agent: {{cashierName}}"
            },
            {
              type: "text",
              style: { fontSize: "14px", textAlign: "right", lineHeight: "1.6" },
              placeholder: "Payment Method: <span style='text-transform: uppercase;'><strong>{{paymentMethod}}</strong></span><br>Time: {{time}}"
            }
          ]
        },
        {
          id: "divider-line",
          type: "row",
          style: { borderTop: "1px solid #e2e8f0", marginTop: "20px", marginBottom: "20px" },
          children: []
        },
        {
          id: "items-table",
          type: "row",
          style: { width: "100%" },
          children: [
            {
              id: "items",
              key: ["no", "name", "qty", "price", "discount", "total"],
              type: "items",
              style: { width: "100%", fontSize: "14px" },
              placeholder: "{{items}}"
            }
          ]
        },
        {
          id: "totals-grid",
          type: "row",
          style: { display: "flex", justifyContent: "flex-end", marginTop: "24px" },
          children: [
            {
              type: "text",
              style: { width: "300px", lineHeight: "2" },
              placeholder: "<div style='display:flex; justify-content:space-between; border-bottom:1px solid #f1f5f9;'><span>Subtotal:</span><span>{{subtotal}}</span></div><div style='display:flex; justify-content:space-between; border-bottom:1px solid #f1f5f9;'><span>Shipping Fee:</span><span>{{shippingFee}}</span></div><div style='display:flex; justify-content:space-between; border-bottom:1px solid #f1f5f9; color:#10b981;'><span>Discount:</span><span>-{{totalDiscount}}</span></div><div style='display:flex; justify-content:space-between; font-size:18px; font-weight:bold; color:#1e3a8a; margin-top:8px;'><span>TOTAL DUE:</span><span>{{totalAmount}}</span></div>"
            }
          ]
        },
        {
          id: "footer",
          type: "row",
          style: { marginTop: "50px", textAlign: "center", borderTop: "1px solid #e2e8f0", paddingTop: "20px", color: "#94a3b8", fontSize: "12px" },
          children: [
            {
              type: "text",
              style: {},
              placeholder: "Thank you for doing business with {{shopName}}! Powered by {{brandName}}."
            }
          ]
        }
      ],
      printer_type: "Standard",
      printer_config: {
        max_label_width: 800,
        max_label_height: 0
      }
    }
  },
  {
    id: 5,
    name: "Retail Delivery Slip",
    printer_type: "Standard",
    json: {
      name: "Retail Delivery Slip",
      sections: [
        {
          id: "title-row",
          type: "row",
          style: { textAlign: "center", paddingBottom: "15px", borderBottom: "2px dashed #000", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%" },
          children: [
            {
              type: "text",
              style: { textAlign: "center", marginBottom: "5px" },
              placeholder: "{{businessLogo}}"
            },
            {
              type: "text",
              style: { fontSize: "28px", fontWeight: "bold" },
              placeholder: "DELIVERY PACKING SLIP"
            }
          ]
        },
        {
          id: "details-row",
          type: "row",
          style: { display: "flex", justifyContent: "space-between", marginTop: "16px" },
          children: [
            {
              type: "text",
              style: { fontSize: "14px", lineHeight: "1.6" },
              placeholder: "<strong>Order #:</strong> {{billNumber}}<br><strong>Date:</strong> {{transactionDate}}"
            },
            {
              type: "text",
              style: { fontSize: "14px", lineHeight: "1.6" },
              placeholder: "<strong>Delivery Agent:</strong> {{cashierName}}"
            }
          ]
        },
        {
          id: "items-title",
          type: "row",
          style: { marginTop: "24px", fontWeight: "bold", borderBottom: "1px solid #000", paddingBottom: "4px" },
          children: [
            { type: "text", style: { fontSize: "16px" }, placeholder: "Packaged Items" }
          ]
        },
        {
          id: "items-list",
          type: "row",
          style: { width: "100%", marginTop: "8px" },
          children: [
            {
              id: "items",
              key: ["no", "name", "qty"],
              type: "items",
              style: { width: "100%", fontSize: "14px" },
              placeholder: "{{items}}"
            }
          ]
        },
        {
          id: "shipping-charges",
          type: "row",
          style: { marginTop: "24px", display: "flex", justifyContent: "flex-end" },
          children: [
            {
              type: "text",
              style: { width: "200px", fontSize: "14px" },
              placeholder: "<div style='display:flex; justify-content:space-between;'><span>Shipping Fee:</span><strong>{{shippingFee}}</strong></div>"
            }
          ]
        },
        {
          id: "foot",
          type: "row",
          style: { marginTop: "30px", borderTop: "2px dashed #000", paddingTop: "15px", textAlign: "center", fontSize: "12px" },
          children: [
            { type: "text", style: {}, placeholder: "Please check your package weights at delivery. Powered by {{brandName}}." }
          ]
        }
      ],
      printer_type: "Standard",
      printer_config: {
        max_label_width: 700,
        max_label_height: 0
      }
    }
  }
];
