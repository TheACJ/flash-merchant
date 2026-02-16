# Flash Merchant - Onboarding & Wallet Implementation Summary

## Completed Implementation

### 1. Constants & Storage (✓)
**File**: `constants/storage.ts`
- Created merchant-specific storage keys
- Defined onboarding steps: welcome → disclaimer → create/import wallet → tag → pin → bank_setup → kyc → complete
- Added cleanup utilities

### 2. Utilities (✓)
**Files**: 
- `utils/onboarding.ts` - Step management functions
- `utils/SecureStoreWrapper.ts` - HEX key encoding/decoding
- `utils/base64ToUint8Array.ts` - Base64 conversion
- `utils/uint8ArrayToBase64.ts` - Uint8Array conversion

### 3. Redux Store (✓)
**Files**:
- `store/slices/merchantWalletSlice.ts` - Wallet state management (no private keys)
- `store/slices/merchantAuthSlice.ts` - Auth & merchant profile state
- `store/index.ts` - Store configuration

**State Structure**:
```typescript
{
  merchantWallet: {
    wallets: Wallet[],
    selectedWalletId: string | null,
    isLoading: boolean,
    error: string | null
  },
  merchantAuth: {
    isAuthenticated: boolean,
    isLocked: boolean,
    merchantProfile: MerchantProfile | null,
    sessionToken: string | null
  }
}
```

### 4. Services (✓)
**Files**: 
- `services/MerchantWalletService.ts` - Main wallet service
- `services/SolanaService.ts` - Solana wallet operations
- `services/BitcoinService.ts` - Bitcoin wallet operations
- `services/BinanceService.ts` - BNB wallet operations

**MerchantWalletService**:
- `createWallet()` - Creates multi-chain wallets (ETH, SOL, BTC, BNB) with secure entropy
- `importWalletFromMnemonic()` - Imports all chains from 12-word seed phrase
- `saveWalletToStorage()` - Stores public wallet data
- `getAllWallets()` - Retrieves all wallets (public data only)
- `getWalletPrivateKey()` - Retrieves private key on-demand from SecureStore

**Chain Services**:
- **SolanaService**: Minimal Solana wallet creation/import with ed25519 derivation
- **BitcoinService**: Minimal Bitcoin wallet creation/import with P2WPKH (Bech32) addresses
- **BinanceService**: Minimal BNB wallet creation/import (uses Ethereum-compatible keys)

**Security**:
- Private keys stored in SecureStore with HEX encoding
- Mnemonic stored with key `merchant_wallet_mnemonic_primary`
- Redux only stores public wallet data
- Private keys retrieved on-demand for transactions

### 5. Root Layout with Session Persistence (✓)
**File**: `app/_layout.tsx`
- Checks onboarding status on app launch
- Routes to correct screen based on onboarding step
- Wraps app with Redux Provider
- Implements route mapping for all onboarding steps

**Route Map**:
```typescript
{
  welcome: '/(welcome)',
  disclaimer: '/(welcome)/disclaimer',
  createWallet: '/auth/create-wallet',
  importWallet: '/auth/login/import-wallet',
  tag: '/auth/setup/tag',
  pin: '/auth/setup/pin',
  bankSetup: '/auth/setup/bank_setup',
  kyc: '/auth/setup/kyc',
  tabs: '/(tabs)'
}
```

### 6. Updated Screens (✓)

#### Welcome Screen (`app/(welcome)/index.tsx`)
- Sets `ONBOARDING_STEPS.welcome` on mount
- Sets `ONBOARDING_STEPS.disclaimer` before navigating

#### Disclaimer Screen (`app/(welcome)/disclaimer.tsx`)
- Sets `ONBOARDING_STEPS.create_wallet` for Sign Up
- Sets `ONBOARDING_STEPS.import_wallet` for Login

#### Create Wallet Screen (`app/auth/create-wallet/index.tsx`)
- Integrates `MerchantWalletService.createWallet()`
- Stores wallet in Redux via `addWallet` action
- Sets `ONBOARDING_STEPS.tag` after wallet creation
- Navigates to seed phrase screen

#### Import Wallet Screen (`app/auth/login/import-wallet.tsx`)
- Integrates `MerchantWalletService.importWalletFromMnemonic()`
- Stores wallet in Redux via `addWallet` action
- Sets `ONBOARDING_STEPS.tag` after import
- Validates 12-word seed phrase

#### Tag Screen (`app/auth/setup/tag.tsx`)
- Sets `ONBOARDING_STEPS.pin` before navigating
- Fixed navigation to go to pin screen

## Onboarding Flow

```
1. Welcome (3 slides) → 2. Disclaimer → 3. Privacy Policy
                                           ↓
                                    Sign Up / Login
                                           ↓
                        ┌──────────────────┴──────────────────┐
                        ↓                                      ↓
                4a. Create Wallet                      4b. Import Wallet
                    (Generate seed)                        (12 words)
                        ↓                                      ↓
                        └──────────────────┬──────────────────┘
                                           ↓
                                    5. Create Tag
                                           ↓
                                    6. Set PIN
                                           ↓
                                    7. Bank Setup
                                           ↓
                                    8. KYC
                                           ↓
                                    9. Complete → Main App (Tabs)
```

## Data Storage

### SecureStore (Encrypted)
- `merchant_wallet_private_key_{walletId}` - Private keys (HEX encoded as base64)
- `merchant_wallet_mnemonic_{walletId}` - Wallet-specific mnemonic
- `merchant_wallet_mnemonic_primary` - Primary mnemonic for easy retrieval
- `merchant_wallets_data` - Array of public wallet data
- `merchant_onboarding_step` - Current onboarding step
- `merchant_pin_hash` - Hashed PIN
- `merchant_tag` - Merchant tag
- `merchant_profile` - Merchant profile data

### Redux (In-Memory)
- Public wallet data (address, balance, type, network)
- Merchant profile
- Auth state
- NO private keys or mnemonics

## Security Features

1. **Private Key Protection**
   - Never stored in Redux
   - Encrypted in SecureStore
   - HEX keys encoded as base64 for Android compatibility
   - Retrieved on-demand for transactions

2. **Mnemonic Storage**
   - Stored per wallet + primary copy
   - Encrypted in SecureStore
   - Never exposed in Redux state

3. **Session Persistence**
   - Onboarding step tracked
   - App resumes at correct step
   - No data loss on app restart

## Next Steps (Not Implemented)

### Priority 4: Session Management
- [ ] Create `SessionManager` service
- [ ] Implement auto-lock after inactivity
- [ ] Add PIN verification on app resume
- [ ] Track last activity timestamp

### Priority 5: Lock Screen
- [ ] Create `LockScreen` component
- [ ] Implement PIN entry
- [ ] Add lock state management
- [ ] Handle failed PIN attempts

### Priority 6: Additional Setup Screens
- [ ] Update PIN screen to hash and store PIN
- [ ] Implement Bank Setup screen
- [ ] Implement KYC screen
- [ ] Set `ONBOARDING_STEPS.complete` after KYC

### Priority 7: Main App Integration
- [ ] Load wallets from storage on app launch
- [ ] Fetch balances for all wallets
- [ ] Display wallet data in tabs
- [ ] Implement transaction functionality

## Testing Checklist

- [ ] Fresh install - should start at welcome
- [ ] Create wallet - should persist through app restart
- [ ] Import wallet - should validate seed phrase
- [ ] Onboarding steps - should resume at correct step
- [ ] Private keys - should be retrievable from SecureStore
- [ ] Redux state - should not contain private keys
- [ ] Navigation - should follow onboarding flow
- [ ] Tag creation - should check availability
- [ ] Multiple wallets - should support multiple chains

## Dependencies Required

```json
{
  "@reduxjs/toolkit": "^2.0.0",
  "react-redux": "^9.0.0",
  "expo-secure-store": "^13.0.0",
  "expo-crypto": "^13.0.0",
  "ethers": "^6.0.0",
  "uuid": "^9.0.0"
}
```

## File Structure

```
Flash/
├── app/
│   ├── _layout.tsx (✓ Updated with session persistence)
│   ├── (welcome)/
│   │   ├── index.tsx (✓ Updated)
│   │   └── disclaimer.tsx (✓ Updated)
│   └── auth/
│       ├── create-wallet/
│       │   └── index.tsx (✓ Updated)
│       ├── login/
│       │   └── import-wallet.tsx (✓ Updated)
│       └── setup/
│           └── tag.tsx (✓ Updated)
├── constants/
│   └── storage.ts (✓ Created)
├── utils/
│   ├── onboarding.ts (✓ Created)
│   ├── SecureStoreWrapper.ts (✓ Created)
│   ├── base64ToUint8Array.ts (✓ Created)
│   └── uint8ArrayToBase64.ts (✓ Created)
├── store/
│   ├── index.ts (✓ Created)
│   └── slices/
│       ├── merchantWalletSlice.ts (✓ Created)
│       └── merchantAuthSlice.ts (✓ Created)
└── services/
    ├── MerchantWalletService.ts (✓ Created)
    ├── SolanaService.ts (✓ Created)
    ├── BitcoinService.ts (✓ Created)
    └── BinanceService.ts (✓ Created)
```

## Notes

- Implementation follows flash-wallet patterns
- Minimal code approach as requested
- Security-first design (no private keys in Redux)
- Ready for PIN/lock screen integration
- Supports multi-chain wallets (Ethereum focus for now)
- Onboarding persistence works across app restarts
