import { useRouter } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Path, Svg } from "react-native-svg";

// --- Icons ---

const CheckCircleIcon = () => (
  <Svg width={25} height={25} viewBox="0 0 25 25" fill="none">
    <Path
      d="M12.5 2.34375C6.8916 2.34375 2.34375 6.8916 2.34375 12.5C2.34375 18.1084 6.8916 22.6562 12.5 22.6562C18.1084 22.6562 22.6562 18.1084 22.6562 12.5C22.6562 6.8916 18.1084 2.34375 12.5 2.34375Z"
      fill="#128807"
    />
    <Path
      d="M17.1875 9.375L10.9375 15.625L7.8125 12.5"
      stroke="white"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const XCircleIcon = () => (
  <Svg width={25} height={25} viewBox="0 0 25 25" fill="none">
    <Path
      d="M12.5 2.34375C6.8916 2.34375 2.34375 6.8916 2.34375 12.5C2.34375 18.1084 6.8916 22.6562 12.5 22.6562C18.1084 22.6562 22.6562 18.1084 22.6562 12.5C22.6562 6.8916 18.1084 2.34375 12.5 2.34375Z"
      fill="#C31D1E"
    />
    <Path
      d="M15.625 9.375L9.375 15.625"
      stroke="white"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9.375 9.375L15.625 15.625"
      stroke="white"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Simulated taken tags for demo
const TAKEN_TAGS = ["admin", "flash", "merchant", "test", "user"];

type TagStatus = "idle" | "checking" | "available" | "taken";

export default function CreateTag() {
  const router = useRouter();
  const [tag, setTag] = useState("");
  const [tagStatus, setTagStatus] = useState<TagStatus>("idle");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkTagAvailability = useCallback((value: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim().length === 0) {
      setTagStatus("idle");
      return;
    }

    if (value.trim().length < 3) {
      setTagStatus("idle");
      return;
    }

    setTagStatus("checking");

    debounceRef.current = setTimeout(() => {
      const isTaken = TAKEN_TAGS.includes(value.trim().toLowerCase());
      setTagStatus(isTaken ? "taken" : "available");
    }, 800);
  }, []);

  const handleTagChange = (value: string) => {
    // Only allow alphanumeric and underscore
    const sanitized = value.replace(/[^a-zA-Z0-9_]/g, "");
    setTag(sanitized);
    checkTagAvailability(sanitized);
  };

  const handleNext = () => {
    if (tagStatus === "available") {
      router.push("/auth/setup/bank_setup");
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const getInputBorderColor = () => {
    switch (tagStatus) {
      case "available":
        return "#128807";
      case "taken":
        return "#C31D1E";
      default:
        return "#D2D6E1";
    }
  };

  const getStatusMessage = () => {
    switch (tagStatus) {
      case "available":
        return { text: "Tag is available!", color: "#128807" };
      case "taken":
        return { text: "Tag is already taken", color: "#C31D1E" };
      default:
        return null;
    }
  };

  const statusMessage = getStatusMessage();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Create tag</Text>
            <Text style={styles.subtitle}>
              Create a merchant identity tag
            </Text>
          </View>

          {/* Tag Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Enter your tag</Text>
            <View
              style={[
                styles.inputContainer,
                { borderColor: getInputBorderColor() },
              ]}
            >
              <TextInput
                style={styles.textInput}
                value={tag}
                onChangeText={handleTagChange}
                placeholder="e.g. Cryptoguru"
                placeholderTextColor="#657084"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
              />

              {/* Status Icon */}
              <View style={styles.statusIconContainer}>
                {tagStatus === "checking" && (
                  <ActivityIndicator size="small" color="#0F6EC0" />
                )}
                {tagStatus === "available" && <CheckCircleIcon />}
                {tagStatus === "taken" && <XCircleIcon />}
              </View>
            </View>

            {/* Status Message */}
            {statusMessage && (
              <Text
                style={[styles.statusMessage, { color: statusMessage.color }]}
              >
                {statusMessage.text}
              </Text>
            )}
          </View>

          {/* Bottom Buttons */}
          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[
                styles.nextButton,
                tagStatus !== "available" && styles.nextButtonDisabled,
              ]}
              onPress={handleNext}
              disabled={tagStatus !== "available"}
              activeOpacity={0.8}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.goBackButton}
              onPress={handleGoBack}
              activeOpacity={0.8}
            >
              <Text style={styles.goBackButtonText}>Go back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
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
    fontWeight: "500",
    fontSize: 20,
    lineHeight: 25,
    textAlign: "center",
    color: "#323333",
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
    flexDirection: "row",
    alignItems: "center",
    height: 60,
    backgroundColor: "#F4F6F5",
    borderWidth: 1,
    borderColor: "#D2D6E1",
    borderRadius: 15,
    paddingHorizontal: 18,
  },
  textInput: {
    flex: 1,
    fontFamily: "System",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 19,
    color: "#000000",
    height: "100%",
  },
  statusIconContainer: {
    width: 25,
    height: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  statusMessage: {
    fontFamily: "System",
    fontWeight: "400",
    fontSize: 14,
    lineHeight: 18,
    marginTop: -5,
  },
  bottomSection: {
    position: "absolute",
    bottom: 60,
    left: 24,
    right: 24,
    gap: 20,
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
  goBackButton: {
    backgroundColor: "rgba(15, 114, 199, 0.1)",
    borderRadius: 15,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  goBackButtonText: {
    fontFamily: "System",
    fontWeight: "400",
    fontSize: 16,
    lineHeight: 16,
    textAlign: "center",
    color: "#000000",
  },
});