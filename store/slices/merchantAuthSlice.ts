import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface MerchantProfile {
  // Identity
  normalizedTag: string;
  name: string;
  businessName: string;
  email: string;
  phoneNumber: string;
  description: string | null;
  agentId: string;

  // Security & Status
  tier: string;
  isVerified: boolean;
  verifiedAt: string | null;
  kycStatus?: 'pending' | 'verified' | 'rejected'; // Keep for backwards compatibility if needed
  reputationScore: string;
  verificationScore: string;
  status: string;

  // Financials
  dailyLimit: string;
  transactionLimit: string;
  availableFiatLiquidity: string;
  ratePercentage: string;
  flashFeePercent: number;

  // Activity
  reviewCount: number;
  totalTrades: number;
  completedTrades: number;

  // Location
  location: {
    address: string;
    state: string;
    latitude: number;
    longitude: number;
  };

  // Complex Data (placeholder types, can be refined as needed)
  bankDetails: any;
  orderLimit: any;
  stakeAsset: any;
  paymentMethods: any[];
}

interface MerchantAuthState {
  isAuthenticated: boolean;
  isLocked: boolean;
  merchantProfile: MerchantProfile | null;
  sessionToken: string | null;
}

const initialState: MerchantAuthState = {
  isAuthenticated: false,
  isLocked: false,
  merchantProfile: null,
  sessionToken: null,
};

const merchantAuthSlice = createSlice({
  name: 'merchantAuth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setLocked: (state, action: PayloadAction<boolean>) => {
      state.isLocked = action.payload;
    },
    setMerchantProfile: (state, action: PayloadAction<MerchantProfile | null>) => {
      state.merchantProfile = action.payload;
    },
    setSessionToken: (state, action: PayloadAction<string | null>) => {
      state.sessionToken = action.payload;
    },
    logout: () => initialState,
  },
});

export const {
  setAuthenticated,
  setLocked,
  setMerchantProfile,
  setSessionToken,
  logout,
} = merchantAuthSlice.actions;

export default merchantAuthSlice.reducer;
