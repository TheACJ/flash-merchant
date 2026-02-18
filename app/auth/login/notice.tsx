// auth/login/notice.tsx
import { ONBOARDING_STEPS } from '@/constants/storage';
import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import { setOnboardingStep } from '@/utils/onboarding';
import { useRouter } from 'expo-router';
import {
  AlertCircle,
  Check,
  ChevronRight,
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

interface CheckboxItemProps {
  text: string;
  checked: boolean;
  onToggle: () => void;
}

const CheckboxItem: React.FC<CheckboxItemProps> = ({
  text,
  checked,
  onToggle,
}) => (
  <TouchableOpacity
    style={[styles.checkboxContainer, checked && styles.checkboxContainerActive]}
    onPress={onToggle}
    activeOpacity={0.7}
  >
    <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
      {checked && (
        <Check size={12} color={colors.textWhite} strokeWidth={3} />
      )}
    </View>
    <Text style={styles.checkboxText}>{text}</Text>
  </TouchableOpacity>
);

export default function ImportantNotice() {
  const router = useRouter();
  const [checks, setChecks] = useState([false, false, false]);

  const allChecked = checks.every(Boolean);

  const toggleCheck = (index: number) => {
    setChecks((prev) => {
      const newChecks = [...prev];
      newChecks[index] = !newChecks[index];
      return newChecks;
    });
  };

  const handleContinue = async () => {
    if (allChecked) {
      await setOnboardingStep(ONBOARDING_STEPS.pin);
      router.push('/auth/setup/pin');
    }
  };

  const disclaimers = [
    'My funds are controlled on this device. Flash has no custody nor access control over my funds.',
    'Flash can never recover my funds for me. It is my responsibility to save and protect my seed phrase.',
    'If the app is deleted or I lose my seed phrase, it cannot be recovered. I can only get my funds back with my seed phrase.',
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.warningIconContainer}>
            <AlertCircle
              size={layout.iconSize['2xl']}
              color={colors.error}
              strokeWidth={1.5}
            />
          </View>
          <Text style={styles.title}>Important Notice</Text>
          <Text style={styles.subtitle}>
            Please read and acknowledge each statement before continuing
          </Text>
        </View>

        {/* Disclaimers */}
        <View style={styles.disclaimersSection}>
          {disclaimers.map((text, index) => (
            <CheckboxItem
              key={index}
              text={text}
              checked={checks[index]}
              onToggle={() => toggleCheck(index)}
            />
          ))}
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Continue Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !allChecked && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!allChecked}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <ChevronRight
              size={layout.iconSize.sm}
              color={colors.textWhite}
              strokeWidth={2.5}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  headerSection: {
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing['3xl'],
    marginBottom: spacing['2xl'],
  },
  warningIconContainer: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: colors.errorLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    textAlign: 'center',
    color: colors.textTertiary,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    paddingHorizontal: spacing.lg,
  },
  disclaimersSection: {
    gap: spacing.md,
  },
  checkboxContainer: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  checkboxContainerActive: {
    borderColor: colors.primaryMedium,
    backgroundColor: colors.primaryLight,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.backgroundInput,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing['2xs'],
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    color: colors.textSecondary,
  },
  bottomSection: {
    paddingBottom: spacing['2xl'],
  },
  continueButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    ...shadows.button,
  },
  continueButtonDisabled: {
    opacity: 0.45,
  },
  continueButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
  },
});