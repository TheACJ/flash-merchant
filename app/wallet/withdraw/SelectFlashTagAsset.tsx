import { ArrowLeft, AtSign, ChevronDown } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
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
import { Asset, ASSETS } from './types';

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
              <ArrowLeft size={24} color="#000000" strokeWidth={2} />
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
                  <AtSign size={20} color="#657084" strokeWidth={2} />
                </View>
                <TextInput
                  ref={inputRef}
                  style={styles.input}
                  value={flashTag.replace('@', '')}
                  onChangeText={handleFlashTagChange}
                  placeholder="username"
                  placeholderTextColor="#AFAFB0"
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
                <ChevronDown size={24} color="#AFAFB0" strokeWidth={2} />
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
        assets={ASSETS}
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
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#F4F6F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: '600',
    color: '#000000',
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
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F6F5',
    borderWidth: 1,
    borderColor: '#D2D6E1',
    borderRadius: 15,
    height: 60,
    paddingHorizontal: 16,
  },
  inputContainerFocused: {
    borderColor: '#0F6EC0',
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: '#C31D1E',
  },
  inputPrefix: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#000000',
    height: '100%',
  },
  errorText: {
    fontSize: 14,
    color: '#C31D1E',
    marginTop: -5,
  },
  selectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F4F6F5',
    borderWidth: 1,
    borderColor: '#D2D6E1',
    borderRadius: 15,
    height: 60,
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
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  assetName: {
    fontSize: 12,
    color: '#657084',
  },
  placeholderText: {
    fontSize: 16,
    color: '#AFAFB0',
  },
  bottomContainer: {
    paddingHorizontal: 52,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  nextButton: {
    backgroundColor: '#0F6EC0',
    borderRadius: 15,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: 'rgba(15, 114, 199, 0.2)',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F5F5F5',
  },
  nextButtonTextDisabled: {
    color: '#F5F5F5',
  },
});