import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import {
  Wallet,
  TrendingUp,
  Box,
  Truck,
  Heart,
  Calendar,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react-native';
import { theme } from '../theme';
import { useRider } from '../context/RiderContext';

export const EarningsScreen: React.FC = () => {
  const { metrics } = useRider();

  const dropPay = metrics.deliveredCount * 45;
  const boxPay = metrics.coolersCollected * 15;
  const tips = 60;
  const surge = 45;
  const grandTotal = dropPay + boxPay + tips + surge;

  const pastShifts = [
    { date: 'Yesterday (Sunday)', drops: 14, boxes: 11, total: 910 },
    { date: 'Saturday', drops: 18, boxes: 15, total: 1180 },
    { date: 'Friday', drops: 12, boxes: 9, total: 785 },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Earnings Card */}
        <View style={styles.heroCard}>
          <Text style={styles.heroSub}>Today's Shift Payout</Text>
          <Text style={styles.heroTotal}>₹{grandTotal}</Text>
          <View style={styles.heroStatus}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Auto-settles to UPI tonight at 11:30 PM</Text>
          </View>
        </View>

        {/* Breakdown Card */}
        <View style={styles.breakdownCard}>
          <Text style={styles.cardHeader}>Shift Breakdown</Text>

          <View style={styles.breakdownRow}>
            <View style={styles.iconCircle}>
              <Truck size={16} color={theme.colors.primary} />
            </View>
            <View style={styles.rowTexts}>
              <Text style={styles.rowTitle}>Cold Deliveries Completed</Text>
              <Text style={styles.rowSubtitle}>{metrics.deliveredCount} drops @ ₹45 / drop</Text>
            </View>
            <Text style={styles.rowAmount}>₹{dropPay}</Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={[styles.iconCircle, styles.boxCircle]}>
              <Box size={16} color={theme.colors.emerald} />
            </View>
            <View style={styles.rowTexts}>
              <Text style={styles.rowTitle}>EPP Cooler Box Returns</Text>
              <Text style={styles.rowSubtitle}>{metrics.coolersCollected} boxes collected @ ₹15 / box</Text>
            </View>
            <Text style={styles.rowAmount}>₹{boxPay}</Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={[styles.iconCircle, styles.tipCircle]}>
              <Heart size={16} color="#f43f5e" />
            </View>
            <View style={styles.rowTexts}>
              <Text style={styles.rowTitle}>Customer Doorstep Tips</Text>
              <Text style={styles.rowSubtitle}>100% passed to you</Text>
            </View>
            <Text style={styles.rowAmount}>₹{tips}</Text>
          </View>

          <View style={styles.breakdownRow}>
            <View style={[styles.iconCircle, styles.surgeCircle]}>
              <TrendingUp size={16} color="#eab308" />
            </View>
            <View style={styles.rowTexts}>
              <Text style={styles.rowTitle}>Cold-Fleet On-Time Surge</Text>
              <Text style={styles.rowSubtitle}>Sub-4°C Zero Thaw Performance</Text>
            </View>
            <Text style={styles.rowAmount}>₹{surge}</Text>
          </View>
        </View>

        {/* Bank UPI Payout Account */}
        <View style={styles.upiCard}>
          <View style={styles.upiIconCircle}>
            <Wallet size={20} color="#ffffff" />
          </View>
          <View style={styles.upiTexts}>
            <Text style={styles.upiTitle}>Linked Payout VPA</Text>
            <Text style={styles.upiVpa}>ramesh.rider@okhdfcbank</Text>
          </View>
          <View style={styles.verifiedTag}>
            <ShieldCheck size={12} color="#15803d" />
            <Text style={styles.verifiedText}>VERIFIED</Text>
          </View>
        </View>

        {/* Past Shifts */}
        <View style={styles.historyCard}>
          <Text style={styles.cardHeader}>Recent Shifts</Text>
          {pastShifts.map((shift, i) => (
            <View key={i} style={[styles.historyRow, i !== pastShifts.length - 1 && styles.historyRowBorder]}>
              <Calendar size={14} color={theme.colors.textMuted} />
              <View style={styles.historyTexts}>
                <Text style={styles.historyDate}>{shift.date}</Text>
                <Text style={styles.historyMeta}>
                  {shift.drops} drops • {shift.boxes} coolers returned
                </Text>
              </View>
              <Text style={styles.historyAmount}>₹{shift.total}</Text>
            </View>
          ))}
        </View>
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
  heroCard: {
    backgroundColor: theme.colors.fleetCard,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.fleetBorder,
    ...theme.shadow.card,
  },
  heroSub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weightSemi,
  },
  heroTotal: {
    fontSize: 38,
    fontWeight: theme.typography.weightBold,
    color: '#ffffff',
    marginVertical: 4,
  },
  heroStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.fleetDark,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: theme.radius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.emerald,
  },
  statusText: {
    fontSize: 11,
    color: '#a7f3d0',
    fontWeight: theme.typography.weightMedium,
  },
  breakdownCard: {
    backgroundColor: theme.colors.fleetCard,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.fleetBorder,
    ...theme.shadow.card,
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: theme.typography.weightBold,
    color: '#ffffff',
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#3b1318',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  boxCircle: {
    backgroundColor: '#064e3b',
  },
  tipCircle: {
    backgroundColor: '#4c0519',
  },
  surgeCircle: {
    backgroundColor: '#422006',
  },
  rowTexts: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 13,
    fontWeight: theme.typography.weightSemi,
    color: '#ffffff',
  },
  rowSubtitle: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  rowAmount: {
    fontSize: 15,
    fontWeight: theme.typography.weightBold,
    color: '#ffffff',
  },
  upiCard: {
    backgroundColor: theme.colors.fleetCard,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.fleetBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  upiIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upiTexts: {
    flex: 1,
  },
  upiTitle: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  upiVpa: {
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
    color: '#ffffff',
    marginTop: 1,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
  },
  verifiedText: {
    fontSize: 9,
    fontWeight: theme.typography.weightBold,
    color: '#15803d',
  },
  historyCard: {
    backgroundColor: theme.colors.fleetCard,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.fleetBorder,
    ...theme.shadow.card,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  historyRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.fleetBorder,
  },
  historyTexts: {
    flex: 1,
  },
  historyDate: {
    fontSize: 13,
    fontWeight: theme.typography.weightSemi,
    color: '#ffffff',
  },
  historyMeta: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  historyAmount: {
    fontSize: 14,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.emerald,
  },
});
