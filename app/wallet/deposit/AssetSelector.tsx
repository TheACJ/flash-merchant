import { Check } from 'lucide-react-native';
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
import { AssetIcon } from './SelectAssetAmount';
import { Asset } from './types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = 680;

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
                outputRange: [0, 0.25],
              }),
            },
          ]}
        >
          <Pressable style={styles.backdropPressable} onPress={onClose} />
        </Animated.View>

        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Assets</Text>

          {/* Asset List */}
          <ScrollView
            style={styles.assetList}
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
                  activeOpacity={0.7}
                  accessibilityLabel={`Select ${asset.name}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <View style={styles.assetLeft}>
                    <AssetIcon asset={asset} size={40} />
                    <View style={styles.assetInfo}>
                      <Text style={styles.assetSymbol}>{asset.symbol}</Text>
                      <Text style={styles.assetName}>{asset.name}</Text>
                    </View>
                  </View>
                  {isSelected && (
                    <View style={styles.checkContainer}>
                      <Check size={20} color="#0F6EC0" strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Cancel Button */}
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
    backgroundColor: '#000000',
  },
  backdropPressable: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: '#F4F6F5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: MODAL_HEIGHT,
    paddingBottom: 30,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#D2D6E1',
    borderRadius: 2,
  },
  title: {
    fontSize: 25,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 20,
  },
  assetList: {
    paddingHorizontal: 52,
    maxHeight: 400,
  },
  assetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  assetItemSelected: {
    backgroundColor: '#E8F4FD',
    borderWidth: 1,
    borderColor: '#0F6EC0',
  },
  assetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  assetInfo: {
    gap: 3,
  },
  assetSymbol: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  assetName: {
    fontSize: 14,
    color: '#323333',
  },
  checkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 110, 192, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelContainer: {
    paddingHorizontal: 52,
    paddingTop: 20,
  },
  cancelButton: {
    backgroundColor: 'rgba(15, 110, 192, 0.1)',
    borderRadius: 15,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
});