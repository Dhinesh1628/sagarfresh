import React, { useState, useEffect } from 'react';
import { MessageCircle, X, ChevronRight, Sparkles, RefreshCw, Bot, ExternalLink } from 'lucide-react';
import { WhatsAppChatbotModal } from './WhatsAppChatbotModal';

interface WhatsAppButtonProps {
  isChatbotOpen?: boolean;
  onOpenChatbot?: () => void;
  onCloseChatbot?: () => void;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  isChatbotOpen: controlledIsOpen,
  onOpenChatbot,
  onCloseChatbot
}) => {
  const [internalChatbotOpen, setInternalChatbotOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const phoneNumber = ''; // Uses WhatsApp text dispatch or in-app AI bot

  const isChatbotOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalChatbotOpen;

  const openChatbot = () => {
    setShowTooltip(false);
    setIsMenuOpen(false);
    if (onOpenChatbot) {
      onOpenChatbot();
    } else {
      setInternalChatbotOpen(true);
    }
  };

  const closeChatbot = () => {
    if (onCloseChatbot) {
      onCloseChatbot();
    } else {
      setInternalChatbotOpen(false);
    }
  };

  const handleOpenWhatsAppDirect = (message: string) => {
    const encoded = encodeURIComponent(message);
    if (phoneNumber) {
      window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, '_blank');
    } else {
      openChatbot();
    }
  };

  return (
    <>
      <div className="fixed bottom-5 right-4 sm:right-6 z-40 flex flex-col items-end gap-2.5">
        
        {/* Floating Callout Tooltip (Directly visible so users immediately spot AI Butcher) */}
        {showTooltip && !isMenuOpen && !isChatbotOpen && (
          <div className="relative mb-1 bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 border border-emerald-400/60 text-white rounded-2xl p-3 shadow-2xl max-w-[270px] animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-700 hover:bg-gray-600 rounded-full flex items-center justify-center text-gray-200 text-xs shadow-md cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center flex-shrink-0 text-lg">
                🥩
              </div>
              <div>
                <p className="text-[11px] font-bold text-white leading-tight">
                  Need help picking today's fresh catch or cuts?
                </p>
                <p className="text-[10px] text-emerald-300 mt-0.5">
                  Ask our 24/7 AI Butcher for recipes & availability!
                </p>
                <button
                  onClick={openChatbot}
                  className="mt-2 text-[10px] font-extrabold text-white bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 rounded-full inline-flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Chat with AI Butcher</span>
                </button>
              </div>
            </div>
            {/* Tooltip triangle pointer */}
            <div className="absolute -bottom-1.5 right-10 w-3 h-3 bg-slate-800 border-b border-r border-emerald-400/60 rotate-45"></div>
          </div>
        )}

        {/* Quick WhatsApp Action Menu */}
        {isMenuOpen && (
          <div className="mb-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden text-gray-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="bg-[#128C7E] text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center p-0.5 shadow-xs">
                  <img src="/images/logo.png" alt="GoMeat" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="font-bold text-xs leading-tight">GoMeat WhatsApp Support</h4>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-100">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Direct Concierge</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 space-y-2 bg-gray-50 text-xs">
              <button
                onClick={() => handleOpenWhatsAppDirect("Hello GoMeat, I want to order fresh seafood and meat. Please share today's harbor catch.")}
                className="w-full text-left p-2.5 bg-white border border-gray-200 hover:border-[#128C7E] rounded-xl flex items-center justify-between group shadow-2xs hover:bg-emerald-50/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#128C7E]" />
                  <div>
                    <div className="font-bold text-gray-900 text-[11px]">Order via WhatsApp</div>
                    <div className="text-[10px] text-gray-500">90-min chilled delivery slots</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#128C7E]" />
              </button>

              <button
                onClick={() => handleOpenWhatsAppDirect("Hi GoMeat, I want to return my ThermalVault cooler box for my ₹250 UPI refund.")}
                className="w-full text-left p-2.5 bg-white border border-gray-200 hover:border-[#128C7E] rounded-xl flex items-center justify-between group shadow-2xs hover:bg-emerald-50/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="font-bold text-gray-900 text-[11px]">Return Cold Box (₹250 Refund)</div>
                    <div className="text-[10px] text-gray-500">Doorstep pickup & instant reversal</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#128C7E]" />
              </button>
            </div>
          </div>
        )}

        {/* DUAL FLOATING ACTIONS: 1. Chat with AI Butcher, 2. Order via WhatsApp */}
        <div className="flex flex-wrap items-center justify-end gap-2.5">
          
          {/* PRIMARY FLOATING BUTTON: "Chat with AI Butcher" */}
          <button
            onClick={openChatbot}
            className="group flex items-center gap-2 bg-gradient-to-r from-gray-900 via-slate-900 to-emerald-950 hover:from-black hover:to-emerald-900 text-white pl-3.5 pr-4 py-2.5 rounded-full border border-emerald-400/50 shadow-xl hover:shadow-2xl hover:scale-102 active:scale-95 transition-all duration-200 cursor-pointer"
            aria-label="Chat with AI Butcher"
          >
            <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400/40">
              <Bot className="w-4 h-4 text-emerald-300 group-hover:rotate-12 transition-transform duration-200" />
              <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
            </div>
            
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-xs text-white tracking-tight flex items-center gap-1">
                Chat with AI Butcher
                <Sparkles className="w-3 h-3 text-amber-300" />
              </span>
              <span className="text-[9px] text-emerald-300 font-medium leading-none">
                Ask cuts, catch & recipes 24/7
              </span>
            </div>
          </button>

          {/* SECONDARY FLOATING BUTTON: "Order via WhatsApp" (Prominent visible pill) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="group flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white pl-3.5 pr-4 py-2.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-102 active:scale-95 transition-all duration-200 cursor-pointer"
            aria-label="Order via WhatsApp"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
            </span>
            <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-xs text-white tracking-tight">
                Order via WhatsApp
              </span>
              <span className="text-[9px] text-emerald-100 font-medium leading-none">
                Express 90-min delivery
              </span>
            </div>
          </button>

        </div>
      </div>

      {/* Interactive AI Chatbot Modal */}
      <WhatsAppChatbotModal
        isOpen={isChatbotOpen}
        onClose={closeChatbot}
        whatsappNumber={phoneNumber}
      />
    </>
  );
};
