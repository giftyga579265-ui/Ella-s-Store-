import { useState, useMemo } from "react";
import { Order, Payment } from "../types";
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
  Printer
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface OrderHistoryProps {
  orders: Order[];
  payments: Payment[];
  currentUser: string;
  currentUserEmail: string;
  onClose: () => void;
}

export default function OrderHistory({ 
  orders, 
  payments, 
  currentUser, 
  currentUserEmail, 
  onClose 
}: OrderHistoryProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "payments">("orders");

  // Filter orders by current user (match name or email)
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchName = order.customer.toLowerCase() === currentUser.toLowerCase();
      const matchEmail = currentUserEmail && order.customer.toLowerCase() === currentUserEmail.toLowerCase();
      return matchName || matchEmail;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [orders, currentUser, currentUserEmail]);

  // Filter payments by current user (match name or email)
  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchName = payment.customer.toLowerCase() === currentUser.toLowerCase();
      const matchEmail = currentUserEmail && payment.customer.toLowerCase() === currentUserEmail.toLowerCase();
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
    doc.text(`Status: ${order.status.toUpperCase()}`, 14, 50);

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
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-500 hover:text-black transition-colors border border-neutral-200/60 cursor-pointer"
            title="Close Panel"
            id="close-order-history-btn"
          >
            <X className="w-4 h-4" />
          </button>
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
                    return (
                      <div 
                        key={order.id} 
                        className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden"
                      >
                        {/* Card Header */}
                        <div className="flex justify-between items-start border-b border-neutral-100 pb-3">
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
                            <button 
                              onClick={() => generateInvoicePDF(order)}
                              className="flex items-center gap-1 text-[10px] bg-neutral-100 hover:bg-neutral-200 text-neutral-600 px-2 py-1 rounded-md transition-colors cursor-pointer"
                            >
                              <Printer className="w-3 h-3" />
                              Print Invoice
                            </button>
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
                            {payment.method.toUpperCase()} Payment
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
