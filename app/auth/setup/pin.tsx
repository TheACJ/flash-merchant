import * as LocalAuthentication from "expo-local-authentication";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { Path, Svg } from "react-native-svg";

const PIN_LENGTH = 6;

// --- Fingerprint Icon ---
const FingerprintIcon = () => (
  <Svg width={40} height={40} viewBox="0 0 40 40" fill="none">
    <Path
      d="M20 3.33334C10.795 3.33334 3.33331 10.795 3.33331 20C3.33331 29.205 10.795 36.6667 20 36.6667C29.205 36.6667 36.6667 29.205 36.6667 20C36.6667 10.795 29.205 3.33334 20 3.33334Z"
      stroke="#0F6EC0"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.75 20C13.75 16.5483 16.5483 13.75 20 13.75"
      stroke="#0F6EC0"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20 26.25C23.4518 26.25 26.25 23.4518 26.25 20"
      stroke="#0F6EC0"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10 20C10 14.4772 14.4772 10 20 10C25.5228 10 30 14.4772 30 20C30 25.5228 25.5228 30 20 30"
      stroke="#0F6EC0"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M20 16.6667C21.8409 16.6667 23.3333 18.1591 23.3333 20C23.3333 21.8409 21.8409 23.3333 20 23.3333C18.1591 23.3333 16.6667 21.8409 16.6667 20C16.6667 18.1591 18.1591 16.6667 20 16.6667Z"
      stroke="#0F6EC0"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface PinDigitBoxProps {
  digit: string | null;
  isActive: boolean;
  isFilled: boolean;
}

const PinDigitBox: React.FC<PinDigitBoxProps> = ({
  digit,
  isActive,
  isFilled,
}) => (
  <View
    style={[
      styles.pinBox,
      isActive && styles.pinBoxActive,
      isFilled && styles.pinBoxFilled,
    ]}
  >
    {digit !== null && (
      <Text style={styles.pinDigit}>{digit}</Text>
    )}
  </View>
);

export default function CreatePin() {
  const router = useRouter();
  const [pin, setPin] = useState<string[]>([]);
  const [confirmPin, setConfirmPin] = useState<string[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

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
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnim, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
        easing: Easing.linear,
      }),
      Animated.timing(shakeAnim, {
        toValue: -10,
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

  const handleDigitPress = (digit: string) => {
    if (currentPin.length >= PIN_LENGTH) return;
    const newPin = [...currentPin, digit];
    setCurrentPin(newPin);

    // Auto-submit when all digits entered
    if (newPin.length === PIN_LENGTH) {
      if (!isConfirming) {
        setTimeout(() => {
          setIsConfirming(true);
        }, 300);
      } else {
        // Verify pins match
        setTimeout(() => {
          if (newPin.join("") === pin.join("")) {
            handlePinSuccess();
          } else {
            shakeBoxes();
            Alert.alert("Pins don't match", "Please try again", [
              {
                text: "OK",
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
        "Enable Biometrics",
        "Would you like to enable biometric authentication for quick access?",
        [
          {
            text: "Not now",
            style: "cancel",
            onPress: () => navigateToKYC(),
          },
          {
            text: "Enable",
            onPress: async () => {
              try {
                const result = await LocalAuthentication.authenticateAsync({
                  promptMessage: "Authenticate to enable biometrics",
                  cancelLabel: "Cancel",
                  disableDeviceFallback: false,
                });
                if (result.success) {
                  setBiometricEnabled(true);
                  Alert.alert(
                    "Biometrics Enabled",
                    "You can now use biometrics to authenticate.",
                    [{ text: "OK", onPress: () => navigateToKYC() }]
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

  const handleContinue = () => {
    if (currentPin.length === PIN_LENGTH) {
      if (!isConfirming) {
        setIsConfirming(true);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>
            {isConfirming ? "Confirm pin" : "Create pin"}
          </Text>
          <Text style={styles.subtitle}>
            {isConfirming
              ? "Re-enter your pin to confirm"
              : "Enter a 6 digit merchant pin, keep it safe"}
          </Text>
        </View>

        {/* Pin Boxes */}
        <Animated.View
          style={[
            styles.pinContainer,
            { transform: [{ translateX: shakeAnim }] },
          ]}
        >
          {Array.from({ length: PIN_LENGTH }).map((_, index) => (
            <PinDigitBox
              key={index}
              digit={currentPin[index] || null}
              isActive={index === currentPin.length}
              isFilled={index < currentPin.length}
            />
          ))}
        </Animated.View>

        {/* Biometric option hint */}
        {biometricAvailable && !isConfirming && (
          <View style={styles.biometricHint}>
            <FingerprintIcon />
            <Text style={styles.biometricHintText}>
              Biometric authentication will be available after PIN setup
            </Text>
          </View>
        )}

        {/* Custom Numpad */}
        <View style={styles.numpadSection}>
          {[
            ["1", "2", "3"],
            ["4", "5", "6"],
            ["7", "8", "9"],
            ["#", "0", "X"],
          ].map((row, rowIndex) => (
            <View key={rowIndex} style={styles.numpadRow}>
              {row.map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.numpadKey,
                    (key === "#" || key === "X") && styles.numpadKeySpecial,
                  ]}
                  onPress={() => {
                    if (key === "X") {
                      handleDelete();
                    } else if (key === "#") {
                      // No action for #
                    } else {
                      handleDigitPress(key);
                    }
                  }}
                  activeOpacity={0.7}
                  disabled={key === "#"}
                >
                  <Text
                    style={[
                      styles.numpadKeyText,
                      key === "X" && styles.numpadKeyTextDelete,
                    ]}
                  >
                    {key === "X" ? "⌫" : key}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {/* Bottom Buttons */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              currentPin.length < PIN_LENGTH && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={currentPin.length < PIN_LENGTH}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.8}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
  },
  headerSection: {
    alignItems: "center",
    gap: 15,
    marginTop: 40,
  },
  title: {
    fontFamily: "System",
    fontWeight: "600",
    fontSize: 25,
    lineHeight: 25,
    textAlign: "center",
    color: "#000000",
  },
  subtitle: {
    fontFamily: "System",
    fontWeight: "400",
    fontSize: 18,
    lineHeight: 25,
    textAlign: "center",
    color: "#323333",
    paddingHorizontal: 10,
  },
  pinContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 35,
  },
  pinBox: {
    width: 55,
    height: 55,
    backgroundColor: "#F4F6F5",
    borderRadius: 8.33,
    alignItems: "center",
    justifyContent: "center",
  },
  pinBoxActive: {
    borderWidth: 1,
    borderColor: "#0F6EC0",
  },
  pinBoxFilled: {
    backgroundColor: "#F4F6F5",
  },
  pinDigit: {
    fontFamily: "System",
    fontWeight: "500",
    fontSize: 18,
    lineHeight: 21,
    textAlign: "center",
    color: "#000000",
  },
  biometricHint: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  biometricHintText: {
    fontFamily: "System",
    fontWeight: "400",
    fontSize: 13,
    lineHeight: 18,
    color: "#657084",
    flex: 1,
  },
  numpadSection: {
    marginTop: "auto",
    alignItems: "center",
    gap: 18,
    marginBottom: 20,
  },
  numpadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  numpadKey: {
    width: 90,
    height: 52,
    backgroundColor: "rgba(15, 114, 199, 0.07)",
    borderWidth: 1,
    borderColor: "#D2D6E1",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  numpadKeySpecial: {
    backgroundColor: "rgba(15, 114, 199, 0.07)",
  },
  numpadKeyText: {
    fontFamily: "System",
    fontWeight: "500",
    fontSize: 18,
    lineHeight: 18,
    textAlign: "center",
    color: "#000000",
  },
  numpadKeyTextDelete: {
    fontSize: 22,
  },
  bottomSection: {
    gap: 20,
    marginBottom: 30,
  },
  continueButton: {
    backgroundColor: "#0F6EC0",
    borderRadius: 15,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontFamily: "System",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 16,
    textAlign: "center",
    color: "#F5F5F5",
  },
  skipButton: {
    backgroundColor: "rgba(15, 114, 199, 0.1)",
    borderRadius: 15,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonText: {
    fontFamily: "System",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 16,
    textAlign: "center",
    color: "#000000",
  },
});