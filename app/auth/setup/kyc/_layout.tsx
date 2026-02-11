import { Stack } from "expo-router";

export default function KYCLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#F5F5F5" },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="nin" />
      <Stack.Screen name="bvn" />
      <Stack.Screen name="drivers_licence" />
      <Stack.Screen name="verifying" />
      <Stack.Screen name="success" />
    </Stack>
  );
}