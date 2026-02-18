import { ONBOARDING_STEPS } from '@/constants/storage';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, useColorScheme, View } from 'react-native';
import 'react-native-get-random-values';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch } from 'react-redux';
import MerchantWalletService from '../services/MerchantWalletService';
import { store } from '../store';
import { addWallet } from '../store/slices/merchantWalletSlice';
import { getOnboardingStep } from '../utils/onboarding';

const ROUTE_MAP = {
  welcome: '/(welcome)',
  disclaimer: '/(welcome)/disclaimer',
  createWallet: '/auth/create-wallet',
  importWallet: '/auth/login/import-wallet',
  seedPhrase: '/auth/create-wallet/seed_phrase',
  verifySeed: '/auth/create-wallet/verify_seed_phrase',
  notice: '/auth/create-wallet/notice',
  loginNotice: '/auth/login/notice',
  tag: '/auth/setup/tag',
  pin: '/auth/setup/pin',
  bankSetup: '/auth/setup/bank_setup',
  kyc: '/auth/setup/kyc',
  tabs: '/(tabs)/home',
} as const;

type RoutePath = typeof ROUTE_MAP[keyof typeof ROUTE_MAP];

const routeFromStep = (step: string | null): RoutePath => {
  if (!step) return ROUTE_MAP.welcome;

  switch (step) {
    case ONBOARDING_STEPS.welcome:
      return ROUTE_MAP.welcome;
    case ONBOARDING_STEPS.disclaimer:
      return ROUTE_MAP.disclaimer;
    case ONBOARDING_STEPS.create_wallet:
      return ROUTE_MAP.createWallet;
    case ONBOARDING_STEPS.import_wallet:
      return ROUTE_MAP.importWallet;
    case ONBOARDING_STEPS.seed_phrase:
      return ROUTE_MAP.seedPhrase;
    case ONBOARDING_STEPS.verify_seed:
      return ROUTE_MAP.verifySeed;
    case ONBOARDING_STEPS.notice:
      return ROUTE_MAP.notice;
    case ONBOARDING_STEPS.tag:
      return ROUTE_MAP.tag;
    case ONBOARDING_STEPS.pin:
      return ROUTE_MAP.pin;
    case ONBOARDING_STEPS.bank_setup:
      return ROUTE_MAP.bankSetup;
    case ONBOARDING_STEPS.kyc:
      return ROUTE_MAP.kyc;
    case ONBOARDING_STEPS.complete:
      return ROUTE_MAP.tabs;
    default:
      return ROUTE_MAP.welcome;
  }
};

function RootLayoutContent() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const dispatch = useDispatch();
  const [initialRoute, setInitialRoute] = useState<RoutePath | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize all cache orchestrators and services in background
  useAppInitialization();

  // Load wallets from storage on app launch
  useEffect(() => {
    const loadWallets = async () => {
      try {
        const wallets = await MerchantWalletService.getAllWallets();
        console.log('Loading wallets from storage:', wallets.length);
        wallets.forEach(wallet => {
          dispatch(addWallet(wallet));
        });
      } catch (error) {
        console.error('Failed to load wallets:', error);
      }
    };

    loadWallets();
  }, [dispatch]);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const currentStep = await getOnboardingStep();
        const route = currentStep === ONBOARDING_STEPS.complete
          ? ROUTE_MAP.tabs
          : routeFromStep(currentStep);

        setInitialRoute(route);
        setIsReady(true);
      } catch (error) {
        console.error('Error checking onboarding:', error);
        setInitialRoute(ROUTE_MAP.welcome);
        setIsReady(true);
      }
    };

    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (isReady && initialRoute) {
      router.replace(initialRoute);
    }
  }, [isReady, initialRoute, router]);

  // Show loading indicator while checking onboarding status
  if (!isReady) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' }}>
          <ActivityIndicator size="large" color="#0066FF" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(welcome)" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="wallet" />
        <Stack.Screen name="misc" />
        <Stack.Screen name="settings" />
      </Stack>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutContent />
    </Provider>
  );
}
