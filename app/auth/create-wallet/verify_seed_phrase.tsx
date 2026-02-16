// auth/create-wallet/verify_seed_phrase.tsx
import { STORAGE_KEYS } from '@/constants/storage';
import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import { completeOnboarding } from '@/utils/onboarding';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import {
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  X,
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

export default function VerifySeedPhrase() {
  const [seedWords, setSeedWords] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadAndShuffleMnemonic();
  }, []);

  const loadAndShuffleMnemonic = async () => {
    try {
      const mnemonic = await SecureStore.getItemAsync(
        STORAGE_KEYS.wallet_mnemonic_primary
      );
      if (mnemonic) {
        const words = mnemonic.split(' ');
        setSeedWords(words);
        setShuffledWords([...words].sort(() => Math.random() - 0.5));
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

  const handleWordPress = (word: string, shuffledIndex: number) => {
    if (selectedWords.length < seedWords.length && !usedIndices.has(shuffledIndex)) {
      setSelectedWords([...selectedWords, word]);
      setUsedIndices(new Set([...usedIndices, shuffledIndex]));
    }
  };

  const handleRemoveWord = (index: number) => {
    const removedWord = selectedWords[index];
    // Find the corresponding shuffled index
    const shuffledIndex = shuffledWords.findIndex(
      (w, i) => w === removedWord && usedIndices.has(i)
    );

    const newSelected = selectedWords.filter((_, i) => i !== index);
    const newUsed = new Set(usedIndices);
    if (shuffledIndex >= 0) newUsed.delete(shuffledIndex);

    setSelectedWords(newSelected);
    setUsedIndices(newUsed);
  };

  const handleReset = () => {
    setSelectedWords([]);
    setUsedIndices(new Set());
  };

  const handleVerify = async () => {
    const isCorrect = selectedWords.join(' ') === seedWords.join(' ');

    if (isCorrect) {
      try {
        await completeOnboarding();
        Alert.alert(
          'Wallet Secured',
          'Your recovery phrase has been verified successfully.',
          [
            {
              text: 'Continue',
              onPress: () => router.replace('/(tabs)/home'),
            },
          ]
        );
      } catch (error) {
        console.error('Failed to complete onboarding:', error);
        Alert.alert('Error', 'Failed to complete setup. Please try again.');
      }
    } else {
      Alert.alert(
        'Incorrect Order',
        'The words are not in the correct order. Please try again.'
      );
      handleReset();
    }
  };

  const allSelected = selectedWords.length === seedWords.length;

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
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft
              size={layout.iconSize.md}
              color={colors.textPrimary}
              strokeWidth={2}
            />
          </TouchableOpacity>

          {selectedWords.length > 0 && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              activeOpacity={0.7}
            >
              <RotateCcw
                size={layout.iconSize.sm}
                color={colors.textTertiary}
                strokeWidth={1.8}
              />
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <View style={styles.contentSection}>
          <View style={styles.headerSection}>
            <View style={styles.titleIconContainer}>
              <ShieldCheck
                size={layout.iconSize.lg}
                color={colors.primary}
                strokeWidth={1.8}
              />
            </View>
            <Text style={styles.title}>Verify Recovery Phrase</Text>
            <Text style={styles.subtitle}>
              Tap the words in the correct order to confirm you saved your
              recovery phrase
            </Text>
          </View>

          {/* Progress Indicator */}
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>
              {selectedWords.length} of {seedWords.length} words
            </Text>
            <View style={styles.progressBarSmall}>
              <View
                style={[
                  styles.progressFillSmall,
                  {
                    width: `${
                      (selectedWords.length / seedWords.length) * 100
                    }%`,
                  },
                ]}
              />
            </View>
          </View>

          {/* Selected Words Area */}
          <View style={styles.selectedArea}>
            {selectedWords.length === 0 ? (
              <Text style={styles.selectedPlaceholder}>
                Tap words below in the correct order
              </Text>
            ) : (
              selectedWords.map((word, index) => (
                <TouchableOpacity
                  key={`selected-${index}`}
                  style={styles.selectedWord}
                  onPress={() => handleRemoveWord(index)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.selectedWordNumber}>{index + 1}</Text>
                  <Text style={styles.selectedWordText}>{word}</Text>
                  <X size={12} color={colors.textWhite} strokeWidth={2.5} />
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Available Words */}
          <View style={styles.wordsGrid}>
            {shuffledWords.map((word, index) => {
              const isUsed = usedIndices.has(index);

              return (
                <TouchableOpacity
                  key={`word-${index}`}
                  style={[
                    styles.wordButton,
                    isUsed && styles.wordButtonUsed,
                  ]}
                  onPress={() => !isUsed && handleWordPress(word, index)}
                  activeOpacity={isUsed ? 1 : 0.7}
                  disabled={isUsed}
                >
                  <Text
                    style={[
                      styles.wordButtonText,
                      isUsed && styles.wordButtonTextUsed,
                    ]}
                  >
                    {word}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Bottom Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.verifyButton,
              allSelected && styles.verifyButtonActive,
            ]}
            onPress={handleVerify}
            disabled={!allSelected}
            activeOpacity={0.85}
          >
            {allSelected && (
              <CheckCircle2
                size={layout.iconSize.sm}
                color={colors.textWhite}
                strokeWidth={2}
              />
            )}
            <Text style={styles.verifyButtonText}>Verify Recovery Phrase</Text>
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
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.full,
  },
  resetButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textTertiary,
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
    backgroundColor: colors.primaryLight,
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
    paddingHorizontal: spacing.sm,
  },

  // Progress
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.base,
  },
  progressLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textTertiary,
    minWidth: 100,
  },
  progressBarSmall: {
    flex: 1,
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFillSmall: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },

  // Selected Area
  selectedArea: {
    minHeight: 100,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.primaryMedium,
    borderStyle: 'dashed',
    marginBottom: spacing.xl,
  },
  selectedPlaceholder: {
    fontSize: typography.fontSize.base,
    color: colors.textPlaceholder,
    fontWeight: typography.fontWeight.regular,
    fontStyle: 'italic',
  },
  selectedWord: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
    gap: spacing.xs,
  },
  selectedWordNumber: {
    fontSize: typography.fontSize.xs,
    color: colors.textWhite,
    fontWeight: typography.fontWeight.bold,
    opacity: 0.7,
  },
  selectedWordText: {
    fontSize: typography.fontSize.sm,
    color: colors.textWhite,
    fontWeight: typography.fontWeight.semibold,
  },

  // Word Buttons
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  wordButton: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.xs,
  },
  wordButtonUsed: {
    backgroundColor: colors.backgroundInput,
    borderColor: colors.borderLight,
    opacity: 0.4,
    ...({ elevation: 0 } as any),
    shadowOpacity: 0,
  },
  wordButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  wordButtonTextUsed: {
    color: colors.textPlaceholder,
  },

  // Bottom
  bottomSection: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing['2xl'],
  },
  verifyButton: {
    backgroundColor: colors.primaryDisabled,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  verifyButtonActive: {
    backgroundColor: colors.primary,
    ...shadows.button,
  },
  verifyButtonText: {
    fontWeight: typography.fontWeight.semibold,
    fontSize: typography.fontSize.md,
    color: colors.textWhite,
  },
});