import { Stack } from "expo-router";

export default function CreateWalletLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#F5F5F5" },
      }}
    >
      <Stack.Screen name="notice" />
      <Stack.Screen name="seed_phrase" />
      <Stack.Screen name="verify_seed_phrase" />
    </Stack>
  );
}