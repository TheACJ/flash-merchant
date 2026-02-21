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
import { ArrowLeft, ChevronDown, Info } from 'lucide-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AssetSelector from './AssetSelector';
import { Asset, convertAPIAsset } from './types';

interface SelectAssetAmountProps {
  initialAsset?: Asset | null;
  initialAmount?: string;
  onSubmit: (asset: Asset, amount: string) => void;
  onBack: () => void;
}

export default function SelectAssetAmount({
  initialAsset = null,
  initialAmount = '',
  onSubmit,
  onBack,
}: SelectAssetAmountProps) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(
    initialAsset
  );
  const [amount, setAmount] = useState(initialAmount);
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const amountInputRef = useRef<TextInput>(null);

  const assetIds = assetInfoOrchestrator.getAssetIds();
  const { assets: apiAssets, isLoading: isLoadingAssets } =
    useAssetCache(assetIds);

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

  const formatAmount = (value: string): string => {
    const cleaned = value.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[1]?.length > 2) {
      return parts[0] + '.' + parts[1].slice(0, 2);
    }
    return cleaned;
  };

  const handleAmountChange = (text: string) => {
    const formatted = formatAmount(text);
    setAmount(formatted);
    if (amountError) setAmountError('');
  };

  const handleAssetSelect = useCallback((asset: Asset) => {
    setSelectedAsset(asset);
    setShowAssetSelector(false);
  }, []);

  const validateForm = (): boolean => {
    if (!selectedAsset) return false;
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      setAmountError('Please enter a valid amount');
      return false;
    }
    if (numAmount < 1) {
      setAmountError('Minimum amount is $1.00');
      return false;
    }
    return true;
  };

  const handleSubmit = () => {
    Keyboard.dismiss();
    if (validateForm() && selectedAsset) {
      onSubmit(selectedAsset, amount);
    }
  };

  const isButtonDisabled = !selectedAsset || !amount;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
            <Text style={styles.headerTitle}>Physical Deposit</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, styles.stepDotCompleted]} />
            <View style={[styles.stepLine, styles.stepLineCompleted]} />
            <View style={[styles.stepDot, styles.stepDotActive]} />
            <View style={styles.stepLine} />
            <View style={styles.stepDot} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Select Asset */}
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

            {/* Enter Amount */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Enter Amount</Text>
              <View
                style={[
                  styles.amountContainer,
                  isAmountFocused && styles.amountContainerFocused,
                  amountError ? styles.amountContainerError : null,
                ]}
              >
                <View
                  style={[
                    styles.currencyBadge,
                    isAmountFocused && styles.currencyBadgeFocused,
                  ]}
                >
                  <Text
                    style={[
                      styles.currencyPrefix,
                      isAmountFocused && styles.currencyPrefixFocused,
                    ]}
                  >
                    $
                  </Text>
                </View>
                <TextInput
                  ref={amountInputRef}
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={handleAmountChange}
                  placeholder="0.00"
                  placeholderTextColor={colors.textPlaceholder}
                  keyboardType="decimal-pad"
                  returnKeyType="done"
                  onFocus={() => setIsAmountFocused(true)}
                  onBlur={() => setIsAmountFocused(false)}
                  onSubmitEditing={handleSubmit}
                  accessibilityLabel="Amount input"
                />
              </View>
              {amountError ? (
                <View style={styles.errorRow}>
                  <Info size={14} color={colors.error} strokeWidth={2} />
                  <Text style={styles.errorText}>{amountError}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Bottom Buttons */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={[
                styles.nextButton,
                isButtonDisabled && styles.nextButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={isButtonDisabled}
              activeOpacity={0.8}
              accessibilityLabel="Continue to transaction summary"
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

            <TouchableOpacity
              style={styles.goBackButton}
              onPress={onBack}
              activeOpacity={0.8}
              accessibilityLabel="Go back to previous step"
            >
              <Text style={styles.goBackButtonText}>Go Back</Text>
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
  stepDotCompleted: {
    backgroundColor: colors.success,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.borderLight,
  },
  stepLineCompleted: {
    backgroundColor: colors.success,
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
  inputLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase',
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

  // Amount Input
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.lg,
    height: layout.inputHeightLarge,
    paddingHorizontal: spacing.base,
    ...shadows.xs,
  },
  amountContainerFocused: {
    borderColor: colors.borderActive,
    borderWidth: 2,
    backgroundColor: colors.backgroundElevated,
  },
  amountContainerError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  currencyBadge: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  currencyBadgeFocused: {
    backgroundColor: colors.primaryLight,
  },
  currencyPrefix: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textSecondary,
  },
  currencyPrefixFocused: {
    color: colors.primary,
  },
  amountInput: {
    flex: 1,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
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
    gap: spacing.md,
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
  goBackButton: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  goBackButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },

  // Icon
  iconText: {
    fontWeight: typography.fontWeight.bold,
  },
});