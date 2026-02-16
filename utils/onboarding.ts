import { ONBOARDING_STEPS, STORAGE_KEYS } from '@/constants/storage';
import * as SecureStore from 'expo-secure-store';

export async function setOnboardingStep(step: keyof typeof ONBOARDING_STEPS) {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.onboarding_step, step);
  } catch (error) {
    console.error('[Onboarding] Error setting step:', error);
    throw error;
  }
}

export async function getOnboardingStep(): Promise<keyof typeof ONBOARDING_STEPS | null> {
  try {
    const step = await SecureStore.getItemAsync(STORAGE_KEYS.onboarding_step);
    return step as keyof typeof ONBOARDING_STEPS | null;
  } catch (error) {
    console.error('[Onboarding] Error getting step:', error);
    return null;
  }
}

export async function completeOnboarding() {
  try {
    await setOnboardingStep(ONBOARDING_STEPS.complete);
  } catch (error) {
    console.error('[Onboarding] Error completing onboarding:', error);
    throw error;
  }
}
