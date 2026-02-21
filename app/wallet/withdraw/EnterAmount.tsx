import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import { usePreferredCurrency } from '@/hooks';
import { ArrowLeft, ArrowRightLeft, Delete, User, Wallet } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
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
const MAX_DECIMALS_FIAT = 2;
const MAX_DECIMALS_CRYPTO = 8;

export default function EnterAmount({
  customer,
  asset,
  initialAmount = '',
  onSubmit,
  onBack,
}: EnterAmountProps) {
  const [amount, setAmount] = useState(initialAmount || '0');
  const [error, setError] = useState('');
  const [isCryptoMode, setIsCryptoMode] = useState(false); // false = fiat, true = crypto
  const { formatCurrency, code: currencyCode, getCurrencyInfo } = usePreferredCurrency();

  // Get currency symbol
  const currencySymbol = getCurrencyInfo()?.symbol || currencyCode || '$';

  // Get asset price in USD
  const assetPriceUSD = useMemo(() => {
    return asset?.price || 0;
  }, [asset]);

  // Convert between crypto and fiat
  const convertedAmount = useMemo(() => {
    const numAmount = parseFloat(amount) || 0;
    if (numAmount === 0 || assetPriceUSD === 0) return 0;

    if (isCryptoMode) {
      // Amount is in crypto, convert to fiat
      return numAmount * assetPriceUSD;
    } else {
      // Amount is in fiat, convert to crypto
      return numAmount / assetPriceUSD;
    }
  }, [amount, isCryptoMode, assetPriceUSD]);

  const formatDisplayAmount = (value: string): string => {
    if (!value || value === '0') return isCryptoMode ? `0 ${asset?.symbol || ''}` : formatCurrency(0);
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return isCryptoMode ? `0 ${asset?.symbol || ''}` : formatCurrency(0);

    if (isCryptoMode) {
      return `${numValue.toFixed(8)} ${asset?.symbol || ''}`;
    }
    return formatCurrency(numValue);
  };

  // Toggle between crypto and fiat input mode
  const toggleInputMode = useCallback(() => {
    if (!asset || assetPriceUSD === 0) return;

    const numAmount = parseFloat(amount) || 0;
    if (numAmount > 0) {
      if (isCryptoMode) {
        // Switching from crypto to fiat - convert crypto amount to fiat
        const fiatAmount = numAmount * assetPriceUSD;
        setAmount(fiatAmount.toFixed(2));
      } else {
        // Switching from fiat to crypto - convert fiat amount to crypto
        const cryptoAmount = numAmount / assetPriceUSD;
        setAmount(cryptoAmount.toFixed(8));
      }
    }
    setIsCryptoMode(!isCryptoMode);
  }, [isCryptoMode, amount, assetPriceUSD, asset]);

  const handleKeyPress = useCallback(
    (key: string) => {
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
        if (prev === '0' && key !== '.') return key;

        const parts = prev.split('.');
        const maxDecimals = isCryptoMode ? MAX_DECIMALS_CRYPTO : MAX_DECIMALS_FIAT;
        if (parts.length > 1 && parts[1].length >= maxDecimals) return prev;

        const newValue = prev + key;

        // For fiat mode, check max amount
        if (!isCryptoMode && parseFloat(newValue) > MAX_AMOUNT) {
          setError(`Maximum amount is ${formatCurrency(MAX_AMOUNT)}`);
          return prev;
        }

        return newValue;
      });
    },
    [isCryptoMode, formatCurrency]
  );

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Validate minimum based on mode
    if (isCryptoMode) {
      const fiatEquivalent = numAmount * assetPriceUSD;
      if (fiatEquivalent < 1) {
        setError(`Minimum amount is ${currencySymbol}1.00`);
        return;
      }
    } else {
      if (numAmount < 1) {
        setError(`Minimum amount is ${currencySymbol}1.00`);
        return;
      }
    }

    // Always submit fiat amount
    const fiatAmount = isCryptoMode ? convertedAmount : numAmount;
    onSubmit(fiatAmount.toString());
  };

  const truncateAddress = (address: string): string => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const isButtonDisabled = parseFloat(amount) <= 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

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
        <Text style={styles.headerTitle}>Withdrawal</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, styles.stepDotCompleted]} />
        <View style={[styles.stepLine, styles.stepLineCompleted]} />
        <View style={[styles.stepDot, styles.stepDotActive]} />
        <View style={styles.stepLine} />
        <View style={styles.stepDot} />
      </View>

      {/* Customer Info Card */}
      <View style={styles.customerCard}>
        <View style={styles.customerCardHeader}>
          <View style={styles.recipientBadge}>
            <Wallet
              size={layout.iconSize.xs}
              color={colors.primary}
              strokeWidth={2}
            />
            <Text style={styles.recipientBadgeText}>Recipient</Text>
          </View>
        </View>
        <View style={styles.customerInfo}>
          <View style={styles.avatarContainer}>
            <User
              size={layout.iconSize.sm}
              color={colors.textWhite}
              strokeWidth={2}
            />
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

        {/* Toggle button */}
        {asset && assetPriceUSD > 0 && (
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleInputMode}
            activeOpacity={0.7}
            accessibilityLabel={`Switch to ${isCryptoMode ? 'fiat' : 'crypto'} input`}
          >
            <ArrowRightLeft
              size={layout.iconSize.xs}
              color={colors.primary}
              strokeWidth={2}
            />
            <Text style={styles.toggleButtonText}>
              {isCryptoMode ? currencyCode : asset.symbol}
            </Text>
          </TouchableOpacity>
        )}

        {/* Show converted amount */}
        {parseFloat(amount) > 0 && assetPriceUSD > 0 && (
          <Text style={styles.convertedAmountText}>
            ≈ {isCryptoMode
              ? formatCurrency(convertedAmount)
              : `${convertedAmount.toFixed(8)} ${asset?.symbol}`}
          </Text>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : (
          <Text style={styles.assetHint}>
            Withdrawing {asset.symbol} • {asset.name}
          </Text>
        )}
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
            Continue
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
                  key === 'delete' && styles.keypadKeySpecial,
                ]}
                onPress={() => handleKeyPress(key)}
                activeOpacity={0.5}
                accessibilityLabel={
                  key === 'delete'
                    ? 'Delete'
                    : key === '.'
                      ? 'Decimal point'
                      : key
                }
              >
                {key === 'delete' ? (
                  <Delete
                    size={layout.iconSize.md}
                    color={colors.textPrimary}
                    strokeWidth={1.8}
                  />
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
    paddingHorizontal: layout.screenPaddingHorizontal * 2,
    paddingVertical: spacing.md,
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
  stepDotCompleted: {
    backgroundColor: colors.success,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.borderLight,
  },
  stepLineCompleted: {
    backgroundColor: colors.success,
  },

  // Customer Card
  customerCard: {
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing.base,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    ...shadows.sm,
  },
  customerCardHeader: {
    marginBottom: spacing.md,
  },
  recipientBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing['2xs'],
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  recipientBadgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarContainer: {
    width: layout.avatarSize.md,
    height: layout.avatarSize.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerDetails: {
    flex: 1,
    gap: spacing['2xs'],
  },
  customerName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  customerAddress: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    fontFamily: typography.fontFamilyMono,
  },

  // Amount Display
  amountContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  amountText: {
    fontSize: typography.fontSize['7xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPlaceholder,
    textAlign: 'center',
    letterSpacing: typography.letterSpacing.tight,
  },
  amountTextActive: {
    color: colors.textPrimary,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  toggleButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  convertedAmountText: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  assetHint: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textTertiary,
    marginTop: spacing.sm,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.sm,
    textAlign: 'center',
  },

  // Continue Button
  continueButtonContainer: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginBottom: spacing.lg,
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.button,
  },
  continueButtonDisabled: {
    backgroundColor: colors.primaryDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
    letterSpacing: typography.letterSpacing.wide,
  },
  continueButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.6)',
  },

  // Keypad
  keypadContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
    gap: spacing.sm,
  },
  keypadRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  keypadKey: {
    flex: 1,
    height: 56,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xs,
  },
  keypadKeySpecial: {
    backgroundColor: colors.backgroundInput,
  },
  keypadKeyText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
});
