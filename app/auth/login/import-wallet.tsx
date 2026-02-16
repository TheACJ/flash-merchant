// auth/login/import-wallet.tsx
import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import {
  ArrowLeft,
  ChevronRight,
  ClipboardPaste,
  KeyRound,
} from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');
const TOTAL_PHRASES = 12;

export default function ImportWalletScreen() {
  const [inputText, setInputText] = useState('');
  const [seedPhrases, setSeedPhrases] = useState<string[]>(
    Array(TOTAL_PHRASES).fill('')
  );
  const inputRef = useRef<TextInput>(null);

  const handleTextChange = (text: string) => {
    setInputText(text);
    const words = text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0);
    const newPhrases = Array(TOTAL_PHRASES).fill('');
    words.forEach((word, index) => {
      if (index < TOTAL_PHRASES) {
        newPhrases[index] = word.toLowerCase();
      }
    });
    setSeedPhrases(newPhrases);
  };

  const handlePaste = async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) {
        handleTextChange(text);
      }
    } catch {
      // Clipboard access failed
    }
  };

  const handleImport = async () => {
    const filledCount = seedPhrases.filter((p) => p.trim() !== '').length;

    if (filledCount !== TOTAL_PHRASES) {
      Alert.alert(
        'Incomplete',
        `Please enter all ${TOTAL_PHRASES} words (${filledCount}/${TOTAL_PHRASES} entered)`
      );
      return;
    }

    const mnemonic = seedPhrases.join(' ');
    router.push({
      pathname: '/auth/login/loading',
      params: { mnemonic },
    });
  };

  const filledCount = seedPhrases.filter((p) => p.trim() !== '').length;
  const allFilled = filledCount === TOTAL_PHRASES;

  const renderSeedSlot = (index: number) => {
    const word = seedPhrases[index];
    const isFilled = word.trim() !== '';

    return (
      <View
        key={index}
        style={[styles.seedSlot, isFilled && styles.seedSlotFilled]}
      >
        <View style={styles.seedNumber}>
          <Text style={styles.seedNumberText}>{index + 1}</Text>
        </View>
        <Text
          style={[styles.seedWord, !isFilled && styles.seedWordEmpty]}
        >
          {word || '—'}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.headerTitle}>Import Wallet</Text>
        <View style={{ width: layout.minTouchTarget }} />
      </View>

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Subtitle */}
        <View style={styles.subtitleSection}>
          <View style={styles.subtitleIcon}>
            <KeyRound
              size={layout.iconSize.lg}
              color={colors.primary}
              strokeWidth={1.8}
            />
          </View>
          <Text style={styles.subtitle}>
            Enter or paste your 12-word recovery phrase to restore your wallet
          </Text>
        </View>

        {/* Input Field */}
        <TouchableOpacity
          style={styles.inputContainer}
          onPress={() => inputRef.current?.focus()}
          activeOpacity={0.95}
        >
          <TextInput
            ref={inputRef}
            style={styles.textArea}
            value={inputText}
            onChangeText={handleTextChange}
            placeholder="Type or paste your recovery phrase here…"
            placeholderTextColor={colors.textPlaceholder}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.pasteButton}
            onPress={handlePaste}
            activeOpacity={0.7}
          >
            <ClipboardPaste
              size={layout.iconSize.xs}
              color={colors.primary}
              strokeWidth={2}
            />
            <Text style={styles.pasteButtonText}>Paste</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Progress */}
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>
            {filledCount} of {TOTAL_PHRASES} words
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(filledCount / TOTAL_PHRASES) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* Seed Phrase Grid */}
        <View style={styles.seedGrid}>
          {Array.from({ length: TOTAL_PHRASES / 2 }).map((_, rowIndex) => (
            <View key={rowIndex} style={styles.seedRow}>
              {renderSeedSlot(rowIndex * 2)}
              {renderSeedSlot(rowIndex * 2 + 1)}
            </View>
          ))}
        </View>

        {/* Import Button */}
        <TouchableOpacity
          style={[
            styles.importButton,
            allFilled && styles.importButtonActive,
          ]}
          onPress={handleImport}
          activeOpacity={0.85}
          disabled={!allFilled}
        >
          <Text style={styles.importButtonText}>Import Wallet</Text>
          <ChevronRight
            size={layout.iconSize.sm}
            color={colors.textWhite}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const SLOT_WIDTH = (width - layout.screenPaddingHorizontal * 2 - spacing.sm) / 2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
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
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  subtitleSection: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  subtitleIcon: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    textAlign: 'center',
    color: colors.textTertiary,
    paddingHorizontal: spacing.lg,
  },
  inputContainer: {
    backgroundColor: colors.backgroundCard,
    borderWidth: 2,
    borderColor: colors.primaryMedium,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.lg,
    minHeight: 100,
  },
  textArea: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    color: colors.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  pasteButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.primary,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  progressLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textTertiary,
    minWidth: 100,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  seedGrid: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  seedRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  seedSlot: {
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
  seedSlotFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  seedNumber: {
    width: 22,
    height: 22,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seedNumberText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
  },
  seedWord: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  seedWordEmpty: {
    color: colors.textPlaceholder,
  },
  importButton: {
    height: layout.buttonHeight,
    backgroundColor: colors.primaryDisabled,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  importButtonActive: {
    backgroundColor: colors.primary,
    ...shadows.button,
  },
  importButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
  },
});