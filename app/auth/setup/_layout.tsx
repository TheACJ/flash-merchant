import { Stack } from "expo-router";

export default function CreateTagLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
        contentStyle: { backgroundColor: "#F5F5F5" },
      }}
    >
      <Stack.Screen name="tag" />
      <Stack.Screen name="bank_setup" />
      <Stack.Screen name="pin" />
      <Stack.Screen name="kyc" />
      <Stack.Screen name="kyc/nin" />
      <Stack.Screen name="kyc/bvn" />
      <Stack.Screen name="kyc/drivers_licence" />
      <Stack.Screen name="kyc/verifying" />
      <Stack.Screen name="kyc/success" />
    </Stack>
  );
}