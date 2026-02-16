import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MerchantProfile {
  id: string;
  tag: string;
  businessName: string;
  email: string;
  phone: string;
  address: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
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
