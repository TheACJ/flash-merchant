import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import { ArrowLeft, Delete, Lock, Shield } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransactionSummary } from './types';

interface EnterPinProps {
  summary: TransactionSummary;
  onSubmit: (pin: string) => void;
  onBack: () => void;
}

const PIN_LENGTH = 6;

const KEYPAD_KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'delete'],
];

interface SummaryRowProps {
  label: string;
  value: string;
  isHighlighted?: boolean;
  isLast?: boolean;
}

function SummaryRow({
  label,
  value,
  isHighlighted = false,
  isLast = false,
}: SummaryRowProps) {
  return (
    <>
      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text
          style={[
            styles.summaryValue,
            isHighlighted && styles.summaryValueHighlighted,
          ]}
        >
          {value}
        </Text>
      </View>
      {!isLast && <View style={styles.summaryDivider} />}
    </>
  );
}

export default function EnterPin({ summary, onSubmit, onBack }: EnterPinProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      handleSubmit();
    }
  }, [pin]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleKeyPress = useCallback(
    (key: string) => {
      if (!key) return;
      Vibration.vibrate(10);
      setError('');

      if (key === 'delete') {
        setPin((prev) => prev.slice(0, -1));
        return;
      }

      if (pin.length < PIN_LENGTH) {
        setPin((prev) => prev + key);
      }
    },
    [pin]
  );

  const handleSubmit = () => {
    if (pin.length !== PIN_LENGTH) {
      setError('Please enter your complete PIN');
      triggerShake();
      return;
    }
    onSubmit(pin);
  };

  const renderPinDots = () => {
    const dots = [];
    for (let i = 0; i < PIN_LENGTH; i++) {
      const isFilled = i < pin.length;
      const isNext = i === pin.length;
      dots.push(
        <Animated.View
          key={i}
          style={[
            styles.pinDotContainer,
            isFilled && styles.pinDotContainerFilled,
            isNext && styles.pinDotContainerNext,
            { transform: [{ translateX: shakeAnim }] },
          ]}
        >
          {isFilled && <View style={styles.pinDotInner} />}
        </Animated.View>
      );
    }
    return dots;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
        <Text style={styles.headerTitle}>Confirm</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, styles.stepDotCompleted]} />
        <View style={[styles.stepLine, styles.stepLineCompleted]} />
        <View style={[styles.stepDot, styles.stepDotCompleted]} />
        <View style={[styles.stepLine, styles.stepLineCompleted]} />
        <View style={[styles.stepDot, styles.stepDotActive]} />
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryCardHeader}>
          <Shield
            size={layout.iconSize.sm}
            color={colors.primary}
            strokeWidth={1.8}
          />
          <Text style={styles.summaryTitle}>Transaction Summary</Text>
        </View>

        <SummaryRow label="Amount" value={summary.amount} />
        <SummaryRow label="Exchange Rate" value={summary.exchangeRate} />
        <SummaryRow
          label="Customer Receives"
          value={summary.customerReceives}
          isHighlighted
        />
        <SummaryRow
          label="Network Fee"
          value={summary.networkFee}
          isLast
        />
      </View>

      {/* PIN Section */}
      <View style={styles.pinSection}>
        <View style={styles.pinIconRow}>
          <View style={styles.lockIconContainer}>
            <Lock
              size={layout.iconSize.sm}
              color={colors.primary}
              strokeWidth={2}
            />
          </View>
        </View>
        <Text style={styles.pinTitle}>Enter your PIN</Text>
        <Text style={styles.pinSubtitle}>
          Enter your 6-digit security PIN to confirm
        </Text>

        <View style={styles.pinDotsContainer}>{renderPinDots()}</View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      {/* Keypad */}
      <View style={styles.keypadContainer}>
        {KEYPAD_KEYS.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keypadRow}>
            {row.map((key, keyIndex) => (
              <TouchableOpacity
                key={`${rowIndex}-${keyIndex}`}
                style={[
                  styles.keypadKey,
                  key === 'delete' && styles.keypadKeySpecial,
                  key === '' && styles.keypadKeyEmpty,
                ]}
                onPress={() => handleKeyPress(key)}
                activeOpacity={key ? 0.5 : 1}
                disabled={!key}
                accessibilityLabel={
                  key === 'delete'
                    ? 'Delete'
                    : key
                      ? key
                      : undefined
                }
              >
                {key === 'delete' ? (
                  <Delete
                    size={layout.iconSize.md}
                    color={colors.textPrimary}
                    strokeWidth={1.8}
                  />
                ) : key ? (
                  <Text style={styles.keypadKeyText}>{key}</Text>
                ) : null}
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

  // Summary Card
  summaryCard: {
    marginHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing.sm,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.base,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  summaryTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.wide,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    fontWeight: typography.fontWeight.regular,
  },
  summaryValue: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semibold,
    textAlign: 'right',
    maxWidth: '55%',
  },
  summaryValueHighlighted: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.divider,
  },

  // PIN Section
  pinSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  pinIconRow: {
    marginBottom: spacing.md,
  },
  lockIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  pinSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    fontWeight: typography.fontWeight.regular,
    marginBottom: spacing.xl,
  },
  pinDotsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  pinDotContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xs,
  },
  pinDotContainerFilled: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  pinDotContainerNext: {
    borderColor: colors.primaryMedium,
    borderStyle: 'dashed',
  },
  pinDotInner: {
    width: 14,
    height: 14,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    fontWeight: typography.fontWeight.medium,
    marginTop: spacing.md,
    textAlign: 'center',
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
  keypadKeyEmpty: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  keypadKeyText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
});