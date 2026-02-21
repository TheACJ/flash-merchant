// (tabs)/home.tsx
import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import { useDashboardSummary, useExchangeRates, usePreferredCurrency, useTotalBalance } from '@/hooks';
import { useRouter } from 'expo-router';
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Bell,
  ChevronDown,
  CreditCard,
  Eye,
  EyeOff,
  MessageCircle,
  Star,
  Timer,
  TrendingUp,
  User
} from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

import { RootState } from '../../store';

const { width } = Dimensions.get('window');
const CHAIN_ICONS: Record<string, any> = {
  ethereum: require('../../assets/images/eth.png'),
  bitcoin: require('../../assets/images/btc.png'),
  solana: require('../../assets/images/sol.png'),
  bnb: require('../../assets/images/bnb.png'),
};


interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
  onPress: () => void;
}

interface SummaryCard {
  id: string;
  label: string;
  value: string;
  icon: React.ElementType;
  iconColor: string;
}

const HomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const [balanceVisible, setBalanceVisible] = useState<boolean>(true);
  const [convertedBalance, setConvertedBalance] = useState<number>(0);
  const router = useRouter();


  // Get currency from Redux (loaded from API)
  const { code: currencyCode, formatCurrency, isLoading: currencyLoading } = usePreferredCurrency();

  // Get exchange rates for currency conversion
  const { convertCurrency } = useExchangeRates();

  // Get balance from cache (loaded from API) - returns USD value
  const { totalBalance, isLoading: balanceLoading } = useTotalBalance();

  const wallets = useSelector(
    (state: RootState) => state.merchantWallet.wallets
  );

  // Get merchant profile from Redux
  const merchantProfile = useSelector(
    (state: RootState) => state.merchantAuth.merchantProfile
  );

  // Get dashboard summary data from cache (auto-refreshes every 5 minutes globally)
  const { summary: dashboardSummary, isLoading: dashboardLoading } = useDashboardSummary();

  // State for converted dashboard values
  const [convertedAmountToday, setConvertedAmountToday] = useState<number>(0);
  const [convertedLiquidity, setConvertedLiquidity] = useState<number>(0);

  // Convert dashboard values to preferred currency
  useEffect(() => {
    const convertDashboardValues = async () => {
      // Convert total amount today
      if (!currencyCode || currencyCode === 'USD') {
        setConvertedAmountToday(dashboardSummary.totalAmountToday);
        setConvertedLiquidity(dashboardSummary.availableLiquidity);
        return;
      }

      try {
        const convertedAmount = await convertCurrency(dashboardSummary.totalAmountToday, 'USD', currencyCode);
        const convertedLiq = await convertCurrency(dashboardSummary.availableLiquidity, 'USD', currencyCode);
        setConvertedAmountToday(convertedAmount);
        setConvertedLiquidity(convertedLiq);
      } catch (error) {
        console.error('[HomeScreen] Dashboard currency conversion failed:', error);
        // Fallback to raw USD values
        setConvertedAmountToday(dashboardSummary.totalAmountToday);
        setConvertedLiquidity(dashboardSummary.availableLiquidity);
      }
    };

    convertDashboardValues();
  }, [currencyCode, dashboardSummary.totalAmountToday, dashboardSummary.availableLiquidity, convertCurrency]);

  // TODO: These should come from API/notification service
  const notificationCount = 0;
  const messageCount = 0;

  // Derived values from API data
  const displayName = merchantProfile?.normalizedTag || 'Merchant';
  const isVerified = merchantProfile?.isVerified || merchantProfile?.status === 'verified';
  const userName = merchantProfile?.normalizedTag ? `@${merchantProfile.normalizedTag}` : '@User';
  const rawWalletBalance = totalBalance || 0; // USD value from API

  // Convert USD balance to preferred currency
  useEffect(() => {
    const convertBalance = async () => {
      if (!currencyCode || currencyCode === 'USD') {
        // No conversion needed for USD
        setConvertedBalance(rawWalletBalance);
        return;
      }

      try {
        const converted = await convertCurrency(rawWalletBalance, 'USD', currencyCode);
        setConvertedBalance(converted);
      } catch (error) {
        console.error('[HomeScreen] Currency conversion failed:', error);
        // Fallback to raw USD value
        setConvertedBalance(rawWalletBalance);
      }
    };

    convertBalance();
  }, [currencyCode, rawWalletBalance, convertCurrency]);

  const quickActions: QuickAction[] = [
    {
      id: 'deposit',
      label: 'Deposit',
      icon: ArrowDownToLine,
      onPress: () => router.push('/wallet/deposit'),
    },
    {
      id: 'withdraw',
      label: 'Withdraw',
      icon: ArrowUpFromLine,
      onPress: () => router.push('/wallet/withdraw'),
    },
    {
      id: 'stake',
      label: 'Stake',
      icon: TrendingUp,
      onPress: () => router.push('/wallet/stake'),
    },
  ];

  // Summary cards populated from dashboard API data
  // Data is cached and auto-refreshes every 5 minutes globally
  // Currency values are converted to preferred currency
  const summaryCards: SummaryCard[] = useMemo(() => [
    {
      id: 'transactions_today',
      label: 'Today\'s Transactions',
      value: dashboardSummary.totalTransactionsToday.toString(),
      icon: CreditCard,
      iconColor: colors.primary,
    },
    {
      id: 'amount_today',
      label: 'Today\'s Volume',
      value: formatCurrency(convertedAmountToday),
      icon: TrendingUp,
      iconColor: colors.success,
    },
    {
      id: 'pending',
      label: 'Pending Requests',
      value: dashboardSummary.pendingRequests.toString(),
      icon: Timer,
      iconColor: colors.info,
    },
    {
      id: 'liquidity',
      label: 'Available Liquidity',
      value: formatCurrency(convertedLiquidity),
      icon: ArrowDownToLine,
      iconColor: colors.success,
    },
    {
      id: 'reputation',
      label: 'Reputation Score',
      value: dashboardSummary.reputationScore.toFixed(1),
      icon: Star,
      iconColor: colors.warning,
    },
  ], [dashboardSummary, convertedAmountToday, convertedLiquidity, formatCurrency]);

  const renderBadge = (count: number) => {
    if (count <= 0) return null;
    return (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.primary}
        translucent
      />


      {/* Header */}
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, spacing.md) }]}>

        {/* Top Row */}
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.userSection}
            activeOpacity={0.7}
            accessibilityLabel="User Profile"
            onPress={() => router.push('/wallet/profile')}
          >
            <View style={styles.avatar}>
              <User
                size={layout.iconSize.md}
                color={colors.borderLight}
                strokeWidth={2}
              />
            </View>
            <View style={styles.greetingContainer}>
              <Text style={styles.helloText}>Hello</Text>
              <Text style={styles.usernameText}>{userName}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.actionIconsRow}>
            <TouchableOpacity
              style={styles.actionIconButton}
              activeOpacity={0.7}
              accessibilityLabel={`Messages, ${messageCount} unread`}
              onPress={() => router.push('/misc/chat')}
            >
              <MessageCircle
                size={layout.iconSize.md}
                color={colors.borderLight}
                strokeWidth={1.5}
              />
              {renderBadge(messageCount)}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionIconButton}
              activeOpacity={0.7}
              accessibilityLabel={`Notifications, ${notificationCount} new`}
              onPress={() => router.push('/misc/notifications')}
            >
              <Bell
                size={layout.iconSize.md}
                color={colors.borderLight}
                strokeWidth={1.5}
              />
              {renderBadge(notificationCount)}
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Wallet Balance</Text>

          <TouchableOpacity
            style={styles.currencySelector}
            activeOpacity={0.7}
            accessibilityLabel={`Currency: ${currencyCode || 'Loading...'}`}
          >
            <View style={styles.currencyFlag}>
              <Text style={styles.currencyFlagText}>
                {currencyLoading ? '...' : (currencyCode?.charAt(0) || '$')}
              </Text>
            </View>
            <Text style={styles.currencyText}>
              {currencyLoading ? 'Loading...' : (currencyCode || 'USD')}
            </Text>
            <ChevronDown size={14} color={colors.textLight} strokeWidth={2} />
          </TouchableOpacity>

          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>
              {balanceVisible ? formatCurrency(convertedBalance) : '••••••'}
            </Text>
            <TouchableOpacity
              onPress={() => setBalanceVisible(!balanceVisible)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityLabel={
                balanceVisible ? 'Hide balance' : 'Show balance'
              }
            >
              {balanceVisible ? (
                <Eye
                  size={layout.iconSize.lg}
                  color={colors.textLight}
                  strokeWidth={1.5}
                />
              ) : (
                <EyeOff
                  size={layout.iconSize.lg}
                  color={colors.textLight}
                  strokeWidth={1.5}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsWrapper}>
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action, index) => (
              <React.Fragment key={action.id}>
                <TouchableOpacity
                  style={styles.quickActionItem}
                  activeOpacity={0.7}
                  accessibilityLabel={action.label}
                  onPress={action.onPress}
                >
                  <View style={styles.quickActionIconContainer}>
                    <action.icon
                      size={layout.iconSize.lg}
                      color={colors.textWhite}
                      strokeWidth={2}
                    />
                  </View>
                  <Text style={styles.quickActionLabel}>{action.label}</Text>
                </TouchableOpacity>
                {index < quickActions.length - 1 && (
                  <View style={styles.quickActionDivider} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Wallets */}
        {wallets.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Wallets</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{wallets.length}</Text>
              </View>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.walletsScroll}
            >
              {wallets.map((wallet) => (
                <View key={wallet.id} style={styles.walletCard}>
                  <View style={styles.walletCardHeader}>
                    <View style={styles.walletIconContainer}>
                      <Image
                        source={CHAIN_ICONS[wallet.type] || require('../../assets/images/default-coin.png')}
                        style={styles.chainIcon}
                        resizeMode="contain"
                      />
                    </View>

                    <Text style={styles.walletType}>
                      {wallet.type.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.walletAddress} numberOfLines={1}>
                    {wallet.address.slice(0, 8)}…{wallet.address.slice(-6)}
                  </Text>
                  <Text style={styles.walletNetwork}>{wallet.network}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.cardsGrid}>
            {summaryCards.map((card) => (
              <TouchableOpacity
                key={card.id}
                style={styles.summaryCard}
                activeOpacity={0.8}
                accessibilityLabel={`${card.label}: ${card.value}`}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardAccentLine} />
                  <View
                    style={[
                      styles.cardIconWrapper,
                      {
                        backgroundColor: `${card.iconColor}15`,
                      },
                    ]}
                  >
                    <card.icon
                      size={layout.iconSize.sm}
                      color={card.iconColor}
                      strokeWidth={1.8}
                    />
                  </View>
                </View>
                <View style={styles.cardContent}>
                  <Text style={styles.cardLabel}>{card.label}</Text>
                  <Text style={styles.cardValue}>{card.value}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  headerContainer: {
    backgroundColor: colors.primary,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: borderRadius['3xl'],
    borderBottomRightRadius: borderRadius['3xl'],
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginBottom: spacing['2xl'],
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: layout.avatarSize.md,
    height: layout.avatarSize.md,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  greetingContainer: {
    justifyContent: 'center',
  },
  helloText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.textWhite,
    letterSpacing: typography.letterSpacing.wide,
  },
  usernameText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    color: colors.textWhite,
    opacity: 0.85,
    marginTop: spacing['2xs'],
  },
  actionIconsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionIconButton: {
    width: layout.avatarSize.md,
    height: layout.avatarSize.md,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: borderRadius.full,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    paddingHorizontal: spacing['2xs'],
  },
  badgeText: {
    color: colors.textWhite,
    fontSize: typography.fontSize['2xs'],
    fontWeight: typography.fontWeight.bold,
  },

  // Balance
  balanceSection: {
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  balanceLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textWhite,
    fontWeight: typography.fontWeight.regular,
    opacity: 0.85,
    marginBottom: spacing.sm,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  currencyFlag: {
    width: 20,
    height: 20,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyFlagText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  currencyText: {
    color: colors.textWhite,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
  },
  balanceAmount: {
    fontSize: typography.fontSize['7xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
    letterSpacing: typography.letterSpacing.tight,
  },

  // Quick Actions
  quickActionsWrapper: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing.xl,
  },
  quickActionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: borderRadius['2xl'],
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionDivider: {
    width: 1,
    height: 56,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickActionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.md,
  },
  quickActionLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textWhite,
    fontWeight: typography.fontWeight.medium,
  },

  // Content
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: layout.screenPaddingHorizontal,
    paddingTop: spacing['2xl'],
  },
  section: {
    marginBottom: spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
    marginTop: spacing.md,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  sectionBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing['2xs'],
    borderRadius: borderRadius.full,
  },
  sectionBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },

  // Wallets
  walletsScroll: {
    gap: spacing.md,
  },
  walletCard: {
    width: 180,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  walletCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  walletIconContainer: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  chainIcon: {
    width: 20,
    height: 20,
  },

  walletType: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    letterSpacing: typography.letterSpacing.wider,
  },
  walletAddress: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    color: colors.textTertiary,
    fontFamily: typography.fontFamilyMono,
    marginBottom: spacing.xs,
  },
  walletNetwork: {
    fontSize: typography.fontSize['2xs'],
    fontWeight: typography.fontWeight.medium,
    color: colors.textMuted,
    textTransform: 'capitalize',
  },

  // Summary Cards
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  summaryCard: {
    width: (width - layout.screenPaddingHorizontal * 2 - spacing.md) / 2,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  cardAccentLine: {
    width: 3,
    height: 28,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  cardIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    gap: spacing.xs,
  },
  cardLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    fontWeight: typography.fontWeight.medium,
  },
  cardValue: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },

  bottomSpacer: {
    height: 100,
  },
});

export default HomeScreen;