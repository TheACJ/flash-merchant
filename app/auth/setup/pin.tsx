// auth/setup/pin.tsx
import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import {
  Delete,
  Fingerprint,
  Lock,
  ShieldCheck
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const PIN_LENGTH = 6;

interface PinDigitBoxProps {
  filled: boolean;
  active: boolean;
}

const PinDigitBox: React.FC<PinDigitBoxProps> = ({ filled, active }) => (
  <View style={[styles.pinDot, active && styles.pinDotActive, filled && styles.pinDotFilled]}>
    {filled && <View style={styles.pinDotInner} />}
  </View>
);

export default function CreatePin() {
  const router = useRouter();
  const [pin, setPin] = useState<string[]>([]);
  const [confirmPin, setConfirmPin] = useState<string[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);
    } catch {
      setBiometricAvailable(false);
    }
  };

  const currentPin = isConfirming ? confirmPin : pin;
  const setCurrentPin = isConfirming ? setConfirmPin : setPin;

  const shakeBoxes = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 12,
        duration: 50,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnim, {
        toValue: -12,
        duration: 50,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnim, {
        toValue: 12,
        duration: 50,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnim, {
        toValue: -12,
        duration: 50,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
    ]).start();
  };

  const transitionToConfirm = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleDigitPress = (digit: string) => {
    if (currentPin.length >= PIN_LENGTH) return;
    const newPin = [...currentPin, digit];
    setCurrentPin(newPin);

    if (newPin.length === PIN_LENGTH) {
      if (!isConfirming) {
        setTimeout(() => {
          transitionToConfirm();
          setIsConfirming(true);
        }, 300);
      } else {
        setTimeout(() => {
          if (newPin.join('') === pin.join('')) {
            handlePinSuccess();
          } else {
            shakeBoxes();
            Alert.alert("PINs don't match", 'Please try again', [
              {
                text: 'OK',
                onPress: () => {
                  setConfirmPin([]);
                  setIsConfirming(false);
                  setPin([]);
                },
              },
            ]);
          }
        }, 300);
      }
    }
  };

  const handleDelete = () => {
    if (currentPin.length === 0) return;
    setCurrentPin(currentPin.slice(0, -1));
  };

  const handlePinSuccess = async () => {
    if (biometricAvailable) {
      Alert.alert(
        'Enable Biometrics',
        'Would you like to enable biometric authentication for quick access?',
        [
          {
            text: 'Not now',
            style: 'cancel',
            onPress: () => navigateToKYC(),
          },
          {
            text: 'Enable',
            onPress: async () => {
              try {
                const result = await LocalAuthentication.authenticateAsync({
                  promptMessage: 'Authenticate to enable biometrics',
                  cancelLabel: 'Cancel',
                  disableDeviceFallback: false,
                });
                if (result.success) {
                  Alert.alert(
                    'Biometrics Enabled',
                    'You can now use biometrics to authenticate.',
                    [{ text: 'OK', onPress: () => navigateToKYC() }]
                  );
                } else {
                  navigateToKYC();
                }
              } catch {
                navigateToKYC();
              }
            },
          },
        ]
      );
    } else {
      navigateToKYC();
    }
  };

  const navigateToKYC = () => {
    router.push('/auth/setup/kyc' as const);
  };

  const handleSkip = () => {
    router.push('/auth/setup/kyc' as const);
  };

  const numpadKeys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['biometric', '0', 'delete'],
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View style={styles.container}>
        {/* Header */}
        <Animated.View style={[styles.headerSection, { opacity: fadeAnim }]}>
          <View style={styles.headerIconContainer}>
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
          <Text style={styles.title}>
            {isConfirming ? 'Confirm PIN' : 'Create PIN'}
          </Text>
          <Text style={styles.subtitle}>
            {isConfirming
              ? 'Re-enter your PIN to confirm'
              : 'Set a 6-digit PIN to secure your merchant account'}
          </Text>
        </Animated.View>

        {/* Pin Dots */}
        <Animated.View
          style={[
            styles.pinContainer,
            { transform: [{ translateX: shakeAnim }] },
          ]}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, index) => (
            <PinDigitBox
              key={index}
              active={index === currentPin.length}
              filled={index < currentPin.length}
            />
          ))}
        </Animated.View>

        {/* Biometric Hint */}
        {biometricAvailable && !isConfirming && (
          <View style={styles.biometricHint}>
            <Fingerprint
              size={layout.iconSize.sm}
              color={colors.primary}
              strokeWidth={1.8}
            />
            <Text style={styles.biometricHintText}>
              Biometric login will be available after PIN setup
            </Text>
          </View>
        )}

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Numpad */}
        <View style={styles.numpadSection}>
          {numpadKeys.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.numpadRow}>
              {row.map((key) => {
                if (key === 'biometric') {
                  return (
                    <View key={key} style={styles.numpadKeyEmpty} />
                  );
                }

                if (key === 'delete') {
                  return (
                    <TouchableOpacity
                      key={key}
                      style={styles.numpadKeySpecial}
                      onPress={handleDelete}
                      activeOpacity={0.6}
                    >
                      <Delete
                        size={layout.iconSize.md}
                        color={colors.textPrimary}
                        strokeWidth={1.8}
                      />
                    </TouchableOpacity>
                  );
                }

                return (
                  <TouchableOpacity
                    key={key}
                    style={styles.numpadKey}
                    onPress={() => handleDigitPress(key)}
                    activeOpacity={0.6}
                  >
                    <Text style={styles.numpadKeyText}>{key}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Bottom */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.8}
          >
            <Text style={styles.skipButtonText}>Skip for now</Text>
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
    paddingHorizontal: layout.screenPaddingHorizontal,
  },

  // Header
  headerSection: {
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing['3xl'],
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    textAlign: 'center',
    color: colors.textTertiary,
    paddingHorizontal: spacing.lg,
  },

  // PIN Dots
  pinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.base,
    marginTop: spacing['2xl'],
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

  // Biometric
  biometricHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    paddingHorizontal: spacing['2xl'],
  },
  biometricHintText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textMuted,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    flex: 1,
  },

  // Numpad
  numpadSection: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  numpadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  numpadKey: {
    width: 80,
    height: 56,
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.xs,
  },
  numpadKeySpecial: {
    width: 80,
    height: 56,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
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

  // Bottom
  bottomSection: {
    paddingBottom: spacing['2xl'],
  },
  skipButton: {
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textTertiary,
  },
});