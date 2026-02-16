import { Stack, useRouter } from "expo-router";
import { TouchableOpacity, View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function CreateWalletLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#F5F5F5" },
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name='index' />
      <Stack.Screen name="notice" />
      <Stack.Screen name="seed_phrase" />
      <Stack.Screen name="verify_seed_phrase" />
    </Stack>
  );
}

// Back button component for screens
export function CreateWalletHeader({ onBack }: { onBack?: () => void }) {
  const router = useRouter();

  const handlePress = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={handlePress}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        activeOpacity={0.7}
      >
        <Ionicons
          name="arrow-back"
          size={24}
          color="#000000"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    padding: 4,
  },
});
