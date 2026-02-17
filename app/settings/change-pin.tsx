// settings/change-pin.tsx
import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Delete,
  Lock,
  ShieldCheck,
} from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PIN_LENGTH = 6;

export default function ChangePinScreen() {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const currentPin = isConfirming ? confirmPin : pin;

  const shakeBoxes = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true, easing: Easing.linear }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true, easing: Easing.linear }),
    ]).start();
  };

  const handleNumberPress = (num: string) => {
    if (currentPin.length >= PIN_LENGTH) return;

    const newPin = currentPin + num;

    if (isConfirming) {
      setConfirmPin(newPin);
      if (newPin.length === PIN_LENGTH) {
        setTimeout(() => {
          if (newPin === pin) {
            router.back();
          } else {
            shakeBoxes();
            setConfirmPin('');
            setIsConfirming(false);
            setPin('');
          }
        }, 300);
      }
    } else {
      setPin(newPin);
      if (newPin.length === PIN_LENGTH) {
        setTimeout(() => {
          Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
          ]).start();
          setIsConfirming(true);
        }, 300);
      }
    }
  };

  const handleDelete = () => {
    if (isConfirming) {
      setConfirmPin(confirmPin.slice(0, -1));
    } else {
      setPin(pin.slice(0, -1));
    }
  };

  const numpadKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['empty', '0', 'delete'],
  ];

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.headerTitle}>Change PIN</Text>
        <View style={{ width: layout.minTouchTarget }} />
      </View>

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.iconContainer}>
          {isConfirming ? (
            <ShieldCheck
              size={layout.iconSize.xl}
              color={colors.primary}
              strokeWidth={1.8}
            />
          ) : (
            <Lock
              size={layout.iconSize.xl}
              color={colors.primary}
              strokeWidth={1.8}
            />
          )}
        </View>

        <Text style={styles.instructionText}>
          {isConfirming
            ? 'Confirm your new PIN'
            : 'Enter your new 6-digit PIN'}
        </Text>

        {/* PIN Dots */}
        <Animated.View
          style={[
            styles.pinContainer,
            { transform: [{ translateX: shakeAnim }] },
          ]}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.pinDot,
                index === currentPin.length && styles.pinDotActive,
                index < currentPin.length && styles.pinDotFilled,
              ]}
            >
              {index < currentPin.length && (
                <View style={styles.pinDotInner} />
              )}
            </View>
          ))}
        </Animated.View>

        <Text style={styles.hintText}>
          {PIN_LENGTH - currentPin.length} digits remaining
        </Text>
      </Animated.View>

      {/* Numpad */}
      <View style={styles.numpad}>
        {numpadKeys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numpadRow}>
            {row.map((key) => {
              if (key === 'empty') {
                return <View key={key} style={styles.numpadKeyEmpty} />;
              }
              if (key === 'delete') {
                return (
                  <TouchableOpacity
                    key={key}
                    style={styles.numpadKeySpecial}
                    onPress={handleDelete}
                    activeOpacity={0.6}
                    disabled={currentPin.length === 0}
                  >
                    <Delete
                      size={layout.iconSize.md}
                      color={
                        currentPin.length === 0
                          ? colors.textMuted
                          : colors.textPrimary
                      }
                      strokeWidth={1.8}
                    />
                  </TouchableOpacity>
                );
              }
              return (
                <TouchableOpacity
                  key={key}
                  style={styles.numpadKey}
                  onPress={() => handleNumberPress(key)}
                  activeOpacity={0.6}
                  disabled={currentPin.length >= PIN_LENGTH}
                >
                  <Text style={styles.numpadKeyText}>{key}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  backButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  instructionText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    marginBottom: spacing['2xl'],
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.base,
    marginBottom: spacing.base,
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: borderRadius.full,
    backgroundColor: colors.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDotActive: {
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: colors.primary,
  },
  pinDotInner: {
    width: 8,
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.textWhite,
  },
  hintText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textMuted,
  },
  numpad: {
    alignItems: 'center',
    gap: spacing.md,
    paddingBottom: spacing['2xl'],
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  numpadRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  numpadKey: {
    width: 80,
    height: 56,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xs,
  },
  numpadKeySpecial: {
    width: 80,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numpadKeyEmpty: {
    width: 80,
    height: 56,
  },
  numpadKeyText: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
  },
});