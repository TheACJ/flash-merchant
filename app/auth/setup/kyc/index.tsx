// auth/setup/kyc/index.tsx
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
  ArrowLeft,
  Car,
  ChevronRight,
  CreditCard,
  Fingerprint,
  ShieldCheck,
  UserCheck
} from 'lucide-react-native';
import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface KYCOptionProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onPress: () => void;
}

const KYCOption: React.FC<KYCOptionProps> = ({
  title,
  description,
  icon,
  onPress,
}) => (
  <TouchableOpacity
    style={styles.optionContainer}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.optionIconContainer}>{icon}</View>
    <View style={styles.optionTextGroup}>
      <Text style={styles.optionTitle}>{title}</Text>
      <Text style={styles.optionDescription}>{description}</Text>
    </View>
    <ChevronRight
      size={layout.iconSize.sm}
      color={colors.textMuted}
      strokeWidth={2}
    />
  </TouchableOpacity>
);

export default function KYCVerification() {
  const router = useRouter();

  const kycOptions = [
    {
      title: 'NIN',
      description: 'National Identification Number',
      icon: (
        <Fingerprint
          size={layout.iconSize.md}
          color={colors.primary}
          strokeWidth={1.8}
        />
      ),
      onPress: () => router.push('/auth/setup/kyc/nin'),
    },
    {
      title: 'BVN',
      description: 'Bank Verification Number',
      icon: (
        <CreditCard
          size={layout.iconSize.md}
          color={colors.primary}
          strokeWidth={1.8}
        />
      ),
      onPress: () => router.push('/auth/setup/kyc/bvn'),
    },
    {
      title: "Driver's Licence",
      description: 'Vehicle operation permit',
      icon: (
        <Car
          size={layout.iconSize.md}
          color={colors.primary}
          strokeWidth={1.8}
        />
      ),
      onPress: () => router.push('/auth/setup/kyc/drivers_licence'),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

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
      </View>

      <View style={styles.container}>
        {/* Title Section */}
        <View style={styles.headerSection}>
          <View style={styles.titleIconContainer}>
            <UserCheck
              size={layout.iconSize.xl}
              color={colors.primary}
              strokeWidth={1.8}
            />
          </View>
          <Text style={styles.title}>Identity Verification</Text>
          <Text style={styles.subtitle}>
            Verify your identity to unlock full merchant features and higher
            transaction limits
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionLabel}>Verification Method</Text>
          {kycOptions.map((option, index) => (
            <KYCOption key={index} {...option} />
          ))}
        </View>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Footer Notice */}
        <View style={styles.footerSection}>
          <View style={styles.footerCard}>
            <ShieldCheck
              size={layout.iconSize.sm}
              color={colors.success}
              strokeWidth={1.8}
            />
            <View style={styles.footerTextContainer}>
              <Text style={styles.footerTitle}>Secure Verification</Text>
              <Text style={styles.footerText}>
                Your details are encrypted and verified through official
                government identity providers. We never store raw document data.
              </Text>
            </View>
          </View>
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
  header: {
    height: layout.headerHeight,
    paddingHorizontal: layout.screenPaddingHorizontal,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },

  // Title Section
  headerSection: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  titleIconContainer: {
    width: 72,
    height: 72,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    textAlign: 'center',
    color: colors.textTertiary,
    paddingHorizontal: spacing.sm,
  },

  // Options
  optionsSection: {
    gap: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
    marginBottom: spacing.xs,
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
    gap: spacing.base,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.xs,
  },
  optionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTextGroup: {
    flex: 1,
    gap: spacing.xs,
  },
  optionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  optionDescription: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textTertiary,
  },

  // Footer
  footerSection: {
    paddingBottom: spacing['2xl'],
  },
  footerCard: {
    flexDirection: 'row',
    backgroundColor: colors.successLight,
    borderRadius: borderRadius.md,
    padding: spacing.base,
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  footerTextContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  footerTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success,
  },
  footerText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    color: colors.textSecondary,
  },
});