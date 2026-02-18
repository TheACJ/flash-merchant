import { ONBOARDING_STEPS } from '@/constants/storage';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '../stores/authStore';
import { getOnboardingStep } from '../utils/onboarding';

export default function Index() {
    const { isAuthenticated, hasPin, checkHasPin, isLoading } = useAuthStore();
    const [onboardingStep, setOnboardingStep] = useState<string | null>(null);
    const [checkingOnboarding, setCheckingOnboarding] = useState(true);

    useEffect(() => {
        const checkOnboarding = async () => {
            try {
                const step = await getOnboardingStep();
                setOnboardingStep(step);
            } catch (error) {
                console.error('Error checking onboarding step:', error);
            } finally {
                setCheckingOnboarding(false);
            }
        };
        
        checkHasPin();
        checkOnboarding();
    }, []);

    // Show loading while checking auth and onboarding status
    if (isLoading || checkingOnboarding) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
                <ActivityIndicator size="large" color="#0066FF" />
            </View>
        );
    }

    // If onboarding is complete, go to tabs (user is fully set up)
    if (onboardingStep === ONBOARDING_STEPS.complete) {
        return <Redirect href="/(tabs)/home" />;
    }

    // If user is authenticated, go to tabs
    if (isAuthenticated) {
        return <Redirect href="/(tabs)/home" />;
    }

    // If user has a PIN but not authenticated, go to login
    if (hasPin) {
        return <Redirect href="/auth/login" />;
    }

    // Otherwise, go to welcome screen (new user or incomplete onboarding)
    return <Redirect href="/(welcome)" />;
}
