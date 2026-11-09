import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Box,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  QrCode,
  Check,
} from 'lucide-react-native';
import { theme } from '../theme';
import { useRider } from '../context/RiderContext';

export const CoolerIntakeScreen: React.FC = () => {
  const { markCoolerCollectedOnly, metrics } = useRider();
  const [coolerCode, setCoolerCode] = useState('CLR-EPP-208');
  const [customerPhone, setCustomerPhone] = useState('9876543210');
  const [condition, setCondition] = useState<'clean' | 'minor' | 'damaged'>('clean');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleIntakeSubmit = async () => {
    if (!coolerCode.trim()) {
      Alert.alert('Missing Code', 'Please enter or scan the EPP Cold Box QR code.');
      return;
    }

    setIsSubmitting(true);
    setSuccessNotice(null);
    try {
      await markCoolerCollectedOnly(coolerCode.trim(), customerPhone.trim());
      setSuccessNotice(`✓ Cooler #${coolerCode} accepted! ₹250 refunded to customer and +₹15 credited to your earnings.`);
      setCoolerCode(`CLR-EPP-${Math.floor(200 + Math.random() * 800)}`);
      setTimeout(() => setSuccessNotice(null), 5000);
    } catch (err: any) {
      Alert.alert('Intake Error', err.message || 'Unable to record cooler intake.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const collectedCoolers = [
    { id: 'CLR-EPP-104', condition: 'Clean & Sanitized', time: '10:14 AM', incentive: 15 },
    { id: 'CLR-EPP-118', condition: 'Clean & Sanitized', time: '09:42 AM', incentive: 15 },
    { id: 'CLR-EPP-092', condition: 'Minor Dirt (Needs Wash)', time: '09:05 AM', incentive: 15 },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Summary */}
        <View style={styles.headerCard}>
          <View style={styles.headerIconCircle}>
            <Box size={24} color={theme.colors.emerald} />
          </View>
          <View style={styles.headerTexts}>
            <Text style={styles.headerTitle}>Doorstep Cold Box Intake</Text>
            <Text style={styles.headerSub}>
              Collect customer's ₹250 deposit cooler box & earn +₹15 bonus
            </Text>
          </View>
        </View>

        {successNotice && (
          <View style={styles.successBanner}>
            <CheckCircle2 size={16} color="#15803d" />
            <Text style={styles.successBannerText}>{successNotice}</Text>
          </View>
        )}

        {/* INTAKE FORM */}
        <View style={styles.formCard}>
          <Text style={styles.formSectionTitle}>Scan or Enter Cooler Box ID</Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.textInput}
              value={coolerCode}
              onChangeText={setCoolerCode}
              placeholder="e.g. CLR-EPP-208"
              placeholderTextColor={theme.colors.textMuted}
              autoCapitalize="characters"
            />
            <Pressable
              style={styles.scanBtn}
              onPress={() => setCoolerCode(`CLR-EPP-${Math.floor(100 + Math.random() * 900)}`)}
            >
              <QrCode size={18} color="#ffffff" />
            </Pressable>
          </View>

          <Text style={styles.label}>Customer Mobile Number (For ₹250 Vault Refund)</Text>
          <TextInput
            style={styles.textInput}
            value={customerPhone}
            onChangeText={setCustomerPhone}
            placeholder="9876543210"
            placeholderTextColor={theme.colors.textMuted}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Box Condition Assessment</Text>
          <View style={styles.conditionRow}>
            <Pressable
              style={[
                styles.conditionChip,
                condition === 'clean' && styles.conditionChipActive,
              ]}
              onPress={() => setCondition('clean')}
            >
              <Text
                style={[
                  styles.conditionChipText,
                  condition === 'clean' && styles.conditionChipTextActive,
                ]}
              >
                Clean & Intact
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.conditionChip,
                condition === 'minor' && styles.conditionChipActive,
              ]}
              onPress={() => setCondition('minor')}
            >
              <Text
                style={[
                  styles.conditionChipText,
                  condition === 'minor' && styles.conditionChipTextActive,
                ]}
              >
                Needs Sanitizing
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.conditionChip,
                condition === 'damaged' && styles.conditionChipActive,
              ]}
              onPress={() => setCondition('damaged')}
            >
              <Text
                style={[
                  styles.conditionChipText,
                  condition === 'damaged' && styles.conditionChipTextActive,
                ]}
              >
                Damaged EPP
              </Text>
            </Pressable>
          </View>

          <Pressable
            style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
            onPress={handleIntakeSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <RotateCcw size={16} color="#ffffff" />
                <Text style={styles.submitBtnText}>
                  Confirm Return (Refund ₹250 & Earn ₹15)
                </Text>
              </>
            )}
          </Pressable>
        </View>

        {/* BIKE CRATE CAPACITY */}
        <View style={styles.crateCard}>
          <Text style={styles.crateTitle}>Bike Cargo Hold ({collectedCoolers.length} Coolers Loaded)</Text>
          {collectedCoolers.map((c, i) => (
            <View key={c.id || i} style={[styles.coolerItem, i !== collectedCoolers.length - 1 && styles.coolerItemBorder]}>
              <View style={styles.coolerIconCircle}>
                <Box size={16} color="#ffffff" />
              </View>
              <View style={styles.coolerMeta}>
                <Text style={styles.coolerIdText}>{c.id}</Text>
                <Text style={styles.coolerCondText}>{c.condition} • {c.time}</Text>
              </View>
              <View style={styles.incentiveBadge}>
                <Text style={styles.incentiveText}>+₹{c.incentive}</Text>
              </View>
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
    backgroundColor: theme.colors.fleetCard,
    borderWidth: 1,
    borderColor: theme.colors.fleetBorder,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    ...theme.shadow.card,
  },
  headerIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#064e3b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTexts: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: theme.typography.weightBold,
    color: '#ffffff',
  },
  headerSub: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#dcfce7',
    padding: 12,
    borderRadius: theme.radius.md,
  },
  successBannerText: {
    color: '#15803d',
    fontSize: 12,
    fontWeight: theme.typography.weightSemi,
    flex: 1,
  },
  formCard: {
    backgroundColor: theme.colors.fleetCard,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.fleetBorder,
    padding: theme.spacing.md,
    ...theme.shadow.card,
  },
  formSectionTitle: {
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
    color: '#ffffff',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.colors.fleetDark,
    borderWidth: 1,
    borderColor: theme.colors.fleetBorder,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#ffffff',
    fontSize: 14,
    fontWeight: theme.typography.weightSemi,
  },
  scanBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
  },
  label: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 6,
    fontWeight: theme.typography.weightMedium,
  },
  conditionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  conditionChip: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.fleetDark,
    borderWidth: 1,
    borderColor: theme.colors.fleetBorder,
  },
  conditionChipActive: {
    backgroundColor: theme.colors.emeraldBg,
    borderColor: theme.colors.emerald,
  },
  conditionChipText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weightMedium,
  },
  conditionChipTextActive: {
    color: '#a7f3d0',
    fontWeight: theme.typography.weightBold,
  },
  submitBtn: {
    backgroundColor: theme.colors.emerald,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: theme.radius.md,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
  },
  crateCard: {
    backgroundColor: theme.colors.fleetCard,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.fleetBorder,
    padding: theme.spacing.md,
    ...theme.shadow.card,
  },
  crateTitle: {
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
    color: '#ffffff',
    marginBottom: 10,
  },
  coolerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  coolerItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.fleetBorder,
  },
  coolerIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.fleetDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  coolerMeta: {
    flex: 1,
  },
  coolerIdText: {
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
    color: '#ffffff',
  },
  coolerCondText: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  incentiveBadge: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  incentiveText: {
    color: '#a7f3d0',
    fontSize: 11,
    fontWeight: theme.typography.weightBold,
  },
});
