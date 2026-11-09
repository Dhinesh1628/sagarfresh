import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Mail, Lock, ShieldCheck, ArrowRight, X } from 'lucide-react-native';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onClose, onSuccess }) => {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState('customer@gomeat.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!identifier.trim() || !password) {
      setError('Please provide your email/phone and password');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(identifier.trim(), password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoUser = () => {
    setIdentifier('customer@gomeat.com');
    setPassword('password123');
  };

  const setDemoAdmin = () => {
    setIdentifier('admin@gomeat.com');
    setPassword('admin123');
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>
              Go<Text style={styles.brandAccent}>Meat</Text>
            </Text>
            <Text style={styles.subtext}>Login to track cold orders & claim box deposits</Text>
          </View>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <X size={18} color={theme.colors.textMuted} />
          </Pressable>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address or Mobile</Text>
            <View style={styles.inputWrapper}>
              <Mail size={16} color={theme.colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="name@example.com or 9876543210"
                placeholderTextColor={theme.colors.textMuted}
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Lock size={16} color={theme.colors.textMuted} />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={theme.colors.textMuted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>
          </View>

          <Pressable
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Text style={styles.submitBtnText}>Continue</Text>
                <ArrowRight size={16} color="#ffffff" strokeWidth={2.5} />
              </>
            )}
          </Pressable>

          {/* DEMO ACCOUNTS QUICK FILL */}
          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>Quick Fill Demo Credentials</Text>
            <View style={styles.demoButtons}>
              <Pressable style={styles.demoBtn} onPress={setDemoUser}>
                <Text style={styles.demoBtnText}>Customer Demo</Text>
              </Pressable>
              <Pressable style={styles.demoBtn} onPress={setDemoAdmin}>
                <Text style={styles.demoBtnText}>Admin Demo</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.securityNote}>
            <ShieldCheck size={14} color="#15803d" />
            <Text style={styles.securityText}>
              256-bit Encrypted. Authentic GoMeat Cold-Chain Ecosystem.
            </Text>
          </View>
        </View>
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
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
  },
  brandAccent: {
    color: theme.colors.primary,
  },
  subtext: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.radius.md,
  },
  errorBox: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 10,
    borderRadius: theme.radius.md,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 12,
    color: theme.colors.danger,
    textAlign: 'center',
  },
  form: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: theme.typography.weightSemi,
    color: theme.colors.navy,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    height: 44,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.navy,
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 46,
    borderRadius: theme.radius.md,
    marginTop: 6,
  },
  submitBtnDisabled: {
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: theme.typography.weightBold,
  },
  demoSection: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  demoTitle: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weightMedium,
    marginBottom: 8,
    textAlign: 'center',
  },
  demoButtons: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  demoBtn: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.radius.md,
  },
  demoBtnText: {
    fontSize: 11,
    fontWeight: theme.typography.weightSemi,
    color: theme.colors.navy,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
    marginTop: 8,
  },
  securityText: {
    fontSize: 10,
    color: '#15803d',
  },
});
