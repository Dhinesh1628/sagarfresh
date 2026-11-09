import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Truck, Power, Star } from 'lucide-react-native';
import { theme } from '../theme';
import { useRider } from '../context/RiderContext';

export const RiderHeader: React.FC = () => {
  const { isOnline, toggleDuty, metrics } = useRider();

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Truck size={18} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.brandTitle}>
              Go<Text style={styles.brandAccent}>Meat</Text> Fleet
            </Text>
            <Text style={styles.hubLocation}>Indiranagar Hub #04</Text>
          </View>
        </View>

        <Pressable
          style={[styles.dutyToggle, isOnline ? styles.dutyOnline : styles.dutyOffline]}
          onPress={toggleDuty}
        >
          <Power size={14} color="#ffffff" />
          <Text style={styles.dutyText}>{isOnline ? 'ON DUTY' : 'OFF DUTY'}</Text>
        </Pressable>
      </View>

      {/* Metrics Bar */}
      <View style={styles.metricsBar}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{metrics.deliveredCount}</Text>
          <Text style={styles.metricLabel}>Drops</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{metrics.coolersCollected}</Text>
          <Text style={styles.metricLabel}>Boxes Ret.</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>₹{metrics.totalEarnings}</Text>
          <Text style={styles.metricLabel}>Earnings</Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metricItem}>
          <View style={styles.ratingRow}>
            <Star size={12} color="#f59e0b" fill="#f59e0b" />
            <Text style={styles.metricValue}>{metrics.rating}</Text>
          </View>
          <Text style={styles.metricLabel}>Rating</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.fleetCard,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.fleetBorder,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: theme.typography.weightBold,
    color: '#ffffff',
  },
  brandAccent: {
    color: theme.colors.primary,
  },
  hubLocation: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  dutyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
  },
  dutyOnline: {
    backgroundColor: theme.colors.emerald,
  },
  dutyOffline: {
    backgroundColor: theme.colors.surfaceSubtle,
  },
  dutyText: {
    fontSize: 11,
    fontWeight: theme.typography.weightBold,
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  metricsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.fleetDark,
    borderRadius: theme.radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: theme.typography.weightBold,
    color: '#ffffff',
  },
  metricLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: theme.colors.fleetBorder,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
});
