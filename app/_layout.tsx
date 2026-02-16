import 'react-native-get-random-values';
import React, { useEffect, useState } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider, useDispatch } from 'react-redux';
import { store } from '../store';
import { getOnboardingStep } from '../utils/onboarding';
import { ONBOARDING_STEPS } from '@/constants/storage';
import MerchantWalletService from '../services/MerchantWalletService';
import { addWallet } from '../store/slices/merchantWalletSlice';

const ROUTE_MAP = {
  welcome: '/(welcome)',
  disclaimer: '/(welcome)/disclaimer',
  createWallet: '/auth/create-wallet',
  importWallet: '/auth/login/import-wallet',
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
