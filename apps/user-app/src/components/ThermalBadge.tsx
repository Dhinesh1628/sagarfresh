import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ShieldCheck, Snowflake } from 'lucide-react-native';
import { theme } from '../theme';

interface ThermalBadgeProps {
  currentTemp?: number;
  compact?: boolean;
}

export const ThermalBadge: React.FC<ThermalBadgeProps> = ({ currentTemp = 2.4, compact = false }) => {
  const isSafe = currentTemp >= 0 && currentTemp <= 4;

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Snowflake size={12} color={theme.colors.sky} />
        <Text style={styles.compactText}>{currentTemp.toFixed(1)}°C Cold-Vault</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <ShieldCheck size={20} color={theme.colors.emerald} />
      </View>
      <View style={styles.content}>
        <View style={styles.row}>
          <Text style={styles.title}>0°C – 4°C ThermalVault™ Sealed</Text>
          <View style={[styles.tempPill, isSafe ? styles.tempPillSafe : styles.tempPillWarning]}>
            <Snowflake size={11} color={isSafe ? theme.colors.sky : theme.colors.amber} />
            <Text style={[styles.tempText, isSafe ? styles.tempTextSafe : styles.tempTextWarning]}>
              {currentTemp.toFixed(1)}°C
            </Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          Delivered in wholesale EPP cold box with eutectic gel bricks. Zero ambient thaw.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.sm,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  content: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: theme.typography.weightSemi,
    color: '#166534',
  },
  subtitle: {
    fontSize: 11,
    color: '#15803d',
    lineHeight: 15,
  },
  tempPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.full,
    gap: 3,
  },
  tempPillSafe: {
    backgroundColor: '#e0f2fe',
  },
  tempPillWarning: {
    backgroundColor: '#fef3c7',
  },
  tempText: {
    fontSize: 11,
    fontWeight: theme.typography.weightBold,
  },
  tempTextSafe: {
    color: theme.colors.sky,
  },
  tempTextWarning: {
    color: theme.colors.amber,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.full,
    gap: 4,
    alignSelf: 'flex-start',
  },
  compactText: {
    fontSize: 11,
    fontWeight: theme.typography.weightSemi,
    color: theme.colors.sky,
  },
});
