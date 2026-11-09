import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Store, Snowflake, CheckCircle2, ThermometerSnowflake } from 'lucide-react-native';
import { theme } from '../theme';
import { config } from '../config';

interface PartnerHeaderProps {
  ordersCount?: number;
}

export const PartnerHeader: React.FC<PartnerHeaderProps> = ({ ordersCount = 5 }) => {
  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <View style={styles.iconCircle}>
            <Store size={20} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.brandTitle}>
              Go<Text style={styles.brandAccent}>Meat</Text> Partner
            </Text>
            <Text style={styles.hubLocation}>{config.hubId} • {config.hubName}</Text>
          </View>
        </View>

        <View style={styles.queueBadge}>
          <Text style={styles.queueCount}>{ordersCount}</Text>
          <Text style={styles.queueLabel}>In Prep</Text>
        </View>
      </View>

      {/* IoT Hub Sensors Bar */}
      <View style={styles.sensorRow}>
        <View style={styles.sensorItem}>
          <Snowflake size={14} color={theme.colors.sky} />
          <Text style={styles.sensorText}>Cold Room: <Text style={styles.sensorBold}>1.8°C</Text></Text>
          <View style={styles.safeDot} />
        </View>

        <View style={styles.divider} />

        <View style={styles.sensorItem}>
          <ThermometerSnowflake size={14} color="#818cf8" />
          <Text style={styles.sensorText}>Gel Freezer: <Text style={styles.sensorBold}>-18.4°C</Text></Text>
          <View style={styles.safeDot} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
  },
  brandAccent: {
    color: theme.colors.primary,
  },
  hubLocation: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  queueBadge: {
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: theme.radius.md,
    alignItems: 'center',
  },
  queueCount: {
    fontSize: 14,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.primary,
  },
  queueLabel: {
    fontSize: 9,
    color: theme.colors.primary,
    fontWeight: theme.typography.weightSemi,
  },
  sensorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: theme.radius.md,
    marginTop: 4,
  },
  sensorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  sensorText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
  },
  sensorBold: {
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
  },
  safeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.emerald,
  },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: theme.colors.borderStrong,
    marginHorizontal: 8,
  },
});
