import React, { useState } from 'react';
import { MessageCircle, X, ChevronRight, Sparkles, RefreshCw, Bot, ExternalLink } from 'lucide-react';
import { WhatsAppChatbotModal } from './WhatsAppChatbotModal';

export const WhatsAppButton: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const phoneNumber = ''; // No hardcoded personal number - uses WhatsApp text dispatch or in-app AI bot

  const handleOpenWhatsAppDirect = (message: string) => {
    const encoded = encodeURIComponent(message);
    if (phoneNumber) {
      window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, '_blank');
    } else {
      // If no business number is configured, open the GoMeat AI Chatbot directly!
      setIsChatbotOpen(true);
      setIsMenuOpen(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        {/* Quick Action Popup Modal */}
        {isMenuOpen && (
          <div className="mb-3 w-84 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden text-gray-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
            {/* Header */}
            <div className="bg-[#128C7E] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1 shadow-xs">
                  <img src="/images/logo.png" alt="GoMeat" className="w-full h-full object-contain" />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h4 className="font-bold text-sm leading-tight">GoMeat AI Assistant</h4>
                    <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">AI BOT</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-100">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Online • Instant 24/7 Replies</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Action Options */}
            <div className="p-3.5 space-y-2 bg-gray-50 text-xs">
              {/* Option 1: AI Chatbot on Website */}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsChatbotOpen(true);
                }}
                className="w-full text-left p-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl flex items-center justify-between group shadow-sm hover:shadow-md transition active:scale-98 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm leading-tight">Chat with AI Butcher</div>
                    <div className="text-[10px] text-emerald-100">Ask catch, cuts, recipe & box return</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/80 group-hover:translate-x-0.5 transition" />
              </button>

              <div className="pt-1 text-[11px] text-gray-500 font-semibold px-1">
                Or send instant message to WhatsApp:
              </div>

              {/* Option 2: Order on WhatsApp App */}
              <button
                onClick={() => handleOpenWhatsAppDirect("Hello GoMeat, I want to order fresh seafood and meat. Please share today's 4 AM harbor catch availability.")}
                className="w-full text-left p-2.5 bg-white border border-gray-200 hover:border-[#128C7E] rounded-xl flex items-center justify-between group shadow-2xs hover:bg-emerald-50/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#128C7E]" />
                  <div>
                    <div className="font-bold text-gray-900">Order via WhatsApp App</div>
                    <div className="text-[10px] text-gray-500">90-min chilled delivery slots</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#128C7E]" />
              </button>

              {/* Option 3: Return Box */}
              <button
                onClick={() => handleOpenWhatsAppDirect("Hi GoMeat, I have an empty ThermalVault cooler box at my apartment and want to schedule a return for my ₹250 UPI refund.")}
                className="w-full text-left p-2.5 bg-white border border-gray-200 hover:border-[#128C7E] rounded-xl flex items-center justify-between group shadow-2xs hover:bg-emerald-50/40 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-amber-600" />
                  <div>
                    <div className="font-bold text-gray-900">Return Cold Box (₹250 Refund)</div>
                    <div className="text-[10px] text-gray-500">Instant UPI refund doorstep pickup</div>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#128C7E]" />
              </button>
            </div>

            <div className="p-2.5 bg-white border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400 px-3">
              <span>Powered by GoMeat AI</span>
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Meta Webhook Live
              </span>
            </div>
          </div>
        )}

        {/* Floating Main Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="group flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 cursor-pointer"
          aria-label="Chat on WhatsApp"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
          <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />
          <span className="font-bold text-xs tracking-wide">
            Chat on WhatsApp <span className="bg-white/25 px-1.5 py-0.5 rounded-full text-[10px] ml-1">AI</span>
          </span>
        </button>
      </div>

      {/* Interactive AI Chatbot Modal */}
      <WhatsAppChatbotModal
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        whatsappNumber={phoneNumber}
      />
    </>
  );
};