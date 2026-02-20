import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import {
  ArrowLeft,
  Clock,
  Coins,
  Info,
  Percent,
  TrendingUp,
} from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StakingInfo } from './types';

interface EnterStakeAmountProps {
  initialAmount?: string;
  stakingConfig: StakingInfo;
  onSubmit: (amount: string) => void;
  onBack: () => void;
}

interface InfoCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  iconColor?: string;
}

function InfoCard({
  icon: Icon,
  label,
  value,
  iconColor = colors.primary,
}: InfoCardProps) {
  return (
    <View style={styles.infoCard}>
      <View
        style={[
          styles.infoCardIcon,
          { backgroundColor: `${iconColor}15` },
        ]}
      >
        <Icon size={layout.iconSize.sm} color={iconColor} strokeWidth={2} />
      </View>
      <View style={styles.infoCardContent}>
        <Text style={styles.infoCardLabel}>{label}</Text>
        <Text style={styles.infoCardValue}>{value}</Text>
      </View>
    </View>
  );
}

export default function EnterStakeAmount({
  initialAmount = '',
  stakingConfig,
  onSubmit,
  onBack,
}: EnterStakeAmountProps) {
  const [amount, setAmount] = useState(initialAmount);
  const [error, setError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const formatAmount = (value: string): string => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[1]?.length > 2) {
      return parts[0] + '.' + parts[1].slice(0, 2);
    }
    return cleaned;
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatAmount(text);
    setAmount(formatted);
    if (error) setError('');
  };

  const validateAmount = (): boolean => {
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount)) {
      setError('Please enter a valid amount');
      return false;
    }
    if (numAmount < stakingConfig.minAmount) {
      setError(`Minimum stake amount is $${stakingConfig.minAmount}`);
      return false;
    }
    if (numAmount > stakingConfig.maxAmount) {
      setError(
        `Maximum stake amount is $${stakingConfig.maxAmount.toLocaleString()}`
      );
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    if (validateAmount()) {
      onSubmit(amount);
    }
  };

  const calculateEstimatedReturns = (): string => {
    const numAmount = parseFloat(amount) || 0;
    const dailyRate = stakingConfig.apr / 100 / 365;
    const returns = numAmount * dailyRate * stakingConfig.lockPeriodDays;
    return `$${returns.toFixed(2)}`;
  };

  const quickAmounts = [100, 500, 1000, 5000];

  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
    if (error) setError('');
  };

  const isButtonDisabled = !amount || parseFloat(amount) <= 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={onBack}
              activeOpacity={0.7}
              accessibilityLabel="Go back"
            >
              <ArrowLeft
                size={layout.iconSize.md}
                color={colors.textPrimary}
                strokeWidth={2}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Stake</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={styles.stepLine} />
            <View style={styles.stepDot} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces
          >
            {/* Amount Input Section */}
            <View style={styles.inputSection}>
              <Text style={styles.inputTitle}>
                How much do you want to stake?
              </Text>
              <Text style={styles.inputDescription}>
                Enter the amount of FLA$H tokens to stake and start earning
                rewards.
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  isFocused && styles.inputContainerFocused,
                  error ? styles.inputContainerError : null,
                ]}
              >
                <View
                  style={[
                    styles.currencyBadge,
                    isFocused && styles.currencyBadgeFocused,
                  ]}
                >
                  <Text
                    style={[
                      styles.currencyPrefix,
                      isFocused && styles.currencyPrefixFocused,
                    ]}
                  >
                    $
                  </Text>
                </View>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={amount}
                  onChangeText={handleAmountChange}
                  placeholder="0.00"
                  placeholderTextColor={colors.textPlaceholder}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onSubmitEditing={handleSubmit}
                  accessibilityLabel="Stake amount input"
                />
                <View style={styles.currencySuffixBadge}>
                  <Text style={styles.currencySuffix}>FLA$H</Text>
                </View>
              </View>

              {error ? (
                <View style={styles.errorRow}>
                  <Info size={14} color={colors.error} strokeWidth={2} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
            </View>

            {/* Quick Amount Buttons */}
            <View style={styles.quickAmountsContainer}>
              <Text style={styles.quickAmountsLabel}>QUICK SELECT</Text>
              <View style={styles.quickAmountsRow}>
                {quickAmounts.map((quickAmount) => {
                  const isActive = parseFloat(amount) === quickAmount;
                  return (
                    <TouchableOpacity
                      key={quickAmount}
                      style={[
                        styles.quickAmountButton,
                        isActive && styles.quickAmountButtonActive,
                      ]}
                      onPress={() => handleQuickAmount(quickAmount)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.quickAmountText,
                          isActive && styles.quickAmountTextActive,
                        ]}
                      >
                        ${quickAmount.toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Staking Info Cards */}
            <View style={styles.infoCardsContainer}>
              <Text style={styles.sectionTitle}>Staking Details</Text>

              <View style={styles.infoCardsGrid}>
                <InfoCard
                  icon={Percent}
                  label="APR"
                  value={`${stakingConfig.apr}%`}
                  iconColor={colors.success}
                />
                <InfoCard
                  icon={Clock}
                  label="Lock Period"
                  value={`${stakingConfig.lockPeriodDays} days`}
                  iconColor={colors.warning}
                />
              </View>

              <View style={styles.infoCardsGrid}>
                <InfoCard
                  icon={Coins}
                  label="Min Stake"
                  value={`$${stakingConfig.minAmount}`}
                  iconColor={colors.primary}
                />
                <InfoCard
                  icon={TrendingUp}
                  label="Est. Returns"
                  value={calculateEstimatedReturns()}
                  iconColor={colors.success}
                />
              </View>
            </View>

            {/* Info Notice */}
            <View style={styles.noticeContainer}>
              <Info
                size={layout.iconSize.sm}
                color={colors.info}
                strokeWidth={1.8}
              />
              <Text style={styles.noticeText}>
                Your staked funds will be locked for{' '}
                {stakingConfig.lockPeriodDays} days. You'll earn{' '}
                {stakingConfig.apr}% APR on your staked amount.
              </Text>
            </View>
          </ScrollView>

          {/* Bottom Button */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={[
                styles.stakeButton,
                isButtonDisabled && styles.stakeButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isButtonDisabled}
              activeOpacity={0.8}
              accessibilityLabel="Continue to payment"
            >
              <Text
                style={[
                  styles.stakeButtonText,
                  isButtonDisabled && styles.stakeButtonTextDisabled,
                ]}
              >
                Continue
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },

  // Header
  header: {
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
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.wide,
  },
  headerSpacer: {
    width: layout.avatarSize.md,
  },

  // Step Indicator
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal * 3,
    paddingVertical: spacing.lg,
    gap: spacing.xs,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
    backgroundColor: colors.borderLight,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
    width: 12,
    height: 12,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.borderLight,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },

  // Input Section
  inputSection: {
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  inputTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
  },
  inputDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textTertiary,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.lg,
    height: layout.inputHeightLarge,
    paddingHorizontal: spacing.base,
    ...shadows.xs,
  },
  inputContainerFocused: {
    borderColor: colors.borderActive,
    borderWidth: 2,
    backgroundColor: colors.backgroundElevated,
  },
  inputContainerError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  currencyBadge: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  currencyBadgeFocused: {
    backgroundColor: colors.primaryLight,
  },
  currencyPrefix: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
  },
  currencyPrefixFocused: {
    color: colors.primary,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    height: '100%',
  },
  currencySuffixBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  currencySuffix: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    letterSpacing: typography.letterSpacing.wider,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    fontWeight: typography.fontWeight.medium,
  },

  // Quick Amounts
  quickAmountsContainer: {
    marginBottom: spacing['2xl'],
  },
  quickAmountsLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textTertiary,
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing.md,
  },
  quickAmountsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickAmountButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  quickAmountButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...shadows.button,
  },
  quickAmountText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  quickAmountTextActive: {
    color: colors.textWhite,
  },

  // Info Cards
  infoCardsContainer: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
    marginBottom: spacing.base,
  },
  infoCardsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1,
    gap: spacing['2xs'],
  },
  infoCardLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    fontWeight: typography.fontWeight.medium,
  },
  infoCardValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },

  // Notice
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.infoLight,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    borderLeftWidth: 3,
    borderLeftColor: colors.info,
  },
  noticeText: {
    flex: 1,
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    lineHeight: typography.fontSize.xs * typography.lineHeight.relaxed,
  },

  // Bottom
  bottomContainer: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: Platform.OS === 'ios' ? spacing['3xl'] : spacing['2xl'],
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  stakeButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.button,
  },
  stakeButtonDisabled: {
    backgroundColor: colors.primaryDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  stakeButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
    letterSpacing: typography.letterSpacing.wide,
  },
  stakeButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
});