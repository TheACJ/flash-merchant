// auth/setup/kyc/verifying.tsx
import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import { completeOnboarding } from '@/utils/onboarding';
import { router, useLocalSearchParams } from 'expo-router';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Loader2,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type VerificationStatus = 'verifying' | 'success' | 'failed';

export default function VerifyingScreen() {
  const params = useLocalSearchParams();
  const type = params.type as string;
  const number = params.number as string;
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Spin animation
  useEffect(() => {
    if (status === 'verifying') {
      const spin = Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      );
      spin.start();
      return () => spin.stop();
    }
  }, [status, spinAnim]);

  // Entry animation
  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, fadeAnim]);

  // Simulate verification
  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate success — replace with actual API call
      setStatus('success');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleContinue = async () => {
    await completeOnboarding();
    router.replace('/(tabs)/home');
  };

  const handleRetry = () => {
    setStatus('verifying');
    // Re-trigger verification
    setTimeout(() => {
      setStatus('success');
    }, 3000);
  };

  const spinInterpolation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const maskedNumber = number
    ? `${number.slice(0, 3)}${'*'.repeat(Math.max(0, number.length - 6))}${number.slice(-3)}`
    : '';

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <>
            <Animated.View
              style={[
                styles.iconCircle,
                styles.iconCircleVerifying,
                { transform: [{ rotate: spinInterpolation }] },
              ]}
            >
              <Loader2
                size={layout.iconSize['2xl']}
                color={colors.primary}
                strokeWidth={1.5}
              />
            </Animated.View>
            <Text style={styles.statusTitle}>Verifying Identity</Text>
            <Text style={styles.statusSubtitle}>
              Checking your {type} details with the issuing authority…
            </Text>
            <View style={styles.detailCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Document Type</Text>
                <Text style={styles.detailValue}>{type}</Text>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Number</Text>
                <Text style={styles.detailValueMono}>{maskedNumber}</Text>
              </View>
            </View>
          </>
        );

      case 'success':
        return (
          <>
            <View style={[styles.iconCircle, styles.iconCircleSuccess]}>
              <CheckCircle2
                size={layout.iconSize['2xl']}
                color={colors.success}
                strokeWidth={1.5}
              />
            </View>
            <Text style={styles.statusTitle}>Verified Successfully</Text>
            <Text style={styles.statusSubtitle}>
              Your {type} has been verified. You're all set to start accepting
              payments.
            </Text>
            <View style={styles.detailCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status</Text>
                <View style={styles.statusBadge}>
                  <ShieldCheck
                    size={12}
                    color={colors.success}
                    strokeWidth={2.5}
                  />
                  <Text style={styles.statusBadgeText}>Verified</Text>
                </View>
              </View>
              <View style={styles.detailDivider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Document</Text>
                <Text style={styles.detailValue}>{type}</Text>
              </View>
            </View>
          </>
        );

      case 'failed':
        return (
          <>
            <View style={[styles.iconCircle, styles.iconCircleFailed]}>
              <AlertCircle
                size={layout.iconSize['2xl']}
                color={colors.error}
                strokeWidth={1.5}
              />
            </View>
            <Text style={styles.statusTitle}>Verification Failed</Text>
            <Text style={styles.statusSubtitle}>
              We couldn't verify your {type}. Please check the number and try
              again.
            </Text>
          </>
        );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.contentSection,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {renderContent()}
        </Animated.View>

        {/* Bottom Actions */}
        <View style={styles.bottomSection}>
          {status === 'success' && (
            <TouchableOpacity
              style={styles.continueButton}
              onPress={handleContinue}
              activeOpacity={0.85}
            >
              <Text style={styles.continueButtonText}>Go to Dashboard</Text>
              <ChevronRight
                size={layout.iconSize.sm}
                color={colors.textWhite}
                strokeWidth={2.5}
              />
            </TouchableOpacity>
          )}

          {status === 'failed' && (
            <>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={handleRetry}
                activeOpacity={0.85}
              >
                <RotateCcw
                  size={layout.iconSize.sm}
                  color={colors.textWhite}
                  strokeWidth={2}
                />
                <Text style={styles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.goBackButton}
                onPress={() => router.back()}
                activeOpacity={0.8}
              >
                <Text style={styles.goBackButtonText}>
                  Choose different method
                </Text>
              </TouchableOpacity>
            </>
          )}
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
  contentSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },

  // Icon Circles
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  iconCircleVerifying: {
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primaryMedium,
  },
  iconCircleSuccess: {
    backgroundColor: colors.successLight,
    borderWidth: 2,
    borderColor: colors.success,
    borderStyle: undefined,
  },
  iconCircleFailed: {
    backgroundColor: colors.errorLight,
    borderWidth: 2,
    borderColor: colors.error,
  },

  // Status Text
  statusTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
    letterSpacing: typography.letterSpacing.tight,
  },
  statusSubtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
    maxWidth: 300,
  },

  // Detail Card
  detailCard: {
    width: '100%',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  detailLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textTertiary,
  },
  detailValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  detailValueMono: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyMono,
    letterSpacing: typography.letterSpacing.wide,
  },

  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.successLight,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success,
  },

  // Bottom Actions
  bottomSection: {
    gap: spacing.md,
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
  continueButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
  },
  retryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    ...shadows.button,
  },
  retryButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
  },
  goBackButton: {
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  goBackButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
});