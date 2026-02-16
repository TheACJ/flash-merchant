# MerchantApiService Usage Guide

## Installation

```bash
npm install axios
```

## Configuration

Add to your `.env` file:
```
EXPO_PUBLIC_API_URL=https://your-backend-url.com/api/agents
```

## Import

```typescript
import merchantApi from './services/MerchantApiService';
```

---

## Authentication Flow

### 1. Registration (Signup)

```typescript
// Step 1: Initiate registration (sends OTP)
const initiateRegistration = async () => {
  try {
    const response = await merchantApi.registerInitiate({
      phone_number: '+2348012345678',
      email: 'merchant@example.com',
      business_address: '123 Business St, Lagos'
    });
    
    if (response.success) {
      console.log('OTP sent to phone');
      // Navigate to OTP screen
    }
  } catch (error) {
    const err = merchantApi.handleError(error);
    console.error(err.error);
  }
};

// Step 2: Complete registration (verify OTP + submit wallet addresses)
const completeRegistration = async (otp: string, wallets: any) => {
  try {
    const response = await merchantApi.registerComplete({
      phone_number: '+2348012345678',
      otp: otp,
      wallet_addresses: {
        ethereum: wallets.ethereum.address,
        solana: wallets.solana.address,
        bitcoin: wallets.bitcoin.address,
        bnb: wallets.bnb.address
      }
    });
    
    if (response.success) {
      console.log('Registration complete, token saved');
      // Navigate to add tag screen
    }
  } catch (error) {
    const err = merchantApi.handleError(error);
    console.error(err.error);
  }
};
```

### 2. Login

```typescript
// Step 1: Initiate login (sends OTP)
const initiateLogin = async () => {
  try {
    const response = await merchantApi.loginInitiate({
      phone_number: '+2348012345678'
    });
    
    if (response.success) {
      console.log('OTP sent to phone');
      // Navigate to OTP screen
    }
  } catch (error) {
    const err = merchantApi.handleError(error);
    console.error(err.error);
  }
};

// Step 2: Complete login (verify OTP)
const completeLogin = async (otp: string) => {
  try {
    const response = await merchantApi.loginComplete({
      phone_number: '+2348012345678',
      otp: otp
    });
    
    if (response.success) {
      console.log('Login successful, token saved');
      // Navigate to home
    }
  } catch (error) {
    const err = merchantApi.handleError(error);
    console.error(err.error);
  }
};
```

---

## Onboarding

### Add Merchant Tag

```typescript
const addTag = async (tag: string) => {
  try {
    // First check if tag is available
    const checkResponse = await merchantApi.checkTagAvailability(tag);
    
    if (!checkResponse.data?.available) {
      console.log('Tag already taken');
      return;
    }
    
    // Add the tag
    const response = await merchantApi.addMerchantTag({ tag });
    
    if (response.success) {
      console.log('Tag added successfully');
      // Navigate to next step
    }
  } catch (error) {
    const err = merchantApi.handleError(error);
    console.error(err.error);
  }
};
```

### Add Bank Details

```typescript
const addBankDetails = async () => {
  try {
    const response = await merchantApi.addBankDetails({
      bank_name: 'GTBank',
      account_number: '0123456789',
      account_name: 'John Doe'
    });
    
    if (response.success) {
      console.log('Bank details added');
      // Navigate to next step
    }
  } catch (error) {
    const err = merchantApi.handleError(error);
    console.error(err.error);
  }
};
```

---

## Merchant Profile

### Get Profile

```typescript
const getProfile = async () => {
  try {
    const response = await merchantApi.getMerchantProfile();
    
    if (response.success) {
      console.log('Profile:', response.data);
      // Update Redux store
    }
  } catch (error) {
    const err = merchantApi.handleError(error);
    console.error(err.error);
  }
};
```

### Get Dashboard

```typescript
const getDashboard = async () => {
  try {
    const response = await merchantApi.getMerchantDashboard();
    
    if (response.success) {
      console.log('Dashboard data:', response.data);
      // Display stats, transactions, etc.
    }
  } catch (error) {
    const err = merchantApi.handleError(error);
    console.error(err.error);
  }
};
```

---

## Transactions

### Physical Withdrawal (Customer withdraws cash from merchant)

```typescript
const initiateWithdrawal = async () => {
  try {
    const response = await merchantApi.initiatePhysicalWithdrawal({
      amount: '5000',
      currency: 'NGN',
      customer_tag: '@customer123'
    });
    
    if (response.success) {
      console.log('Withdrawal initiated:', response.data);
      // Show QR code or transaction details
    }
  } catch (error) {
    const err = merchantApi.handleError(error);
    console.error(err.error);
  }
};
```

### Physical Deposit (Customer deposits cash to merchant)

```typescript
// Step 1: Initiate deposit
const initiateDeposit = async () => {
  try {
    const response = await merchantApi.initiatePhysicalDeposit({
      amount: '10000',
      currency: 'NGN',
      customer_tag: '@customer123'
    });
    
    if (response.success) {
      console.log('Deposit initiated:', response.data);
      const transactionId = response.data.transaction_id;
      // Merchant sends crypto, then confirms
    }
  } catch (error) {
    const err = merchantApi.handleError(error);
    console.error(err.error);
  }
};

// Step 2: Confirm deposit (after sending crypto)
const confirmDeposit = async (transactionId: string, txHash: string) => {
  try {
    const response = await merchantApi.confirmPhysicalDeposit({
      transaction_id: transactionId,
      tx_hash: txHash
    });
    
    if (response.success) {
      console.log('Deposit confirmed');
      // Show success message
    }
  } catch (error) {
    const err = merchantApi.handleError(error);
    console.error(err.error);
  }
};
```

### Get Transactions

```typescript
const getTransactions = async () => {
  try {
    const response = await merchantApi.getMerchantTransactions({
      page: 1,
      status: 'completed',
      type: 'deposit'
    });
    
    if (response.success) {
      console.log('Transactions:', response.data);
      // Display in list
    }
  } catch (error) {
    const err = merchantApi.handleError(error);
    console.error(err.error);
  }
};
```

---

## Staking

### Get Staking Status

```typescript
const getStakingStatus = async () => {
  try {
    const response = await merchantApi.getStakingStatus();
    
    if (response.success) {
      console.log('Staking info:', response.data);
      // Display staked amount, rewards, etc.
    }
  } catch (error) {
    const err = merchantApi.handleError(error);
    console.error(err.error);
  }
};
```

### Stake Tokens

```typescript
const stakeTokens = async () => {
  try {
    const response = await merchantApi.stakeTokens({
      amount: '1000',
      duration_days: 30
    });
    
    if (response.success) {
      console.log('Tokens staked successfully');
      // Show success message
    }
  } catch (error) {
    const err = merchantApi.handleError(error);
    console.error(err.error);
  }
};
```

---

## Integration Example: Complete Signup Flow

```typescript
// app/auth/create-wallet/index.tsx
import merchantApi from '../../../services/MerchantApiService';

const SignupScreen = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);

  // Step 1: Send registration request
  const handleCreateAccount = async () => {
    try {
      const response = await merchantApi.registerInitiate({
        phone_number: phoneNumber,
        email: email,
        business_address: address
      });
      
      if (response.success) {
        setStep(2); // Move to OTP screen
      } else {
        Alert.alert('Error', response.error || 'Registration failed');
      }
    } catch (error) {
      const err = merchantApi.handleError(error);
      Alert.alert('Error', err.error);
    }
  };

  // Step 2: Verify OTP and create wallets
  const handleVerifyOTP = async () => {
    try {
      // Create wallets first
      const wallets = await MerchantWalletService.createWallet();
      
      // Complete registration with wallet addresses
      const response = await merchantApi.registerComplete({
        phone_number: phoneNumber,
        otp: otp,
        wallet_addresses: {
          ethereum: wallets.ethereum.address,
          solana: wallets.solana.address,
          bitcoin: wallets.bitcoin.address,
          bnb: wallets.bnb.address
        }
      });
      
      if (response.success) {
        // Token is automatically saved by the service
        router.push('/auth/create-wallet/seed_phrase');
      } else {
        Alert.alert('Error', response.error || 'Verification failed');
      }
    } catch (error) {
      const err = merchantApi.handleError(error);
      Alert.alert('Error', err.error);
    }
  };

  // ... rest of component
};
```

---

## Error Handling

The service includes automatic error handling:

```typescript
try {
  const response = await merchantApi.someMethod();
  // Handle success
} catch (error) {
  const err = merchantApi.handleError(error);
  Alert.alert('Error', err.error);
}
```

---

## Authentication Token

The service automatically:
- ✅ Stores auth token in SecureStore
- ✅ Adds token to all authenticated requests
- ✅ Clears token on 401 errors
- ✅ Persists token across app restarts

---

## Notes

1. **Base URL**: Set `EXPO_PUBLIC_API_URL` in your `.env` file
2. **Token Storage**: Tokens are stored securely using `expo-secure-store`
3. **Auto-retry**: 401 errors automatically clear auth and redirect to login
4. **Timeout**: All requests timeout after 30 seconds
5. **Type Safety**: Full TypeScript support with exported types
