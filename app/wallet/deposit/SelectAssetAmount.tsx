import { ArrowLeft, ChevronDown } from 'lucide-react-native';
import React, { useCallback, useRef, useState } from 'react';
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
import { borderRadius, colors, layout, typography } from '@/constants/theme';
import AssetSelector from './AssetSelector';
import { Asset, ASSETS } from './types';

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
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(initialAsset);
  const [amount, setAmount] = useState(initialAmount);
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const [amountError, setAmountError] = useState('');
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const amountInputRef = useRef<TextInput>(null);

  const formatAmount = (value: string): string => {
    // Remove non-numeric characters except decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit decimal places to 2
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
    if (!selectedAsset) {
      return false;
    }
    
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
              <ArrowLeft size={24} color={colors.textPrimary} strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Physical deposit</Text>
            <View style={styles.headerSpacer} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            {/* Select Asset */}
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
                <ChevronDown size={24} color={colors.textPlaceholder} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Enter Amount */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Select amount</Text>
              <View
                style={[
                  styles.inputContainer,
                  isAmountFocused && styles.inputContainerFocused,
                  amountError ? styles.inputContainerError : null,
                ]}
              >
                <Text style={styles.currencyPrefix}>$</Text>
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
                <Text style={styles.errorText}>{amountError}</Text>
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
                Next
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.goBackButton}
              onPress={onBack}
              activeOpacity={0.8}
              accessibilityLabel="Go back to previous step"
            >
              <Text style={styles.goBackButtonText}>Go back</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>

      {/* Asset Selector Modal */}
      <AssetSelector
        visible={showAssetSelector}
        assets={ASSETS}
        selectedAsset={selectedAsset}
        onSelect={handleAssetSelect}
        onClose={() => setShowAssetSelector(false)}
      />
    </SafeAreaView>
  );
}

// Asset Icon Component
interface AssetIconProps {
  asset: Asset;
  size?: number;
}

function AssetIcon({ asset, size = 40 }: AssetIconProps) {
  const iconStyles = {
    width: size,
    height: size,
    borderRadius: size / 8,
    backgroundColor: asset.iconBgColor,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  };

  const getIconContent = () => {
    switch (asset.iconType) {
      case 'bitcoin':
        return <Text style={[styles.iconText, { color: colors.textWhite }]}>₿</Text>;
      case 'ethereum':
        return <Text style={[styles.iconText, { color: colors.textTertiary }]}>Ξ</Text>;
      case 'solana':
        return <Text style={[styles.iconText, { color: '#14F195' }]}>◎</Text>;
      case 'polygon':
        return <Text style={[styles.iconText, { color: '#8247E5' }]}>⬡</Text>;
      case 'zcash':
        return <Text style={[styles.iconText, { color: colors.background }]}>Z</Text>;
      default:
        return <Text style={styles.iconText}>{asset.symbol[0]}</Text>;
    }
  };

  return <View style={iconStyles}>{getIconContent()}</View>;
}

export { AssetIcon };

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
    borderRadius: 25,
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
    paddingHorizontal: 52,
    paddingTop: 50,
    gap: 25,
  },
  inputSection: {
    gap: 15,
  },
  inputLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.normal,
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
    paddingHorizontal: 16,
  },
  selectedAsset: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    color: colors.textPlaceholder,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundInput,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    height: layout.inputHeight,
    paddingHorizontal: 16,
  },
  inputContainerFocused: {
    borderColor: colors.borderActive,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: colors.error,
  },
  currencyPrefix: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
    height: '100%',
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    marginTop: -5,
  },
  bottomContainer: {
    paddingHorizontal: 52,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    gap: 20,
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: colors.borderLight,
  },
  nextButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textLight,
  },
  nextButtonTextDisabled: {
    color: colors.textPlaceholder,
  },
  goBackButton: {
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goBackButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
  iconText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
  },
});