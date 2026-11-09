import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { CatalogPage } from './pages/CatalogPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { CustomerDashboardPage } from './pages/CustomerDashboardPage';
import { CoolerReturnsPage } from './pages/CoolerReturnsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderConfirmationModal } from './components/OrderConfirmationModal';
import { LegalModal } from './components/LegalModals';
import { WhatsAppButton } from './components/WhatsAppButton';
import { GlassmorphicLoginGate } from './components/GlassmorphicLoginGate';
import { LocationSelectorModal } from './components/LocationSelectorModal';
import { FloatingBottomCartBar } from './components/FloatingBottomCartBar';
import type { Order, DeliveryAddress } from './types';

const MainApp: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { isCartOpen, setIsCartOpen } = useCart();
  const [currentTab, setCurrentTab] = useState<'catalog' | 'tracking' | 'dashboard' | 'coolers' | 'admin'>(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') as any : 'catalog';
    return ['catalog', 'tracking', 'dashboard', 'coolers', 'admin'].includes(hash) ? hash : 'catalog';
  });
  // Modals and Overlays
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authRoleHint, setAuthRoleHint] = useState<'customer' | 'admin'>('customer');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'tos' | 'privacy' | null>(null);
  const [isAiButcherOpen, setIsAiButcherOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Customer Delivery Address State (saved in localStorage)
  const [currentAddress, setCurrentAddress] = useState<DeliveryAddress>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gomeat_active_address');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return {
      id: 'default_hyd',
      tag: 'Home',
      flatNo: 'Road No. 36',
      building: 'Near Checkpost',
      street: 'Jubilee Hills',
      area: 'Jubilee Hills',
      city: 'Hyderabad',
      pincode: '500033',
      formattedAddress: 'Road No. 36, Jubilee Hills, Hyderabad 500033'
    };
  });

  const [selectedCity, setSelectedCity] = useState(() => currentAddress?.city || 'Hyderabad');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectAddress = (addr: DeliveryAddress) => {
    setCurrentAddress(addr);
    setSelectedCity(addr.city);
    localStorage.setItem('gomeat_active_address', JSON.stringify(addr));
  };

  const handleOpenLocationModal = () => {
    window.history.pushState({ type: 'modal', name: 'location' }, '');
    setIsLocationModalOpen(true);
  };

  // Synchronize browser history so pressing "Back" retreats by 1 step instead of exiting the website
  useEffect(() => {
    // Baseline state on initial load
    if (!window.history.state) {
      window.history.replaceState({ type: 'tab', tab: 'catalog' }, '', window.location.hash || '/');
    }

    const handlePopState = () => {
      // Step 1: If any overlay or modal is active, dismiss it (retreats 1 step)
      if (isLocationModalOpen) {
        setIsLocationModalOpen(false);
        return;
      }
      if (isAiButcherOpen) {
        setIsAiButcherOpen(false);
        return;
      }
      if (isAuthOpen) {
        setIsAuthOpen(false);
        return;
      }
      if (isConfirmationOpen) {
        setIsConfirmationOpen(false);
        return;
      }
      if (isCheckoutOpen) {
        setIsCheckoutOpen(false);
        return;
      }
      if (legalModalType) {
        setLegalModalType(null);
        return;
      }
      if (isCartOpen) {
        setIsCartOpen(false);
        return;
      }

      // Step 2: If on a sub-tab (Live Tracking, Dashboard, Coolers, Hub Ops), return to Catalog homepage
      const hash = window.location.hash.replace('#', '') as any;
      if (hash && ['catalog', 'tracking', 'dashboard', 'coolers', 'admin'].includes(hash)) {
        setCurrentTab(hash);
      } else {
        setCurrentTab('catalog');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isLocationModalOpen, isAiButcherOpen, isAuthOpen, isCheckoutOpen, isConfirmationOpen, legalModalType, isCartOpen, currentTab, setIsCartOpen]);

  // Tab switching with history push
  const handleTabChange = (tab: 'catalog' | 'tracking' | 'dashboard' | 'coolers' | 'admin') => {
    if (tab === currentTab) return;
    window.history.pushState({ type: 'tab', tab }, '', tab === 'catalog' ? '/' : `#${tab}`);
    setCurrentTab(tab);
  };

  const handleOpenAuth = (roleHint?: 'customer' | 'admin') => {
    setAuthRoleHint(roleHint || 'customer');
    window.history.pushState({ type: 'modal', name: 'auth' }, '');
    setIsAuthOpen(true);
  };

  const handleCloseAuth = () => {
    setIsAuthOpen(false);
    if (authRoleHint === 'admin') {
      setCurrentTab('admin');
    }
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      handleOpenAuth('customer');
      return;
    }
    window.history.pushState({ type: 'modal', name: 'checkout' }, '');
    setIsCheckoutOpen(true);
  };

  const handleCloseCheckout = () => {
    setIsCheckoutOpen(false);
  };

  const handleOpenLegalModal = (type: 'tos' | 'privacy') => {
    window.history.pushState({ type: 'modal', name: 'legal' }, '');
    setLegalModalType(type);
  };

  const handleOpenAiButcher = () => {
    window.history.pushState({ type: 'modal', name: 'ai-butcher' }, '');
    setIsAiButcherOpen(true);
  };

  const handleCloseAiButcher = () => {
    setIsAiButcherOpen(false);
  };

  const handleOrderSuccess = (newOrder: Order) => {
    setConfirmedOrder(newOrder);
    window.history.pushState({ type: 'modal', name: 'order-confirmation' }, '');
    setIsConfirmationOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f9] dark:bg-[#080c14] text-gray-800 dark:text-gray-100 flex flex-col font-sans selection:bg-[#d11243] selection:text-white transition-colors duration-300 relative">
      
      {/* Radiant Ambient Light Effects */}
      <div className="light-glow-ambient" aria-hidden="true">
        <div className="light-glow-orb-1" />
        <div className="light-glow-orb-2" />
        <div className="light-glow-orb-3" />
      </div>

      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => handleTabChange(tab as any)}
        onOpenAuth={handleOpenAuth}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        currentAddress={currentAddress}
        onOpenLocationModal={handleOpenLocationModal}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        {currentTab === 'catalog' && (
          <CatalogPage 
            onNavigateToReturns={() => {
              if (!user) handleOpenAuth('customer');
              else handleTabChange('coolers');
            }}
            selectedCity={selectedCity}
            searchQuery={searchQuery}
            onSetSearchQuery={setSearchQuery}
          />
        )}

        {currentTab === 'tracking' && (
          <OrderTrackingPage 
            onNavigateToReturns={() => {
              if (!user) handleOpenAuth('customer');
              else handleTabChange('coolers');
            }}
          />
        )}

        {currentTab === 'dashboard' && (
          user ? (
            <CustomerDashboardPage 
              onNavigateToTracking={(orderId) => {
                handleTabChange('tracking');
              }}
              onNavigateToCatalog={() => {
                handleTabChange('catalog');
              }}
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-8 text-center max-w-md mx-auto my-12 space-y-3">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Please Sign In to Access Customer Dashboard</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">View previous orders, track live parcels, download invoices, and manage cold-box refunds.</p>
              <button
                onClick={() => handleOpenAuth('customer')}
                className="px-4 py-2 bg-[#d11243] hover:bg-[#b80f3b] text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
              >
                Sign In to Dashboard
              </button>
            </div>
          )
        )}

        {currentTab === 'coolers' && (
          user ? (
            <CoolerReturnsPage />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md mx-auto my-12 space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">Please Sign In to View Your Cold Boxes</h3>
              <p className="text-xs text-gray-500">Sign in with your registered account to manage box returns and track your ₹250 security deposit.</p>
              <button
                onClick={() => handleOpenAuth('customer')}
                className="px-4 py-2 bg-[#d11243] hover:bg-[#b80f3b] text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
              >
                Sign In with Credentials
              </button>
            </div>
          )
        )}

        {currentTab === 'admin' && (
          authLoading ? (
            <div className="flex items-center justify-center py-24 text-xs text-gray-500 font-bold">
              <div className="animate-spin mr-2 w-4 h-4 border-2 border-[#d11243] border-t-transparent rounded-full" />
              <span>Verifying Operations Hub credentials...</span>
            </div>
          ) : user?.role === 'admin' ? (
            <AdminDashboardPage />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-8 text-center max-w-md mx-auto my-12 space-y-3">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Operations Admin Authentication Required</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Access to the Central Hub Operations Control Room requires verified administrator credentials (ops@gomeat.in / admin123).</p>
              <button
                onClick={() => handleOpenAuth('admin')}
                className="px-4 py-2 bg-[#d11243] hover:bg-[#b80f3b] text-white rounded-xl font-bold text-xs cursor-pointer shadow-xs"
              >
                Sign In as Admin
              </button>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 mt-16 text-xs text-gray-600 dark:text-gray-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="space-y-3">
              <div className="flex items-center">
                <img 
                  src="/images/logo.png" 
                  alt="GoMeat - Freshness we can trust." 
                  className="h-9 w-auto object-contain" 
                />
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                India's finest cold-chain fresh meat & coastal seafood brand. Delivered farm-to-fork in reusable insulated cold-gel boxes at 0°C to 4°C with zero thermocol waste.
              </p>
              <div className="text-[10px] text-gray-400 dark:text-gray-500 space-y-0.5 pt-1">
                <div>FSSAI Central Lic. No: 11224333000491</div>
                <div>FSSC 22000 Certified Cold-Chain Processing</div>
                <div>GSTIN: 29AAECS4912J1Z8</div>
              </div>
            </div>

            <div>
              <h4 className="text-gray-900 dark:text-white font-bold mb-3">Popular Categories</h4>
              <ul className="space-y-1.5 text-gray-600 dark:text-gray-400 text-[11px]">
                <li>Daily Harbor Fish & Seafood (Surmai, Pomfret)</li>
                <li>Bio-Secured Farm Fresh Chicken</li>
                <li>Pasture-Grazed Young Tender Mutton</li>
                <li>Sea Tiger Prawns (Cleaned & Deveined)</li>
                <li>Chef-Crafted Ready to Cook Marinades</li>
              </ul>
            </div>

            <div>
              <h4 className="text-gray-900 dark:text-white font-bold mb-3">Reusable Box Initiative</h4>
              <ul className="space-y-1.5 text-gray-600 dark:text-gray-400 text-[11px]">
                <li>₹250 Refundable Security Deposit</li>
                <li>EPP Insulated Box with Ice Gel Packs</li>
                <li>Maintains 0°C - 4°C for up to 36 Hours</li>
                <li>Instant UPI Reversal upon Doorstep Pickup</li>
              </ul>
            </div>

            <div>
              <h4 className="text-gray-900 dark:text-white font-bold mb-3">Customer & Legal</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <button onClick={() => handleOpenLegalModal('tos')} className="text-gray-600 dark:text-gray-400 hover:text-[#d11243] cursor-pointer">
                    Terms of Service & Box Deposit Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => handleOpenLegalModal('privacy')} className="text-gray-600 dark:text-gray-400 hover:text-[#d11243] cursor-pointer">
                    Privacy Policy (DPDP Compliance)
                  </button>
                </li>
                <li>
                  <button onClick={() => {
                    if (!user) handleOpenAuth('customer');
                    else handleTabChange('coolers');
                  }} className="text-gray-600 dark:text-gray-400 hover:text-[#d11243] cursor-pointer">
                    Doorstep Box Collection
                  </button>
                </li>
                <li>
                  <button onClick={() => {
                    if (user?.role === 'admin') handleTabChange('admin');
                    else handleOpenAuth('admin');
                  }} className="text-gray-600 dark:text-gray-400 hover:text-[#d11243] cursor-pointer">
                    Hub Fulfillment Operations
                  </button>
                </li>
              </ul>
            </div>

          </div>

          <div className="border-t border-gray-100 dark:border-slate-800 pt-5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 dark:text-gray-500 gap-2">
            <div>
              © 2026 GoMeat Technologies Private Limited. All rights reserved.
            </div>
            <div>
              Fulfillment Depot: Outer Ring Road, Mahadevapura, Bengaluru 560048
            </div>
          </div>
        </div>
      </footer>

      {/* Swiggy Style Floating Bottom Cart Bar */}
      <FloatingBottomCartBar
        onViewCart={() => setIsCartOpen(true)}
        isHidden={isCartOpen || isCheckoutOpen || isConfirmationOpen || isLocationModalOpen || isAiButcherOpen}
      />

      {/* Cart Drawer */}
      <CartDrawer onCheckout={handleProceedToCheckout} />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckout}
        onOrderSuccess={handleOrderSuccess}
        selectedCity={selectedCity}
        currentAddress={currentAddress}
        onOpenLocationModal={handleOpenLocationModal}
      />

      {/* Location Selector Modal */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentAddress={currentAddress}
        onSelectAddress={handleSelectAddress}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
      />

      {/* Order Confirmation & Telemetry Modal (Figma Step 5) */}
      <OrderConfirmationModal
        order={confirmedOrder}
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onViewLiveTelemetry={() => {
          setIsConfirmationOpen(false);
          handleTabChange('tracking');
        }}
        onNavigateToReturns={() => {
          setIsConfirmationOpen(false);
          handleTabChange('coolers');
        }}
      />

      {/* Glassmorphic Login / Register Modal (Prompted only on Checkout or Sign In click) */}
      <GlassmorphicLoginGate
        isOpen={isAuthOpen}
        isModalMode={true}
        roleHint={authRoleHint}
        onCloseModal={handleCloseAuth}
        onUnlockGuest={handleCloseAuth}
      />

      {/* Legal Modals */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      {/* Floating AI Butcher & WhatsApp Concierge */}
      <WhatsAppButton 
        isChatbotOpen={isAiButcherOpen}
        onOpenChatbot={handleOpenAiButcher}
        onCloseChatbot={handleCloseAiButcher}
      />

    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
