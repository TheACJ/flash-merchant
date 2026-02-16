import { ArrowLeft, Delete } from 'lucide-react-native';
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
import { borderRadius, colors, layout, spacing, typography } from '@/constants/theme';
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
  ['#', '0', 'delete'],
];

interface SummaryRowProps {
  label: string;
  value: string;
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

export default function EnterPin({ summary, onSubmit, onBack }: EnterPinProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      // Auto-submit when PIN is complete
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

  const handleKeyPress = useCallback((key: string) => {
    Vibration.vibrate(10);
    setError('');

    if (key === 'delete') {
      setPin((prev) => prev.slice(0, -1));
      return;
    }

    if (key === '#') {
      // Handle special character or ignore
      return;
    }

    if (pin.length < PIN_LENGTH) {
      setPin((prev) => prev + key);
    }
  }, [pin]);

  const handleSubmit = () => {
    if (pin.length !== PIN_LENGTH) {
      setError('Please enter complete PIN');
      triggerShake();
      return;
    }

    // In real app, validate PIN here
    onSubmit(pin);
  };

  const renderPinBoxes = () => {
    const boxes = [];
    for (let i = 0; i < PIN_LENGTH; i++) {
      const isFilled = i < pin.length;
      boxes.push(
        <Animated.View
          key={i}
          style={[
            styles.pinBox,
            isFilled && styles.pinBoxFilled,
            { transform: [{ translateX: shakeAnim }] },
          ]}
        >
          {isFilled && <View style={styles.pinDot} />}
        </Animated.View>
      );
    }
    return boxes;
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
          <ArrowLeft size={24} color={colors.textPrimary} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enter your pin</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Summary</Text>
        <SummaryRow label="Amount" value={summary.amount} />
        <SummaryRow label="Exchange rate" value={summary.exchangeRate} />
        <SummaryRow label="Customer receives" value={summary.customerReceives} />
        <SummaryRow label="Network fee" value={summary.networkFee} />
      </View>

      {/* PIN Input */}
      <View style={styles.pinContainer}>
        <View style={styles.pinBoxesContainer}>{renderPinBoxes()}</View>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      {/* Submit Button */}
      <View style={styles.submitButtonContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            pin.length !== PIN_LENGTH && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={pin.length !== PIN_LENGTH}
          activeOpacity={0.8}
          accessibilityLabel="Confirm transaction"
        >
          <Text
            style={[
              styles.submitButtonText,
              pin.length !== PIN_LENGTH && styles.submitButtonTextDisabled,
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
                  key === 'delete' ? 'Delete' : key === '#' ? 'Hash' : key
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
  summaryCard: {
    marginHorizontal: spacing['3xl'],
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.md,
    gap: spacing.md,
  },
  summaryTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.regular,
  },
  summaryValue: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  pinContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    paddingHorizontal: spacing['3xl'],
  },
  pinBoxesContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pinBox: {
    width: 70,
    height: 70,
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinBoxFilled: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  submitButtonContainer: {
    paddingHorizontal: spacing['3xl'],
    marginBottom: spacing.md,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: colors.primaryDisabled,
  },
  submitButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textLight,
  },
  submitButtonTextDisabled: {
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