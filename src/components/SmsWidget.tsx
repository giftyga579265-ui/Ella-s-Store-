import { useState } from "react";
import { MessageSquare, Phone, MessageCircle, X } from "lucide-react";

interface SmsWidgetProps {
  onLogActivity: (activity: string, type: 'login' | 'cart_addition' | 'purchase' | 'product_view' | 'inquiry' | 'admin_action' | 'user_action') => void;
  username: string;
}

export default function SmsWidget({ onLogActivity, username }: SmsWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (type: string, url: string) => {
    onLogActivity(`Clicked to contact Ella via ${type}`, "user_action");
    window.open(url, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-40" id="sms-widget">
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-amber-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-amber-600 transition-all duration-300 hover:scale-110 active:scale-95"
        id="sms-toggle-btn"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Dropdown Card */}
      {isOpen && (
        <div className="absolute bottom-18 right-0 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden border border-amber-100 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="bg-neutral-900 text-white p-4 flex justify-between items-center">
            <h3 className="font-serif text-lg tracking-wide">Contact Ella</h3>
            <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="p-5 space-y-4">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg">
              <h4 className="font-medium text-neutral-900 text-sm mb-1">Get in Touch with Ella</h4>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Contact Ella directly for styling consultations, customized sizing, orders, or delivery support.
              </p>
              <p className="text-xs font-mono font-medium text-amber-700 mt-2">Phone: 0276747037</p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleAction("SMS", "sms:0276747037")}
                className="w-full flex items-center gap-3 p-3 bg-neutral-50 hover:bg-amber-500 hover:text-white rounded-xl transition-all duration-300 text-left text-sm font-medium text-neutral-700 group"
              >
                <div className="w-10 h-10 rounded-full bg-amber-100 group-hover:bg-amber-600 flex items-center justify-center text-amber-600 group-hover:text-white transition-colors duration-300">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-neutral-900 group-hover:text-white transition-colors">Send SMS</strong>
                  <span className="text-xs text-neutral-500 group-hover:text-amber-100 transition-colors">Text Ella directly</span>
                </div>
              </button>

              <button
                onClick={() => handleAction("WhatsApp", "https://wa.me/233276747037")}
                className="w-full flex items-center gap-3 p-3 bg-neutral-50 hover:bg-emerald-500 hover:text-white rounded-xl transition-all duration-300 text-left text-sm font-medium text-neutral-700 group"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 group-hover:bg-emerald-600 flex items-center justify-center text-emerald-600 group-hover:text-white transition-colors duration-300">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-neutral-900 group-hover:text-white transition-colors">WhatsApp Chat</strong>
                  <span className="text-xs text-neutral-500 group-hover:text-emerald-100 transition-colors">Message on WhatsApp</span>
                </div>
              </button>

              <button
                onClick={() => handleAction("Call", "tel:0276747037")}
                className="w-full flex items-center gap-3 p-3 bg-neutral-50 hover:bg-blue-500 hover:text-white rounded-xl transition-all duration-300 text-left text-sm font-medium text-neutral-700 group"
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 group-hover:bg-blue-600 flex items-center justify-center text-blue-600 group-hover:text-white transition-colors duration-300">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-neutral-900 group-hover:text-white transition-colors">Call Ella</strong>
                  <span className="text-xs text-neutral-500 group-hover:text-blue-100 transition-colors">Speak directly on the phone</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
