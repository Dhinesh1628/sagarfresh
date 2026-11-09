import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import {
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  X,
  Box,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react-native';
import { theme } from '../theme';
import { useRider } from '../context/RiderContext';

interface PinVerificationModalProps {
  order: any;
  onClose: () => void;
  onSuccess: () => void;
}

export const PinVerificationModal: React.FC<PinVerificationModalProps> = ({
  order,
  onClose,
  onSuccess,
}) => {
  const { verifyAndDeliver } = useRider();
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [coolerReturned, setCoolerReturned] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleKeyPress = (val: string) => {
    setErrorMessage(null);
    if (val === 'C') {
      setPinDigits([]);
      return;
    }
    if (val === 'DEL') {
      setPinDigits((prev) => prev.slice(0, -1));
      return;
    }
    if (pinDigits.length < 4) {
      const next = [...pinDigits, val];
      setPinDigits(next);
      if (next.length === 4) {
        verifyPin(next.join(''));
      }
    }
  };

  const verifyPin = async (fullPin: string) => {
    setLoading(true);
    setErrorMessage(null);

    const orderId = order.id || order.orderNumber;
    const res = await verifyAndDeliver(orderId, fullPin, coolerReturned);

    setLoading(false);
    if (res.success) {
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } else {
      setErrorMessage(res.message || 'Incorrect PIN. Please re-enter.');
      setPinDigits([]);
    }
  };

  const keypad = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['C', '0', 'DEL'],
  ];

  return (
    <View style={styles.overlay}>
      <View style={styles.modalCard}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.keyIconCircle}>
              <KeyRound size={20} color="#ffffff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>Verify Handover PIN</Text>
              <Text style={styles.orderLabel}>Order #{order.id || order.orderNumber || 'ORD-88219'}</Text>
            </View>
          </View>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <X size={18} color={theme.colors.textMuted} />
          </Pressable>
        </View>

        {isSuccess ? (
          /* SUCCESS CELEBRATION VIEW */
          <View style={styles.successContainer}>
            <View style={styles.successCircle}>
              <CheckCircle2 size={48} color="#ffffff" />
            </View>
            <Text style={styles.successTitle}>Handover Verified!</Text>
            <Text style={styles.successSubtitle}>
              Order marked Delivered. Sub-4°C Cold Chain completed.
            </Text>
            {coolerReturned && (
              <View style={styles.bonusBadge}>
                <Sparkles size={14} color="#ffffff" />
                <Text style={styles.bonusText}>
                  +₹15 Cooler Return Bonus Credited!
                </Text>
              </View>
            )}
          </View>
        ) : (
          /* KEYPAD VERIFICATION VIEW */
          <>
            {/* PIN DIGITS DISPLAY */}
            <View style={styles.pinDisplay}>
              {[0, 1, 2, 3].map((idx) => {
                const digit = pinDigits[idx];
                return (
                  <View
                    key={idx}
                    style={[
                      styles.digitBox,
                      digit !== undefined && styles.digitBoxFilled,
                      errorMessage && styles.digitBoxError,
                    ]}
                  >
                    <Text style={styles.digitText}>{digit || ''}</Text>
                  </View>
                );
              })}
            </View>

            {/* ERROR BANNER */}
            {errorMessage ? (
              <View style={styles.errorBanner}>
                <AlertTriangle size={14} color="#ef4444" />
                <Text style={styles.errorBannerText}>{errorMessage}</Text>
              </View>
            ) : (
              <Text style={styles.helperText}>
                Ask the customer for their unique 4-digit PIN from their GoMeat Tracking Screen.
              </Text>
            )}

            {/* COOLER RETURN TOGGLE */}
            <Pressable
              style={[
                styles.coolerToggleCard,
                coolerReturned && styles.coolerToggleCardActive,
              ]}
              onPress={() => setCoolerReturned(!coolerReturned)}
            >
              <View style={styles.coolerToggleLeft}>
                <Box
                  size={18}
                  color={coolerReturned ? theme.colors.emerald : theme.colors.textMuted}
                />
                <View style={styles.coolerToggleTexts}>
                  <Text style={styles.coolerToggleTitle}>
                    Customer Returned EPP Cold Box?
                  </Text>
                  <Text style={styles.coolerToggleSub}>
                    {coolerReturned
                      ? '✓ Customer gets ₹250 refund • You earn +₹15 bonus'
                      : 'No box returned (Customer kept cooler for ₹250)'}
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.toggleRadio,
                  coolerReturned && styles.toggleRadioActive,
                ]}
              >
                {coolerReturned && <View style={styles.toggleRadioDot} />}
              </View>
            </Pressable>

            {/* TACTILE NUMERIC KEYPAD */}
            <View style={styles.keypadContainer}>
              {loading ? (
                <View style={styles.keypadLoader}>
                  <ActivityIndicator size="large" color={theme.colors.primary} />
                  <Text style={styles.keypadLoaderText}>Verifying Handover Token...</Text>
                </View>
              ) : (
                keypad.map((row, rIdx) => (
                  <View key={rIdx} style={styles.keypadRow}>
                    {row.map((btn) => (
                      <Pressable
                        key={btn}
                        style={[
                          styles.keypadBtn,
                          btn === 'C' && styles.keypadBtnCancel,
                          btn === 'DEL' && styles.keypadBtnDel,
                        ]}
                        onPress={() => handleKeyPress(btn)}
                      >
                        <Text
                          style={[
                            styles.keypadBtnText,
                            (btn === 'C' || btn === 'DEL') && styles.keypadBtnSpecialText,
                          ]}
                        >
                          {btn}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  modalCard: {
    backgroundColor: theme.colors.fleetCard,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  keyIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: theme.typography.weightBold,
    color: '#ffffff',
  },
  orderLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.radius.md,
  },
  pinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 14,
  },
  digitBox: {
    width: 52,
    height: 56,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.fleetDark,
    borderWidth: 2,
    borderColor: theme.colors.fleetBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitBoxFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: '#2a1215',
  },
  digitBoxError: {
    borderColor: theme.colors.danger,
    backgroundColor: '#3f1315',
  },
  digitText: {
    fontSize: 26,
    fontWeight: theme.typography.weightBold,
    color: '#ffffff',
  },
  helperText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.dangerBg,
    padding: 10,
    borderRadius: theme.radius.md,
    marginBottom: 12,
  },
  errorBannerText: {
    color: '#fca5a5',
    fontSize: 11,
    flex: 1,
  },
  coolerToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.fleetDark,
    borderWidth: 1,
    borderColor: theme.colors.fleetBorder,
    borderRadius: theme.radius.lg,
    padding: 12,
    marginBottom: 16,
  },
  coolerToggleCardActive: {
    borderColor: theme.colors.emerald,
    backgroundColor: '#062b1e',
  },
  coolerToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  coolerToggleTexts: {
    flex: 1,
  },
  coolerToggleTitle: {
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
    color: '#ffffff',
  },
  coolerToggleSub: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  toggleRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleRadioActive: {
    borderColor: theme.colors.emerald,
  },
  toggleRadioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.emerald,
  },
  keypadContainer: {
    gap: 8,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 8,
  },
  keypadBtn: {
    flex: 1,
    height: 50,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keypadBtnCancel: {
    backgroundColor: '#3f1315',
  },
  keypadBtnDel: {
    backgroundColor: theme.colors.fleetDark,
  },
  keypadBtnText: {
    fontSize: 20,
    fontWeight: theme.typography.weightBold,
    color: '#ffffff',
  },
  keypadBtnSpecialText: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  keypadLoader: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  keypadLoaderText: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 36,
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: theme.typography.weightBold,
    color: '#ffffff',
    marginBottom: 6,
  },
  successSubtitle: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  bonusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
  },
  bonusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: theme.typography.weightBold,
  },
});
