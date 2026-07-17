import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Bell, Trash2, X, Info, CheckCircle, AlertTriangle, Gift } from "lucide-react";
import { NotificationItem } from "../types";

interface NotificationInboxProps {
  notifications: NotificationItem[];
  currentUserEmail: string;
  isLoggedIn: boolean;
  onDeleteNotification: (id: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationInbox({
  notifications,
  currentUserEmail,
  isLoggedIn,
  onDeleteNotification,
  isOpen,
  onClose,
}: NotificationInboxProps) {
  // Filter notifications for current user (or "all")
  const filteredNotifications = React.useMemo(() => {
    return notifications.filter(n => {
      // If notification is broadcast to all
      if (!n.customerEmail || n.customerEmail === "all") return true;
      // If it is targeted to the logged-in user
      if (isLoggedIn && currentUserEmail && (n.customerEmail || '').toLowerCase() === (currentUserEmail || '').toLowerCase()) {
        return true;
      }
      return false;
    });
  }, [notifications, currentUserEmail, isLoggedIn]);

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case "promo":
        return <Gift className="w-4 h-4 text-purple-500 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
    }
  };

  const getBgClass = (type: string) => {
    switch (type) {
      case "success":
        return "bg-emerald-50/70 border-emerald-100";
      case "warning":
        return "bg-amber-50/70 border-amber-100";
      case "promo":
        return "bg-purple-50/70 border-purple-100";
      default:
        return "bg-blue-50/70 border-blue-100";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black z-45"
            id="notification-backdrop"
          />

          {/* Drawer Sliding up or from Right */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-3xl shadow-2xl z-50 border-t border-neutral-200 overflow-hidden flex flex-col md:max-w-2xl md:mx-auto"
            id="notification-drawer"
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-5 border-b border-neutral-150 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 rounded-xl">
                  <Bell className="w-5 h-5 text-indigo-600 animate-swing" />
                </div>
                <div>
                  <h3 className="font-sans text-base font-black text-slate-900 tracking-tight uppercase">
                    Customer Notification Center
                  </h3>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {filteredNotifications.length} active notifications stored safely
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-neutral-200/50 hover:bg-neutral-200 flex items-center justify-center text-slate-700 transition-colors cursor-pointer"
                title="Close Panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notification List body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 max-h-[60vh] bg-slate-50/30">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                    <Bell className="w-8 h-8 text-slate-400" />
                  </div>
                  <h4 className="font-sans text-sm font-bold text-slate-800">Your Inbox is Clear</h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                    No active notifications or admin promotions at the moment. We will notify you here when order updates or campaign offers are launched!
                  </p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredNotifications.map((n) => (
                    <motion.div
                      key={n.id}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.9, opacity: 0 }}
                      className={`p-4 rounded-2xl border flex gap-3.5 items-start justify-between shadow-sm transition-all hover:shadow-md ${getBgClass(
                        n.type
                      )}`}
                    >
                      <div className="flex gap-3 items-start">
                        <div className="mt-0.5 p-1.5 bg-white rounded-lg shadow-sm border border-neutral-100">
                          {getIcon(n.type)}
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-xs font-black text-slate-900 leading-tight uppercase font-sans">
                            {n.title}
                          </h5>
                          <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium">
                            {n.message}
                          </p>
                          <span className="text-[9px] text-slate-400 font-mono block">
                            {new Date(n.timestamp).toLocaleString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Delete button (Customer Action) */}
                      <button
                        onClick={() => onDeleteNotification(n.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all cursor-pointer group"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom info banner */}
            <div className="px-6 py-4.5 bg-slate-900 text-slate-400 text-[10px] text-center font-mono border-t border-slate-800 flex justify-between items-center gap-4">
              <span>Account: {isLoggedIn ? currentUserEmail : "Guest Session"}</span>
              <span>Ella's Customer Portal</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
