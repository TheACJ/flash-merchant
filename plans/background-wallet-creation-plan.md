# Background Wallet Creation Implementation Plan

## Overview

Currently, wallet creation happens synchronously in the OTP verification screen (Screen 2), causing UI blocking and delay. This plan outlines implementing non-blocking background wallet creation that starts when the user lands on the signup screen.

## Current Flow Analysis

```
Screen 1 (Account Details)          Screen 2 (OTP Verification)
┌─────────────────────────┐        ┌─────────────────────────────┐
│ User fills form         │        │ User enters OTP             │
│ User taps Create Account│───────►│ User taps Verify            │
│ API: registerInitiate   │        │ ⚠️ BLOCKS UI: createWallet()│
│ Navigate to Screen 2    │        │ API: registerComplete       │
└─────────────────────────┘        └─────────────────────────────┘
```

**Problem**: Wallet creation on Screen 2 blocks the UI thread, causing poor UX.

## Proposed Flow

```
Screen 1 (Account Details)          Screen 2 (OTP Verification)
┌─────────────────────────┐        ┌─────────────────────────────┐
│ 🔄 Background: Start    │        │ Check if wallets ready      │
│    wallet creation      │        │ If ready: Use cached wallets│
│ User fills form         │        │ If pending: Show loading    │
│ User taps Create Account│───────►│ User taps Verify            │
│ API: registerInitiate   │        │ API: registerComplete       │
│ Navigate to Screen 2    │        │ Navigate to loading screen  │
└─────────────────────────┘        └─────────────────────────────┘
```

**Benefit**: Wallets are created in parallel while user fills the form, reducing wait time on Screen 2.

---

## Implementation Details

### 1. Create Wallet Creation Hook

**File**: `hooks/useBackgroundWalletCreation.ts`

```typescript
interface WalletCreationState {
  status: 'idle' | 'creating' | 'success' | 'error';
  wallets: WalletAddresses | null;
  error: string | null;
  createWallets: () => Promise<void>;
  reset: () => void;
}

const useBackgroundWalletCreation = (): WalletCreationState
```

**Features**:
- Returns current wallet creation state
- Provides `createWallets` function to start background creation
- Handles errors gracefully with retry capability
- Uses React state to track progress

### 2. Create Wallet Context Provider

**File**: `contexts/WalletCreationContext.tsx`

```typescript
interface WalletCreationContextValue {
  wallets: WalletAddresses | null;
  status: WalletStatus;
  startCreation: () => void;
  waitForWallets: () => Promise<WalletAddresses>;
}
```

**Features**:
- Global state accessible from any component
- Promise-based `waitForWallets` for async operations
- Singleton pattern ensures wallet is only created once

### 3. Modify SignupScreen Component

**File**: `app/auth/create-wallet/index.tsx`

**Changes**:
1. Import the wallet creation hook/context
2. Start wallet creation on component mount (useEffect)
3. Pass wallet state to SignupScreen2 via props or context
4. Remove synchronous wallet creation from OTP screen

### 4. Modify SignupScreen2 (OTP Verification)

**File**: `app/auth/create-wallet/index.tsx` (Screen 2 section)

**Changes**:
1. Receive wallet state from parent or context
2. If wallets are ready, use them immediately
3. If still creating, show loading indicator and wait
4. Handle error state with retry option

---

## Detailed File Changes

### Step 1: Create `hooks/useBackgroundWalletCreation.ts`

**Purpose**: Custom hook to manage background wallet creation lifecycle

**Implementation**:
- Uses `useRef` to track if creation has started (prevents double creation)
- Uses `useState` for status and wallet data
- Returns status, wallets, error, and control functions
- Handles cleanup on unmount (optional)

### Step 2: Create `contexts/WalletCreationContext.tsx`

**Purpose**: Provide global wallet creation state across screens

**Implementation**:
- Creates a React Context with wallet creation state
- Provides `startCreation` to initiate background creation
- Provides `waitForWallets` that returns a Promise resolving when wallets are ready
- Wraps the signup flow in the provider

### Step 3: Update `app/auth/create-wallet/index.tsx`

**Changes to SignupScreen (main component)**:
```typescript
const SignupScreen: React.FC = () => {
  const { wallets, status, startCreation, waitForWallets } = useWalletCreation();
  
  // Start wallet creation on mount
  useEffect(() => {
    startCreation();
  }, []);
  
  // Pass wallet state to screens
  // ...
};
```

**Changes to SignupScreen1**:
- No changes needed (wallet creation happens in background)

**Changes to SignupScreen2**:
```typescript
const SignupScreen2: React.FC<SignupScreen2Props> = ({ onNext, userData, walletState }) => {
  const handleNext = async () => {
    setLoading(true);
    try {
      // Wait for wallets if not ready
      const wallets = await walletState.waitForWallets();
      
      const response = await merchantApi.registerComplete({
        session_token: userData.sessionToken || '',
        otp: verificationCode,
        wallets: {
          ethereum: { addresses: [wallets.ethereum.address] },
          // ...
        },
      });
      // ...
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };
  // ...
};
```

### Step 4: Update Types

**File**: `types/wallet.ts` or inline in the hook file

```typescript
interface WalletAddresses {
  ethereum: { address: string; privateKey?: string };
  solana: { address: string; privateKey?: string };
  bitcoin: { address: string; privateKey?: string };
  bnb: { address: string; privateKey?: string };
}

type WalletStatus = 'idle' | 'creating' | 'success' | 'error';
```

---

## Error Handling Strategy

### Wallet Creation Fails

1. **On Screen 1**: Show a subtle warning that wallet creation failed, with a retry button
2. **On Screen 2**: If wallets failed, show error with retry option before OTP submission
3. **Retry Logic**: Allow user to retry wallet creation, with max 3 attempts

### Network/Timeout Issues

1. Set a timeout for wallet creation (30 seconds)
2. If timeout occurs, show error with retry option
3. Consider fallback to simpler wallet creation method

---

## Testing Checklist

- [ ] Wallet creation starts when signup screen mounts
- [ ] Wallet creation completes successfully in background
- [ ] Screen 2 uses pre-created wallets when ready
- [ ] Screen 2 waits for wallets if still creating
- [ ] Error handling works when wallet creation fails
- [ ] Retry mechanism works correctly
- [ ] No memory leaks on component unmount
- [ ] Works correctly when user navigates back and forth

---

## Implementation Order

1. Create `hooks/useBackgroundWalletCreation.ts`
2. Create `contexts/WalletCreationContext.tsx` (optional, can use hook directly)
3. Update `app/auth/create-wallet/index.tsx` to use the hook
4. Update SignupScreen2 to use pre-created wallets
5. Add error handling and retry logic
6. Test the complete flow

---

## Alternative Approach: Simpler Implementation

If context is overkill, a simpler approach using just the hook:

```typescript
// In SignupScreen component
const [walletState, setWalletState] = useState({
  status: 'idle',
  wallets: null,
  error: null
});

useEffect(() => {
  let isMounted = true;
  setWalletState(prev => ({ ...prev, status: 'creating' }));
  
  MerchantWalletService.createWallet()
    .then(wallets => {
      if (isMounted) {
        setWalletState({ status: 'success', wallets, error: null });
      }
    })
    .catch(error => {
      if (isMounted) {
        setWalletState({ status: 'error', wallets: null, error: error.message });
      }
    });
  
  return () => { isMounted = false; };
}, []);

// Pass walletState to SignupScreen2 via props
```

This simpler approach:
- Uses local state instead of context
- Starts wallet creation on mount
- Passes state down via props
- Easier to implement and understand

---

## Recommendation

Start with the **Simpler Implementation** first. If it works well, no need for the context approach. The context becomes useful if:
- Multiple distant components need wallet state
- You want to persist wallet state across navigation
- You need to share wallet state between different flows
