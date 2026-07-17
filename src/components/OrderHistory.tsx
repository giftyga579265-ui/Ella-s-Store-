import { useState, useMemo } from "react";
import { Order, Payment, Customer, DeliveryItem } from "../types";
import { 
  X, 
  ShoppingBag, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  PackageCheck,
  Truck,
  Printer,
  MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface OrderHistoryProps {
  orders: Order[];
  payments: Payment[];
  customers: Customer[];
  deliveries: DeliveryItem[];
  currentUser: string;
  currentUserEmail: string;
  onClose: () => void;
  isCustomerOnly?: boolean;
  currentUserAvatar?: string;
  onUpdateAvatar?: (url: string) => Promise<void>;
  onRedeemPoints: (customerId: number) => void;
}

export default function OrderHistory({ 
  orders, 
  payments, 
  customers,
  deliveries,
  currentUser, 
  currentUserEmail, 
  onClose,
  isCustomerOnly = true,
  currentUserAvatar = "",
  onUpdateAvatar,
  onRedeemPoints
}: OrderHistoryProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "payments">("orders");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleBulkPrint = () => {
    const selected = filteredOrders.filter(o => selectedOrders.includes(o.id));
    // Create a consolidated PDF
    const doc = new jsPDF();
    selected.forEach((order, index) => {
      if (index > 0) doc.addPage();
      doc.text(`Invoice - Order #${order.id.slice(-6).toUpperCase()}`, 14, 20);
      doc.text(`Date: ${order.date}`, 14, 30);
      doc.text(`Customer: ${order.customer}`, 14, 40);
      
      autoTable(doc, {
        head: [['Item']],
        body: order.items.map(item => [item]),
        startY: 50,
      });

      // @ts-ignore
      const finalY = (doc as any).lastAutoTable.finalY || 60;
      doc.text(`Total: GH₵ ${order.total.toLocaleString()}`, 14, finalY + 10);
    });
    doc.save(`Bulk_Invoices_${new Date().toISOString().slice(0,10)}.pdf`);
    setSelectedOrders([]);
  };

  // Filter orders by current user (match name or email)
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchName = (order.customer || '').toLowerCase() === (currentUser || '').toLowerCase();
      const matchEmail = currentUserEmail && (order.customer || '').toLowerCase() === (currentUserEmail || '').toLowerCase();
      return matchName || matchEmail;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, currentUser, currentUserEmail]);

  // Filter payments by current user (match name or email)
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchName = (payment.customer || '').toLowerCase() === (currentUser || '').toLowerCase();
      const matchEmail = currentUserEmail && (payment.customer || '').toLowerCase() === (currentUserEmail || '').toLowerCase();
      return matchName || matchEmail;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments, currentUser, currentUserEmail]);

  // Helper to determine active step in the order timeline
  const getStatusStep = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return 1; // Ordered
      case "processing":
        return 2; // Processing
      case "completed":
        return 3; // Completed
      default:
        return 0; // Cancelled or unknown
    }
  };

  const generateInvoicePDF = (order: Order) => {
    const doc = new jsPDF();
    doc.text(`Invoice - Order #${order.id.slice(-6).toUpperCase()}`, 14, 20);
    doc.text(`Date: ${order.date}`, 14, 30);
    doc.text(`Customer: ${order.customer}`, 14, 40);
    doc.text(`Status: ${(order.status || '').toUpperCase()}`, 14, 50);

    autoTable(doc, {
      head: [['Item']],
      body: order.items.map(item => [item]),
      startY: 60,
    });

    // @ts-ignore
    const finalY = (doc as any).lastAutoTable.finalY || 70;
    doc.text(`Total: GH₵ ${order.total.toLocaleString()}`, 14, finalY + 10);
    
    doc.save(`Invoice_${order.id.slice(-6).toUpperCase()}.pdf`);
  };

  const generatePaymentInvoicePDF = (payment: Payment) => {
    const doc = new jsPDF();
    doc.text(`Payment Invoice - Ref #${payment.id.slice(-6).toUpperCase()}`, 14, 20);
    doc.text(`Date: ${payment.date}`, 14, 30);
    doc.text(`Customer: ${payment.customer}`, 14, 40);
    doc.text(`Payment Method: ${(payment.method || '').toUpperCase()}`, 14, 50);
    doc.text(`Status: ${(payment.status || '').toUpperCase()}`, 14, 60);

    autoTable(doc, {
      head: [['Payment Transaction Detail', 'Value']],
      body: [
        ['Transaction ID', payment.id],
        ['Reference Order ID', payment.orderId || 'N/A'],
        ['Customer Account', payment.customer],
        ['Payment Method', (payment.method || '').toUpperCase()],
        ['Transaction Date', payment.date],
        ['Transaction Status', (payment.status || '').toUpperCase()],
        ['Total Paid Amount', `GH₵ ${payment.amount.toLocaleString()}`],
      ],
      startY: 70,
    });

    // @ts-ignore
    const finalY = (doc as any).lastAutoTable.finalY || 130;
    doc.text(`Total Charged Amount: GH₵ ${payment.amount.toLocaleString()}`, 14, finalY + 10);
    
    doc.save(`Payment_Invoice_${payment.id.slice(-6).toUpperCase()}.pdf`);
  };

  const matchedCustomer = useMemo(() => {
    return customers.find(c => 
      (c.name || '').toLowerCase() === (currentUser || '').toLowerCase() ||
      (currentUserEmail && (c.email || '').toLowerCase() === (currentUserEmail || '').toLowerCase())
    );
  }, [customers, currentUser, currentUserEmail]);

  const printOrderInvoice = (order: Order) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const itemsHtml = order.items.map(item => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 0; font-size: 14px; color: #374151;">${item}</td>
        <td style="padding: 12px 0; font-size: 14px; color: #111827; text-align: right; font-weight: bold;">Included</td>
      </tr>
    `).join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - #${order.id.slice(-6).toUpperCase()}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 40px;
            color: #1f2937;
            background-color: #ffffff;
          }
          .invoice-container {
            max-w: 800px;
            margin: 0 auto;
            border: 1px solid #e5e7eb;
            padding: 40px;
            border-radius: 12px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #f3f4f6;
            padding-bottom: 24px;
            margin-bottom: 30px;
          }
          .logo-area h1 {
            font-size: 24px;
            font-weight: 800;
            letter-spacing: 0.1em;
            margin: 0;
            color: #111827;
          }
          .logo-area p {
            font-size: 10px;
            color: #6b7280;
            text-transform: uppercase;
            margin: 4px 0 0 0;
            font-family: monospace;
          }
          .invoice-title {
            text-align: right;
          }
          .invoice-title h2 {
            font-size: 28px;
            font-weight: 800;
            color: #4f46e5;
            margin: 0;
          }
          .invoice-title p {
            font-size: 12px;
            color: #6b7280;
            margin: 6px 0 0 0;
          }
          .details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            margin-bottom: 40px;
          }
          .details-block h3 {
            font-size: 12px;
            text-transform: uppercase;
            color: #9ca3af;
            margin-bottom: 8px;
            letter-spacing: 0.05em;
          }
          .details-block p {
            font-size: 14px;
            margin: 4px 0;
            font-weight: 500;
          }
          .table-container {
            margin-bottom: 40px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            text-align: left;
            padding-bottom: 12px;
            border-bottom: 2px solid #e5e7eb;
            font-size: 12px;
            text-transform: uppercase;
            color: #6b7280;
            letter-spacing: 0.05em;
          }
          .total-section {
            border-top: 2px solid #f3f4f6;
            padding-top: 20px;
            display: flex;
            justify-content: flex-end;
          }
          .total-box {
            width: 250px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .total-box span {
            font-size: 16px;
            font-weight: 600;
            color: #4b5563;
          }
          .total-box .price {
            font-size: 24px;
            font-weight: 800;
            color: #111827;
          }
          .footer {
            text-align: center;
            margin-top: 60px;
            font-size: 12px;
            color: #9ca3af;
            border-top: 1px solid #f3f4f6;
            padding-top: 20px;
          }
          @media print {
            body {
              padding: 0;
            }
            .invoice-container {
              border: none;
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header" style="display: flex; justify-content: space-between;">
            <div class="logo-area">
              <h1>ELLA'S STORE</h1>
              <p>Couture & Alterations • Accra</p>
            </div>
            <div class="invoice-title" style="text-align: right;">
              <h2 style="margin: 0; color: #4f46e5;">INVOICE</h2>
              <p>Invoice No: #INV-${order.id.slice(-6).toUpperCase()}</p>
            </div>
          </div>
          
          <div class="details-grid" style="display: flex; justify-content: space-between; margin-top: 20px;">
            <div class="details-block">
              <h3>Billed To:</h3>
              <p style="font-size: 16px; font-weight: 700; color: #111827; margin: 0;">${order.customer}</p>
              <p style="color: #4b5563; margin: 4px 0;">Accra, Ghana</p>
            </div>
            <div class="details-block" style="text-align: right;">
              <h3>Invoice Details:</h3>
              <p style="margin: 2px 0;">Date: <strong>${order.date}</strong></p>
              <p style="margin: 2px 0;">Payment Mode: <strong>MTN Mobile Money</strong></p>
              <p style="margin: 2px 0;">Status: <strong style="color: #10b981; text-transform: uppercase;">${order.status}</strong></p>
            </div>
          </div>
          
          <div class="table-container" style="margin-top: 30px;">
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 2px solid #e5e7eb;">
                  <th style="width: 70%; text-align: left; padding-bottom: 10px;">Style Item / Description</th>
                  <th style="width: 30%; text-align: right; padding-bottom: 10px;">Price Status</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>
          
          <div class="total-section" style="display: flex; justify-content: flex-end; margin-top: 30px; border-top: 2px solid #f3f4f6; padding-top: 20px;">
            <div class="total-box" style="display: flex; justify-content: space-between; width: 300px; align-items: center;">
              <span style="font-size: 16px; font-weight: 600; color: #4b5563;">Grand Total:</span>
              <span style="font-size: 24px; font-weight: 800; color: #111827;">GH₵ ${order.total.toLocaleString()}</span>
            </div>
          </div>
          
          <div class="footer" style="text-align: center; margin-top: 60px; font-size: 12px; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 20px;">
            <p>Thank you for choosing Ella's Bespoke Couture!</p>
            <p style="font-size: 10px; margin-top: 5px;">If you have any questions about this invoice, please contact 0276747037.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 300);
    }
  };

  const printPaymentReceipt = (payment: Payment) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Receipt - #${payment.id.slice(-6).toUpperCase()}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
          body {
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 40px;
            color: #1f2937;
            background-color: #ffffff;
          }
          .receipt-container {
            max-w: 600px;
            margin: 0 auto;
            border: 1px solid #e5e7eb;
            padding: 40px;
            border-radius: 12px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #f3f4f6;
            padding-bottom: 24px;
            margin-bottom: 30px;
          }
          .header h1 {
            font-size: 22px;
            font-weight: 800;
            letter-spacing: 0.1em;
            margin: 0;
            color: #111827;
          }
          .header p {
            font-size: 10px;
            color: #6b7280;
            text-transform: uppercase;
            margin: 4px 0 0 0;
          }
          .receipt-title {
            font-size: 14px;
            font-weight: 800;
            color: #10b981;
            margin-top: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
          }
          .details-list {
            margin-bottom: 30px;
          }
          .details-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #f3f4f6;
            font-size: 14px;
          }
          .details-label {
            color: #6b7280;
            font-weight: 500;
          }
          .details-value {
            color: #111827;
            font-weight: 600;
          }
          .total-section {
            background-color: #f9fafb;
            padding: 16px;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .total-label {
            font-size: 14px;
            font-weight: 700;
            color: #374151;
          }
          .total-value {
            font-size: 20px;
            font-weight: 800;
            color: #10b981;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 11px;
            color: #9ca3af;
          }
        </style>
      </head>
      <body>
        <div class="receipt-container">
          <div class="header">
            <h1>ELLA'S STORE</h1>
            <p>Couture & Alterations • Accra</p>
            <div class="receipt-title">Payment Receipt</div>
          </div>
          
          <div class="details-list">
            <div class="details-row">
              <span class="details-label">Transaction ID</span>
              <span class="details-value">#${(payment.id || '').toUpperCase()}</span>
            </div>
            <div class="details-row">
              <span class="details-label">Order Reference ID</span>
              <span class="details-value">#${payment.orderId ? (payment.orderId || '').toUpperCase() : 'N/A'}</span>
            </div>
            <div class="details-row">
              <span class="details-label">Customer Account</span>
              <span class="details-value">${payment.customer}</span>
            </div>
            <div class="details-row">
              <span class="details-label">Payment Method</span>
              <span class="details-value" style="text-transform: uppercase;">${payment.method}</span>
            </div>
            <div class="details-row">
              <span class="details-label">Transaction Date</span>
              <span class="details-value">${payment.date}</span>
            </div>
            <div class="details-row">
              <span class="details-label">Transaction Status</span>
              <span class="details-value" style="color: #10b981; text-transform: uppercase;">${payment.status}</span>
            </div>
          </div>
          
          <div class="total-section">
            <span class="total-label">Total Amount Charged</span>
            <span class="total-value">GH₵ ${payment.amount.toLocaleString()}</span>
          </div>
          
          <div class="footer">
            <p>Thank you for your secure payment to Ella's Store!</p>
            <p style="font-size: 9px; margin-top: 5px;">Momo Gateway Ref: ${payment.id.slice(-8).toUpperCase()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
      
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => {
          document.body.removeChild(iframe);
        }, 1000);
      }, 300);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-300" id="order-history-panel">
      {/* Sidebar Container */}
      <div className="w-full max-w-lg bg-white h-full flex flex-col shadow-2xl border-l border-neutral-100">
        
        {/* Header */}
        <header className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
            <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-sans text-lg font-extrabold text-black tracking-tight">Chart History</h2>
              <p className="text-[11px] text-neutral-500 font-medium">View all your previous shopping & payment records</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedOrders.length > 0 && (
              <button 
                onClick={handleBulkPrint}
                className="flex items-center gap-1.5 text-[10px] bg-amber-500 hover:bg-amber-600 text-neutral-900 font-black px-3 py-2 rounded-lg transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                Bulk Print ({selectedOrders.length})
              </button>
            )}
            <button 
              onClick={onClose}
              className="w-9 h-9 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-black transition-colors border border-neutral-200/60 cursor-pointer"
              title="Close Panel"
              id="close-order-history-btn"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 pb-2 border-b border-neutral-100 flex gap-2">
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border ${
              activeTab === "orders" 
                ? "bg-indigo-600 text-white border-indigo-600 shadow-md" 
                : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
            }`}
            id="tab-history-orders"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            Shopping Orders ({filteredOrders.length})
          </button>
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 border ${
              activeTab === "payments" 
                ? "bg-indigo-600 text-white border-indigo-600 shadow-md" 
                : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100"
            }`}
            id="tab-history-payments"
          >
            <CreditCard className="w-3.5 h-3.5" />
            Payments ({filteredPayments.length})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* CUSTOMER PROFILE CARD WITH ACTIVE AVATAR AND IMAGE UPDATE */}
          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200/60 flex items-center gap-3.5 relative overflow-hidden shadow-sm">
            <div className="relative group shrink-0">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-150 bg-neutral-100 flex items-center justify-center shadow-md">
                {currentUserAvatar ? (
                  <img src={currentUserAvatar} alt={currentUser} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                    {currentUser ? currentUser[0].toUpperCase() : 'U'}
                  </div>
                )}
              </div>
              {onUpdateAvatar && (
                <label className="absolute inset-0 bg-slate-950/70 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity">
                  <span className="text-[8px] text-white font-extrabold">Edit</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const img = new Image();
                          img.onload = () => {
                            const canvas = document.createElement("canvas");
                            canvas.width = 120;
                            canvas.height = 120;
                            const ctx = canvas.getContext("2d");
                            if (ctx) {
                              ctx.drawImage(img, 0, 0, 120, 120);
                              const resizedBase64 = canvas.toDataURL("image/jpeg", 0.85);
                              onUpdateAvatar(resizedBase64);
                            }
                          };
                          img.src = event.target?.result as string;
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              )}
            </div>
            
            <div className="space-y-0.5 w-full">
              <span className="text-[8px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-2 py-0.5 rounded-full uppercase tracking-wider font-mono">
                Bespoke Customer
              </span>
              <h3 className="font-sans text-xs font-black text-neutral-800 uppercase tracking-wide">{currentUser}</h3>
              <p className="text-[10px] text-neutral-500 font-semibold truncate max-w-[200px]">{currentUserEmail}</p>
              
              {/* Loyalty Points display in the Profile Sidebar Card */}
              <div className="mt-2 pt-1.5 border-t border-dashed border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-xs">🪙</span>
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wide">Loyalty Balance:</span>
                </div>
                <span className="text-xs font-extrabold text-amber-600 font-mono bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  {matchedCustomer?.loyaltyPoints ?? 0} Points
                </span>
              </div>
              {matchedCustomer && matchedCustomer.loyaltyPoints >= 10 && (
                <button
                  onClick={() => onRedeemPoints(matchedCustomer.id)}
                  className="mt-2 w-full bg-amber-500 hover:bg-amber-600 text-neutral-900 font-black text-[10px] uppercase py-1.5 rounded-lg shadow-sm transition-all"
                >
                  Redeem 30% Off
                </button>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "orders" ? (
              <motion.div
                key="orders-list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-5"
              >
                {filteredOrders.length === 0 ? (
                  <div className="text-center py-20 text-neutral-400 space-y-3">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-300">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-700">No Orders Placed Yet</p>
                      <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1">
                        When you select designs from the catalog and checkout, your orders will appear here.
                      </p>
                    </div>
                  </div>
                ) : (
                  filteredOrders.map(order => {
                    const step = getStatusStep(order.status);
                    const delivery = deliveries.find(d => d.orderId === order.id);
                    return (
                      <div 
                        key={order.id} 
                        className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden"
                      >
                        <div className="absolute top-4 left-4 z-10">
                          <input 
                            type="checkbox" 
                            checked={selectedOrders.includes(order.id)}
                            onChange={() => toggleOrderSelection(order.id)}
                            className="w-4 h-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                        </div>
                        {/* Card Header */}
                        <div className="flex justify-between items-start border-b border-neutral-100 pb-3 pl-6">
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase">
                              Order ID: #{order.id.slice(-6).toUpperCase()}
                            </span>
                            <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{order.date}</span>
                            </div>
                          </div>
                          
                          <div className="text-right flex flex-col items-end gap-2">
                            <div>
                              <span className="text-sm font-black text-black">
                                GH₵ {order.total.toLocaleString()}
                              </span>
                              <p className="text-[9px] text-neutral-400 uppercase tracking-widest font-black">Total Paid</p>
                            </div>
                            {isCustomerOnly && (
                              <button 
                                onClick={() => printOrderInvoice(order)}
                                className="flex items-center gap-1 text-[10px] bg-neutral-900 hover:bg-amber-500 hover:text-neutral-900 text-white font-bold px-2.5 py-1.5 rounded-md transition-colors cursor-pointer shadow-sm active:scale-95"
                              >
                                <Printer className="w-3 h-3" />
                                Print Invoice
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Items List */}
                        <div className="space-y-1.5 py-1">
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Purchased Styles</p>
                          <ul className="space-y-1">
                            {order.items.map((item, idx) => (
                              <li key={idx} className="text-xs font-semibold text-neutral-800 flex items-center gap-1.5">
                                <span className="text-indigo-500">✦</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {/* Delivery Tracking */}
                        {delivery && (
                          <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl space-y-2">
                            <div className="flex justify-between items-center text-xs">
                              <p className="font-bold flex items-center gap-1.5"><Truck className="w-4 h-4"/> Delivery Status: <span className="text-indigo-700 capitalize">{(delivery.status || "").replace('_', ' ')}</span></p>
                              <p className="flex items-center gap-1.5"><MapPin className="w-4 h-4"/> {delivery.address}</p>
                            </div>
                            <div className="w-full bg-indigo-200 rounded-full h-2">
                              <div 
                                className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                                style={{ width: delivery.status === 'delivered' ? '100%' : delivery.status === 'in_transit' ? '70%' : delivery.status === 'dispatched' ? '30%' : '10%' }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Visual Progress Status Indicator */}
                        <div className="pt-3 border-t border-neutral-100 space-y-3">
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Order Tracking Status</p>
                          
                          {order.status === "cancelled" ? (
                            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2.5 rounded-xl border border-red-100 text-xs font-bold">
                              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                              <span>This order has been cancelled by showroom support.</span>
                            </div>
                          ) : (
                            <div className="relative pt-1">
                              {/* Connector Lines */}
                              <div className="absolute top-[14px] left-[10%] right-[10%] h-[2px] bg-neutral-100 -z-10" />
                              <div 
                                className="absolute top-[14px] left-[10%] h-[2px] bg-emerald-500 -z-10 transition-all duration-500"
                                style={{ 
                                  width: step === 1 ? "0%" : step === 2 ? "40%" : "80%" 
                                }}
                              />

                              {/* Progress Nodes */}
                              <div className="flex justify-between items-center text-center">
                                {/* Node 1: Ordered */}
                                <div className="flex flex-col items-center flex-1">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border text-xs font-bold transition-all duration-300 ${
                                    step >= 1 
                                      ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20" 
                                      : "bg-white border-neutral-200 text-neutral-400"
                                  }`}>
                                    <Clock className="w-3.5 h-3.5" />
                                  </div>
                                  <span className={`text-[10px] font-extrabold mt-1.5 ${
                                    step >= 1 ? "text-emerald-600" : "text-neutral-400"
                                  }`}>Ordered</span>
                                </div>

                                {/* Node 2: Processing */}
                                <div className="flex flex-col items-center flex-1">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border text-xs font-bold transition-all duration-300 ${
                                    step >= 2 
                                      ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20" 
                                      : "bg-white border-neutral-200 text-neutral-400"
                                  }`}>
                                    <Truck className="w-3.5 h-3.5" />
                                  </div>
                                  <span className={`text-[10px] font-extrabold mt-1.5 ${
                                    step >= 2 ? "text-emerald-600" : "text-neutral-400"
                                  }`}>Processing</span>
                                </div>

                                {/* Node 3: Completed */}
                                <div className="flex flex-col items-center flex-1">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center border text-xs font-bold transition-all duration-300 ${
                                    step >= 3 
                                      ? "bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20" 
                                      : "bg-white border-neutral-200 text-neutral-400"
                                  }`}>
                                    <PackageCheck className="w-3.5 h-3.5" />
                                  </div>
                                  <span className={`text-[10px] font-extrabold mt-1.5 ${
                                    step >= 3 ? "text-emerald-600" : "text-neutral-400"
                                  }`}>Completed</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </motion.div>
            ) : (
              <motion.div
                key="payments-list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {filteredPayments.length === 0 ? (
                  <div className="text-center py-20 text-neutral-400 space-y-3">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-300">
                      <CreditCard className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-neutral-700">No Payments Made Yet</p>
                      <p className="text-xs text-neutral-500 max-w-xs mx-auto mt-1">
                        Your successful checkout transactions and MoMo / Cash payments will be cataloged here.
                      </p>
                    </div>
                  </div>
                ) : (
                  filteredPayments.map(payment => (
                    <div 
                      key={payment.id} 
                      className="bg-neutral-50/50 border border-neutral-200 rounded-2xl p-4.5 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full border flex items-center justify-center ${
                          payment.status === 'completed' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                          payment.status === 'pending' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                          'bg-red-50 border-red-100 text-red-600'
                        }`}>
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-neutral-800 uppercase tracking-tight">
                            {(payment.method || '').toUpperCase()} Payment
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-medium">
                            <span className="font-mono">ID: #{payment.id.slice(-6).toUpperCase()}</span>
                            <span>•</span>
                            <span>{payment.date}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <span className="text-xs font-black text-neutral-900 block">
                          GH₵ {payment.amount.toLocaleString()}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border inline-block ${
                          payment.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200/50' :
                          payment.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200/50' :
                          'bg-red-100 text-red-800 border-red-200/50'
                        }`}>
                          {payment.status}
                        </span>
                        {isCustomerOnly && (
                          <button 
                            onClick={() => printPaymentReceipt(payment)}
                            className="mt-2 flex items-center gap-1 text-[9px] bg-neutral-900 hover:bg-emerald-500 hover:text-neutral-900 text-white font-bold border border-neutral-800 px-2.5 py-1.5 rounded-md transition-all cursor-pointer ml-auto justify-end shadow-sm active:scale-95 animate-pulse"
                          >
                            <Printer className="w-2.5 h-2.5 text-white hover:text-neutral-900" />
                            <span>Print Receipt</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer info banner */}
        <footer className="p-5 border-t border-neutral-100 bg-neutral-50/50 text-center text-[10px] text-neutral-400 font-bold tracking-tight">
          Payments are secure via MTN MoMo / Orange Money Integration.
        </footer>
      </div>
    </div>
  );
}
