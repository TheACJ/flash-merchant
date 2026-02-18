import { ArrowLeft, Delete, User } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';


import { SafeAreaView } from 'react-native-safe-area-context';
import { Asset, CustomerInfo } from './types';

interface EnterAmountProps {
  customer: CustomerInfo;
  asset: Asset;
  initialAmount?: string;
  onSubmit: (amount: string) => void;
  onBack: () => void;
}

const KEYPAD_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['.', '0', 'delete'],
];

const MAX_AMOUNT = 100000;
const MAX_DECIMALS = 2;

import { borderRadius, colors, layout, spacing, typography } from '@/constants/theme';

export default function EnterAmount({
  customer,
  asset,
  initialAmount = '',
  onSubmit,
  onBack,
}: EnterAmountProps) {
  const [amount, setAmount] = useState(initialAmount || '0');
  const [error, setError] = useState('');

  const formatDisplayAmount = (value: string): string => {
    if (!value || value === '0') return '$0';

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '$0';

    // Format with commas for thousands
    const parts = value.split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    if (parts.length > 1) {
      return `$${integerPart}.${parts[1]}`;
    }
    return `$${integerPart}`;
  };

  const handleKeyPress = useCallback((key: string) => {
    Vibration.vibrate(10);
    setError('');

    if (key === 'delete') {
      setAmount((prev) => {
        if (prev.length <= 1) return '0';
        const newValue = prev.slice(0, -1);
        return newValue || '0';
      });
      return;
    }

    if (key === '.') {
      setAmount((prev) => {
        if (prev.includes('.')) return prev;
        return prev + '.';
      });
      return;
    }

    setAmount((prev) => {
      // Handle initial zero
      if (prev === '0' && key !== '.') {
        return key;
      }

      // Check decimal places
      const parts = prev.split('.');
      if (parts.length > 1 && parts[1].length >= MAX_DECIMALS) {
        return prev;
      }

      // Check max amount
      const newValue = prev + key;
      if (parseFloat(newValue) > MAX_AMOUNT) {
        setError(`Maximum amount is $${MAX_AMOUNT.toLocaleString()}`);
        return prev;
      }

      return newValue;
    });
  }, []);

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (numAmount < 1) {
      setError('Minimum amount is $1.00');
      return;
    }

    onSubmit(amount);
  };

  const truncateAddress = (address: string): string => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const isButtonDisabled = parseFloat(amount) <= 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Physical withdrawal</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Customer Info Card */}
      <View style={styles.customerCard}>
        <Text style={styles.cardLabel}>To:</Text>
        <View style={styles.customerInfo}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <User size={20} color={colors.textTertiary} strokeWidth={2} />
            </View>
          </View>
          <View style={styles.customerDetails}>
            <Text style={styles.customerName}>{customer.name}</Text>
            <Text style={styles.customerAddress}>
              {truncateAddress(customer.walletAddress)}
            </Text>
          </View>
        </View>
      </View>

      {/* Amount Display */}
      <View style={styles.amountContainer}>
        <Text
          style={[
            styles.amountText,
            parseFloat(amount) > 0 && styles.amountTextActive,
          ]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {formatDisplayAmount(amount)}
        </Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      {/* Continue Button */}
      <View style={styles.continueButtonContainer}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            isButtonDisabled && styles.continueButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isButtonDisabled}
          activeOpacity={0.8}
          accessibilityLabel="Continue to PIN entry"
        >
          <Text
            style={[
              styles.continueButtonText,
              isButtonDisabled && styles.continueButtonTextDisabled,
            ]}
          >
            Next
          </Text>
        </TouchableOpacity>
      </View>

      {/* Keypad */}
      <View style={styles.keypadContainer}>
        {KEYPAD_KEYS.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.keypadKey,
                  key === 'delete' && styles.keypadKeyDelete,
                ]}
                onPress={() => handleKeyPress(key)}
                activeOpacity={0.6}
                accessibilityLabel={
                  key === 'delete' ? 'Delete' : key === '.' ? 'Decimal point' : key
                }
              >
                {key === 'delete' ? (
                  <Delete size={24} color={colors.textPrimary} strokeWidth={2} />
                ) : (
                  <Text style={styles.keypadKeyText}>{key}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 50,
  },
  customerCard: {
    marginHorizontal: spacing['3xl'],
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.md,
  },
  cardLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: layout.avatarSize.md,
    height: layout.avatarSize.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: borderRadius.full,
    backgroundColor: colors.textTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerDetails: {
    flex: 1,
    gap: 4,
  },
  customerName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  customerAddress: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  amountContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing['3xl'],
  },
  amountText: {
    fontSize: 50,
    fontWeight: typography.fontWeight.bold,
    color: colors.textTertiary,
    textAlign: 'center',
  },
  amountTextActive: {
    color: colors.textPrimary,
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  continueButtonContainer: {
    paddingHorizontal: spacing['3xl'],
    marginBottom: spacing.md,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: colors.primaryDisabled,
  },
  continueButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textLight,
  },
  continueButtonTextDisabled: {
    color: colors.textLight,
    opacity: 0.7,
  },
  keypadContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing['3xl'],
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
    gap: spacing.md,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  keypadKey: {
    flex: 1,
    height: 58,
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadKeyDelete: {
    backgroundColor: colors.primaryLight,
  },
  keypadKeyText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
});