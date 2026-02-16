// @/components/kyc/NumpadScreen.tsx
// Shared numpad screen component used by NIN, BVN, and Driver's Licence
import {
    borderRadius,
    colors,
    layout,
    shadows,
    spacing,
    typography,
} from '@/constants/theme';
import { useRouter } from 'expo-router';
import {
    AlertTriangle,
    ArrowLeft,
    ChevronRight,
    Delete
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface KYCNumpadScreenProps {
  title: string;
  inputLabel: string;
  placeholder: string;
  maxDigits: number;
  hint: string;
  icon: React.ReactNode;
  onSubmit: (value: string) => void;
}

export const NumpadScreen: React.FC<KYCNumpadScreenProps> = ({
  title,
  inputLabel,
  placeholder,
  maxDigits,
  hint,
  icon,
  onSubmit,
}) => {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>([]);

  const handleDigitPress = (digit: string) => {
    if (digits.length >= maxDigits) return;
    setDigits([...digits, digit]);
  };

  const handleDelete = () => {
    if (digits.length === 0) return;
    setDigits(digits.slice(0, -1));
  };

  const handleNext = () => {
    if (digits.length === maxDigits) {
      onSubmit(digits.join(''));
    }
  };

  const displayValue = digits.join('');
  const isComplete = digits.length === maxDigits;
  const progress = digits.length / maxDigits;

  const numpadKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['empty', '0', 'delete'],
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft
              size={layout.iconSize.md}
              color={colors.textPrimary}
              strokeWidth={2}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={{ width: layout.minTouchTarget }} />
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>{inputLabel}</Text>

          <View
            style={[
              styles.inputContainer,
              isComplete && styles.inputContainerComplete,
              digits.length > 0 && !isComplete && styles.inputContainerActive,
            ]}
          >
            <View style={styles.inputIconContainer}>{icon}</View>
            <Text
              style={[
                styles.inputText,
                !displayValue && styles.inputPlaceholder,
                isComplete && styles.inputTextComplete,
              ]}
            >
              {displayValue || placeholder}
            </Text>
            <Text style={styles.digitCounter}>
              {digits.length}/{maxDigits}
            </Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>

          {/* Hint */}
          <View style={styles.hintRow}>
            <AlertTriangle
              size={12}
              color={colors.warning}
              strokeWidth={2.5}
            />
            <Text style={styles.hintText}>{hint}</Text>
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.submitSection}>
          <TouchableOpacity
            style={[styles.submitButton, !isComplete && styles.buttonDisabled]}
            onPress={handleNext}
            disabled={!isComplete}
            activeOpacity={0.85}
          >
            <Text style={styles.submitButtonText}>Verify</Text>
            <ChevronRight
              size={layout.iconSize.sm}
              color={colors.textWhite}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        </View>

        {/* Numpad */}
        <View style={styles.numpadSection}>
          {numpadKeys.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.numpadRow}>
              {row.map((key) => {
                if (key === 'empty') {
                  return <View key={key} style={styles.numpadKeyEmpty} />;
                }

                if (key === 'delete') {
                  return (
                    <TouchableOpacity
                      key={key}
                      style={styles.numpadKeySpecial}
                      onPress={handleDelete}
                      activeOpacity={0.6}
                      disabled={digits.length === 0}
                    >
                      <Delete
                        size={layout.iconSize.md}
                        color={
                          digits.length === 0
                            ? colors.textMuted
                            : colors.textPrimary
                        }
                        strokeWidth={1.8}
                      />
                    </TouchableOpacity>
                  );
                }

                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.numpadKey,
                      digits.length >= maxDigits && styles.numpadKeyDisabled,
                    ]}
                    onPress={() => handleDigitPress(key)}
                    activeOpacity={0.6}
                    disabled={digits.length >= maxDigits}
                  >
                    <Text style={styles.numpadKeyText}>{key}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },

  // Header
  header: {
    height: layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
  },

  // Input
  inputSection: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
  },
  inputContainer: {
    height: layout.inputHeight,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  inputContainerActive: {
    borderColor: colors.primary,
  },
  inputContainerComplete: {
    borderColor: colors.success,
    backgroundColor: colors.successLight,
  },
  inputIconContainer: {
    width: layout.iconSize.lg,
    alignItems: 'center',
  },
  inputText: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.wider,
  },
  inputPlaceholder: {
    color: colors.textPlaceholder,
    letterSpacing: typography.letterSpacing.normal,
    fontWeight: typography.fontWeight.regular,
  },
  inputTextComplete: {
    color: colors.success,
    fontWeight: typography.fontWeight.semibold,
  },
  digitCounter: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textMuted,
  },

  // Progress
  progressBar: {
    height: 3,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },

  // Hint
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  hintText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.warning,
  },

  // Submit
  submitSection: {
    marginTop: spacing.xl,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    ...shadows.button,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  submitButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
  },

  // Numpad
  numpadSection: {
    marginTop: 'auto',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  numpadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  numpadKey: {
    width: 80,
    height: 56,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xs,
  },
  numpadKeyDisabled: {
    opacity: 0.4,
  },
  numpadKeySpecial: {
    width: 80,
    height: 56,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numpadKeyEmpty: {
    width: 80,
    height: 56,
  },
  numpadKeyText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
});

export default NumpadScreen;