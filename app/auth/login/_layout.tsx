import { Stack } from 'expo-router';

export default function LoginLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="otp" />
            <Stack.Screen name="import-wallet" />
        </Stack>
    );
}
