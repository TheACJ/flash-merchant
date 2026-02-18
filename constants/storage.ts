import * as SecureStore from 'expo-secure-store';

export const STORAGE_KEYS = {
  // Wallet Data
  wallet_address: 'merchant_wallet_address',
  wallet_private_key: 'merchant_wallet_private_key',
  wallet_mnemonic: 'merchant_wallet_mnemonic_',
  wallet_mnemonic_primary: 'merchant_wallet_mnemonic_primary',
  selected_wallet_id: 'merchant_selected_wallet_id',
  wallets_data: 'merchant_wallets_data',
  
  // Merchant Data
  merchant_tag: 'merchant_tag',
  merchant_profile: 'merchant_profile',
  merchant_business_info: 'merchant_business_info',
  merchant_bank_details: 'merchant_bank_details',
  merchant_kyc_status: 'merchant_kyc_status',
  
  // Onboarding Status
  onboarding_step: 'merchant_onboarding_step',
  
  // Auth
  merchant_pin_hash: 'merchant_pin_hash',
  pin_attempts: 'merchant_pin_attempts',
  temp_lock_until: 'merchant_temp_lock_until',
  session_token: 'merchant_session_token',
  
  // Settings
  auto_lock_interval: 'merchant_auto_lock_interval',
  preferred_currency: 'merchant_preferred_currency',
  
  // Activity
  last_activity_timestamp: 'merchant_last_activity_timestamp',
} as const;

export const ONBOARDING_STEPS = {
  welcome: 'welcome',
  disclaimer: 'disclaimer',
  create_wallet: 'create_wallet',
  import_wallet: 'import_wallet',
  seed_phrase: 'seed_phrase',
  verify_seed: 'verify_seed',
  notice: 'notice',
  tag: 'tag',
  bank_setup: 'bank_setup',
  pin: 'pin',
  kyc: 'kyc',
  complete: 'complete',
} as const;

export const cleanupOnboardingData = async () => {
  const keys = Object.values(STORAGE_KEYS);
  await Promise.all(keys.map(key => SecureStore.deleteItemAsync(key).catch(() => {})));
};
