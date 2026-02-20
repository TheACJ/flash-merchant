// (tabs)/settings.tsx
import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import { RootState } from '@/store';
import { useRouter } from 'expo-router';
import {
  ArrowRightLeft,
  BadgeCheck,
  Bell,
  ChevronRight,
  CircleDollarSign,
  Clock,
  CreditCard,
  HelpCircle,
  LogOut,
  Shield,
  User,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

// ─── Settings Item ──────────────────────────────────────────────────────────

interface SettingsItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showChevron?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
  icon,
  title,
  subtitle,
  onPress,
  showChevron = true,
  showSwitch = false,
  switchValue = false,
  onSwitchChange,
}) => (
  <TouchableOpacity
    style={styles.settingsItem}
    onPress={onPress}
    disabled={showSwitch}
    activeOpacity={0.7}
  >
    <View style={styles.itemLeft}>
      <View style={styles.iconContainer}>{icon}</View>
      <View style={styles.textContainer}>
        <Text style={styles.itemTitle}>{title}</Text>
        {subtitle && (
          <Text style={styles.itemSubtitle}>{subtitle}</Text>
        )}
      </View>
    </View>
    <View style={styles.itemRight}>
      {showSwitch && (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{
            false: colors.borderLight,
            true: colors.primary,
          }}
          thumbColor={colors.backgroundCard}
        />
      )}
      {showChevron && !showSwitch && (
        <ChevronRight
          size={layout.iconSize.sm}
          color={colors.textMuted}
          strokeWidth={2}
        />
      )}
    </View>
  </TouchableOpacity>
);

// ─── Section Header ─────────────────────────────────────────────────────────

const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Get merchant profile from Redux (loaded from API)
  const merchantProfile = useSelector(
    (state: RootState) => state.merchantAuth.merchantProfile
  );

  // Derived values from API data
  const displayName = merchantProfile?.normalizedTag || 'Merchant';
  const isVerified = merchantProfile?.isVerified || merchantProfile?.status === 'verified';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Profile Card */}
        <TouchableOpacity
          style={styles.profileSection}
          onPress={() => router.push('/settings/profile' as any)}
          activeOpacity={0.7}
        >
          <View style={styles.profileLeft}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <User
                  size={layout.iconSize.md}
                  color={colors.textTertiary}
                  strokeWidth={1.8}
                />
              </View>
              {isVerified && (
                <View style={styles.verifiedBadge}>
                  <BadgeCheck
                    size={16}
                    color={colors.success}
                    strokeWidth={2.5}
                    fill={colors.successLight}
                  />
                </View>
              )}
            </View>
            <View style={styles.profileInfo}>
              <View style={styles.profileNameRow}>
                <Text style={styles.profileName}>{displayName}</Text>
                {isVerified && (
                  <BadgeCheck
                    size={14}
                    color={colors.success}
                    strokeWidth={2.5}
                  />
                )}
              </View>
              <Text style={styles.profileRole}>Merchant</Text>
            </View>
          </View>
          <ChevronRight
            size={layout.iconSize.sm}
            color={colors.textMuted}
            strokeWidth={2}
          />
        </TouchableOpacity>

        {/* Account Section */}
        <View style={styles.section}>
          <SectionHeader title="Account" />
          <View style={styles.card}>
            <SettingsItem
              icon={
                <CreditCard
                  size={layout.iconSize.sm}
                  color={colors.textSecondary}
                  strokeWidth={1.8}
                />
              }
              title="Bank Account"
              subtitle="Manage payout methods"
              onPress={() =>
                router.push('/settings/bank-details' as any)
              }
            />
            <View style={styles.divider} />
            <SettingsItem
              icon={
                <Shield
                  size={layout.iconSize.sm}
                  color={colors.textSecondary}
                  strokeWidth={1.8}
                />
              }
              title="Security"
              subtitle="PIN, biometric & KYC settings"
              onPress={() =>
                router.push('/settings/security' as any)
              }
            />
          </View>
        </View>

        {/* Business Settings */}
        <View style={styles.section}>
          <SectionHeader title="Business" />
          <View style={styles.card}>
            <SettingsItem
              icon={
                <Clock
                  size={layout.iconSize.sm}
                  color={colors.textSecondary}
                  strokeWidth={1.8}
                />
              }
              title="Business Hours"
              subtitle="Mon–Fri: 9:00 AM – 6:00 PM"
              onPress={() =>
                router.push('/settings/business-hours' as any)
              }
            />
            <View style={styles.divider} />
            <SettingsItem
              icon={
                <ArrowRightLeft
                  size={layout.iconSize.sm}
                  color={colors.textSecondary}
                  strokeWidth={1.8}
                />
              }
              title="Exchange Rate"
              subtitle="Customize your pricing"
              onPress={() =>
                router.push('/settings/exchange-rate' as any)
              }
            />
            <View style={styles.divider} />
            <SettingsItem
              icon={
                <CircleDollarSign
                  size={layout.iconSize.sm}
                  color={colors.textSecondary}
                  strokeWidth={1.8}
                />
              }
              title="Currency"
              subtitle="Choose your currency"
              onPress={() =>
                router.push('/settings/currency' as any)
              }
            />
            <View style={styles.divider} />
            <SettingsItem
              icon={
                <Bell
                  size={layout.iconSize.sm}
                  color={colors.textSecondary}
                  strokeWidth={1.8}
                />
              }
              title="Notifications"
              subtitle="Allow push notifications"
              showChevron={false}
              showSwitch
              switchValue={notificationsEnabled}
              onSwitchChange={setNotificationsEnabled}
            />
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <SectionHeader title="Support" />
          <View style={styles.card}>
            <SettingsItem
              icon={
                <HelpCircle
                  size={layout.iconSize.sm}
                  color={colors.textSecondary}
                  strokeWidth={1.8}
                />
              }
              title="Help & Support"
              subtitle="FAQs and contact support"
              onPress={() =>
                router.push('/settings/help-support' as any)
              }
            />
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => router.push('/settings/logout' as any)}
            activeOpacity={0.7}
          >
            <LogOut
              size={layout.iconSize.sm}
              color={colors.error}
              strokeWidth={1.8}
            />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.base,
  },
  headerTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
  },

  // Profile
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
    marginHorizontal: layout.screenPaddingHorizontal,
    marginBottom: spacing.base,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  profileLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: layout.avatarSize.lg,
    height: layout.avatarSize.lg,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.full,
    padding: 1,
  },
  profileInfo: {
    gap: spacing.xs,
  },
  profileNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  profileName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  profileRole: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textTertiary,
  },

  // Sections
  section: {
    marginBottom: spacing.lg,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.base,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
    gap: spacing['2xs'],
  },
  itemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  itemSubtitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textTertiary,
  },
  itemRight: {
    marginLeft: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 68,
  },

  // Logout
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.base,
    backgroundColor: colors.errorLight,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  logoutText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
  },

  bottomSpacer: {
    height: 100,
  },
});