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
  Flame, 
  ChefHat, 
  Tag, 
  Clock, 
  Users, 
  Check, 
  ArrowRight,
  ShieldCheck,
  Package,
  Thermometer
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { Product } from '../types';

interface ActionCardData {
  title: string;
  subtitle?: string;
  buttonText: string;
  actionType: 'ADD_TO_CART' | 'APPLY_COUPON' | 'OPEN_CART' | 'OPEN_TRACKING' | 'OPEN_RETURNS';
  productId?: string;
  productName?: string;
  price?: number;
  code?: string;
}

interface RecipeData {
  title: string;
  prepTime: string;
  cookTime: string;
  difficulty: string;
  servings: string;
}

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  time: string;
  suggestedReplies?: string[];
  products?: Product[];
  actionCard?: ActionCardData;
  recipe?: RecipeData;
  actionExecuted?: string;
}

interface WhatsAppChatbotModalProps {
  isOpen: boolean;
  onClose: () => void;
  whatsappNumber: string;
  onNavigateTab?: (tab: 'catalog' | 'tracking' | 'dashboard' | 'coolers' | 'admin') => void;
}

export const WhatsAppChatbotModal: React.FC<WhatsAppChatbotModalProps> = ({
  isOpen,
  onClose,
  whatsappNumber,
  onNavigateTab
}) => {
  const { items, subtotal, total, couponCode, addItem, applyCoupon, setIsCartOpen } = useCart();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_welcome',
      sender: 'bot',
      text: `👋 *Namaste! Welcome to GoMeat — Freshness We Can Trust.*\n\nI am your *24/7 AI Master Butcher & Culinary Concierge* 👨‍🍳✨\n\nI don't just answer questions — *tell me what you need and I will do all the work:*\n\n• 🛒 *"Add 500g Surmai and 1kg Mutton to my cart"*\n• 🛍️ *"View my cart"* (check items & total)\n• 👨‍🍳 *"How to cook Surmai Tawa Fry?"* or *"Mutton Rogan Josh recipe"*\n• ⚖️ *"Dinner for 6 people, how much meat should I order?"*\n• 🎟️ *"Apply 20% discount coupon"*\n• 📦 *"How do I get my ₹250 box refund?"*\n• ❄️ *"Is the meat fresh or frozen?"*\n\nHow can I serve you today?`,
      time: getCurrentTime(),
      suggestedReplies: [
        "View my cart",
        "Today's Harbor Seafood",
        "Kashmiri Mutton Rogan Josh",
        "Dinner for 4 people?",
        "Apply 20% OFF Deal",
        "How to get ₹250 box refund?"
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionToast, setActionToast] = useState<string | null>(null);
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

  // Execute client-side agentic actions returned by backend
  const executeBotAction = (action: any, products?: Product[]) => {
    if (!action) return null;

    if (action.type === 'ADD_TO_CART') {
      const prod = products?.find(p => p.id === action.productId) || products?.[0];
      if (prod) {
        addItem(
          prod,
          action.quantity || 1,
          prod.cutStyle || 'Master Butcher Cut',
          action.selectedWeight || '500g',
          action.price || prod.price,
          prod.mrp
        );
        const toast = `🛒 Added ${prod.name} (${action.selectedWeight || '500g'}) to cart!`;
        showToast(toast);
        return `Added ${prod.name} (${action.selectedWeight || '500g'}) to your cart`;
      }
    } else if (action.type === 'APPLY_COUPON') {
      applyCoupon(action.code || 'FRESH20');
      const toast = `🎉 Applied 20% OFF Deal (${action.code || 'FRESH20'})!`;
      showToast(toast);
      return `Coupon ${action.code || 'FRESH20'} applied (20% OFF)`;
    } else if (action.type === 'OPEN_CART') {
      // Keep chat modal open so customer can read the full cart breakdown; ActionCard opens drawer on tap
      return `Cart reviewed`;
    } else if (action.type === 'OPEN_TRACKING') {
      if (onNavigateTab) {
        onNavigateTab('tracking');
        onClose();
      }
    } else if (action.type === 'OPEN_RETURNS') {
      if (onNavigateTab) {
        onNavigateTab('coolers');
        onClose();
      }
    }

    return null;
  };

  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3500);
  };

  const handleActionCardClick = (card: ActionCardData, products?: Product[]) => {
    if (card.actionType === 'OPEN_CART') {
      setIsCartOpen(true);
      onClose();
    } else if (card.actionType === 'OPEN_TRACKING') {
      if (onNavigateTab) onNavigateTab('tracking');
      onClose();
    } else if (card.actionType === 'OPEN_RETURNS') {
      if (onNavigateTab) onNavigateTab('coolers');
      onClose();
    } else if (card.actionType === 'APPLY_COUPON') {
      applyCoupon(card.code || 'FRESH20');
      showToast(`🎉 Applied 20% OFF Deal (${card.code || 'FRESH20'})!`);
    } else if (card.actionType === 'ADD_TO_CART') {
      const prod = products?.find(p => p.id === card.productId) || products?.[0];
      if (prod) {
        addItem(prod, 1, prod.cutStyle || 'Master Butcher Cut', '500g', card.price || prod.price, prod.mrp);
        showToast(`🛒 Added ${prod.name} to cart!`);
      }
    }
  };

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
      const cartSummary = {
        itemsCount: items.length,
        items: items.map(i => ({
          name: i.product.name,
          qty: i.quantity,
          weight: i.selectedWeight || '500g',
          price: i.unitPrice || i.product.price
        })),
        subtotal,
        total,
        couponCode
      };

      const response = await fetch('/api/chatbot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, phone: whatsappNumber, cartSummary })
      });

      const data = await response.json();
      if (data && data.reply) {
        // Execute automated action if returned
        const executedNote = executeBotAction(data.action, data.products);

        const botMsg: Message = {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: data.reply,
          time: getCurrentTime(),
          suggestedReplies: data.suggestedReplies,
          products: data.products,
          actionCard: data.actionCard,
          recipe: data.recipe,
          actionExecuted: executedNote || undefined
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error('Invalid response');
      }
    } catch (err) {
      const errorMsg: Message = {
        id: `bot_err_${Date.now()}`,
        sender: 'bot',
        text: "I am synchronizing cuts with our 0°C harbor cold hub. You can also message our master butcher directly on WhatsApp!",
        time: getCurrentTime(),
        suggestedReplies: ["Today's seafood catch", "Mutton cuts", "Apply 20% coupon"]
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
    <div className="fixed inset-0 z-60 flex items-center justify-center p-2.5 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        onClick={onClose} 
        className="fixed inset-0 -z-10" 
      />

      {/* Floating Action Toast */}
      {actionToast && (
        <div className="absolute top-5 z-70 bg-gray-900 text-white px-4 py-2.5 rounded-2xl shadow-2xl border border-emerald-400 text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* Master Butcher WhatsApp Window Frame */}
      <div className="relative w-full max-w-lg bg-[#efeae2] dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-slate-800 flex flex-col h-[650px] max-h-[92vh]">
        
        {/* Header: Master Butcher Branding */}
        <div className="bg-[#075E54] dark:bg-slate-950 text-white px-4 py-3 flex items-center justify-between shadow-md shrink-0 border-b border-emerald-600/30">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 p-1 flex items-center justify-center shadow-md">
                <img 
                  src="/images/logo.png" 
                  alt="GoMeat" 
                  className="w-full h-full object-contain dark:hidden" 
                />
                <img 
                  src="/images/logo-dark.png" 
                  alt="GoMeat" 
                  className="w-full h-full object-contain hidden dark:block" 
                />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-[#075E54] rounded-full"></span>
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm leading-tight text-white flex items-center gap-1.5">
                  <span>GoMeat AI Master Butcher</span>
                  <span className="text-[10px] bg-amber-400/90 text-amber-950 font-black px-1.5 py-0.2 rounded-full uppercase">
                    PRO
                  </span>
                </h3>
              </div>
              <div className="text-[11px] text-emerald-100/90 leading-tight flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{loading ? 'Consulting cuts & recipes...' : 'Active 24/7 • Cold-Chain Concierge'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleLaunchWhatsApp("Hello GoMeat Master Butcher, I want to order fresh meat and seafood.")}
              title="Open chat in WhatsApp App"
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/90 hover:text-white transition flex items-center gap-1 text-[11px] font-bold"
            >
              <ExternalLink className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-white/10 text-white/90 hover:text-white transition"
              title="Close Chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Status Strip */}
        <div className="bg-[#128C7E] dark:bg-slate-800 px-4 py-1.5 flex items-center justify-between text-xs text-emerald-100 dark:text-emerald-300 border-t border-emerald-600/40 shrink-0 font-medium">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span className="text-[11px]">0°C to 4°C Blast-Chilled • 1-Tap Cart Execution Active</span>
          </div>
          <span className="text-[10px] bg-emerald-950/40 px-2 py-0.5 rounded-md font-bold">
            90-Min Dispatch
          </span>
        </div>

        {/* Chat Messages Feed */}
        <div 
          className="flex-1 overflow-y-auto p-3.5 space-y-3"
          style={{
            backgroundImage: `radial-gradient(#94a3b8 0.65px, transparent 0.65px)`,
            backgroundSize: '16px 16px'
          }}
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              {/* Automated Action Confirmation Banner */}
              {msg.actionExecuted && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-[10px] font-bold shadow-2xs">
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>{msg.actionExecuted}</span>
                </div>
              )}

              {/* Chat Bubble */}
              <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 shadow-sm text-xs relative ${
                  msg.sender === 'user'
                    ? 'bg-[#d9fdd3] dark:bg-emerald-900/50 text-gray-900 dark:text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-tl-none border border-gray-200/70 dark:border-slate-700'
                }`}
              >
                {/* Formatted Text with WhatsApp markdown */}
                <div className="whitespace-pre-line leading-relaxed text-[11.5px]">
                  {formatWhatsAppMarkdown(msg.text)}
                </div>

                {/* Recipe Preview Card if Recipe returned */}
                {msg.recipe && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/80 space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-amber-900 dark:text-amber-200 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <ChefHat className="w-4 h-4 text-amber-600" />
                        <span>{msg.recipe.title}</span>
                      </div>
                      <span className="text-[10px] bg-amber-200/80 dark:bg-amber-900/60 px-1.5 py-0.2 rounded font-black">
                        {msg.recipe.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-amber-800 dark:text-amber-300 font-medium">
                      <span>⏱️ Prep: {msg.recipe.prepTime}</span>
                      <span>•</span>
                      <span>🔥 Cook: {msg.recipe.cookTime}</span>
                      <span>•</span>
                      <span>👥 {msg.recipe.servings}</span>
                    </div>
                  </div>
                )}

                {/* Interactive Action Card if present */}
                {msg.actionCard && (
                  <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-rose-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 border border-rose-200 dark:border-slate-700 space-y-2">
                    <div>
                      <div className="font-extrabold text-xs text-gray-900 dark:text-white">
                        {msg.actionCard.title}
                      </div>
                      {msg.actionCard.subtitle && (
                        <div className="text-[10px] text-gray-500 dark:text-gray-400">
                          {msg.actionCard.subtitle}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleActionCardClick(msg.actionCard!, msg.products)}
                      className="w-full py-2 px-3 rounded-lg bg-[#d11243] hover:bg-[#b80f3b] text-white font-extrabold text-[11px] shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition"
                    >
                      <span>{msg.actionCard.buttonText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Products Cards embedded in Bot reply with + Add to Cart */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-slate-700/80 space-y-2">
                    <span className="text-[10px] font-black uppercase text-[#d11243] dark:text-rose-400 block tracking-wider">
                      Recommended Chef Cuts:
                    </span>
                    <div className="space-y-1.5">
                      {msg.products.map(prod => (
                        <div 
                          key={prod.id} 
                          className="bg-gray-50 dark:bg-slate-900/90 rounded-xl p-2 border border-gray-200 dark:border-slate-700 flex items-center justify-between gap-2.5"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <img 
                              src={prod.image || prod.imageUrl || `/images/products/${prod.id}.jpg`} 
                              alt={prod.name} 
                              className="w-11 h-11 rounded-lg object-cover shrink-0 border border-gray-200 dark:border-slate-700" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `/images/products/${prod.id}.jpg`;
                              }}
                            />
                            <div className="overflow-hidden">
                              <div className="font-bold text-[11px] text-gray-900 dark:text-white truncate">
                                {prod.name}
                              </div>
                              <div className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">₹{prod.price}</span>
                                {prod.mrp && <span className="line-through text-gray-400 text-[9px]">₹{prod.mrp}</span>}
                                <span>• {prod.netWeight || prod.unit || '500g'}</span>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              addItem(prod, 1, prod.cutStyle || 'Master Butcher Cut', '500g', prod.price, prod.mrp);
                              showToast(`🛒 Added ${prod.name} to cart!`);
                            }}
                            className="px-2.5 py-1.5 bg-[#d11243] hover:bg-[#b80f3b] text-white text-[10px] font-extrabold rounded-lg shrink-0 flex items-center gap-1 shadow-xs active:scale-95 cursor-pointer"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            <span>+ Add</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamp & Status */}
                <div className="flex items-center justify-end gap-1 mt-1.5 text-[9px] text-gray-400 dark:text-gray-500">
                  <span>{msg.time}</span>
                  {msg.sender === 'user' && (
                    <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                  )}
                </div>
              </div>

              {/* Quick Action Chips below Bot message */}
              {msg.suggestedReplies && msg.suggestedReplies.length > 0 && (
                <div className="flex flex-wrap gap-1.5 max-w-[88%] pt-0.5">
                  {msg.suggestedReplies.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-[#075E54] dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-slate-700 shadow-2xs transition active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                      <Sparkles className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{chip}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3.5 py-2.5 rounded-2xl rounded-tl-none border border-gray-200/80 dark:border-slate-700 shadow-2xs w-fit text-xs text-gray-500 dark:text-gray-400">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium text-[11px]">AI Master Butcher is checking stock & calculating cuts...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-2.5 bg-[#f0f2f5] dark:bg-slate-950 border-t border-gray-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Ask recipes, order cuts, or say 'add surmai to cart'..."
            className="flex-1 bg-white dark:bg-slate-900 px-4 py-2.5 rounded-full border border-gray-300 dark:border-slate-700 text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#128C7E] shadow-2xs"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || loading}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition shadow-xs ${
              inputText.trim() && !loading
                ? 'bg-[#128C7E] hover:bg-[#0d6e63] text-white cursor-pointer active:scale-95'
                : 'bg-gray-300 dark:bg-slate-800 text-gray-500 cursor-not-allowed'
            }`}
            title="Send Message"
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
