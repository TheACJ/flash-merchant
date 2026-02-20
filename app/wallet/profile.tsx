import { borderRadius, colors, layout, shadows, spacing, typography } from '@/constants/theme';
import { usePreferredCurrency, useTotalBalance } from '@/hooks';
import { RootState } from '@/store';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  BadgeCheck,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Plus,
  Shield,
  Star,
  TrendingUp,
  User,
  Wallet,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const { width } = Dimensions.get('window');

interface InfoCardProps {
  icon: React.ElementType;
  iconBgColor: string;
  iconColor: string;
  label: string;
  value: string;
}

function InfoCard({ icon: Icon, iconBgColor, iconColor, label, value }: InfoCardProps) {
  return (
    <View style={styles.infoCard}>
      <View style={[styles.infoCardIcon, { backgroundColor: iconBgColor }]}>
        <Icon size={layout.iconSize.md} color={iconColor} strokeWidth={1.8} />
      </View>
      <View style={styles.infoCardContent}>
        <Text style={styles.infoCardLabel}>{label}</Text>
        <Text style={styles.infoCardValue}>{value}</Text>
      </View>
    </View>
  );
}

interface LimitRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

function LimitRow({ label, value, isLast = false }: LimitRowProps) {
  return (
    <>
      <View style={styles.limitRow}>
        <Text style={styles.limitLabel}>{label}</Text>
        <Text style={styles.limitValue}>{value}</Text>
      </View>
      {!isLast && <View style={styles.limitDivider} />}
    </>
  );
}

export default function WalletProfileScreen() {
  const router = useRouter();
  const { totalBalance } = useTotalBalance();
  const { formatCurrency: formatCurrencyHook } = usePreferredCurrency();
  const merchantProfile = useSelector(
    (state: RootState) => state.merchantAuth.merchantProfile
  );

  const [balanceVisible, setBalanceVisible] = useState(true);

  const displayName = merchantProfile?.name || 'Merchant';
  const roleText = merchantProfile?.tier
    ? `${merchantProfile.tier.charAt(0).toUpperCase() + merchantProfile.tier.slice(1)} Merchant`
    : 'Merchant Account';
  const isVerified =
    merchantProfile?.isVerified || merchantProfile?.status === 'verified';

  const transactionLimit = parseFloat(merchantProfile?.transactionLimit || '0');
  const dailyLimitValue = parseFloat(merchantProfile?.dailyLimit || '0');
  const availableLiquidity = parseFloat(
    merchantProfile?.availableFiatLiquidity || '0'
  );

  // Staking data from profile
  const stakeAsset = merchantProfile?.stakeAsset;
  const stakingTier = merchantProfile?.tier || 'None';
  const stakingTarget = stakeAsset?.target || 0;
  const stakingProgress = stakeAsset?.staked_amount || 0;

  // Order/in-orders data from profile
  const orderLimit = merchantProfile?.orderLimit;
  const inOrdersAmount = orderLimit?.in_orders || 0;
  const dailyUsed = orderLimit?.daily_used || 0;

  const walletBalance = totalBalance || 0;

  const formatCurrency = (amount: number): string =>
    `$${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const progressPercentage = (stakingProgress / stakingTarget) * 100;

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary}
        translucent
      />

      {/* Header Section */}
      <SafeAreaView edges={['top']} style={styles.headerWrapper}>
        <View style={styles.headerContainer}>
          {/* Top Bar */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
              accessibilityLabel="Go back"
            >
              <ArrowLeft
                size={layout.iconSize.md}
                color={colors.textWhite}
                strokeWidth={2}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Wallet Profile</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Profile Info */}
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <User
                size={layout.iconSize.xl}
                color={colors.borderLight}
                strokeWidth={1.8}
              />
            </View>
            <View style={styles.nameRow}>
              <Text style={styles.displayName}>{displayName}</Text>
              {isVerified && (
                <BadgeCheck size={18} color="#4ADE80" strokeWidth={2.5} />
              )}
            </View>
            <Text style={styles.roleText}>{roleText}</Text>
          </View>

          {/* Balance */}
          <View style={styles.balanceSection}>
            <View style={styles.balanceLabelRow}>
              <Text style={styles.balanceLabel}>Wallet Balance</Text>
              <TouchableOpacity
                onPress={() => setBalanceVisible(!balanceVisible)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel={
                  balanceVisible ? 'Hide balance' : 'Show balance'
                }
              >
                {balanceVisible ? (
                  <Eye
                    size={layout.iconSize.sm}
                    color={colors.textLight}
                    strokeWidth={1.8}
                  />
                ) : (
                  <EyeOff
                    size={layout.iconSize.sm}
                    color={colors.textLight}
                    strokeWidth={1.8}
                  />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.balanceAmount}>
              {balanceVisible ? formatCurrency(walletBalance) : '••••••'}
            </Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Summary Cards */}
        <View style={styles.summaryCards}>
          <InfoCard
            icon={Wallet}
            iconBgColor={colors.infoLight}
            iconColor={colors.info}
            label="Total Fiat"
            value={formatCurrency(availableLiquidity)}
          />
          <InfoCard
            icon={Lock}
            iconBgColor={colors.warningLight}
            iconColor={colors.warning}
            label="In Orders"
            value={formatCurrency(inOrdersAmount)}
          />
        </View>

        {/* Staking Status */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Staking Status</Text>
            <TouchableOpacity
              style={styles.stakeButton}
              activeOpacity={0.7}
              onPress={() => router.push('/wallet/stake')}
              accessibilityLabel="Stake tokens"
            >
              <Plus size={layout.iconSize.xs} color={colors.primary} strokeWidth={2.5} />
              <Text style={styles.stakeButtonText}>Stake</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.stakingCard}>
            <View style={styles.stakingTopRow}>
              <View style={styles.stakingTierBadge}>
                <Star size={14} color={colors.warning} fill={colors.warning} strokeWidth={1} />
                <Text style={styles.stakingTierText}>
                  {stakingTier.charAt(0).toUpperCase() + stakingTier.slice(1)} Tier
                </Text>
              </View>
              <Text style={styles.stakingTargetText}>
                Target: {stakingTarget.toLocaleString()} FLA$H
              </Text>
            </View>

            <View style={styles.stakingProgressSection}>
              <View style={styles.stakingProgressHeader}>
                <Text style={styles.stakingLeftAmount}>
                  {formatCurrency(stakingTarget - stakingProgress)}
                </Text>
                <Text style={styles.stakingLeftLabel}>remaining</Text>
              </View>

              <View style={styles.progressBarContainer}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.max(progressPercentage, 2)}%` },
                  ]}
                />
              </View>

              <View style={styles.progressLabels}>
                <Text style={styles.progressLabelLeft}>
                  {progressPercentage.toFixed(0)}% complete
                </Text>
                <Text style={styles.progressLabelRight}>
                  Daily: {formatCurrency(dailyLimitValue)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Transaction Limits */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transaction Limits</Text>
            <Shield size={layout.iconSize.sm} color={colors.textTertiary} strokeWidth={1.8} />
          </View>

          <View style={styles.limitsCard}>
            <LimitRow
              label="Per Transaction"
              value={formatCurrency(transactionLimit)}
            />
            <LimitRow
              label="Daily Volume"
              value={formatCurrency(dailyLimitValue)}
            />
            <LimitRow
              label="Monthly Volume"
              value={formatCurrency(dailyLimitValue * 30)}
              isLast
            />
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickLinksCard}>
            <TouchableOpacity
              style={styles.quickLink}
              activeOpacity={0.6}
              onPress={() => router.push('/wallet/deposit')}
            >
              <View style={styles.quickLinkLeft}>
                <View style={[styles.quickLinkIcon, { backgroundColor: colors.successLight }]}>
                  <TrendingUp size={layout.iconSize.sm} color={colors.success} strokeWidth={1.8} />
                </View>
                <Text style={styles.quickLinkLabel}>Add Funds</Text>
              </View>
              <ChevronRight size={layout.iconSize.sm} color={colors.textPlaceholder} strokeWidth={1.8} />
            </TouchableOpacity>

            <View style={styles.quickLinkDivider} />

            <TouchableOpacity
              style={styles.quickLink}
              activeOpacity={0.6}
              onPress={() => router.push('/wallet/withdraw')}
            >
              <View style={styles.quickLinkLeft}>
                <View style={[styles.quickLinkIcon, { backgroundColor: colors.errorLight }]}>
                  <Wallet size={layout.iconSize.sm} color={colors.error} strokeWidth={1.8} />
                </View>
                <Text style={styles.quickLinkLabel}>Withdraw</Text>
              </View>
              <ChevronRight size={layout.iconSize.sm} color={colors.textPlaceholder} strokeWidth={1.8} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  headerWrapper: {
    backgroundColor: colors.primary,
  },
  headerContainer: {
    backgroundColor: colors.primary,
    paddingBottom: spacing['2xl'],
    borderBottomLeftRadius: borderRadius['3xl'],
    borderBottomRightRadius: borderRadius['3xl'],
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.base,
  },
  backButton: {
    width: layout.avatarSize.md,
    height: layout.avatarSize.md,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
    letterSpacing: typography.letterSpacing.wide,
  },
  headerSpacer: {
    width: layout.avatarSize.md,
  },

  // Profile
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginBottom: spacing.xl,
  },
  avatar: {
    width: layout.avatarSize.xl,
    height: layout.avatarSize.xl,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing['2xs'],
  },
  displayName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
  },
  roleText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textWhite,
    opacity: 0.75,
  },

  // Balance
  balanceSection: {
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  balanceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  balanceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textWhite,
    opacity: 0.8,
    fontWeight: typography.fontWeight.medium,
  },
  balanceAmount: {
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
    letterSpacing: typography.letterSpacing.tight,
  },

  // Content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: layout.screenPaddingHorizontal,
    paddingTop: spacing.xl,
  },

  // Summary Cards
  summaryCards: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    gap: spacing.md,
    ...shadows.sm,
  },
  infoCardIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCardContent: {
    gap: spacing['2xs'],
  },
  infoCardLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textTertiary,
  },
  infoCardValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },

  // Sections
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.base,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
  },

  // Staking
  stakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2xs'],
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  stakeButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  stakingCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  stakingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  stakingTierBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  stakingTierText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.warning,
  },
  stakingTargetText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.textTertiary,
  },
  stakingProgressSection: {
    gap: spacing.md,
  },
  stakingProgressHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  stakingLeftAmount: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  stakingLeftLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textTertiary,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabelLeft: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.textTertiary,
  },
  progressLabelRight: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    color: colors.textTertiary,
  },

  // Limits
  limitsCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  limitDivider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  limitLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    color: colors.textTertiary,
  },
  limitValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },

  // Quick Links
  quickLinksCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    marginTop: spacing.base,
    ...shadows.sm,
  },
  quickLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  quickLinkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  quickLinkIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickLinkLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  quickLinkDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginHorizontal: spacing.base,
  },

  bottomSpacer: {
    height: 40,
  },
});