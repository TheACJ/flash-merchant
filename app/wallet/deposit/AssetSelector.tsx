import { AssetIcon } from '@/components/AssetIcon';
import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import { Check, X } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Asset } from './types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.7;

interface AssetSelectorProps {
  visible: boolean;
  assets: Asset[];
  selectedAsset: Asset | null;
  onSelect: (asset: Asset) => void;
  onClose: () => void;
}

export default function AssetSelector({
  visible,
  assets,
  selectedAsset,
  onSelect,
  onClose,
}: AssetSelectorProps) {
  const slideAnim = useRef(new Animated.Value(MODAL_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: MODAL_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, backdropAnim]);

  const handleAssetPress = (asset: Asset) => {
    onSelect(asset);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalContainer}>
        <Animated.View
          style={[
            styles.backdrop,
            {
              opacity: backdropAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.5],
              }),
            },
          ]}
        >
          <Pressable style={styles.backdropPressable} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.bottomSheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.title}>Select Asset</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
              accessibilityLabel="Close"
            >
              <X
                size={layout.iconSize.sm}
                color={colors.textTertiary}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>

          {/* Asset List */}
          <ScrollView
            style={styles.assetList}
            contentContainerStyle={styles.assetListContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {assets.map((asset) => {
              const isSelected = selectedAsset?.id === asset.id;
              return (
                <TouchableOpacity
                  key={asset.id}
                  style={[
                    styles.assetItem,
                    isSelected && styles.assetItemSelected,
                  ]}
                  onPress={() => handleAssetPress(asset)}
                  activeOpacity={0.6}
                  accessibilityLabel={`Select ${asset.name}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <View style={styles.assetLeft}>
                    <AssetIcon asset={asset} size={44} />
                    <View style={styles.assetInfo}>
                      <Text style={styles.assetSymbol}>{asset.symbol}</Text>
                      <Text style={styles.assetName}>{asset.name}</Text>
                    </View>
                  </View>
                  {isSelected && (
                    <View style={styles.checkContainer}>
                      <Check
                        size={16}
                        color={colors.textWhite}
                        strokeWidth={3}
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Cancel */}
          <View style={styles.cancelContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.8}
              accessibilityLabel="Cancel asset selection"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  backdropPressable: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: colors.backgroundElevated,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    maxHeight: MODAL_HEIGHT,
    paddingBottom: spacing['3xl'],
    ...shadows.lg,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
  },

  // Header
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Asset List
  assetList: {
    maxHeight: MODAL_HEIGHT * 0.6,
  },
  assetListContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.base,
    paddingBottom: spacing.sm,
  },
  assetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    marginBottom: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  assetItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  assetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  assetInfo: {
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
  checkContainer: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Cancel
  cancelContainer: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.base,
  },
  cancelButton: {
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
});