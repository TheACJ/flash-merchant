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
  User,
  Wallet
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { useTheme } from '../../hooks/useTheme';


const { width } = Dimensions.get('window');

interface QuickAction {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface SummaryCard {
  id: string;
  label: string;
  value: string;
  icon: React.ElementType;
}

interface BottomTab {
  id: string;
  label: string;
  icon: React.ElementType;
}

const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const [balanceVisible, setBalanceVisible] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const router = useRouter();
  
  // Get wallets from Redux
  const wallets = useSelector((state: RootState) => state.merchantWallet.wallets);
  
  console.log('Wallets loaded in home:', wallets.length);


  const walletBalance = 50000;
  const userName = '@TheACJ';
  const notificationCount = 3;
  const messageCount = 3;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: selectedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const quickActions: QuickAction[] = [
    { id: 'deposit', label: 'Deposit', icon: ArrowDownToLine },
    { id: 'withdraw', label: 'Withdraw', icon: ArrowUpFromLine },
    { id: 'stake', label: 'Stake', icon: TrendingUp },
  ];

  const summaryCards: SummaryCard[] = [
    { id: 'deposits', label: 'Total deposits', value: '$2,000.00', icon: ArrowDownToLine },
    { id: 'withdrawals', label: 'Total Withdrawal', value: '$2,000.00', icon: ArrowUpFromLine },
    { id: 'transactions', label: 'Transactions', value: '24', icon: CreditCard },
    { id: 'success', label: 'Success rate', value: '100%', icon: Star },
    { id: 'pending', label: 'Pending request', value: '20', icon: Timer },
  ];


  // Navigate to deposit
  const handleDeposit = () => {
    router.push('/wallet/deposit');
  };

  // Navigate to withdraw
  const handleWithdraw = () => {
    router.push('/wallet/withdraw');
  };

  // Navigate to stake
  const handleStake = () => {
    router.push('/wallet/stake');
  };

  // Navigate to notifications
  const handleNotifications = () => {
    router.push('/misc/notifications');
  };

  // Navigate to chat list
  const handleChat = () => {
    router.push('/misc/chat');
  };

  // Navigate to profile
  const handleProfile = () =>  {
    router.push('/settings/profile')
  }

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
        backgroundColor="#0F6EC0"
        translucent={false}
      />

      {/* Header Section with Blue Background */}
      <View style={styles.headerContainer}>
        {/* Top Row - User Info & Actions */}
        <View style={styles.topRow}>
          <TouchableOpacity 
            style={styles.userSection}
            activeOpacity={0.7}
            accessibilityLabel="User Profile"
            onPress={handleProfile}
            >
            <View style={styles.avatar}>
              <User size={24} color="#E7E7E7" strokeWidth={2} />
            </View>
            <View style={styles.greetingContainer}>
              <View style={styles.helloRow}>
                <Text style={styles.helloText}>Hello</Text>
              </View>
              <Text style={styles.usernameText}>{userName}</Text>
            </View>
            </TouchableOpacity>

          <View style={styles.actionIconsRow}>
            <TouchableOpacity
              style={styles.actionIconButton}
              activeOpacity={0.7}
              accessibilityLabel="Messages"
              accessibilityHint={`You have ${messageCount} unread messages`}
              onPress={handleChat}
            >
              <MessageCircle size={24} color="#DFE0E2" strokeWidth={1.5} />
              {renderBadge(messageCount)}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionIconButton}
              activeOpacity={0.7}
              accessibilityLabel="Notifications"
              accessibilityHint={`You have ${notificationCount} notifications`}
              onPress={handleNotifications}
            >
              <Bell size={24} color="#DFE0E2" strokeWidth={1.5} />
              {renderBadge(notificationCount)}
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Wallet balance</Text>

          <TouchableOpacity
            style={styles.currencySelector}
            activeOpacity={0.7}
            accessibilityLabel={`Currency: ${selectedCurrency}`}
          >
            <View style={styles.currencyFlag}>
              <Text style={styles.currencyFlagText}>$</Text>
            </View>
            <Text style={styles.currencyText}>{selectedCurrency}</Text>
            <ChevronDown size={14} color="#F4F6F5" />
          </TouchableOpacity>

          <View style={styles.balanceRow}>
            <Text style={styles.balanceAmount}>
              {balanceVisible ? formatCurrency(walletBalance) : '******'}
            </Text>
            <TouchableOpacity
              onPress={() => setBalanceVisible(!balanceVisible)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={balanceVisible ? 'Hide balance' : 'Show balance'}
            >
              {balanceVisible ? (
                <Eye size={26} color="#F4F6F5" strokeWidth={1.5} />
              ) : (
                <EyeOff size={26} color="#F4F6F5" strokeWidth={1.5} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions Card */}
        <View style={styles.quickActionsWrapper}>
          <View style={styles.quickActionsContainer}>
            {quickActions.map((action, index) => (
              <React.Fragment key={action.id}>
                <TouchableOpacity
                  style={styles.quickActionItem}
                  activeOpacity={0.7}
                  accessibilityLabel={action.label}
                  onPress={() => {
                    if (action.id === 'deposit') {
                      handleDeposit();
                    } else if (action.id === 'withdraw') {
                      handleWithdraw();
                    } else if (action.id == 'stake') {
                      handleStake();
                    }
                  }}
                >
                  <View style={styles.quickActionIconContainer}>
                    <action.icon size={28} color="#FFFFFF" strokeWidth={2} />
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

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {/* Wallets Section */}
        {wallets.length > 0 && (
          <View style={styles.walletsSection}>
            <Text style={styles.sectionTitle}>My Wallets ({wallets.length})</Text>
            <View style={styles.walletsGrid}>
              {wallets.map((wallet) => (
                <View key={wallet.id} style={styles.walletCard}>
                  <View style={styles.walletHeader}>
                    <Wallet size={20} color="#0F6EC0" />
                    <Text style={styles.walletType}>{wallet.type.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.walletAddress} numberOfLines={1}>
                    {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                  </Text>
                  <Text style={styles.walletNetwork}>{wallet.network}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Summary Cards Section */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Summary card</Text>

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
                  <View style={styles.cardIconWrapper}>
                    <card.icon size={22} color="#323333" strokeWidth={1.8} />
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

        {/* Additional spacing for bottom nav */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Header Styles
  headerContainer: {
    backgroundColor: theme.colors.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 25,
    borderBottomLeftRadius: theme.borderRadius['3xl'],
    borderBottomRightRadius: theme.borderRadius['3xl'],
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.layout.containerPadding,
    marginBottom: theme.spacing['2xl'],
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: theme.layout.avatarSize.md,
    height: theme.layout.avatarSize.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: '#657084',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  greetingContainer: {
    justifyContent: 'center',
  },
  helloRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helloText: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textLight,
    letterSpacing: 0.3,
  },
  usernameText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textLight,
    opacity: 0.9,
    marginTop: 2,
  },
  actionIconsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionIconButton: {
    width: theme.layout.avatarSize.md,
    height: theme.layout.avatarSize.md,
    borderRadius: theme.borderRadius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 18,
    height: 18,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: theme.colors.textWhite,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
  },

  // Balance Styles
  balanceSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#F4F6F5',
    fontWeight: '400',
    opacity: 0.9,
    marginBottom: 10,
  },
  currencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  currencyFlag: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  currencyFlagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  currencyText: {
    color: '#F4F6F5',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 6,
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  balanceAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#F4F6F5',
    letterSpacing: -1,
  },

  // Quick Actions Styles
  quickActionsWrapper: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  quickActionsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 25,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  quickActionItem: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionDivider: {
    width: 1,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  quickActionIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#0F6EC0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  quickActionLabel: {
    fontSize: 16,
    color: '#F4F6F5',
    fontWeight: '500',
  },

  // Scroll Content Styles
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 24,
    paddingTop: 30,
  },
  summarySection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 20,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: (width - 64) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardAccentLine: {
    width: 3,
    height: 28,
    backgroundColor: '#0F6EC0',
    borderRadius: 2,
    marginRight: 10,
  },
  cardIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F7FA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    gap: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: '#657084',
    fontWeight: '500',
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
  },
  walletsSection: {
    marginBottom: 30,
  },
  walletsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  walletCard: {
    width: (width - 64) / 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E7E7E7',
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  walletType: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F6EC0',
  },
  walletAddress: {
    fontSize: 11,
    color: '#657084',
    marginBottom: 4,
  },
  walletNetwork: {
    fontSize: 10,
    color: '#999',
    textTransform: 'capitalize',
  },
  bottomSpacer: {
    height: 100,
  }
});

export default HomeScreen;