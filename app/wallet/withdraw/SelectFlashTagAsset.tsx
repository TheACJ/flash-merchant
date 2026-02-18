import { borderRadius, colors, layout, spacing, typography } from '@/constants/theme';
import { useAssetCache } from '@/hooks';
import { assetInfoOrchestrator } from '@/services/AssetInfoOrchestrator';
import { ArrowLeft, AtSign, ChevronDown } from 'lucide-react-native';
import React, { useMemo, useRef, useState } from 'react';
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
import AssetSelector from '../deposit/AssetSelector';
import { AssetIcon } from '../deposit/SelectAssetAmount';
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
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(initialAsset);
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const [flashTagError, setFlashTagError] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Get asset IDs from orchestrator (fetched dynamically from API)
  const assetIds = assetInfoOrchestrator.getAssetIds();
  
  // Fetch assets from API using the dynamic asset IDs
  // No hardcoded fallback - if no asset IDs, pass empty array
  const { assets: apiAssets } = useAssetCache(assetIds);

  // Convert API assets to local format - no hardcoded fallback
  const assets = useMemo(() => {
    if (apiAssets.length > 0) {
      return apiAssets.map(apiAsset => convertAPIAsset({
        id: apiAsset.id,
        name: apiAsset.name,
        symbol: apiAsset.symbol,
        icon_url: apiAsset.icon_url || '',
        chains: [],
        price: apiAsset.price,
        price24hChange: apiAsset.price24hChange,
      }));
    }
    // Return empty array if no assets - no hardcoded fallback
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
              <ArrowLeft size={24} color={colors.textPrimary} strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Physical withdrawal</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Flash Tag Input */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Enter customer's flash tag</Text>
              <View
                style={[
                  styles.inputContainer,
                  isFocused && styles.inputContainerFocused,
                  flashTagError ? styles.inputContainerError : null,
                ]}
              >
                <View style={styles.inputPrefix}>
                  <AtSign size={20} color={colors.textTertiary} strokeWidth={2} />
                </View>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={flashTag.replace('@', '')}
                  onChangeText={handleFlashTagChange}
                  placeholder="username"
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  accessibilityLabel="Customer flash tag input"
                />
              </View>
              {flashTagError ? (
                <Text style={styles.errorText}>{flashTagError}</Text>
              ) : null}
            </View>

            {/* Asset Selector */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Select asset</Text>
              <TouchableOpacity
                style={styles.selectorContainer}
                onPress={() => setShowAssetSelector(true)}
                activeOpacity={0.7}
                accessibilityLabel="Select cryptocurrency asset"
              >
                {selectedAsset ? (
                  <View style={styles.selectedAsset}>
                    <AssetIcon asset={selectedAsset} size={32} />
                    <View style={styles.assetInfo}>
                      <Text style={styles.assetSymbol}>{selectedAsset.symbol}</Text>
                      <Text style={styles.assetName}>{selectedAsset.name}</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.placeholderText}>Choose an asset</Text>
                )}
                <ChevronDown size={24} color={colors.textTertiary} strokeWidth={2} />
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
                Next
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* Asset Selector Modal */}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing['3xl'],
    paddingTop: spacing['3xl'],
    gap: spacing.lg,
  },
  inputSection: {
    gap: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.normal,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    height: layout.inputHeight,
    paddingHorizontal: spacing.md,
  },
  inputContainerFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  inputPrefix: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    height: '100%',
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    marginTop: -spacing.xs,
  },
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    height: layout.inputHeight,
    paddingHorizontal: spacing.md,
  },
  selectedAsset: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  assetInfo: {
    gap: 2,
  },
  assetSymbol: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  assetName: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
  },
  placeholderText: {
    fontSize: typography.fontSize.md,
    color: colors.textTertiary,
  },
  bottomContainer: {
    paddingHorizontal: spacing['3xl'],
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: colors.primaryDisabled,
  },
  nextButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textLight,
  },
  nextButtonTextDisabled: {
    color: colors.textLight,
  },
});
