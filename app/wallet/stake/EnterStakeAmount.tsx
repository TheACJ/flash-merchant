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

function InfoCard({ icon: Icon, label, value, iconColor = '#0F6EC0' }: InfoCardProps) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.infoCardIcon}>
        <Icon size={20} color={iconColor} strokeWidth={2} />
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
    // Remove non-numeric characters except decimal
    const cleaned = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit decimal places to 2
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
      setError(`Maximum stake amount is $${stakingConfig.maxAmount.toLocaleString()}`);
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
              <ArrowLeft size={24} color="#000000" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Stake</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Amount Input Section */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>How much do you want to stake</Text>
              <View
                style={[
                  styles.inputContainer,
                  isFocused && styles.inputContainerFocused,
                  error ? styles.inputContainerError : null,
                ]}
              >
                <Text style={styles.currencyPrefix}>$</Text>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={amount}
                  onChangeText={handleAmountChange}
                  placeholder="0.00"
                  placeholderTextColor="#AFAFB0"
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onSubmitEditing={handleSubmit}
                  accessibilityLabel="Stake amount input"
                />
                <Text style={styles.currencySuffix}>Flash</Text>
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            {/* Quick Amount Buttons */}
            <View style={styles.quickAmountsContainer}>
              <Text style={styles.quickAmountsLabel}>Quick select</Text>
              <View style={styles.quickAmountsRow}>
                {quickAmounts.map((quickAmount) => (
                  <TouchableOpacity
                    key={quickAmount}
                    style={[
                      styles.quickAmountButton,
                      parseFloat(amount) === quickAmount &&
                        styles.quickAmountButtonActive,
                    ]}
                    onPress={() => handleQuickAmount(quickAmount)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.quickAmountText,
                        parseFloat(amount) === quickAmount &&
                          styles.quickAmountTextActive,
                      ]}
                    >
                      ${quickAmount.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Staking Info Cards */}
            <View style={styles.infoCardsContainer}>
              <Text style={styles.infoCardsTitle}>Staking Details</Text>
              
              <View style={styles.infoCardsGrid}>
                <InfoCard
                  icon={Percent}
                  label="APR"
                  value={`${stakingConfig.apr}%`}
                  iconColor="#22C55E"
                />
                <InfoCard
                  icon={Clock}
                  label="Lock Period"
                  value={`${stakingConfig.lockPeriodDays} days`}
                  iconColor="#F59E0B"
                />
              </View>

              <View style={styles.infoCardsGrid}>
                <InfoCard
                  icon={Coins}
                  label="Min Stake"
                  value={`$${stakingConfig.minAmount}`}
                  iconColor="#0F6EC0"
                />
                <InfoCard
                  icon={TrendingUp}
                  label="Est. Returns"
                  value={calculateEstimatedReturns()}
                  iconColor="#22C55E"
                />
              </View>
            </View>

            {/* Info Notice */}
            <View style={styles.noticeContainer}>
              <Info size={18} color="#657084" strokeWidth={2} />
              <Text style={styles.noticeText}>
                Your staked funds will be locked for {stakingConfig.lockPeriodDays} days.
                You'll earn {stakingConfig.apr}% APR on your staked amount.
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
    backgroundColor: '#F5F5F5',
  },
  keyboardView: {
    flex: 1,
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
    backgroundColor: '#F4F6F5',
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
    paddingTop: 30,
    paddingBottom: 20,
  },
  inputSection: {
    gap: 15,
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F6F5',
    borderWidth: 1,
    borderColor: '#D2D6E1',
    borderRadius: 15,
    height: 60,
    paddingHorizontal: 16,
  },
  inputContainerFocused: {
    borderColor: '#0F6EC0',
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: '#C31D1E',
  },
  currencyPrefix: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#000000',
    height: '100%',
  },
  currencySuffix: {
    fontSize: 16,
    fontWeight: '500',
    color: '#D2D6E1',
    marginLeft: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#C31D1E',
    marginTop: -5,
  },
  quickAmountsContainer: {
    marginBottom: 30,
  },
  quickAmountsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#657084',
    marginBottom: 12,
  },
  quickAmountsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickAmountButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(15, 110, 192, 0.08)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  quickAmountButtonActive: {
    backgroundColor: '#0F6EC0',
    borderColor: '#0F6EC0',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0F6EC0',
  },
  quickAmountTextActive: {
    color: '#FFFFFF',
  },
  infoCardsContainer: {
    marginBottom: 20,
  },
  infoCardsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  infoCardsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  infoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 110, 192, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCardContent: {
    flex: 1,
  },
  infoCardLabel: {
    fontSize: 12,
    color: '#657084',
    marginBottom: 2,
  },
  infoCardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  noticeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(15, 110, 192, 0.05)',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    color: '#657084',
    lineHeight: 20,
  },
  bottomContainer: {
    paddingHorizontal: 52,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    paddingTop: 10,
    backgroundColor: '#F5F5F5',
  },
  stakeButton: {
    backgroundColor: '#0F6EC0',
    borderRadius: 15,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stakeButtonDisabled: {
    backgroundColor: 'rgba(15, 110, 192, 0.3)',
  },
  stakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F5F5F5',
  },
  stakeButtonTextDisabled: {
    color: '#F5F5F5',
    opacity: 0.7,
  },
});