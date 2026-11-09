import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import {
  Box,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  ThermometerSnowflake,
  ShieldCheck,
  Check,
} from 'lucide-react-native';
import { theme } from '../theme';
import { usePartner } from '../context/PartnerContext';

export const CoolerSanitizationScreen: React.FC = () => {
  const { markCoolerReady } = usePartner();

  const [coolersQueue, setCoolersQueue] = useState([
    { id: 'CLR-EPP-104', condition: 'Washed', gelLoaded: true, ready: false },
    { id: 'CLR-EPP-118', condition: 'Pending Wash', gelLoaded: false, ready: false },
    { id: 'CLR-EPP-092', condition: 'Sanitizing', gelLoaded: false, ready: false },
    { id: 'CLR-EPP-065', condition: 'Sanitizing', gelLoaded: false, ready: false },
  ]);

  const handleSignOff = async (coolerId: string) => {
    await markCoolerReady(coolerId);
    setCoolersQueue((prev) =>
      prev.map((c) => (c.id === coolerId ? { ...c, ready: true, condition: 'Sanitized & Packed with -18°C Gels' } : c))
    );
    Alert.alert('Cooler Ready', `${coolerId} sanitized and reloaded with fresh eutectic gel bricks. Ready for next order dispatch.`);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerCard}>
          <View style={styles.headerIcon}>
            <Sparkles size={22} color="#ffffff" />
          </View>
          <View style={styles.headerTexts}>
            <Text style={styles.headerTitle}>Cooler Box Sanitization Bay</Text>
            <Text style={styles.headerSub}>
              Returned wholesale EPP boxes: Sanitized, inspected, and reloaded with -18°C eutectic bricks
            </Text>
          </View>
        </View>

        {/* Eutectic Gel Freezer Metrics */}
        <View style={styles.freezerCard}>
          <View style={styles.freezerTop}>
            <ThermometerSnowflake size={20} color="#818cf8" />
            <Text style={styles.freezerTitle}>Blast Freezer Inventory: 48 Gel Bricks Ready</Text>
          </View>
          <Text style={styles.freezerSub}>
            Maintained at -18.4°C. Guarantees sub-4°C chill for up to 6 hours during Bangalore traffic transit.
          </Text>
        </View>

        {/* Processing Queue */}
        <View style={styles.queueContainer}>
          <Text style={styles.queueTitle}>Boxes Awaiting Turnover ({coolersQueue.length})</Text>

          {coolersQueue.map((item) => (
            <View key={item.id} style={[styles.boxCard, item.ready && styles.boxCardReady]}>
              <View style={styles.boxHeader}>
                <View style={styles.boxIdRow}>
                  <Box size={16} color={theme.colors.sky} />
                  <Text style={styles.boxIdText}>{item.id}</Text>
                </View>
                <View style={[styles.conditionPill, item.ready && styles.conditionPillReady]}>
                  <Text style={[styles.conditionText, item.ready && styles.conditionTextReady]}>
                    {item.condition}
                  </Text>
                </View>
              </View>

              {/* Checklist */}
              <View style={styles.checklist}>
                <View style={styles.checkItem}>
                  <Check size={14} color="#15803d" />
                  <Text style={styles.checkText}>Food-grade eco sanitization mist</Text>
                </View>
                <View style={styles.checkItem}>
                  <Check size={14} color="#15803d" />
                  <Text style={styles.checkText}>EPP structural seal & hinges intact</Text>
                </View>
                <View style={styles.checkItem}>
                  <Check size={14} color={item.ready ? '#15803d' : theme.colors.textMuted} />
                  <Text style={styles.checkText}>2x -18°C Eutectic gel bricks loaded</Text>
                </View>
              </View>

              {/* Action */}
              {item.ready ? (
                <View style={styles.readyBadge}>
                  <CheckCircle2 size={16} color="#15803d" />
                  <Text style={styles.readyBadgeText}>Turnover Complete • Ready for Dispatch</Text>
                </View>
              ) : (
                <Pressable style={styles.signOffBtn} onPress={() => handleSignOff(item.id)}>
                  <CheckCircle2 size={16} color="#ffffff" />
                  <Text style={styles.signOffBtnText}>Sign Off & Ready for Next Order</Text>
                </Pressable>
              )}
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
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.card,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTexts: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
  },
  headerSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
    lineHeight: 15,
  },
  freezerCard: {
    backgroundColor: '#eef2ff',
    borderWidth: 1,
    borderColor: '#c7d2fe',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  freezerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  freezerTitle: {
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
    color: '#3730a3',
  },
  freezerSub: {
    fontSize: 11,
    color: '#4f46e5',
    lineHeight: 15,
  },
  queueContainer: {
    gap: 10,
  },
  queueTitle: {
    fontSize: 14,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
    marginBottom: 4,
  },
  boxCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.card,
  },
  boxCardReady: {
    borderColor: theme.colors.emerald,
    backgroundColor: '#fafffd',
  },
  boxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  boxIdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  boxIdText: {
    fontSize: 14,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
  },
  conditionPill: {
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
  },
  conditionPillReady: {
    backgroundColor: '#dcfce7',
  },
  conditionText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weightSemi,
  },
  conditionTextReady: {
    color: '#15803d',
    fontWeight: theme.typography.weightBold,
  },
  checklist: {
    gap: 6,
    marginBottom: 12,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  signOffBtn: {
    backgroundColor: theme.colors.teal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
  },
  signOffBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
  },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#dcfce7',
    paddingVertical: 8,
    borderRadius: theme.radius.md,
  },
  readyBadgeText: {
    color: '#15803d',
    fontSize: 12,
    fontWeight: theme.typography.weightBold,
  },
});
