import React, { useState } from 'react';
import { MessageCircle, X, ChevronRight, Sparkles, RefreshCw } from 'lucide-react';

export const WhatsAppButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '919845012890'; // GoMeat Central Hub Desk

  const handleOpenWhatsApp = (message: string) => {
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Quick Action Popup Modal */}
      {isOpen && (
        <div className="mb-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden text-gray-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="bg-[#128C7E] text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center p-1 shadow-xs">
                <img src="/images/logo.png" alt="GoMeat" className="w-full h-full object-contain" />
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">GoMeat Support</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>Online • Hub Desk</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Options */}
          <div className="p-3.5 space-y-2 bg-gray-50 text-xs">
            <p className="text-[11px] text-gray-500 mb-2">
              👋 Fast WhatsApp assistance for Bengaluru & Mumbai delivery:
            </p>

            <button
              onClick={() => handleOpenWhatsApp("Hello GoMeat, I want to order fresh seafood and meat. Please share today's 4 AM harbor catch availability.")}
              className="w-full text-left p-2.5 bg-white border border-gray-200 hover:border-[#128C7E] rounded-xl flex items-center justify-between group shadow-2xs hover:bg-emerald-50/40 transition"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#128C7E]" />
                <div>
                  <div className="font-bold text-gray-900">Order on WhatsApp</div>
                  <div className="text-[10px] text-gray-500">Share your cuts list for 90-min delivery</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#128C7E]" />
            </button>

            <button
              onClick={() => handleOpenWhatsApp("Hi GoMeat, I have an empty ThermalVault cooler box at my apartment and want to schedule a return for my ₹250 UPI refund.")}
              className="w-full text-left p-2.5 bg-white border border-gray-200 hover:border-[#128C7E] rounded-xl flex items-center justify-between group shadow-2xs hover:bg-emerald-50/40 transition"
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="font-bold text-gray-900">Return Cold Box (₹250 Refund)</div>
                  <div className="text-[10px] text-gray-500">Instant UPI refund doorstep pickup</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#128C7E]" />
            </button>
          </div>

          <div className="p-2.5 bg-white border-t border-gray-100 text-center text-[10px] text-gray-400">
            Typically replies in under 2 minutes
          </div>
        </div>
      )}

      {/* Floating Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 cursor-pointer"
        aria-label="Chat on WhatsApp"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>
        <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
        <span className="font-bold text-xs tracking-wide hidden sm:inline-block">
          Order on WhatsApp
        </span>
      </button>
    </div>
  );
};
