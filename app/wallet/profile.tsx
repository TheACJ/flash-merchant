import { router, useRouter } from 'expo-router';
import {
  ArrowLeft,
  BadgeCheck,
  Eye,
  EyeOff,
  Lock,
  Plus,
  Star,
  User,
  Wallet
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface WalletData {
  balance: number;
  totalFiat: number;
  inOrders: number;
  stakingTier: string;
  stakingProgress: number;
  stakingTarget: number;
  dailyLimit: number;
  dailyUsed: number;
  limits: {
    perTransaction: number;
    dailyVolume: number;
    monthlyVolume: number;
  };
}

interface ProfileData {
  name: string;
  role: string;
  isVerified: boolean;
}

// Navigate to profile
  const handleStake = () =>  {
    router.push('/wallet/stake')
  }
  
const MOCK_WALLET_DATA: WalletData = {
  balance: 742.45,
  totalFiat: 8750,
  inOrders: 8750,
  stakingTier: 'Silver',
  stakingProgress: 2500,
  stakingTarget: 5000,
  dailyLimit: 3000,
  dailyUsed: 1500,
  limits: {
    perTransaction: 1000,
    dailyVolume: 3000,
    monthlyVolume: 20000,
  },
};

const MOCK_PROFILE_DATA: ProfileData = {
  name: 'Cryptoguru',
  role: 'Merchant',
  isVerified: true,
};

interface InfoCardProps {
  icon: React.ElementType;
  iconBgColor: string;
  iconColor: string;
  label: string;
  value: string;
}

function InfoCard({
  icon: Icon,
  iconBgColor,
  iconColor,
  label,
  value,
}: InfoCardProps) {
  return (
    <View style={styles.infoCard}>
      <View style={[styles.infoCardIcon, { backgroundColor: iconBgColor }]}>
        <Icon size={24} color={iconColor} strokeWidth={1.5} />
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
}

function LimitRow({ label, value }: LimitRowProps) {
  return (
    <View style={styles.limitRow}>
      <Text style={styles.limitLabel}>{label}</Text>
      <Text style={styles.limitValue}>{value}</Text>
    </View>
  );
}

export default function WalletProfileScreen() {
  const router = useRouter();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [walletData] = useState<WalletData>(MOCK_WALLET_DATA);
  const [profileData] = useState<ProfileData>(MOCK_PROFILE_DATA);

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleAddFunds = () => {
    router.push('/wallet/deposit');
  };

  const handleWithdraw = () => {
    router.push('/wallet/withdraw');
  };

  const progressPercentage =
    (walletData.stakingProgress / walletData.stakingTarget) * 100;
  const dailyProgressPercentage =
    (walletData.dailyUsed / walletData.dailyLimit) * 100;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} color="#000000" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile wallet</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <User size={24} color="#E7E7E7" strokeWidth={2} />
          </View>
          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{profileData.name}</Text>
              {profileData.isVerified && (
                <BadgeCheck size={16} color="#128807" strokeWidth={2} />
              )}
            </View>
            <Text style={styles.userRole}>{profileData.role}</Text>
          </View>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            <View style={styles.balanceLabelRow}>
              <Text style={styles.balanceLabel}>Wallet balance</Text>
              <TouchableOpacity
                onPress={() => setBalanceVisible(!balanceVisible)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                {balanceVisible ? (
                  <Eye size={18} color="#323333" strokeWidth={2} />
                ) : (
                  <EyeOff size={18} color="#323333" strokeWidth={2} />
                )}
              </TouchableOpacity>
            </View>
            <Text style={styles.balanceAmount}>
              {balanceVisible ? formatCurrency(walletData.balance) : '******'}
            </Text>
          </View>

          {/* <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.addFundsButton}
              onPress={handleAddFunds}
              activeOpacity={0.8}
            >
              <ArrowUpFromLine size={24} color="#F4F6F5" strokeWidth={1.5} />
              <Text style={styles.addFundsText}>Add Funds</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.withdrawButton}
              onPress={handleWithdraw}
              activeOpacity={0.8}
            >
              <CreditCard size={24} color="#000000" strokeWidth={1.5} />
              <Text style={styles.withdrawText}>Withdraw</Text>
            </TouchableOpacity>
          </View> */}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryCards}>
          <InfoCard
            icon={Wallet}
            iconBgColor="rgba(15, 114, 199, 0.2)"
            iconColor="#0F6EC0"
            label="Total Fiat"
            value={formatCurrency(walletData.totalFiat)}
          />
          <InfoCard
            icon={Lock}
            iconBgColor="rgba(255, 164, 85, 0.2)"
            iconColor="#FF9934"
            label="In orders"
            value={formatCurrency(walletData.inOrders)}
          />
        </View>

        {/* Staking Status */}
        <View style={styles.stakingCard}>
          <View style={styles.stakingHeader}>
            <View style={styles.stakingTitleRow}>
              <View style={styles.stakingIconContainer}>
                <TouchableOpacity 
                    activeOpacity={0.7}
                    accessibilityLabel="Stake"
                    onPress={handleStake}
                    >
                    <Plus size={24} color="#0F6EC0" strokeWidth={2} />
                </TouchableOpacity>    
              </View>
              <Text style={styles.stakingTitle}>Staking status</Text>
            </View>
            <Star size={24} color="#FF9934" fill="#FF9934" strokeWidth={1} />
          </View>

          <Text style={styles.stakingTier}>
            Next tier {walletData.stakingTarget.toLocaleString()} FLA$H
          </Text>

          <View style={styles.stakingProgressSection}>
            <Text style={styles.stakingLeft}>
              ${(walletData.stakingTarget - walletData.stakingProgress).toLocaleString()} left
            </Text>

            <View style={styles.progressBarContainer}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercentage}%` },
                ]}
              />
            </View>

            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>Daily limit</Text>
              <Text style={styles.progressLabel}>
                ${walletData.dailyLimit.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Transaction Limits */}
        <View style={styles.limitsSection}>
          <Text style={styles.limitsSectionTitle}>Transaction Limit</Text>
          <View style={styles.limitsCard}>
            <LimitRow
              label="Per Transaction"
              value={formatCurrency(walletData.limits.perTransaction)}
            />
            <LimitRow
              label="Daily Volume"
              value={formatCurrency(walletData.limits.dailyVolume)}
            />
            <LimitRow
              label="Monthly Volume"
              value={formatCurrency(walletData.limits.monthlyVolume)}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 52,
    paddingBottom: 40,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 20,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#657084',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    gap: 6,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  userRole: {
    fontSize: 14,
    fontWeight: '500',
    color: '#323333',
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 28,
    marginBottom: 20,
    gap: 30,
  },
  balanceHeader: {
    alignItems: 'center',
    gap: 20,
  },
  balanceLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  balanceLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#323333',
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '600',
    color: '#000000',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 30,
  },
  addFundsButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: '#0F6EC0',
    borderRadius: 15,
    paddingVertical: 13,
  },
  addFundsText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F4F6F5',
  },
  withdrawButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 114, 199, 0.1)',
    borderRadius: 15,
    paddingVertical: 13,
  },
  withdrawText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 25,
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 24,
    gap: 20,
  },
  infoCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCardContent: {
    gap: 10,
  },
  infoCardLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#323333',
  },
  infoCardValue: {
    fontSize: 20,
    fontWeight: '500',
    color: '#323333',
  },
  stakingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    gap: 14,
  },
  stakingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 0.3,
    borderBottomColor: '#657084',
    borderStyle: 'dashed',
  },
  stakingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stakingIconContainer: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(15, 114, 199, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stakingTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
  },
  stakingTier: {
    fontSize: 14,
    fontWeight: '500',
    color: '#323333',
  },
  stakingProgressSection: {
    gap: 14,
  },
  stakingLeft: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 30,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0F6EC0',
    borderRadius: 30,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#323333',
  },
  limitsSection: {
    gap: 20,
  },
  limitsSectionTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#000000',
  },
  limitsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    gap: 20,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  limitLabel: {
    fontSize: 16,
    fontWeight: '400',
    color: '#323333',
  },
  limitValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
});