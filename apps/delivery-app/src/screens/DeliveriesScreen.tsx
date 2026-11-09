import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {
  MapPin,
  Phone,
  Navigation,
  KeyRound,
  Snowflake,
  Box,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react-native';
import { theme } from '../theme';
import { useRider } from '../context/RiderContext';
import { PinVerificationModal } from '../components/PinVerificationModal';

export const DeliveriesScreen: React.FC = () => {
  const { orders, loading, fetchOrders, isOnline } = useRider();
  const [selectedOrderForPin, setSelectedOrderForPin] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone || '9876543210'}`);
  };

  const handleNavigate = (address: string) => {
    const encoded = encodeURIComponent(address || 'Indiranagar Bangalore');
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encoded}`);
  };

  // If rider is offline
  if (!isOnline) {
    return (
      <View style={styles.offlineContainer}>
        <View style={styles.offlineIcon}>
          <Clock size={40} color={theme.colors.textMuted} />
        </View>
        <Text style={styles.offlineTitle}>You are Currently OFF DUTY</Text>
        <Text style={styles.offlineSub}>
          Tap 'OFF DUTY' at the top to go Online and start receiving cold-chain deliveries.
        </Text>
      </View>
    );
  }

  // Active runs list
  const activeOrders = orders.length > 0 ? orders : [
    {
      id: 'ORD-88219',
      customerName: 'Ananya Sharma',
      customerPhone: '9876543210',
      shippingAddress: {
        address: 'Flat 402, Prestige Palms, 100ft Road, Indiranagar',
        city: 'Bengaluru',
      },
      total: 749,
      depositAmount: 250,
      paymentMethod: 'razorpay',
      paymentStatus: 'paid',
      coolerId: 'CLR-EPP-104',
      itemsCount: 3,
      status: 'out_for_delivery',
      currentTemp: 2.3,
    },
    {
      id: 'ORD-88220',
      customerName: 'Karthik Raja',
      customerPhone: '9876500112',
      shippingAddress: {
        address: 'Villa 12, Windmills of Your Mind, Whitefield',
        city: 'Bengaluru',
      },
      total: 1250,
      depositAmount: 250,
      paymentMethod: 'upi',
      paymentStatus: 'paid',
      coolerId: 'CLR-EPP-118',
      itemsCount: 4,
      status: 'out_for_delivery',
      currentTemp: 2.1,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Cold Deliveries ({activeOrders.length})</Text>
          <View style={styles.liveTag}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>GPS ACTIVE</Text>
          </View>
        </View>

        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Syncing Fleet Dispatch...</Text>
          </View>
        ) : (
          activeOrders.map((order: any, idx: number) => {
            const isDelivered = order.status === 'delivered';
            const customerName = order.customerName || 'Customer';
            const customerPhone = order.customerPhone || '9876543210';
            const address = order.shippingAddress?.address || order.address || 'Indiranagar 100ft Road';
            const coolerId = order.coolerId || `CLR-EPP-${order.id?.slice(-3) || '102'}`;
            const temp = order.currentTemp || 2.3;

            return (
              <View key={order.id || idx} style={[styles.orderCard, isDelivered && styles.orderCardDelivered]}>
                {/* Top Row: Order ID & Temp */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.orderIdBadge}>
                    <Text style={styles.orderIdText}>#{order.id || order.orderNumber}</Text>
                  </View>

                  <View style={styles.tempBadge}>
                    <Snowflake size={12} color={theme.colors.sky} />
                    <Text style={styles.tempText}>{temp.toFixed(1)}°C Probe</Text>
                  </View>

                  <View style={styles.coolerBadge}>
                    <Box size={12} color="#ffffff" />
                    <Text style={styles.coolerText}>{coolerId}</Text>
                  </View>
                </View>

                {/* Customer Details */}
                <View style={styles.customerRow}>
                  <View style={styles.customerInfo}>
                    <Text style={styles.customerName}>{customerName}</Text>
                    <Text style={styles.customerPhoneText}>{customerPhone}</Text>
                  </View>

                  <Pressable style={styles.callButton} onPress={() => handleCall(customerPhone)}>
                    <Phone size={14} color="#ffffff" />
                    <Text style={styles.callButtonText}>Call</Text>
                  </Pressable>
                </View>

                {/* Delivery Address */}
                <View style={styles.addressRow}>
                  <MapPin size={16} color={theme.colors.primary} style={styles.pinIcon} />
                  <Text style={styles.addressText} numberOfLines={2}>
                    {address}
                  </Text>
                  <Pressable style={styles.navButton} onPress={() => handleNavigate(address)}>
                    <Navigation size={14} color="#ffffff" />
                  </Pressable>
                </View>

                {/* Payment & Items Meta */}
                <View style={styles.metaRow}>
                  <Text style={styles.metaText}>
                    Amount: <Text style={styles.metaBold}>₹{order.total || 499}</Text> • {order.paymentStatus === 'paid' ? 'Paid Online' : 'Cash on Delivery'}
                  </Text>
                  <Text style={styles.depositNote}>₹250 Box Protected</Text>
                </View>

                {/* Main Action */}
                {isDelivered ? (
                  <View style={styles.deliveredPill}>
                    <CheckCircle2 size={16} color="#ffffff" />
                    <Text style={styles.deliveredPillText}>Handover Complete (Delivered)</Text>
                  </View>
                ) : (
                  <Pressable
                    style={styles.verifyActionBtn}
                    onPress={() => setSelectedOrderForPin(order)}
                  >
                    <KeyRound size={16} color="#ffffff" />
                    <Text style={styles.verifyActionBtnText}>
                      Verify 4-Digit Handover PIN
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* PIN VERIFICATION MODAL */}
      {selectedOrderForPin && (
        <PinVerificationModal
          order={selectedOrderForPin}
          onClose={() => setSelectedOrderForPin(null)}
          onSuccess={() => setSelectedOrderForPin(null)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
    gap: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: theme.typography.weightBold,
    color: '#ffffff',
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#064e3b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  liveText: {
    fontSize: 10,
    fontWeight: theme.typography.weightBold,
    color: '#a7f3d0',
  },
  orderCard: {
    backgroundColor: theme.colors.fleetCard,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.fleetBorder,
    padding: theme.spacing.md,
    ...theme.shadow.card,
  },
  orderCardDelivered: {
    opacity: 0.75,
    borderColor: theme.colors.emerald,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  orderIdBadge: {
    backgroundColor: theme.colors.fleetDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  orderIdText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: theme.typography.weightBold,
  },
  tempBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0c4a6e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  tempText: {
    color: '#7dd3fc',
    fontSize: 11,
    fontWeight: theme.typography.weightSemi,
  },
  coolerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    marginLeft: 'auto',
  },
  coolerText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: theme.typography.weightSemi,
  },
  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  customerInfo: {},
  customerName: {
    fontSize: 15,
    fontWeight: theme.typography.weightBold,
    color: '#ffffff',
  },
  customerPhoneText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.emerald,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.md,
  },
  callButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: theme.typography.weightBold,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.fleetDark,
    padding: 10,
    borderRadius: theme.radius.md,
    marginBottom: 10,
    gap: 6,
  },
  pinIcon: {
    marginTop: 2,
  },
  addressText: {
    flex: 1,
    color: theme.colors.textSecondary,
    fontSize: 12,
    lineHeight: 16,
  },
  navButton: {
    backgroundColor: theme.colors.primary,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  metaBold: {
    color: '#ffffff',
    fontWeight: theme.typography.weightBold,
  },
  depositNote: {
    fontSize: 11,
    color: theme.colors.emerald,
    fontWeight: theme.typography.weightSemi,
  },
  verifyActionBtn: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
  },
  verifyActionBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: theme.typography.weightBold,
  },
  deliveredPill: {
    backgroundColor: theme.colors.emerald,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
  },
  deliveredPillText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
  },
  centerContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 10,
  },
  offlineContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: theme.colors.bg,
  },
  offlineIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.fleetCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  offlineTitle: {
    fontSize: 18,
    fontWeight: theme.typography.weightBold,
    color: '#ffffff',
    marginBottom: 6,
  },
  offlineSub: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
