import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Path, Svg } from "react-native-svg";

const BackArrowIcon = () => (
  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 6L9 12L15 18"
      stroke="#000000"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const MAX_DIGITS = 11;

export default function DriversLicenceVerification() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>([]);

  const handleDigitPress = (digit: string) => {
    if (digits.length >= MAX_DIGITS) return;
    setDigits([...digits, digit]);
  };

  const handleDelete = () => {
    if (digits.length === 0) return;
    setDigits(digits.slice(0, -1));
  };

  const handleNext = () => {
    if (digits.length === MAX_DIGITS) {
      // Navigate to Verifying screen with params
      router.push({
        pathname: './verifying',
        params: { type: "Driver's Licence", number: displayValue },
      });
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const displayValue = digits.join("");

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
            activeOpacity={0.7}
          >
            <BackArrowIcon />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Driver's licence</Text>
          <View style={{ width: 50 }} />
        </View>

        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>
            Enter your driver's licence number
          </Text>
          <View style={styles.inputContainer}>
            <Text
              style={[
                styles.inputText,
                !displayValue && styles.inputPlaceholder,
              ]}
            >
              {displayValue || "Enter licence number"}
            </Text>
          </View>
          <Text style={styles.digitHint}>Must be 11 digit long</Text>
        </View>

        {/* Next Button */}
        <View style={styles.nextButtonSection}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              digits.length < MAX_DIGITS && styles.nextButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={digits.length < MAX_DIGITS}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>

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
                  style={styles.numpadKey}
                  onPress={() => {
                    if (key === "X") handleDelete();
                    else if (key !== "#") handleDigitPress(key);
                  }}
                  activeOpacity={0.7}
                  disabled={key === "#"}
                >
                  <Text style={styles.numpadKeyText}>
                    {key === "X" ? "⌫" : key}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    gap: 20,
  },
  backButton: {
    width: 50,
    height: 50,
    backgroundColor: "#F4F6F5",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontFamily: "System",
    fontWeight: "600",
    fontSize: 25,
    lineHeight: 25,
    textAlign: "center",
    color: "#000000",
  },
  inputSection: {
    marginTop: 40,
    gap: 15,
  },
  inputLabel: {
    fontFamily: "System",
    fontWeight: "500",
    fontSize: 16,
    lineHeight: 22,
    color: "#000000",
  },
  inputContainer: {
    height: 60,
    backgroundColor: "#F4F6F5",
    borderWidth: 1,
    borderColor: "#D2D6E1",
    borderRadius: 15,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  inputText: {
    fontFamily: "System",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 22,
    color: "#000000",
  },
  inputPlaceholder: {
    color: "#657084",
  },
  digitHint: {
    fontFamily: "System",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 14,
    color: "#FF9934",
  },
  nextButtonSection: {
    marginTop: 40,
  },
  nextButton: {
    backgroundColor: "#0F6EC0",
    borderRadius: 15,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontFamily: "System",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 16,
    textAlign: "center",
    color: "#F5F5F5",
  },
  numpadSection: {
    marginTop: "auto",
    alignItems: "center",
    gap: 18,
    marginBottom: 30,
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
  numpadKeyText: {
    fontFamily: "System",
    fontWeight: "500",
    fontSize: 18,
    lineHeight: 18,
    textAlign: "center",
    color: "#000000",
  },
});