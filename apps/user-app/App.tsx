import React, { useState } from 'react';
import { StyleSheet, View, Text, Pressable, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Home, ShoppingBag, Truck, Wallet as WalletIcon } from 'lucide-react-native';

import { theme } from './src/theme';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider, useCart } from './src/context/CartContext';
import { Header } from './src/components/Header';
import { HomeScreen } from './src/screens/HomeScreen';
import { CartScreen } from './src/screens/CartScreen';
import { OrderTrackingScreen } from './src/screens/OrderTrackingScreen';
import { WalletScreen } from './src/screens/WalletScreen';
import { LoginScreen } from './src/screens/LoginScreen';

type Tab = 'home' | 'cart' | 'track' | 'vault';

function MainApp() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [activeOrderId, setActiveOrderId] = useState<string | undefined>(undefined);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { totalItemCount } = useCart();

  const handleOrderPlaced = (orderId: string) => {
    setActiveOrderId(orderId);
    setActiveTab('track');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      
      {/* Top Header */}
      <Header
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenWallet={() => setActiveTab('vault')}
      />

      {/* Screen Container */}
      <View style={styles.screenContainer}>
        {activeTab === 'home' && (
          <HomeScreen onNavigateToCart={() => setActiveTab('cart')} />
        )}
        {activeTab === 'cart' && (
          <CartScreen
            onOrderPlaced={handleOrderPlaced}
            onContinueShopping={() => setActiveTab('home')}
          />
        )}
        {activeTab === 'track' && (
          <OrderTrackingScreen
            orderId={activeOrderId}
            onBackToHome={() => setActiveTab('home')}
          />
        )}
        {activeTab === 'vault' && <WalletScreen />}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <Pressable
          style={styles.tabBtn}
          onPress={() => setActiveTab('home')}
        >
          <Home
            size={22}
            color={activeTab === 'home' ? theme.colors.primary : theme.colors.textMuted}
            strokeWidth={activeTab === 'home' ? 2.5 : 2}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'home' && styles.tabLabelActive,
            ]}
          >
            Fresh Cuts
          </Text>
        </Pressable>

        <Pressable
          style={styles.tabBtn}
          onPress={() => setActiveTab('cart')}
        >
          <View style={styles.cartIconWrapper}>
            <ShoppingBag
              size={22}
              color={activeTab === 'cart' ? theme.colors.primary : theme.colors.textMuted}
              strokeWidth={activeTab === 'cart' ? 2.5 : 2}
            />
            {totalItemCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalItemCount}</Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'cart' && styles.tabLabelActive,
            ]}
          >
            Cart
          </Text>
        </Pressable>

        <Pressable
          style={styles.tabBtn}
          onPress={() => setActiveTab('track')}
        >
          <Truck
            size={22}
            color={activeTab === 'track' ? theme.colors.primary : theme.colors.textMuted}
            strokeWidth={activeTab === 'track' ? 2.5 : 2}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'track' && styles.tabLabelActive,
            ]}
          >
            Track Order
          </Text>
        </Pressable>

        <Pressable
          style={styles.tabBtn}
          onPress={() => setActiveTab('vault')}
        >
          <WalletIcon
            size={22}
            color={activeTab === 'vault' ? theme.colors.primary : theme.colors.textMuted}
            strokeWidth={activeTab === 'vault' ? 2.5 : 2}
          />
          <Text
            style={[
              styles.tabLabel,
              activeTab === 'vault' && styles.tabLabelActive,
            ]}
          >
            Vault & Box
          </Text>
        </Pressable>
      </View>

      {/* Login Modal Sheet */}
      {isLoginModalOpen && (
        <LoginScreen
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={() => setIsLoginModalOpen(false)}
        />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  screenContainer: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    ...theme.shadow.card,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  cartIconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: theme.typography.weightBold,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: theme.typography.weightMedium,
    color: theme.colors.textMuted,
  },
  tabLabelActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weightBold,
  },
});
