# Wallet Generation Threading Implementation

This document explains the conditional wallet generation system that provides smooth UI performance during wallet creation.

## Overview

Wallet generation involves CPU-intensive cryptographic operations that can freeze the UI. This implementation provides two execution paths:

1. **Dev Build / Production**: Uses `react-native-threads` for true background threading with full npm package access
2. **Expo Go**: Falls back to yield-to-UI pattern (chunked processing)

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          WalletWorkletService                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Constructor: Detects environment & loads thread service            │   │
│  │  - getThreadingMethod() → 'threads' | 'worklets' | 'main-thread'    │   │
│  │  - Lazy loads WalletThreadService if available                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  createWalletAsync()                                                │   │
│  │  ├─ if threads available → createWalletsWithThread()               │   │
│  │  │   └─ WalletThreadService.generateWallets()                      │   │
│  │  │       └─ wallet.worker.js (separate JS process)                 │   │
│  │  └─ else → createWalletsWithYieldToUI()                            │   │
│  │      └─ Yields between each wallet creation                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Files

| File | Purpose |
|------|---------|
| [`services/WalletWorkletService.ts`](../services/WalletWorkletService.ts) | Main service with conditional execution |
| [`services/worklets/CapabilityDetection.ts`](../services/worklets/CapabilityDetection.ts) | Runtime environment detection |
| [`services/workers/WalletThreadService.ts`](../services/workers/WalletThreadService.ts) | Thread manager for background execution |
| [`services/workers/wallet.worker.js`](../services/workers/wallet.worker.js) | Worker script with full crypto library access |

## Execution Paths

### Path 1: Background Thread (Dev Builds / Production)

When `react-native-threads` is available:

```typescript
// WalletWorkletService.ts
if (this.threadingMethod === 'threads' && this.threadService) {
  return await this.createWalletsWithThread(entropy, mnemonic, now);
}
```

**Benefits:**
- Zero UI blocking
- Smooth navigation animations
- True parallel execution
- Full npm package access in worker

**Requirements:**
- `react-native-threads` installed
- Expo Development Client or bare React Native
- Native build required (not Expo Go)

### Path 2: Yield-to-UI Pattern (Expo Go)

When threads are not available:

```typescript
// WalletWorkletService.ts
private async yieldToUI(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

// Between each wallet creation:
await this.yieldToUI();
```

**Benefits:**
- Works in Expo Go
- No native dependencies
- Allows UI to update between operations

**Trade-offs:**
- Still runs on main thread
- Slightly slower overall
- UI may still stutter during heavy operations

## Environment Detection

```typescript
// services/worklets/CapabilityDetection.ts

export function getThreadingMethod(): 'threads' | 'worklets' | 'main-thread' {
  if (isExpoGo()) {
    return 'main-thread';
  }
  
  if (isThreadsAvailable()) {
    return 'threads';
  }
  
  if (isWorkletsAvailable()) {
    return 'worklets';
  }
  
  return 'main-thread';
}
```

## Installation

### For Expo Go (No additional setup needed)

The yield-to-UI pattern works automatically. No additional packages required.

### For Dev Builds (Background threading)

1. Install the package:
   ```bash
   npm install react-native-threads
   ```

2. The package is already configured in `package.json`. Rebuild the native app:
   ```bash
   npx expo prebuild
   npx expo run:android  # or run:ios
   ```

3. The thread service will be automatically enabled on next launch.

## Worker Implementation

The worker file [`wallet.worker.js`](../services/workers/wallet.worker.js) runs in a separate JavaScript process with full access to npm packages:

```javascript
// wallet.worker.js
const { Wallet } = require('ethers');
const { entropyToMnemonic, mnemonicToSeedSync } = require('@scure/bip39');
const { HDKey } = require('@scure/bip32');
// All crypto libraries work here!

self.onmessage = function(message) {
  const data = JSON.parse(message);
  
  if (data.type === 'generate') {
    // Generate all wallets without blocking main thread
    const wallets = generateAllWallets(data.entropy);
    self.postMessage(JSON.stringify({ type: 'result', wallets }));
  }
};
```

## Communication Protocol

```
Main Thread                          Worker Thread
    │                                     │
    │  ────── { type: 'generate' } ──────>│
    │                                     │
    │  <─── { type: 'progress', 25 } ────│
    │  <─── { type: 'progress', 50 } ────│
    │  <─── { type: 'progress', 75 } ────│
    │                                     │
    │  <──── { type: 'result' } ─────────│
    │                                     │
```

## Testing

### Test in Expo Go
```bash
npx expo start
# Use Expo Go app on device
```
Expected: Yield-to-UI pattern, slight UI stutter during generation

### Test in Dev Build
```bash
npx expo run:android
# or
npx expo run:ios
```
Expected: Background thread execution, smooth UI

## Debugging

Enable logging to see which path is used:

```
[WalletWorkletService] Using react-native-threads for background wallet generation
// or
[WalletWorkletService] Running in expo-go mode, using main thread with yield-to-UI
```

## Comparison: react-native-threads vs react-native-worklets-core

| Feature | react-native-threads | react-native-worklets-core |
|---------|---------------------|---------------------------|
| **Module Access** | ✅ Full npm package access | ❌ Limited (no npm packages) |
| **Thread Type** | Separate JS process | Same JS engine, different context |
| **Communication** | PostMessage (async) | JSI (fast, synchronous) |
| **Expo Compatible** | ⚠️ Requires dev client | ⚠️ Requires dev client |
| **Crypto Libraries** | ✅ Work out of the box | ❌ Need bundling/native |
| **Maintenance** | Less active | Active (margelo) |

**Why we chose react-native-threads:**
- Crypto libraries (`ethers`, `@scure/bip39`, `bitcoinjs-lib`) work out of the box
- Simpler mental model (like Web Workers)
- No need to bundle libraries for worklet context

## Troubleshooting

### Worker not loading
- Ensure `react-native-threads` is installed
- Rebuild native code: `npx expo prebuild && npx expo run:android`
- Check Metro bundler is including the worker file

### Still seeing UI freeze
- Check console logs to verify threading method
- If using Expo Go, UI freeze is expected (use yield-to-UI fallback)
- For dev builds, ensure native module is properly linked

### Import errors in worker
- The worker runs in a separate JS context
- All imports must use CommonJS `require()` syntax
- Check that all required packages are installed
