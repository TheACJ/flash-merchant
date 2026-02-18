// welcome/disclaimer.tsx
import { ONBOARDING_STEPS } from '@/constants/storage';
import {
  animation,
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Shield
} from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { setOnboardingStep } from '../../utils/onboarding';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Reusable Checkbox Component ────────────────────────────────────────────

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label: string;
  size?: 'sm' | 'md';
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  onToggle,
  label,
  size = 'md',
}) => {
  const boxSize = size === 'sm' ? 20 : 24;
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <TouchableOpacity
      style={[
        styles.checkboxRow,
        checked && styles.checkboxRowActive,
      ]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.checkbox,
          { width: boxSize, height: boxSize },
          checked && styles.checkboxChecked,
        ]}
      >
        {checked && (
          <Check size={iconSize} color={colors.textWhite} strokeWidth={3} />
        )}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );
};

// ─── Disclaimer Screen ──────────────────────────────────────────────────────

interface DisclaimerScreenProps {
  onPrivacyPolicy: () => void;
}

const DisclaimerScreen: React.FC<DisclaimerScreenProps> = ({
  onPrivacyPolicy,
}) => {
  const [checks, setChecks] = useState([false, false, false]);

  const toggleCheck = useCallback((index: number) => {
    setChecks((prev) => {
      const updated = [...prev];
      updated[index] = !updated[index];
      return updated;
    });
  }, []);

  const allChecked = checks.every(Boolean);

  const disclaimerItems = [
    "I understand Flash doesn't control or recover my wallet.",
    'I am responsible for my wallet and recovery phrase.',
    'I am responsible for all transactions on my account.',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.disclaimerContent}>
        {/* Header Icon */}
        <View style={styles.disclaimerIconContainer}>
          <View style={styles.disclaimerIconCircle}>
            <Shield
              size={layout.iconSize.xl}
              color={colors.primary}
              strokeWidth={1.8}
            />
          </View>
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.disclaimerTitle}>Before you begin</Text>
        <Text style={styles.disclaimerSubtitle}>
          Please review and acknowledge the following to continue
        </Text>

        {/* Checkbox Items */}
        <View style={styles.checkboxGroup}>
          {disclaimerItems.map((item, index) => (
            <Checkbox
              key={index}
              checked={checks[index]}
              onToggle={() => toggleCheck(index)}
              label={item}
            />
          ))}
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.primaryButton, !allChecked && styles.buttonDisabled]}
          onPress={onPrivacyPolicy}
          activeOpacity={allChecked ? 0.85 : 1}
          disabled={!allChecked}
        >
          <Text style={styles.primaryButtonText}>Continue</Text>
          <ChevronRight
            size={layout.iconSize.sm}
            color={colors.textWhite}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Privacy Policy Screen ──────────────────────────────────────────────────

interface PrivacyPolicyScreenProps {
  onBack: () => void;
  onSignUp?: () => void;
  onLogin?: () => void;
}

const PrivacyPolicyScreen: React.FC<PrivacyPolicyScreenProps> = ({
  onBack,
  onSignUp,
  onLogin,
}) => {
  const [privacyChecked, setPrivacyChecked] = useState(false);

  const togglePrivacyCheck = useCallback(() => {
    setPrivacyChecked((prev) => !prev);
  }, []);

  const sections = [
    {
      title: 'Cancellation Policy',
      body: 'Flash Merchant does not store or manage user wallets. Because your wallet is non-custodial, all actions you take—such as creating, importing, or deleting your wallet—are fully controlled by you. Once a transaction is confirmed on the blockchain, it cannot be reversed or cancelled.',
    },
    {
      title: 'How We Use Your Information',
      body: 'Your information is used to create and maintain your merchant account, provide customer support, improve app features, and ensure compliance with anti-fraud and risk-monitoring requirements. We do not sell or share personal data with third-party advertisers.',
    },
    {
      title: 'Data Security',
      body: 'We implement encryption, device-level security, and strict access control to protect your account data. However, since your wallet keys are stored by you, Flash cannot guarantee recovery in the event of loss.',
    },
    {
      title: 'Terms & Conditions',
      body: 'By using Flash Merchant, you agree to comply with our Terms & Conditions regarding merchant conduct, transaction processing, and fair use. You are responsible for ensuring your account activity follows applicable laws and our platform guidelines.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
        >
          <ArrowLeft
            size={layout.iconSize.md}
            color={colors.textPrimary}
            strokeWidth={2}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: layout.minTouchTarget }} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.privacyScrollView}
        contentContainerStyle={styles.privacyScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section, index) => (
          <View key={index} style={styles.policySection}>
            <View style={styles.policySectionHeader}>
              <View style={styles.policySectionDot} />
              <Text style={styles.policySectionTitle}>{section.title}</Text>
            </View>
            <Text style={styles.policySectionBody}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Privacy Agreement & Buttons */}
      <View style={styles.privacyFooter}>
        <Checkbox
          checked={privacyChecked}
          onToggle={togglePrivacyCheck}
          label="I have read and agree to the Privacy Policy"
          size="sm"
        />

        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              styles.buttonFlex,
              !privacyChecked && styles.buttonDisabled,
            ]}
            onPress={onSignUp}
            activeOpacity={privacyChecked ? 0.85 : 1}
            disabled={!privacyChecked}
          >
            <Text style={styles.primaryButtonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              styles.buttonFlex,
              !privacyChecked && styles.buttonDisabled,
            ]}
            onPress={onLogin}
            activeOpacity={privacyChecked ? 0.85 : 1}
            disabled={!privacyChecked}
          >
            <Text style={styles.secondaryButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// ─── Main Combined Screen ───────────────────────────────────────────────────

const DisclaimerAndPrivacy: React.FC = () => {
  const router = useRouter();
  const [currentScreen, setCurrentScreen] = useState<
    'disclaimer' | 'privacy'
  >('disclaimer');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleSignUp = useCallback(async () => {
    try {
      await setOnboardingStep(ONBOARDING_STEPS.create_wallet);
      router.push('/auth/create-wallet');
    } catch (error) {
      console.error('Navigation to signup failed:', error);
    }
  }, [router]);

  const handleLogin = useCallback(async () => {
    try {
      await setOnboardingStep(ONBOARDING_STEPS.import_wallet);
      router.push('/auth/login');
    } catch (error) {
      console.error('Navigation to login failed:', error);
    }
  }, [router]);

  const navigateTo = useCallback(
    (screen: 'disclaimer' | 'privacy') => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: animation.duration.fast,
        useNativeDriver: true,
      }).start(() => {
        setCurrentScreen(screen);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: animation.duration.normal,
          useNativeDriver: true,
        }).start();
      });
    },
    [fadeAnim]
  );

  return (
    <Animated.View style={[{ flex: 1 }, { opacity: fadeAnim }]}>
      {currentScreen === 'disclaimer' ? (
        <DisclaimerScreen onPrivacyPolicy={() => navigateTo('privacy')} />
      ) : (
        <PrivacyPolicyScreen
          onBack={() => navigateTo('disclaimer')}
          onSignUp={handleSignUp}
          onLogin={handleLogin}
        />
      )}
    </Animated.View>
  );
};

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Header ──────────────────────────────────────────
  header: {
    height: layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
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

  // ── Disclaimer ──────────────────────────────────────
  disclaimerContent: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.xl,
  },
  disclaimerIconContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  disclaimerIconCircle: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disclaimerTitle: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    letterSpacing: typography.letterSpacing.tight,
  },
  disclaimerSubtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    textAlign: 'center',
    color: colors.textTertiary,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    marginBottom: spacing['2xl'],
    paddingHorizontal: spacing.lg,
  },
  checkboxGroup: {
    gap: spacing.md,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  checkboxRowActive: {
    borderColor: colors.primaryMedium,
    backgroundColor: colors.primaryLight,
  },
  checkbox: {
    borderRadius: borderRadius.full,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    color: colors.textSecondary,
  },

  // ── Buttons ─────────────────────────────────────────
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    ...shadows.button,
  },
  primaryButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
  },
  secondaryButton: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonFlex: {
    flex: 1,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  // ── Privacy Policy ──────────────────────────────────
  privacyScrollView: {
    flex: 1,
  },
  privacyScrollContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.base,
    paddingBottom: spacing['2xl'],
    gap: spacing.xl,
  },
  policySection: {
    gap: spacing.sm,
  },
  policySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  policySectionDot: {
    width: 6,
    height: 6,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
  },
  policySectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },
  policySectionBody: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    color: colors.textSecondary,
    paddingLeft: spacing.base,
  },
  privacyFooter: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.xl,
    paddingTop: spacing.base,
    gap: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
});

export default DisclaimerAndPrivacy;