import { Redirect } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../stores/authStore';

export default function Index() {
    const { isAuthenticated, hasPin, checkHasPin, isLoading } = useAuthStore();

    useEffect(() => {
        checkHasPin();
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (isAuthenticated) {
        return <Redirect href="/(tabs)/home" />;
    }

    if (hasPin) {
        return <Redirect href="/auth/login" />;
    }

    return <Redirect href="/(welcome)" />; // Or signup/pin-setup
}
