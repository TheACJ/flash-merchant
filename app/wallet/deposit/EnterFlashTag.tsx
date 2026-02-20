import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import { ArrowLeft, AtSign, Info } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface EnterFlashTagProps {
  initialValue?: string;
  onSubmit: (flashTag: string) => void;
  onBack: () => void;
}

export default function EnterFlashTag({
  initialValue = '',
  onSubmit,
  onBack,
}: EnterFlashTagProps) {
  const [flashTag, setFlashTag] = useState(initialValue);
  const [error, setError] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const validateFlashTag = (tag: string): boolean => {
    if (!tag.trim()) {
      setError('Flash tag is required');
      return false;
    }
    if (tag.length < 3) {
      setError('Flash tag must be at least 3 characters');
      return false;
    }
    if (!/^@?[a-zA-Z0-9_]+$/.test(tag)) {
      setError('Only letters, numbers, and underscores allowed');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    const normalizedTag = flashTag.startsWith('@') ? flashTag : `@${flashTag}`;
    if (validateFlashTag(normalizedTag)) {
      onSubmit(normalizedTag);
    }
  };

  const handleChangeText = (text: string) => {
    setFlashTag(text);
    if (error) setError('');
  };

  const isButtonDisabled = !flashTag.trim();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

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
              accessibilityRole="button"
            >
              <ArrowLeft
                size={layout.iconSize.md}
                color={colors.textPrimary}
                strokeWidth={2}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Physical Deposit</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={styles.stepLine} />
            <View style={styles.stepDot} />
            <View style={styles.stepLine} />
            <View style={styles.stepDot} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.inputSection}>
              <Text style={styles.inputTitle}>Customer Flash Tag</Text>
              <Text style={styles.inputDescription}>
                Enter the customer's unique flash tag to send them crypto
                directly.
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
                    styles.inputPrefix,
                    isFocused && styles.inputPrefixFocused,
                  ]}
                >
                  <AtSign
                    size={layout.iconSize.sm}
                    color={isFocused ? colors.primary : colors.textTertiary}
                    strokeWidth={2}
                  />
                </View>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={flashTag.replace('@', '')}
                  onChangeText={handleChangeText}
                  placeholder="username"
                  placeholderTextColor={colors.textPlaceholder}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onSubmitEditing={handleSubmit}
                  accessibilityLabel="Customer flash tag input"
                />
              </View>

              {error ? (
                <View style={styles.errorRow}>
                  <Info size={14} color={colors.error} strokeWidth={2} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Bottom Button */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={[
                styles.nextButton,
                isButtonDisabled && styles.nextButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isButtonDisabled}
              activeOpacity={0.8}
              accessibilityLabel="Continue to next step"
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.nextButtonText,
                  isButtonDisabled && styles.nextButtonTextDisabled,
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
    paddingHorizontal: layout.screenPaddingHorizontal * 2,
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

  // Content
  content: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing['2xl'],
  },
  inputSection: {
    gap: spacing.md,
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
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.lg,
    height: layout.inputHeight,
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
  inputPrefix: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  inputPrefixFocused: {
    backgroundColor: colors.primaryLight,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
    height: '100%',
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

  // Bottom
  bottomContainer: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: Platform.OS === 'ios' ? spacing['3xl'] : spacing['2xl'],
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.button,
  },
  nextButtonDisabled: {
    backgroundColor: colors.primaryDisabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
    letterSpacing: typography.letterSpacing.wide,
  },
  nextButtonTextDisabled: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
});