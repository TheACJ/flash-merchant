import { AssetIcon } from '@/components/AssetIcon';
import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import { useAssetCache } from '@/hooks';
import { assetInfoOrchestrator } from '@/services/AssetInfoOrchestrator';
import { ArrowLeft, AtSign, ChevronDown, Info } from 'lucide-react-native';
import React, { useMemo, useRef, useState } from 'react';
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
import AssetSelector from '../deposit/AssetSelector';
import { Asset, convertAPIAsset } from './types';

interface SelectFlashTagAssetProps {
  initialFlashTag?: string;
  initialAsset?: Asset | null;
  onSubmit: (flashTag: string, asset: Asset) => void;
  onBack: () => void;
}

export default function SelectFlashTagAsset({
  initialFlashTag = '',
  initialAsset = null,
  onSubmit,
  onBack,
}: SelectFlashTagAssetProps) {
  const [flashTag, setFlashTag] = useState(initialFlashTag);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(
    initialAsset
  );
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const [flashTagError, setFlashTagError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const assetIds = assetInfoOrchestrator.getAssetIds();
  const { assets: apiAssets } = useAssetCache(assetIds);

  const assets = useMemo(() => {
    if (apiAssets.length > 0) {
      // Deduplicate by ID
      const uniqueAssets = new Map<string, typeof apiAssets[0]>();
      for (const apiAsset of apiAssets) {
        if (!uniqueAssets.has(apiAsset.id)) {
          uniqueAssets.set(apiAsset.id, apiAsset);
        }
      }

      return Array.from(uniqueAssets.values()).map((apiAsset) =>
        convertAPIAsset({
          id: apiAsset.id,
          name: apiAsset.name,
          symbol: apiAsset.symbol,
          icon_url: apiAsset.icon_url || '',
          chains: [],
          price: apiAsset.price,
          price24hChange: apiAsset.price24hChange,
        })
      );
    }
    return [];
  }, [apiAssets]);

  const validateFlashTag = (tag: string): boolean => {
    if (!tag.trim()) {
      setFlashTagError('Flash tag is required');
      return false;
    }
    if (tag.length < 3) {
      setFlashTagError('Flash tag must be at least 3 characters');
      return false;
    }
    setFlashTagError('');
    return true;
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    const normalizedTag = flashTag.startsWith('@') ? flashTag : `@${flashTag}`;
    if (!validateFlashTag(normalizedTag)) return;
    if (!selectedAsset) return;
    onSubmit(normalizedTag, selectedAsset);
  };

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
    setShowAssetSelector(false);
  };

  const handleFlashTagChange = (text: string) => {
    setFlashTag(text);
    if (flashTagError) setFlashTagError('');
  };

  const isButtonDisabled = !flashTag.trim() || !selectedAsset;

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
            >
              <ArrowLeft
                size={layout.iconSize.md}
                color={colors.textPrimary}
                strokeWidth={2}
              />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Withdrawal</Text>
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
            {/* Flash Tag Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputTitle}>Customer Flash Tag</Text>
              <Text style={styles.inputDescription}>
                Enter the customer's unique identifier to initiate the
                withdrawal.
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  isFocused && styles.inputContainerFocused,
                  flashTagError ? styles.inputContainerError : null,
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
                  onChangeText={handleFlashTagChange}
                  placeholder="username"
                  placeholderTextColor={colors.textPlaceholder}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  accessibilityLabel="Customer flash tag input"
                />
              </View>

              {flashTagError ? (
                <View style={styles.errorRow}>
                  <Info size={14} color={colors.error} strokeWidth={2} />
                  <Text style={styles.errorText}>{flashTagError}</Text>
                </View>
              ) : null}
            </View>

            {/* Asset Selector */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Select Asset</Text>
              <TouchableOpacity
                style={[
                  styles.selectorContainer,
                  selectedAsset && styles.selectorContainerSelected,
                ]}
                onPress={() => setShowAssetSelector(true)}
                activeOpacity={0.7}
                accessibilityLabel="Select cryptocurrency asset"
              >
                {selectedAsset ? (
                  <View style={styles.selectedAsset}>
                    <AssetIcon asset={selectedAsset} size={36} />
                    <View style={styles.assetTextInfo}>
                      <Text style={styles.assetSymbol}>
                        {selectedAsset.symbol}
                      </Text>
                      <Text style={styles.assetName}>
                        {selectedAsset.name}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>Choose an asset</Text>
                )}
                <View style={styles.chevronContainer}>
                  <ChevronDown
                    size={layout.iconSize.sm}
                    color={colors.textPlaceholder}
                    strokeWidth={2}
                  />
                </View>
              </TouchableOpacity>
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

      <AssetSelector
        visible={showAssetSelector}
        assets={assets}
        selectedAsset={selectedAsset}
        onSelect={handleAssetSelect}
        onClose={() => setShowAssetSelector(false)}
      />
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
    gap: spacing.xl,
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
    marginBottom: spacing.xs,
  },
  inputLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },

  // Flash Tag Input
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

  // Asset Selector
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundCard,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.lg,
    height: layout.inputHeightLarge,
    paddingHorizontal: spacing.base,
    ...shadows.xs,
  },
  selectorContainerSelected: {
    borderColor: colors.primaryMedium,
  },
  selectedAsset: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  assetTextInfo: {
    gap: spacing['2xs'],
  },
  assetSymbol: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  assetName: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    fontWeight: typography.fontWeight.regular,
  },
  placeholderText: {
    fontSize: typography.fontSize.md,
    color: colors.textPlaceholder,
    fontWeight: typography.fontWeight.regular,
  },
  chevronContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
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