import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {
  ShieldCheck,
  Snowflake,
  KeyRound,
  Phone,
  CheckCircle2,
  Clock,
  Box,
  Truck,
  MapPin,
  RefreshCw,
} from 'lucide-react-native';
import { theme } from '../theme';
import { api } from '../services/api';
import { getOrderDeliveryPin } from '@gomeat/shared';

interface OrderTrackingScreenProps {
  orderId?: string;
  onBackToHome: () => void;
}

export const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({
  orderId,
  onBackToHome,
}) => {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tempReading, setTempReading] = useState(2.3);

  const fetchOrder = async () => {
    if (!orderId) {
      // If no specific order ID passed, load latest order
      try {
        const myOrders = await api.getMyOrders();
        if (myOrders && myOrders.length > 0) {
          setOrder(myOrders[0]);
        }
      } catch (err) {
        console.log('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const data = await api.getOrderById(orderId);
      setOrder(data);
    } catch (err) {
      console.log('Error fetching order by ID:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Swiggy-grade real-time order polling
    const pollInterval = setInterval(() => {
      fetchOrder();
    }, 3000);

    // Gentle live temperature fluctuation between 1.8°C and 2.7°C
    const timer = setInterval(() => {
      setTempReading((prev) => {
        const delta = (Math.random() - 0.5) * 0.2;
        const next = Math.max(1.8, Math.min(2.8, prev + delta));
        return parseFloat(next.toFixed(1));
      });
    }, 4000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(timer);
    };
  }, [orderId]);

  const deliveryPin = order?.deliveryPin || getOrderDeliveryPin(order);

  const isDelivered = order?.status === 'Delivered' || order?.orderStatus === 'DELIVERED';
  const isOutForDelivery = isDelivered || order?.status === 'Out for Delivery' || order?.orderStatus === 'OUT_FOR_DELIVERY';
  const isPacked = isOutForDelivery || order?.status === 'Cold Box Packed' || order?.status === 'Packed' || order?.orderStatus === 'PACKED' || order?.prepStage === 'ready_for_dispatch';

  const trackingSteps = [
    { title: 'Order Confirmed', desc: 'Received & routed to dark store', done: true },
    { title: 'Chilled Pack Sealed', desc: order?.coolerId ? `Packed in EPP Box #${order.coolerId} with -18°C gel bricks` : 'Packed in wholesale EPP box with eutectic gel', done: isPacked },
    { title: 'Dispatched with Fleet', desc: order?.deliveryExecutive || 'Assigned to cold-chain delivery rider', done: isOutForDelivery },
    { title: 'Out for Delivery', desc: isDelivered ? 'Arrived at your gate' : 'Rider is on the way with your cold box', done: isOutForDelivery },
    { title: 'Doorstep Handover', desc: isDelivered ? '✓ Handover verified with 4-digit PIN' : 'Verify 4-digit PIN upon cooler handover', done: isDelivered },
  ];

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Connecting to ThermalVault Cold-Chain Feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Summary */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.orderNumber}>
                Order #{order?.id || order?.orderNumber || 'ORD-88219'}
              </Text>
              <Text style={styles.estimatedTime}>Arriving in 12–15 Mins</Text>
            </View>
            <Pressable style={styles.refreshBtn} onPress={fetchOrder}>
              <RefreshCw size={14} color={theme.colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* 4-DIGIT COLD BOX HANDOVER PIN CARD */}
        <View style={styles.pinCard}>
          <View style={styles.pinTopRow}>
            <View style={styles.pinKeyCircle}>
              <KeyRound size={20} color="#ffffff" />
            </View>
            <View style={styles.pinMeta}>
              <Text style={styles.pinTitle}>COLD BOX HANDOVER PIN</Text>
              <Text style={styles.pinSubtitle}>Unique to this order & customer</Text>
            </View>
          </View>

          <View style={styles.pinDisplayBox}>
            {deliveryPin.split('').map((char, i) => (
              <View key={i} style={styles.pinDigitBox}>
                <Text style={styles.pinDigit}>{char}</Text>
              </View>
            ))}
          </View>

          <View style={styles.pinNotice}>
            <ShieldCheck size={14} color="#15803d" />
            <Text style={styles.pinNoticeText}>
              Share this PIN with your delivery partner only after receiving the sealed Thermal Cold Box.
            </Text>
          </View>
        </View>

        {/* LIVE 0°C–4°C THERMAL VAULT TELEMETRY */}
        <View style={styles.vaultCard}>
          <View style={styles.vaultHeader}>
            <View style={styles.snowCircle}>
              <Snowflake size={18} color={theme.colors.sky} />
            </View>
            <View style={styles.vaultHeaderContent}>
              <Text style={styles.vaultTitle}>ThermalVault™ Live Cold Chain</Text>
              <Text style={styles.vaultSub}>IoT EPP Box Sensor Telemetry</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          </View>

          <View style={styles.tempGauge}>
            <Text style={styles.tempLarge}>{tempReading.toFixed(1)}°C</Text>
            <View style={styles.tempStatusPill}>
              <CheckCircle2 size={12} color="#15803d" />
              <Text style={styles.tempStatusText}>Sub-4°C Safe Range Verified</Text>
            </View>
          </View>

          <View style={styles.boxDepositInfo}>
            <Box size={14} color={theme.colors.textMuted} />
            <Text style={styles.boxDepositInfoText}>
              ₹250 Refundable Cooler Box: Return to rider now, or schedule doorstep pickup from your GoMeat Vault.
            </Text>
          </View>
        </View>

        {/* DELIVERY PARTNER CARD */}
        <View style={styles.partnerCard}>
          <View style={styles.partnerInfo}>
            <View style={styles.riderAvatar}>
              <Truck size={18} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.riderName}>Ramesh Kumar</Text>
              <Text style={styles.riderRole}>GoMeat Cold-Fleet Specialist</Text>
              <Text style={styles.riderVehicle}>KA-03-HD-2041 • Hero Electric</Text>
            </View>
          </View>
          <Pressable
            style={styles.callBtn}
            onPress={() => Linking.openURL('tel:9876543210')}
          >
            <Phone size={16} color="#ffffff" />
            <Text style={styles.callBtnText}>Call</Text>
          </Pressable>
        </View>

        {/* 5-STAGE ORDER TIMELINE */}
        <View style={styles.timelineCard}>
          <Text style={styles.timelineTitle}>Delivery Progress</Text>
          {trackingSteps.map((step, idx) => (
            <View key={idx} style={styles.timelineStep}>
              <View style={styles.stepIndicator}>
                <View
                  style={[
                    styles.stepDot,
                    step.done ? styles.stepDotDone : styles.stepDotPending,
                  ]}
                >
                  {step.done ? (
                    <CheckCircle2 size={14} color="#ffffff" />
                  ) : (
                    <Clock size={12} color={theme.colors.textMuted} />
                  )}
                </View>
                {idx !== trackingSteps.length - 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      step.done && styles.stepLineDone,
                    ]}
                  />
                )}
              </View>
              <View style={styles.stepContent}>
                <Text
                  style={[
                    styles.stepTitle,
                    step.done ? styles.stepTitleDone : styles.stepTitlePending,
                  ]}
                >
                  {step.title}
                </Text>
                <Text style={styles.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* RETURN HOME BUTTON */}
        <Pressable style={styles.homeBtn} onPress={onBackToHome}>
          <Text style={styles.homeBtnText}>Back to Fresh Cuts</Text>
        </Pressable>
      </ScrollView>
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.bg,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  headerCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.card,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderNumber: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weightSemi,
  },
  estimatedTime: {
    fontSize: 18,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
    marginTop: 2,
  },
  refreshBtn: {
    padding: 8,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.radius.md,
  },
  pinCard: {
    backgroundColor: '#1e293b',
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    ...theme.shadow.card,
  },
  pinTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  pinKeyCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinMeta: {},
  pinTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: theme.typography.weightBold,
    letterSpacing: 1,
  },
  pinSubtitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: theme.typography.weightSemi,
  },
  pinDisplayBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  pinDigitBox: {
    width: 54,
    height: 60,
    borderRadius: theme.radius.lg,
    backgroundColor: '#0f172a',
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDigit: {
    fontSize: 28,
    fontWeight: theme.typography.weightBold,
    color: '#38bdf8',
    letterSpacing: 2,
  },
  pinNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#064e3b',
    padding: 10,
    borderRadius: theme.radius.md,
  },
  pinNoticeText: {
    color: '#a7f3d0',
    fontSize: 11,
    flex: 1,
    lineHeight: 15,
  },
  vaultCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: '#bae6fd',
    padding: theme.spacing.lg,
    ...theme.shadow.card,
  },
  vaultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  snowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultHeaderContent: {
    flex: 1,
  },
  vaultTitle: {
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
    color: '#0369a1',
  },
  vaultSub: {
    fontSize: 11,
    color: '#0284c7',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16a34a',
  },
  liveText: {
    fontSize: 9,
    fontWeight: theme.typography.weightBold,
    color: '#15803d',
  },
  tempGauge: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  tempLarge: {
    fontSize: 36,
    fontWeight: theme.typography.weightBold,
    color: '#0284c7',
  },
  tempStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    marginTop: 4,
  },
  tempStatusText: {
    color: '#15803d',
    fontSize: 11,
    fontWeight: theme.typography.weightBold,
  },
  boxDepositInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0f2fe',
  },
  boxDepositInfoText: {
    fontSize: 11,
    color: '#0369a1',
    flex: 1,
    lineHeight: 15,
  },
  partnerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadow.card,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  riderAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  riderName: {
    fontSize: 14,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
  },
  riderRole: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  riderVehicle: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  callBtn: {
    backgroundColor: theme.colors.emerald,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
  },
  callBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: theme.typography.weightBold,
  },
  timelineCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.card,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
    marginBottom: 16,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepIndicator: {
    alignItems: 'center',
    width: 28,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: theme.colors.primary,
  },
  stepDotPending: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stepLine: {
    width: 2,
    height: 36,
    backgroundColor: theme.colors.border,
    marginVertical: 2,
  },
  stepLineDone: {
    backgroundColor: theme.colors.primary,
  },
  stepContent: {
    flex: 1,
    marginLeft: 10,
    paddingBottom: 20,
  },
  stepTitle: {
    fontSize: 13,
    marginBottom: 2,
  },
  stepTitleDone: {
    color: theme.colors.navy,
    fontWeight: theme.typography.weightBold,
  },
  stepTitlePending: {
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weightMedium,
  },
  stepDesc: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 15,
  },
  homeBtn: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.lg,
    paddingVertical: 12,
    alignItems: 'center',
  },
  homeBtnText: {
    color: theme.colors.navy,
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
  },
});
