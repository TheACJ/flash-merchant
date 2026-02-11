import { useRouter } from "expo-router";
import React from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Path, Svg } from "react-native-svg";

// --- Chevron Right Icon ---
const ChevronRightIcon = () => (
  <Svg width={12} height={20} viewBox="0 0 12 20" fill="none">
    <Path
      d="M2 18L10 10L2 2"
      stroke="#000000"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function KYCVerification() {
  const router = useRouter();

  const handleNIN = () => {
    router.push('/auth/setup/kyc/nin');
  };

  const handleBVN = () => {
    router.push('/auth/setup/kyc/bvn');
  };

  const handleDriversLicence = () => {
    router.push('/auth/setup/kyc/drivers_licence');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerSection}>
          <Text style={styles.title}>KYC verification</Text>
          <Text style={styles.subtitle}>Choose your verifying method</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsSection}>
          <TouchableOpacity
            style={styles.optionContainer}
            onPress={handleNIN}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionTextGroup}>
                <Text style={styles.optionTitle}>NIN</Text>
                <Text style={styles.optionDescription}>
                  National identification number
                </Text>
              </View>
              <ChevronRightIcon />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionContainer}
            onPress={handleBVN}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionTextGroup}>
                <Text style={styles.optionTitle}>BVN</Text>
                <Text style={styles.optionDescription}>
                  Bank verification number
                </Text>
              </View>
              <ChevronRightIcon />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionContainer}
            onPress={handleDriversLicence}
            activeOpacity={0.7}
          >
            <View style={styles.optionContent}>
              <View style={styles.optionTextGroup}>
                <Text style={styles.optionTitle}>Driver's licence</Text>
                <Text style={styles.optionDescription}>
                  Permit to operate a motor vehicle
                </Text>
              </View>
              <ChevronRightIcon />
            </View>
          </TouchableOpacity>
        </View>

        {/* Footer Notice */}
        <View style={styles.footerSection}>
          <Text style={styles.footerText}>
            Your details are securely verified through official identity
            providers.
          </Text>
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
    marginTop: 50,
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
  },
  optionsSection: {
    marginTop: 30,
    gap: 12,
  },
  optionContainer: {
    backgroundColor: "#F4F6F5",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  optionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  optionTextGroup: {
    gap: 8,
    flex: 1,
  },
  optionTitle: {
    fontFamily: "System",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 16,
    color: "#000000",
  },
  optionDescription: {
    fontFamily: "System",
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 14,
    color: "#323333",
  },
  footerSection: {
    position: "absolute",
    bottom: 50,
    left: 24,
    right: 24,
    alignItems: "center",
  },
  footerText: {
    fontFamily: "System",
    fontWeight: "400",
    fontSize: 12,
    lineHeight: 15,
    color: "#323333",
    textAlign: "center",
  },
});