import React, { useState, useEffect } from 'react';
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
  Wallet,
  Box,
  RotateCcw,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react-native';
import { theme } from '../theme';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export const WalletScreen: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [walletData, setWalletData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upiInput, setUpiInput] = useState(user?.upiId || '');
  const [refundMethod, setRefundMethod] = useState<'wallet' | 'upi'>('wallet');
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  const fetchWallet = async () => {
    try {
      const data = await api.getWallet();
      setWalletData(data);
    } catch (err) {
      console.log('Error fetching wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleRequestReturn = async () => {
    if (refundMethod === 'upi' && !upiInput.includes('@')) {
      Alert.alert('Invalid UPI ID', 'Please enter a valid UPI VPA (e.g. name@okhdfcbank)');
      return;
    }

    setIsSubmittingReturn(true);
    try {
      await api.requestCoolerReturn('CLR-DEFAULT', upiInput, refundMethod);
      Alert.alert(
        'Return Scheduled!',
        refundMethod === 'wallet'
          ? '₹250 will be credited directly to your GoMeat Vault upon pickup verification.'
          : `₹250 will be transferred to ${upiInput} upon pickup verification.`
      );
      setShowReturnModal(false);
      fetchWallet();
      refreshUser();
    } catch (err: any) {
      Alert.alert('Return Request', err.message || 'Unable to schedule cooler return.');
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const activeCoolers = user?.activeCoolersCount || walletData?.activeCoolersCount || 1;
  const vaultBalance = user?.walletBalance || walletData?.walletBalance || 500;
  const depositBalance = activeCoolers * 250;

  const mockTransactions = walletData?.transactions || [
    {
      id: 'tx-1',
      title: 'Cold Box Deposit Refund',
      type: 'credit',
      amount: 250,
      date: 'Today, 10:14 AM',
      description: 'Cooler box returned to delivery partner #KA-03',
    },
    {
      id: 'tx-2',
      title: 'Order Payment',
      type: 'debit',
      amount: 499,
      date: 'Yesterday, 8:30 PM',
      description: 'Order #ORD-7193 • Fresh Chicken Curry Cut',
    },
    {
      id: 'tx-3',
      title: 'Deposit Paid (Refundable)',
      type: 'debit',
      amount: 250,
      date: 'Yesterday, 8:30 PM',
      description: 'Wholesale EPP Cold Box Security Deposit',
    },
  ];

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* VAULT BALANCE CARD */}
        <View style={styles.vaultCard}>
          <View style={styles.vaultCardTop}>
            <View>
              <Text style={styles.vaultLabel}>GoMeat Vault Balance</Text>
              <Text style={styles.vaultAmount}>₹{vaultBalance}</Text>
            </View>
            <View style={styles.walletIconCircle}>
              <Wallet size={24} color="#ffffff" />
            </View>
          </View>
          <Text style={styles.vaultSubtitle}>
            100% usable on your next meat order with 0 transaction fees.
          </Text>
        </View>

        {/* ACTIVE COLD BOXES & DEPOSIT CARD */}
        <View style={styles.depositCard}>
          <View style={styles.depositRow}>
            <View style={styles.boxCircle}>
              <Box size={22} color={theme.colors.sky} />
            </View>
            <View style={styles.depositTextCol}>
              <Text style={styles.depositTitle}>Active Thermal Coolers: {activeCoolers}</Text>
              <Text style={styles.depositSubtitle}>
                ₹{depositBalance} locked in refundable deposits (₹250 each)
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.returnActionBtn}
            onPress={() => setShowReturnModal(!showReturnModal)}
          >
            <RotateCcw size={16} color="#ffffff" />
            <Text style={styles.returnActionBtnText}>
              {showReturnModal ? 'Cancel Return' : 'Return Cooler (Get ₹250 Refund)'}
            </Text>
          </Pressable>

          {/* INLINE RETURN FORM */}
          {showReturnModal && (
            <View style={styles.returnForm}>
              <Text style={styles.formTitle}>Select Refund Destination</Text>

              <View style={styles.methodSelector}>
                <Pressable
                  style={[
                    styles.methodOption,
                    refundMethod === 'wallet' && styles.methodOptionActive,
                  ]}
                  onPress={() => setRefundMethod('wallet')}
                >
                  <Sparkles size={16} color={refundMethod === 'wallet' ? theme.colors.primary : theme.colors.textMuted} />
                  <Text
                    style={[
                      styles.methodText,
                      refundMethod === 'wallet' && styles.methodTextActive,
                    ]}
                  >
                    GoMeat Vault (Instant)
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.methodOption,
                    refundMethod === 'upi' && styles.methodOptionActive,
                  ]}
                  onPress={() => setRefundMethod('upi')}
                >
                  <Wallet size={16} color={refundMethod === 'upi' ? theme.colors.primary : theme.colors.textMuted} />
                  <Text
                    style={[
                      styles.methodText,
                      refundMethod === 'upi' && styles.methodTextActive,
                    ]}
                  >
                    Direct UPI VPA
                  </Text>
                </Pressable>
              </View>

              {refundMethod === 'upi' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Enter UPI ID (e.g. mobile@upi)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="name@okaxis / mobile@upi"
                    placeholderTextColor={theme.colors.textMuted}
                    value={upiInput}
                    onChangeText={setUpiInput}
                    autoCapitalize="none"
                  />
                </View>
              )}

              <Pressable
                style={[styles.submitReturnBtn, isSubmittingReturn && styles.submitReturnBtnDisabled]}
                onPress={handleRequestReturn}
                disabled={isSubmittingReturn}
              >
                {isSubmittingReturn ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.submitReturnBtnText}>
                    Confirm Doorstep Cooler Pickup
                  </Text>
                )}
              </Pressable>
            </View>
          )}
        </View>

        {/* SECURITY & ZERO-LOSS GUARANTEE */}
        <View style={styles.guaranteeCard}>
          <ShieldCheck size={20} color="#15803d" />
          <View style={styles.guaranteeTextCol}>
            <Text style={styles.guaranteeTitle}>Zero Waste, Wholesale Cooler Fleet</Text>
            <Text style={styles.guaranteeDesc}>
              Every EPP cooler is sanitized, tested for 0°C–4°C insulation, and reused. Keep it as long as you want or return anytime for your full ₹250 refund.
            </Text>
          </View>
        </View>

        {/* RECENT TRANSACTIONS LEDGER */}
        <View style={styles.ledgerCard}>
          <Text style={styles.ledgerHeader}>Recent Vault Activity</Text>
          {mockTransactions.map((tx: any, idx: number) => {
            const isCredit = tx.type === 'credit';
            return (
              <View
                key={tx.id || idx}
                style={[
                  styles.txRow,
                  idx !== mockTransactions.length - 1 && styles.txRowBorder,
                ]}
              >
                <View
                  style={[
                    styles.txIconCircle,
                    isCredit ? styles.txCreditCircle : styles.txDebitCircle,
                  ]}
                >
                  {isCredit ? (
                    <ArrowDownLeft size={16} color={theme.colors.emerald} />
                  ) : (
                    <ArrowUpRight size={16} color={theme.colors.navy} />
                  )}
                </View>
                <View style={styles.txDetails}>
                  <Text style={styles.txTitle}>{tx.title}</Text>
                  <Text style={styles.txDesc} numberOfLines={1}>
                    {tx.description}
                  </Text>
                  <Text style={styles.txDate}>{tx.date}</Text>
                </View>
                <Text
                  style={[
                    styles.txAmount,
                    isCredit ? styles.txAmountCredit : styles.txAmountDebit,
                  ]}
                >
                  {isCredit ? '+' : '-'} ₹{tx.amount}
                </Text>
              </View>
            );
          })}
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
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultCard: {
    backgroundColor: theme.colors.navy,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    ...theme.shadow.card,
  },
  vaultCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  vaultLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: theme.typography.weightSemi,
  },
  vaultAmount: {
    fontSize: 32,
    fontWeight: theme.typography.weightBold,
    color: '#ffffff',
    marginTop: 2,
  },
  walletIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaultSubtitle: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 16,
  },
  depositCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    ...theme.shadow.card,
  },
  depositRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  boxCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositTextCol: {
    flex: 1,
  },
  depositTitle: {
    fontSize: 14,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
  },
  depositSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  returnActionBtn: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
  },
  returnActionBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
  },
  returnForm: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  formTitle: {
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
    marginBottom: 8,
  },
  methodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  methodOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: 10,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  methodOptionActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  methodText: {
    fontSize: 11,
    fontWeight: theme.typography.weightSemi,
    color: theme.colors.textSecondary,
  },
  methodTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weightBold,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: theme.typography.weightSemi,
    color: theme.colors.navy,
    marginBottom: 4,
  },
  input: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: theme.colors.navy,
  },
  submitReturnBtn: {
    backgroundColor: theme.colors.emerald,
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  submitReturnBtnDisabled: {
    opacity: 0.7,
  },
  submitReturnBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
  },
  guaranteeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  guaranteeTextCol: {
    flex: 1,
  },
  guaranteeTitle: {
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
    color: '#166534',
    marginBottom: 2,
  },
  guaranteeDesc: {
    fontSize: 11,
    color: '#15803d',
    lineHeight: 16,
  },
  ledgerCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    ...theme.shadow.card,
  },
  ledgerHeader: {
    fontSize: 14,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
    marginBottom: 12,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  txRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  txIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  txCreditCircle: {
    backgroundColor: '#dcfce7',
  },
  txDebitCircle: {
    backgroundColor: theme.colors.surfaceSubtle,
  },
  txDetails: {
    flex: 1,
  },
  txTitle: {
    fontSize: 13,
    fontWeight: theme.typography.weightSemi,
    color: theme.colors.navy,
  },
  txDesc: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginVertical: 1,
  },
  txDate: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  txAmount: {
    fontSize: 14,
    fontWeight: theme.typography.weightBold,
  },
  txAmountCredit: {
    color: theme.colors.emerald,
  },
  txAmountDebit: {
    color: theme.colors.navy,
  },
});
