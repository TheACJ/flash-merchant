import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Path, Svg } from "react-native-svg";

const CheckIcon = () => (
  <Svg width={64} height={64} viewBox="0 0 64 64" fill="none">
    <Path
      d="M10 32L26 48L54 16"
      stroke="#E7E7E7"
      strokeWidth={6}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface SuccessProps {
  title?: string;
  message?: string;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
}

export default function VerificationSuccess({
  title,
  message,
  onPrimaryAction,
  primaryActionLabel,
}: SuccessProps) {
  const router = useRouter();
  const { type } = useLocalSearchParams<{ type: string }>();

  useEffect(() => {
    // Auto-navigate after 2.5 seconds only if no custom action is provided
    if (!onPrimaryAction) {
      const timer = setTimeout(() => {
        router.replace('/(tabs)/home');
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [onPrimaryAction, router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <View style={styles.container}>
        <View style={styles.content}>
          {/* Success Circle */}
          <View style={styles.successCircle}>
            <CheckIcon />
          </View>

          {/* Success Text */}
          <View style={styles.textGroup}>
            <Text style={styles.successText}>{title || "Verification successful"}</Text>
            {message && <Text style={styles.messageText}>{message}</Text>}
          </View>
        </View>
        
        {/* Custom Action Button */}
        {onPrimaryAction && primaryActionLabel && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={onPrimaryAction}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>{primaryActionLabel}</Text>
          </TouchableOpacity>
        )}
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
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    gap: 12,
  },
  successCircle: {
    width: 150,
    height: 150,
    backgroundColor: "#0F6EC0",
    borderRadius: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  textGroup: {
    gap: 10,
  },
  successText: {
    fontFamily: "System",
    fontWeight: "500",
    fontSize: 25,
    lineHeight: 30,
    textAlign: "center",
    color: "#000000",
  },
  messageText: {
    fontSize: 14,
    color: "#657084",
    textAlign: "center",
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: "#0F6EC0",
    borderRadius: 15,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    paddingHorizontal: 32,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#F5F5F5",
  },
});
