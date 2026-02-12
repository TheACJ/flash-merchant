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
import { Circle, Path, Svg } from "react-native-svg";

const WarningIcon = () => (
  <Svg width={50} height={50} viewBox="0 0 50 50" fill="none">
    <Path
      d="M25 4.6875C14.0137 4.6875 4.6875 14.0137 4.6875 25C4.6875 35.9863 14.0137 45.3125 25 45.3125C35.9863 45.3125 45.3125 35.9863 45.3125 25C45.3125 14.0137 35.9863 4.6875 25 4.6875Z"
      stroke="#C31D1E"
      strokeWidth={2.5}
      strokeMiterlimit={10}
    />
    <Path
      d="M25 15.625V26.5625"
      stroke="#C31D1E"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={25} cy={33.5} r={2} fill="#C31D1E" />
  </Svg>
);

const CheckIcon = () => (
  <Svg width={10} height={10} viewBox="0 0 10 10" fill="none">
    <Path
      d="M1.5 5.5L4 8L8.5 2"
      stroke="#FFFFFF"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface CheckboxItemProps {
  text: string;
  checked: boolean;
  onToggle: () => void;
}

const CheckboxItem: React.FC<CheckboxItemProps> = ({
  text,
  checked,
  onToggle,
}) => (
  <TouchableOpacity
    style={styles.checkboxContainer}
    onPress={onToggle}
    activeOpacity={0.7}
  >
    <View style={styles.checkboxRow}>
      <View
        style={[
          styles.checkbox,
          checked && styles.checkboxChecked,
        ]}
      >
        {checked && <CheckIcon />}
      </View>
      <Text style={styles.checkboxText}>{text}</Text>
    </View>
  </TouchableOpacity>
);

export default function ImportantNotice() {
  const router = useRouter();
  const [checks, setChecks] = useState([false, false, false]);

  const allChecked = checks.every(Boolean);

  const toggleCheck = (index: number) => {
    setChecks((prev) => {
      const newChecks = [...prev];
      newChecks[index] = !newChecks[index];
      return newChecks;
    });
  };

  const handleContinue = () => {
    if (allChecked) {
      router.push('/auth/setup/pin');
    }
  };

  const disclaimers = [
    "My funds and controlled on this device. Flash has no custody nor access control over my funds.",
    "Flash can never recover my funds for me. It is my responsibilty to save and protect my seed phrase.",
    "If the app is deleted or i lose my seed phrase it can't be recovered. I can only get my fund back with my seed phrase",
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerSection}>
          <WarningIcon />
          <Text style={styles.title}>Important notice</Text>
        </View>

        {/* Disclaimers */}
        <View style={styles.disclaimersSection}>
          {disclaimers.map((text, index) => (
            <CheckboxItem
              key={index}
              text={text}
              checked={checks[index]}
              onToggle={() => toggleCheck(index)}
            />
          ))}
        </View>

        {/* Continue Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.continueButton,
              !allChecked && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!allChecked}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
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
    gap: 20,
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
  disclaimersSection: {
    marginTop: 40,
    gap: 15,
  },
  checkboxContainer: {
    backgroundColor: "#F4F6F5",
    borderRadius: 10,
    padding: 10,
    minHeight: 80,
    justifyContent: "center",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#0F6EC0",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 3,
  },
  checkboxChecked: {
    backgroundColor: "#0F72C7",
    borderColor: "#0F6EC0",
  },
  checkboxText: {
    flex: 1,
    fontFamily: "System",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 22,
    color: "#323333",
  },
  bottomSection: {
    position: "absolute",
    bottom: 40,
    left: 24,
    right: 24,
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
});