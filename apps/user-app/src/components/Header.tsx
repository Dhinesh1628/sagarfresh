import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { MapPin, User as UserIcon, LogOut } from 'lucide-react-native';
import { theme } from '../theme';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onOpenLogin?: () => void;
  onOpenWallet?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLogin, onOpenWallet }) => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <Text style={styles.brandTitle}>
            Go<Text style={styles.brandAccent}>Meat</Text>
          </Text>
          <Text style={styles.tagline}>Fresh Quality. Delivered with Care.</Text>
        </View>

        <View style={styles.actionsContainer}>
          {user ? (
            <View style={styles.userSection}>
              <Pressable style={styles.userBadge} onPress={onOpenWallet}>
                <View style={styles.userAvatar}>
                  <Text style={styles.avatarText}>{user.name ? user.name[0].toUpperCase() : 'U'}</Text>
                </View>
                <Text style={styles.userName} numberOfLines={1}>
                  {user.name.split(' ')[0]}
                </Text>
              </Pressable>
              <Pressable style={styles.logoutBtn} onPress={logout}>
                <LogOut size={16} color={theme.colors.textMuted} />
              </Pressable>
            </View>
          ) : (
            <Pressable style={styles.loginBtn} onPress={onOpenLogin}>
              <UserIcon size={14} color="#ffffff" />
              <Text style={styles.loginBtnText}>Login</Text>
            </Pressable>
          )}
        </View>
      </View>

      <Pressable style={styles.locationPill}>
        <MapPin size={14} color={theme.colors.primary} />
        <Text style={styles.locationCity}>Bengaluru</Text>
        <Text style={styles.locationAddress} numberOfLines={1}>
          • 100ft Road, Indiranagar (15-20 Mins)
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
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
    flex: 1,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
    letterSpacing: -0.5,
  },
  brandAccent: {
    color: theme.colors.primary,
  },
  tagline: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weightMedium,
    marginTop: -2,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.radius.full,
    gap: 6,
  },
  userAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: theme.typography.weightBold,
  },
  userName: {
    fontSize: 12,
    fontWeight: theme.typography.weightSemi,
    color: theme.colors.navy,
    maxWidth: 80,
  },
  logoutBtn: {
    padding: 6,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSubtle,
  },
  loginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: theme.radius.full,
    gap: 6,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: theme.typography.weightBold,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.md,
    gap: 4,
  },
  locationCity: {
    fontSize: 12,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
  },
  locationAddress: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    flex: 1,
  },
});
