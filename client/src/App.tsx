import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { CatalogPage } from './pages/CatalogPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { CoolerReturnsPage } from './pages/CoolerReturnsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { LegalModal } from './components/LegalModals';
import { WhatsAppButton } from './components/WhatsAppButton';
import type { Order } from './types';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<'catalog' | 'tracking' | 'coolers' | 'admin'>('catalog');
  const [selectedCity, setSelectedCity] = useState('Bengaluru');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authRoleHint, setAuthRoleHint] = useState<'customer' | 'admin'>('customer');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [legalModalType, setLegalModalType] = useState<'tos' | 'privacy' | null>(null);

  const handleOrderSuccess = (_newOrder: Order) => {
    setCurrentTab('tracking');
  };

  const handleOpenAuth = (roleHint?: 'customer' | 'admin') => {
    setAuthRoleHint(roleHint || 'customer');
    setIsAuthOpen(true);
  };

  const handleProceedToCheckout = () => {
    if (!user) {
      handleOpenAuth('customer');
      return;
    }
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f9] text-gray-800 flex flex-col font-sans selection:bg-[#d11243] selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => setCurrentTab(tab as any)}
        onOpenAuth={handleOpenAuth}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5">
        {currentTab === 'catalog' && (
          <CatalogPage 
            onNavigateToReturns={() => {
              if (!user) handleOpenAuth('customer');
              else setCurrentTab('coolers');
            }}
            selectedCity={selectedCity}
            searchQuery={searchQuery}
          />
        )}

        {currentTab === 'tracking' && (
          <OrderTrackingPage 
            onNavigateToReturns={() => {
              if (!user) handleOpenAuth('customer');
              else setCurrentTab('coolers');
            }}
          />
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
          user?.role === 'admin' ? (
            <AdminDashboardPage />
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md mx-auto my-12 space-y-3">
              <h3 className="font-bold text-gray-900 text-sm">Operations Admin Authentication Required</h3>
              <p className="text-xs text-gray-500">Access to the Central Hub Operations Control Room requires verified administrator credentials (ops@gomeat.in / admin123).</p>
              <button
                onClick={() => handleOpenAuth('admin')}
                className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
              >
                Sign In as Admin
              </button>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-16 text-xs text-gray-600">
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
              <p className="text-[11px] text-gray-500 leading-relaxed">
                India's finest cold-chain fresh meat & coastal seafood brand. Delivered farm-to-fork in reusable insulated cold-gel boxes at 0°C to 4°C with zero thermocol waste.
              </p>
              <div className="text-[10px] text-gray-400 space-y-0.5 pt-1">
                <div>FSSAI Central Lic. No: 11224333000491</div>
                <div>FSSC 22000 Certified Cold-Chain Processing</div>
                <div>GSTIN: 29AAECS4912J1Z8</div>
              </div>
            </div>

            <div>
              <h4 className="text-gray-900 font-bold mb-3">Popular Categories</h4>
              <ul className="space-y-1.5 text-gray-600 text-[11px]">
                <li>Daily Harbor Fish & Seafood (Surmai, Pomfret)</li>
                <li>Bio-Secured Farm Fresh Chicken</li>
                <li>Pasture-Grazed Young Tender Mutton</li>
                <li>Sea Tiger Prawns (Cleaned & Deveined)</li>
                <li>Chef-Crafted Ready to Cook Marinades</li>
              </ul>
            </div>

            <div>
              <h4 className="text-gray-900 font-bold mb-3">Reusable Box Initiative</h4>
              <ul className="space-y-1.5 text-gray-600 text-[11px]">
                <li>₹250 Refundable Security Deposit</li>
                <li>EPP Insulated Box with Ice Gel Packs</li>
                <li>Maintains 0°C - 4°C for up to 36 Hours</li>
                <li>Instant UPI Reversal upon Doorstep Pickup</li>
              </ul>
            </div>

            <div>
              <h4 className="text-gray-900 font-bold mb-3">Customer & Legal</h4>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <button onClick={() => setLegalModalType('tos')} className="text-gray-600 hover:text-[#d11243] cursor-pointer">
                    Terms of Service & Box Deposit Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => setLegalModalType('privacy')} className="text-gray-600 hover:text-[#d11243] cursor-pointer">
                    Privacy Policy (DPDP Compliance)
                  </button>
                </li>
                <li>
                  <button onClick={() => {
                    if (!user) handleOpenAuth('customer');
                    else setCurrentTab('coolers');
                  }} className="text-gray-600 hover:text-[#d11243] cursor-pointer">
                    Doorstep Box Collection
                  </button>
                </li>
                <li>
                  <button onClick={() => {
                    if (user?.role === 'admin') setCurrentTab('admin');
                    else handleOpenAuth('admin');
                  }} className="text-gray-600 hover:text-[#d11243] cursor-pointer">
                    Hub Fulfillment Operations
                  </button>
                </li>
              </ul>
            </div>

          </div>

          <div className="border-t border-gray-100 pt-5 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 gap-2">
            <div>
              © 2026 GoMeat Technologies Private Limited. All rights reserved.
            </div>
            <div>
              Fulfillment Depot: Outer Ring Road, Mahadevapura, Bengaluru 560048
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer onCheckout={handleProceedToCheckout} />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={handleOrderSuccess}
        selectedCity={selectedCity}
      />

      {/* Auth Modal with explicit credential inputs */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        defaultRoleHint={authRoleHint}
      />

      {/* Legal Modals */}
      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />

      {/* Floating WhatsApp Quick Order & Support Button */}
      <WhatsAppButton />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <MainApp />
      </CartProvider>
    </AuthProvider>
  );
}
