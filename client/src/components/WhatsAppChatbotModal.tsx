import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  RotateCcw, 
  Phone, 
  ExternalLink, 
  CheckCheck, 
  Bot, 
  ShoppingBag,
  Zap,
  RefreshCw,
  MessageCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  suggestedReplies?: string[];
  products?: Product[];
}

interface WhatsAppChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber: string;
}

export const WhatsAppChatbotModal: React.FC<WhatsAppChatbotModalProps> = ({
  isOpen,
  onClose,
  whatsappNumber
}) => {
  const { addItem } = useCart();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_welcome',
      sender: 'bot',
      text: `Namaste! 🙏 Welcome to *GoMeat* - Freshness we can trust.\n\nI am your 24/7 AI Butcher & Cold-Chain Assistant.\n\nAsk me about:\n• Today's 4 AM harbor catch availability (Surmai, Pomfret, Prawns)\n• Pasture mutton & farm chicken cuts\n• How to get your ₹250 cooler box UPI refund\n• 0°C–4°C Live order temperature tracking`,
      time: getCurrentTime(),
      suggestedReplies: [
        "Today's fresh seafood?",
        "Chicken & Mutton prices",
        "How to get ₹250 box refund?",
        "Track my live order"
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai_chat' | 'direct_wa'>('ai_chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      time: getCurrentTime()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, phone: whatsappNumber })
      });

      const data = await response.json();
      if (data && data.reply) {
        const botMsg: Message = {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: data.reply,
          time: getCurrentTime(),
          suggestedReplies: data.suggestedReplies,
          products: data.products
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error('Invalid response');
      }
    } catch (err) {
      const errorMsg: Message = {
        id: `bot_err_${Date.now()}`,
        sender: 'bot',
        text: "I'm having a brief connection delay with our harbor cold hub. Please feel free to open WhatsApp directly using the button above!",
        time: getCurrentTime(),
        suggestedReplies: ["Open in WhatsApp App", "Check seafood", "Return box"]
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchWhatsApp = (prefilledText: string) => {
    const encoded = encodeURIComponent(prefilledText);
    window.open(`https://wa.me/${whatsappNumber}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        onClick={onClose} 
        className="fixed inset-0 -z-10" 
      />

      {/* WhatsApp Window Frame */}
      <div className="relative w-full max-w-md bg-[#efeae2] rounded-3xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col h-[600px] max-h-[90vh]">
        
        {/* WhatsApp Header */}
        <div className="bg-[#075E54] text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center shadow-xs">
                <img src="/images/logo.png" alt="GoMeat" className="w-full h-full object-contain" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#075E54] rounded-full"></span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm leading-tight text-white">GoMeat AI Assistant</h3>
                <span className="px-1.5 py-0.2 rounded bg-emerald-600/80 text-[9px] font-black uppercase text-emerald-100">
                  AI
                </span>
              </div>
              <div className="text-[11px] text-emerald-100/90 leading-tight">
                {loading ? 'AI is typing...' : 'Online • WhatsApp Live Bot'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleLaunchWhatsApp("Hello GoMeat AI, I want to order fresh meat and seafood.")}
              title="Open directly in WhatsApp application"
              className="p-1.5 rounded-full hover:bg-white/10 text-white/90 hover:text-white transition"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/90 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="bg-[#128C7E] px-4 py-1.5 flex items-center justify-between text-xs text-emerald-100 border-t border-emerald-600/40 shrink-0">
          <div className="flex items-center gap-2 font-medium">
            <Bot className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-[11px]">Instant Web AI Simulation & Meta Webhook Enabled</span>
          </div>
          <button
            onClick={() => handleLaunchWhatsApp("Hi GoMeat, I need support for my order.")}
            className="text-[11px] underline hover:text-white font-bold"
          >
            Open in App &rarr;
          </button>
        </div>

        {/* Chat Messages Feed */}
        <div 
          className="flex-1 overflow-y-auto p-3.5 space-y-3"
          style={{
            backgroundImage: `radial-gradient(#cbd5e1 0.75px, transparent 0.75px)`,
            backgroundSize: '16px 16px'
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              {/* Chat Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 shadow-xs text-xs relative ${
                  msg.sender === 'user'
                    ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none'
                    : 'bg-white text-gray-900 rounded-tl-none border border-gray-200/60'
                }`}
              >
                {/* Formatted Text with WhatsApp markdown */}
                <div className="whitespace-pre-line leading-relaxed">
                  {formatWhatsAppMarkdown(msg.text)}
                </div>

                {/* Products Cards embedded in Bot reply */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-gray-100 space-y-2">
                    <span className="text-[10px] font-extrabold uppercase text-[#d11243] block">
                      Recommended Cuts:
                    </span>
                    <div className="space-y-1.5">
                      {msg.products.map(prod => (
                        <div 
                          key={prod.id} 
                          className="bg-gray-50 rounded-xl p-2 border border-gray-200 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2">
                            <img 
                              src={prod.image || prod.imageUrl || `/images/products/${prod.id}.jpg`} 
                              alt={prod.name} 
                              className="w-10 h-10 rounded-lg object-cover" 
                            />
                            <div>
                              <div className="font-bold text-[11px] text-gray-900 line-clamp-1">{prod.name}</div>
                              <div className="text-[10px] text-gray-500">₹{prod.price} • {prod.netWeight || prod.unit}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              addItem(prod, 1);
                              onClose();
                            }}
                            className="px-2.5 py-1 bg-[#d11243] hover:bg-[#b80f3b] text-white text-[10px] font-bold rounded-lg shrink-0 flex items-center gap-1 shadow-2xs"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>Add</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamp & Status */}
                <div className="flex items-center justify-end gap-1 mt-1 text-[9px] text-gray-400">
                  <span>{msg.time}</span>
                  {msg.sender === 'user' && (
                    <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                  )}
                </div>
              </div>

              {/* Quick Reply Chips below Bot message */}
              {msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-w-[85%] pt-1">
                  {msg.suggestedReplies.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      className="px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-[#075E54] font-semibold text-[10px] border border-emerald-200/80 shadow-2xs transition active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                      <span>{chip}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl rounded-tl-none border border-gray-200/80 shadow-2xs w-fit text-xs text-gray-500">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>GoMeat AI is looking up fresh stock...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-2.5 bg-[#f0f2f5] border-t border-gray-200 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Type your message in English or Hindi..."
            className="flex-1 bg-white px-3.5 py-2.5 rounded-full border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#128C7E] shadow-2xs"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || loading}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition shadow-xs ${
              inputText.trim() && !loading
                ? 'bg-[#128C7E] hover:bg-[#0d6e63] text-white cursor-pointer active:scale-95'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>

      </div>
    </div>
  );
};

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatWhatsAppMarkdown(text: string): React.ReactNode {
  if (!text) return null;

  // Simple parser for *bold* and _italic_
  const parts = text.split('\n');
  return parts.map((line, lIdx) => {
    const boldTokens = line.split(/(\*[^*]+\*)/g);
    return (
      <React.Fragment key={lIdx}>
        {boldTokens.map((token, tIdx) => {
          if (token.startsWith('*') && token.endsWith('*')) {
            return <strong key={tIdx} className="font-bold">{token.slice(1, -1)}</strong>;
          }
          return token;
        })}
        {lIdx < parts.length - 1 && <br />}
      </React.Fragment>
    );
  });
}
