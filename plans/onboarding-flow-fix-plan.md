# Onboarding Flow Fix Plan

## Overview

This plan addresses issues with the onboarding flow that cause the welcome screen to appear briefly on app reload and incorrect `completeOnboarding()` placement.

---

## Identified Issues

### Issue 1: Welcome Screen Resets Onboarding Step
**File:** [`app/(welcome)/index.tsx:65-67`](app/(welcome)/index.tsx:65)

```tsx
useEffect(() => {
  setOnboardingStep(ONBOARDING_STEPS.welcome);
}, []);
```

**Problem:** This resets the step to `welcome` every time the screen mounts. If a user is mid-onboarding and reloads the app, this will reset their progress.

**Fix:** Remove this useEffect entirely. The welcome screen should NOT set the onboarding step. Steps should only be set when progressing forward.

---

### Issue 2: `completeOnboarding()` Called Too Early

**Locations:**
1. [`app/auth/login/loading.tsx:143`](app/auth/login/loading.tsx:143) - After wallet import
2. [`app/auth/create-wallet/verify_seed_phrase.tsx:96`](app/auth/create-wallet/verify_seed_phrase.tsx:96) - After seed verification
3. [`app/auth/setup/tag.tsx:106`](app/auth/setup/tag.tsx:106) - After tag creation

**Problem:** `completeOnboarding()` is called when there are still steps remaining (Notice, Bank Setup, PIN, KYC).

**Fix:** Remove all premature `completeOnboarding()` calls. It should only be called after KYC verification.

---

### Issue 3: Missing Onboarding Step Progression

**Problem:** Most screens don't save their progress to the onboarding step, causing the app to lose track of where the user is in the flow.

**Fix:** Each screen should set the appropriate onboarding step when navigating forward.

---

### Issue 4: No Loading State in Root Layout

**File:** [`app/_layout.tsx`](app/_layout.tsx)

**Problem:** The app renders the Stack navigator before `isReady` is true, which can cause a brief flash of the welcome/index screen.

**Fix:** Add a loading indicator while checking onboarding status.

---

### Issue 5: Conflicting Entry Point Logic

**File:** [`app/index.tsx`](app/index.tsx)

**Problem:** Uses `useAuthStore` (hasPin, isAuthenticated) for routing, while `app/_layout.tsx` uses `onboarding_step`. These can conflict.

**Fix:** Simplify `app/index.tsx` to just show a loading state while `app/_layout.tsx` handles all routing logic.

---

## Correct Onboarding Flows

### Sign Up Flow
```
Welcome Carousel 
  → Disclaimer 
  → Privacy Policy [sets step to create_wallet]
  → Create Wallet (Account Form + OTP) 
  → Loading (Wallet Creation) [sets step to seed_phrase]
  → Seed Phrase Display 
  → Verify Seed Phrase [sets step to notice]
  → Notice [sets step to tag]
  → Create Tag [sets step to bank_setup]
  → Bank Setup [sets step to pin]
  → PIN Setup [sets step to kyc]
  → KYC Verification [sets step to complete]
  → Tabs (Home)
```

### Login Flow
```
Welcome Carousel 
  → Disclaimer 
  → Privacy Policy [sets step to import_wallet]
  → Login (Phone + OTP)
  → Import Wallet (if no mnemonic) 
  → Loading [sets step to notice]
  → Notice [sets step to pin]
  → PIN Setup [sets step to kyc]
  → KYC Verification [sets step to complete]
  → Tabs (Home)

OR (if mnemonic exists and onboarding complete):
  → Tabs (Home)

OR (if mnemonic exists but onboarding incomplete):
  → Continue from saved step
```

---

## Implementation Steps

### Step 1: Update ONBOARDING_STEPS Constants
**File:** [`constants/storage.ts`](constants/storage.ts)

Add missing steps:
```typescript
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
```

### Step 2: Fix Welcome Screen
**File:** [`app/(welcome)/index.tsx`](app/(welcome)/index.tsx)

Remove the useEffect that sets onboarding step:
```diff
- useEffect(() => {
-   setOnboardingStep(ONBOARDING_STEPS.welcome);
- }, []);
```

### Step 3: Update Root Layout
**File:** [`app/_layout.tsx`](app/_layout.tsx)

1. Add loading state while checking onboarding
2. Update route mapping for new steps
3. Prevent rendering until ready

```tsx
// Add new routes to ROUTE_MAP
const ROUTE_MAP = {
  welcome: '/(welcome)',
  disclaimer: '/(welcome)/disclaimer',
  createWallet: '/auth/create-wallet',
  importWallet: '/auth/login/import-wallet',
  seedPhrase: '/auth/create-wallet/seed_phrase',
  verifySeed: '/auth/create-wallet/verify_seed_phrase',
  notice: '/auth/create-wallet/notice',
  tag: '/auth/setup/tag',
  pin: '/auth/setup/pin',
  bankSetup: '/auth/setup/bank_setup',
  kyc: '/auth/setup/kyc',
  tabs: '/(tabs)/home',
} as const;

// Add loading UI
if (!isReady) {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    </SafeAreaProvider>
  );
}
```

### Step 4: Update Disclaimer Screen
**File:** [`app/(welcome)/disclaimer.tsx`](app/(welcome)/disclaimer.tsx)

Set appropriate onboarding steps when navigating:
```tsx
const handleSignUp = useCallback(async () => {
  await setOnboardingStep(ONBOARDING_STEPS.create_wallet);
  router.push('/auth/create-wallet');
}, [router]);

const handleLogin = useCallback(async () => {
  await setOnboardingStep(ONBOARDING_STEPS.import_wallet);
  router.push('/auth/login');
}, [router]);
```

### Step 5: Update Create Wallet Loading Screen
**File:** [`app/auth/create-wallet/loading.tsx`](app/auth/create-wallet/loading.tsx)

Change from `tag` to `seed_phrase`:
```diff
- await setOnboardingStep(ONBOARDING_STEPS.tag);
+ await setOnboardingStep(ONBOARDING_STEPS.seed_phrase);
```

### Step 6: Update Verify Seed Phrase Screen
**File:** [`app/auth/create-wallet/verify_seed_phrase.tsx`](app/auth/create-wallet/verify_seed_phrase.tsx)

Remove `completeOnboarding()` and set step to `notice`:
```diff
- await completeOnboarding();
+ await setOnboardingStep(ONBOARDING_STEPS.notice);
```

### Step 7: Update Create Wallet Notice Screen
**File:** [`app/auth/create-wallet/notice.tsx`](app/auth/create-wallet/notice.tsx)

Set step to `tag` when navigating:
```tsx
const handleContinue = async () => {
  if (allChecked) {
    await setOnboardingStep(ONBOARDING_STEPS.tag);
    router.push('/auth/setup/tag');
  }
};
```

### Step 8: Update Tag Screen
**File:** [`app/auth/setup/tag.tsx`](app/auth/setup/tag.tsx)

Remove `completeOnboarding()` and set step to `bank_setup`:
```diff
- await completeOnboarding();
+ await setOnboardingStep(ONBOARDING_STEPS.bank_setup);
```

### Step 9: Update Bank Setup Screen
**File:** [`app/auth/setup/bank_setup.tsx`](app/auth/setup/bank_setup.tsx)

Set step to `pin` when navigating:
```tsx
const handleNext = async () => {
  if (isFormValid) {
    await setOnboardingStep(ONBOARDING_STEPS.pin);
    router.push('/auth/setup/pin');
  }
};
```

### Step 10: Update PIN Setup Screen
**File:** [`app/auth/setup/pin.tsx`](app/auth/setup/pin.tsx)

Set step to `kyc` when navigating:
```tsx
const navigateToKYC = async () => {
  await setOnboardingStep(ONBOARDING_STEPS.kyc);
  router.push('/auth/setup/kyc' as const);
};
```

### Step 11: Create KYC Success Handler
**File:** [`app/auth/setup/kyc/index.tsx`](app/auth/setup/kyc/index.tsx) or new success screen

Add `completeOnboarding()` after KYC verification:
```tsx
const handleKYCSuccess = async () => {
  await completeOnboarding();
  router.replace('/(tabs)/home');
};
```

### Step 12: Update Login Loading Screen
**File:** [`app/auth/login/loading.tsx`](app/auth/login/loading.tsx)

Remove `completeOnboarding()` and set step to `notice`:
```diff
- await completeOnboarding();
+ await setOnboardingStep(ONBOARDING_STEPS.notice);
```

### Step 13: Update Login Notice Screen
**File:** [`app/auth/login/notice.tsx`](app/auth/login/notice.tsx)

Set step to `pin` when navigating:
```tsx
const handleContinue = async () => {
  if (allChecked) {
    await setOnboardingStep(ONBOARDING_STEPS.pin);
    router.push('/auth/setup/pin');
  }
};
```

### Step 14: Update Login OTP Screen
**File:** [`app/auth/login/otp.tsx`](app/auth/login/otp.tsx)

Check onboarding step after OTP verification:
```tsx
if (existingMnemonic) {
  // Check onboarding step to determine where to go
  const currentStep = await getOnboardingStep();
  if (currentStep === ONBOARDING_STEPS.complete) {
    router.replace('/(tabs)/home');
  } else {
    // Continue from saved step
    router.replace('/auth/setup/pin'); // or appropriate step
  }
} else {
  router.push('/auth/login/import-wallet');
}
```

### Step 15: Simplify App Index
**File:** [`app/index.tsx`](app/index.tsx)

Just show loading - let root layout handle routing:
```tsx
export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `constants/storage.ts` | Add new ONBOARDING_STEPS |
| `app/(welcome)/index.tsx` | Remove setOnboardingStep useEffect |
| `app/(welcome)/disclaimer.tsx` | Set step on signup/login |
| `app/_layout.tsx` | Add loading state, update route map |
| `app/index.tsx` | Simplify to just loading |
| `app/auth/create-wallet/loading.tsx` | Set step to seed_phrase |
| `app/auth/create-wallet/verify_seed_phrase.tsx` | Set step to notice |
| `app/auth/create-wallet/notice.tsx` | Set step to tag |
| `app/auth/setup/tag.tsx` | Set step to bank_setup |
| `app/auth/setup/bank_setup.tsx` | Set step to pin |
| `app/auth/setup/pin.tsx` | Set step to kyc |
| `app/auth/setup/kyc/index.tsx` | Call completeOnboarding on success |
| `app/auth/login/loading.tsx` | Set step to notice |
| `app/auth/login/notice.tsx` | Set step to pin |
| `app/auth/login/otp.tsx` | Check onboarding step |

---

## Testing Checklist

- [ ] Fresh install shows welcome screen
- [ ] Welcome screen does NOT reset onboarding step on mount
- [ ] Sign up flow progresses through all steps
- [ ] Login flow with existing wallet goes to correct step
- [ ] Login flow without wallet goes to import
- [ ] App reload mid-onboarding returns to correct step
- [ ] App reload after onboarding goes to tabs
- [ ] No welcome screen flash on app load
- [ ] KYC completion marks onboarding as complete
