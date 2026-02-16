// auth/create-wallet/seed_phrase.tsx
import { STORAGE_KEYS } from '@/constants/storage';
import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  ShieldAlert,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Seed Word Item ─────────────────────────────────────────────────────────

interface SeedWordItemProps {
  number: number;
  word: string;
  revealed: boolean;
}

const SeedWordItem: React.FC<SeedWordItemProps> = ({
  number,
  word,
  revealed,
}) => (
  <View style={styles.seedWordContainer}>
    <View style={styles.numberBadge}>
      <Text style={styles.numberText}>{number}</Text>
    </View>
    <Text style={styles.seedWord}>
      {revealed ? word : '••••••'}
    </Text>
  </View>
);

// ─── Main Component ─────────────────────────────────────────────────────────

export default function SeedPhrase() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [seedWords, setSeedWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMnemonic();
  }, []);

  const loadMnemonic = async () => {
    try {
      const mnemonic = await SecureStore.getItemAsync(
        STORAGE_KEYS.wallet_mnemonic_primary
      );
      if (mnemonic) {
        setSeedWords(mnemonic.split(' '));
      } else {
        Alert.alert('Error', 'Seed phrase not found');
      }
    } catch (error) {
      console.error('Failed to load mnemonic:', error);
      Alert.alert('Error', 'Failed to load seed phrase');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    const phrase = seedWords.join(' ');
    await Clipboard.setStringAsync(phrase);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleContinue = () => {
    router.push('/auth/create-wallet/verify_seed_phrase');
  };

  const handleGoBack = () => {
    router.back();
  };

  const wordPairs: [number, number][] = [];
  for (let i = 0; i < seedWords.length; i += 2) {
    wordPairs.push([i, i + 1]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <ArrowLeft
              size={layout.iconSize.md}
              color={colors.textPrimary}
              strokeWidth={2}
            />
          </TouchableOpacity>

          {/* Reveal Toggle */}
          <TouchableOpacity
            style={styles.revealButton}
            onPress={() => setRevealed(!revealed)}
            activeOpacity={0.7}
          >
            {revealed ? (
              <EyeOff
                size={layout.iconSize.sm}
                color={colors.textTertiary}
                strokeWidth={1.8}
              />
            ) : (
              <Eye
                size={layout.iconSize.sm}
                color={colors.textTertiary}
                strokeWidth={1.8}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          <View style={styles.headerSection}>
            <View style={styles.titleIconContainer}>
              <ShieldAlert
                size={layout.iconSize.lg}
                color={colors.warning}
                strokeWidth={1.8}
              />
            </View>
            <Text style={styles.title}>Recovery Phrase</Text>
            <Text style={styles.subtitle}>
              Write down these {seedWords.length} words in order and store them
              somewhere safe. This is the only way to recover your wallet.
            </Text>
          </View>

          {/* Warning Banner */}
          <View style={styles.warningBanner}>
            <ShieldAlert
              size={layout.iconSize.xs}
              color={colors.warning}
              strokeWidth={2}
            />
            <Text style={styles.warningText}>
              Never share your recovery phrase with anyone
            </Text>
          </View>

          {/* Seed Words Grid */}
          <View style={styles.gridSection}>
            {wordPairs.map(([leftIdx, rightIdx]) => (
              <View key={leftIdx} style={styles.wordRow}>
                <SeedWordItem
                  number={leftIdx + 1}
                  word={seedWords[leftIdx]}
                  revealed={revealed}
                />
                {rightIdx < seedWords.length && (
                  <SeedWordItem
                    number={rightIdx + 1}
                    word={seedWords[rightIdx]}
                    revealed={revealed}
                  />
                )}
              </View>
            ))}
          </View>

          {/* Copy Button */}
          <TouchableOpacity
            style={[styles.copyButton, copied && styles.copyButtonSuccess]}
            onPress={handleCopy}
            activeOpacity={0.8}
          >
            {copied ? (
              <Check
                size={layout.iconSize.sm}
                color={colors.success}
                strokeWidth={2.5}
              />
            ) : (
              <Copy
                size={layout.iconSize.sm}
                color={colors.primary}
                strokeWidth={1.8}
              />
            )}
            <Text
              style={[
                styles.copyButtonText,
                copied && styles.copyButtonTextSuccess,
              ]}
            >
              {copied ? 'Copied to clipboard' : 'Copy recovery phrase'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Buttons */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
            activeOpacity={0.85}
          >
            <Text style={styles.continueButtonText}>
              I've saved it, continue
            </Text>
            <ChevronRight
              size={layout.iconSize.sm}
              color={colors.textWhite}
              strokeWidth={2.5}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.goBackButton}
            onPress={handleGoBack}
            activeOpacity={0.8}
          >
            <Text style={styles.goBackButtonText}>Go back</Text>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    height: layout.headerHeight,
    paddingHorizontal: layout.screenPaddingHorizontal,
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
  revealButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Content
  contentSection: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  headerSection: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  titleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.warningLight,
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
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    textAlign: 'center',
    color: colors.textTertiary,
    paddingHorizontal: spacing.sm,
  },

  // Warning
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  warningText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.warning,
  },

  // Grid
  gridSection: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  wordRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  seedWordContainer: {
    flex: 1,
    height: 48,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.md,
    gap: spacing.sm,
  },
  numberBadge: {
    width: 22,
    height: 22,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
  },
  seedWord: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyMono,
  },

  // Copy
  copyButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    height: layout.buttonHeightSmall,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.primaryMedium,
  },
  copyButtonSuccess: {
    backgroundColor: colors.successLight,
    borderColor: 'transparent',
  },
  copyButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  copyButtonTextSuccess: {
    color: colors.success,
  },

  // Bottom
  bottomSection: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing['2xl'],
    gap: spacing.md,
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