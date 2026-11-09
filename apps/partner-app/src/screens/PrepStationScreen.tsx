import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
  RefreshControl,
} from 'react-native';
import {
  Scissors,
  PackageCheck,
  Box,
  Truck,
  CheckCircle2,
  Clock,
  Snowflake,
  ShieldAlert,
  ArrowRight,
  QrCode,
} from 'lucide-react-native';
import { theme } from '../theme';
import { usePartner } from '../context/PartnerContext';

export const PrepStationScreen: React.FC = () => {
  const { orders, advanceOrderStage, loading, fetchOrders } = usePartner();
  const [coolerInputMap, setCoolerInputMap] = useState<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const getCoolerInput = (orderId: string) => {
    return coolerInputMap[orderId] || `CLR-EPP-${orderId.slice(-3) || '104'}`;
  };

  const setCoolerInput = (orderId: string, val: string) => {
    setCoolerInputMap((prev) => ({ ...prev, [orderId]: val }));
  };

  const activePrepOrders = orders.length > 0 ? orders : [
    {
      id: 'ORD-88219',
      customerName: 'Ananya Sharma',
      prepStage: 'butchering',
      coolerId: 'CLR-EPP-104',
      items: [
        { name: 'Fresh Chicken Curry Cut', quantity: 2, unit: '500g', cutStyle: 'Small Curry Cut with Bone' },
        { name: 'Fresh Mutton Biryani Cut', quantity: 1, unit: '500g', cutStyle: 'Large Biryani Cut' },
      ],
      total: 749,
      depositAmount: 250,
      createdAt: '10:02 AM',
    },
    {
      id: 'ORD-88220',
      customerName: 'Karthik Raja',
      prepStage: 'received',
      items: [
        { name: 'Mangalore Kingfish (Surmai)', quantity: 1, unit: '500g', cutStyle: 'Bengali Steak Cut (Bone-In)' },
        { name: 'Fresh Chicken Breast Boneless', quantity: 1, unit: '500g', cutStyle: 'Fillet Cut' },
      ],
      total: 1250,
      depositAmount: 250,
      createdAt: '10:14 AM',
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Cold Prep & Packaging KDS Board</Text>
          <Text style={styles.sectionSub}>{activePrepOrders.length} Orders in Queue</Text>
        </View>

        {activePrepOrders.map((order, idx) => {
          const orderId = order.id || order.orderNumber;
          const stage = order.prepStage || 'received';
          const coolerId = order.coolerId || getCoolerInput(orderId);

          return (
            <View key={orderId || idx} style={styles.orderCard}>
              {/* Order Header */}
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.orderNumber}>#{orderId}</Text>
                  <Text style={styles.customerName}>{order.customerName || 'Customer'}</Text>
                </View>

                {/* Stage Badge */}
                <View
                  style={[
                    styles.stageBadge,
                    stage === 'received' && styles.stageBadgeAmber,
                    stage === 'butchering' && styles.stageBadgeTeal,
                    stage === 'vacuum_packed' && styles.stageBadgeBlue,
                    stage === 'ready_for_dispatch' && styles.stageBadgeEmerald,
                  ]}
                >
                  <Text style={styles.stageBadgeText}>
                    {stage === 'received' && '1. Order Received'}
                    {stage === 'butchering' && '2. Butchering Cut'}
                    {stage === 'vacuum_packed' && '3. Vacuum Sealed'}
                    {stage === 'ready_for_dispatch' && '4. Ready for Fleet'}
                  </Text>
                </View>
              </View>

              {/* Items List with Cut Styles */}
              <View style={styles.itemsList}>
                {order.items?.map((item: any, iIdx: number) => (
                  <View key={iIdx} style={styles.itemRow}>
                    <View style={styles.itemBullet} />
                    <View style={styles.itemTextCol}>
                      <Text style={styles.itemName}>
                        {item.quantity}x {item.name} ({item.unit})
                      </Text>
                      <Text style={styles.cutStyleText}>
                        Cut Style: <Text style={styles.cutStyleBold}>{item.cutStyle || 'Standard Curry Cut'}</Text>
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Cooler Box Assignment Input */}
              <View style={styles.coolerAssignRow}>
                <Box size={16} color={theme.colors.sky} />
                <Text style={styles.coolerAssignLabel}>Assigned Wholesale EPP Box:</Text>
                <TextInput
                  style={styles.coolerInput}
                  value={coolerId}
                  onChangeText={(val) => setCoolerInput(orderId, val)}
                  placeholder="CLR-EPP-104"
                />
              </View>

              {/* Action Buttons based on Stage */}
              <View style={styles.actionRow}>
                {stage === 'received' && (
                  <Pressable
                    style={[styles.actionBtn, styles.actionBtnAmber]}
                    onPress={() => advanceOrderStage(orderId, 'butchering', coolerId)}
                  >
                    <Scissors size={16} color="#ffffff" />
                    <Text style={styles.actionBtnText}>Start Butchering Cut</Text>
                  </Pressable>
                )}

                {stage === 'butchering' && (
                  <Pressable
                    style={[styles.actionBtn, styles.actionBtnTeal]}
                    onPress={() => advanceOrderStage(orderId, 'vacuum_packed', coolerId)}
                  >
                    <PackageCheck size={16} color="#ffffff" />
                    <Text style={styles.actionBtnText}>Vacuum Seal & Weigh</Text>
                  </Pressable>
                )}

                {stage === 'vacuum_packed' && (
                  <Pressable
                    style={[styles.actionBtn, styles.actionBtnSky]}
                    onPress={() => advanceOrderStage(orderId, 'ready_for_dispatch', coolerId)}
                  >
                    <Snowflake size={16} color="#ffffff" />
                    <Text style={styles.actionBtnText}>Pack in EPP Box (-18°C Gels)</Text>
                  </Pressable>
                )}

                {stage === 'ready_for_dispatch' && (
                  <View style={styles.readyPill}>
                    <CheckCircle2 size={16} color="#15803d" />
                    <Text style={styles.readyPillText}>Packed & Sealed (Ready for Rider Handover)</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
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
  sectionHeader: {
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
  },
  sectionSub: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  orderCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: 10,
  },
  orderNumber: {
    fontSize: 14,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
  },
  customerName: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
  stageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  stageBadgeAmber: {
    backgroundColor: '#fef3c7',
  },
  stageBadgeTeal: {
    backgroundColor: '#ccfbf1',
  },
  stageBadgeBlue: {
    backgroundColor: '#e0f2fe',
  },
  stageBadgeEmerald: {
    backgroundColor: '#dcfce7',
  },
  stageBadgeText: {
    fontSize: 11,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
  },
  itemsList: {
    gap: 8,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  itemBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
    marginTop: 6,
  },
  itemTextCol: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
  },
  cutStyleText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  cutStyleBold: {
    color: theme.colors.teal,
    fontWeight: theme.typography.weightSemi,
  },
  coolerAssignRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surfaceSubtle,
    padding: 8,
    borderRadius: theme.radius.md,
    marginBottom: 12,
  },
  coolerAssignLabel: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weightMedium,
  },
  coolerInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 12,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
  },
  actionRow: {},
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
  },
  actionBtnAmber: {
    backgroundColor: '#d97706',
  },
  actionBtnTeal: {
    backgroundColor: theme.colors.teal,
  },
  actionBtnSky: {
    backgroundColor: theme.colors.sky,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
  },
  readyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#dcfce7',
    paddingVertical: 8,
    borderRadius: theme.radius.md,
  },
  readyPillText: {
    color: '#15803d',
    fontSize: 12,
    fontWeight: theme.typography.weightBold,
  },
});
