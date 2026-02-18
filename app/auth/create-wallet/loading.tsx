// auth/create-wallet/loading.tsx
import { ONBOARDING_STEPS } from '@/constants/storage';
import {
  borderRadius,
  colors,
  layout,
  spacing,
  typography,
} from '@/constants/theme';
import walletWorkletService from '@/services/WalletWorkletService';
import { addWallet } from '@/store/slices/merchantWalletSlice';
import { setOnboardingStep } from '@/utils/onboarding';
import { router } from 'expo-router';
import { CheckCircle2, Loader2, Wallet } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useDispatch } from 'react-redux';

interface ChainStep {
  label: string;
  key: string;
}

const CHAIN_STEPS: ChainStep[] = [
  { label: 'Ethereum', key: 'ethereum' },
  { label: 'Solana', key: 'solana' },
  { label: 'Bitcoin', key: 'bitcoin' },
  { label: 'BNB Chain', key: 'bnb' },
];

export default function LoadingWalletsScreen() {
  const dispatch = useDispatch();
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentChain, setCurrentChain] = useState('');
  const progressAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Spinning animation for loader
  useEffect(() => {
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
  }, [spinAnim]);

  // Pulse animation for icon
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Animate progress bar
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 400,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  useEffect(() => {
    finalizeWalletSetup();
  }, []);

  const finalizeWalletSetup = async () => {
    try {
      setCurrentChain('Ethereum');
      setProgress(0.15);

      // Check if wallets are already generated (from background process)
      let wallets = walletWorkletService.getStatus().wallets;
      
      if (!wallets) {
        // Wait for background wallet generation to complete
        wallets = await walletWorkletService.waitForCompletion();
      }

      // Animate step-by-step progress for UX
      setCompletedSteps(['ethereum']);
      setCurrentChain('Solana');
      setProgress(0.4);
      dispatch(addWallet(wallets.ethereum));

      await delay(300);
      setCompletedSteps((prev) => [...prev, 'solana']);
      setCurrentChain('Bitcoin');
      setProgress(0.65);
      dispatch(addWallet(wallets.solana));

      await delay(300);
      setCompletedSteps((prev) => [...prev, 'bitcoin']);
      setCurrentChain('BNB Chain');
      setProgress(0.85);
      dispatch(addWallet(wallets.bitcoin));

      await delay(300);
      setCompletedSteps((prev) => [...prev, 'bnb']);
      setProgress(1);
      dispatch(addWallet(wallets.bnb));

      await setOnboardingStep(ONBOARDING_STEPS.seed_phrase);

      await delay(600);
      router.replace('/auth/create-wallet/seed_phrase');
    } catch (error) {
      console.error('Failed to finalize wallet setup:', error);
      // Check if wallets exist before trying to recreate
      const existingWallets = walletWorkletService.getStatus().wallets;
      if (existingWallets) {
        // Wallets exist, just proceed
        dispatch(addWallet(existingWallets.ethereum));
        dispatch(addWallet(existingWallets.solana));
        dispatch(addWallet(existingWallets.bitcoin));
        dispatch(addWallet(existingWallets.bnb));
        await setOnboardingStep(ONBOARDING_STEPS.tag);
        router.replace('/auth/create-wallet/seed_phrase');
        return;
      }
      
      // Only create new wallets if none exist
      try {
        const wallets = await walletWorkletService.createWalletAsync();
        
        // Dispatch wallets
        dispatch(addWallet(wallets.ethereum));
        dispatch(addWallet(wallets.solana));
        dispatch(addWallet(wallets.bitcoin));
        dispatch(addWallet(wallets.bnb));
        
        await setOnboardingStep(ONBOARDING_STEPS.tag);
        router.replace('/auth/create-wallet/seed_phrase');
      } catch (retryError) {
        console.error('Retry also failed:', retryError);
        router.back();
      }
    }
  };

  const spinInterpolation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={styles.content}>
        {/* Animated Icon */}
        <Animated.View
          style={[styles.iconContainer, { transform: [{ scale: pulseAnim }] }]}
        >
          <View style={styles.iconCircle}>
            <Wallet
              size={layout.iconSize['2xl']}
              color={colors.primary}
              strokeWidth={1.5}
            />
          </View>
        </Animated.View>

        {/* Title */}
        <Text style={styles.title}>Setting Up Wallets</Text>
        <Text style={styles.subtitle}>
          Creating multi-chain wallet support for your merchant account
        </Text>

        {/* Chain Steps */}
        <View style={styles.stepsContainer}>
          {CHAIN_STEPS.map((step) => {
            const isCompleted = completedSteps.includes(step.key);
            const isCurrent = currentChain === step.label && !isCompleted;

            return (
              <View key={step.key} style={styles.stepRow}>
                <View
                  style={[
                    styles.stepIcon,
                    isCompleted && styles.stepIconCompleted,
                    isCurrent && styles.stepIconActive,
                  ]}
                >
                  {isCompleted ? (
                    <CheckCircle2
                      size={layout.iconSize.sm}
                      color={colors.success}
                      strokeWidth={2.5}
                    />
                  ) : isCurrent ? (
                    <Animated.View
                      style={{ transform: [{ rotate: spinInterpolation }] }}
                    >
                      <Loader2
                        size={layout.iconSize.sm}
                        color={colors.primary}
                        strokeWidth={2.5}
                      />
                    </Animated.View>
                  ) : (
                    <View style={styles.stepDot} />
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    isCompleted && styles.stepLabelCompleted,
                    isCurrent && styles.stepLabelActive,
                  ]}
                >
                  {step.label}
                </Text>
                {isCompleted && (
                  <Text style={styles.stepStatus}>Ready</Text>
                )}
              </View>
            );
          })}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[styles.progressFill, { width: progressWidth }]}
            />
          </View>
          <Text style={styles.progressText}>
            {Math.round(progress * 100)}%
          </Text>
        </View>
      </View>
    </View>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
    width: '100%',
  },
  iconContainer: {
    marginBottom: spacing['2xl'],
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryMedium,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    letterSpacing: typography.letterSpacing.tight,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    marginBottom: spacing['3xl'],
    maxWidth: 280,
  },
  stepsContainer: {
    width: '100%',
    gap: spacing.base,
    marginBottom: spacing['2xl'],
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    gap: spacing.md,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconCompleted: {
    backgroundColor: colors.successLight,
  },
  stepIconActive: {
    backgroundColor: colors.primaryLight,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.borderLight,
  },
  stepLabel: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textMuted,
  },
  stepLabelCompleted: {
    color: colors.textPrimary,
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  stepStatus: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wider,
  },
  progressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
    width: 36,
    textAlign: 'right',
  },
});