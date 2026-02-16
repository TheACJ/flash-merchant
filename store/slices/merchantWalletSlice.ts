import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type NetworkType = 'mainnet' | 'testnet' | 'sepolia';
export type WalletType = 'ethereum' | 'bitcoin' | 'solana' | 'bnb';

export interface Wallet {
  id: string;
  address: string;
  publicKey: string;
  type: WalletType;
  network: NetworkType;
  balance: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

interface MerchantWalletState {
  wallets: Wallet[];
  selectedWalletId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: MerchantWalletState = {
  wallets: [],
  selectedWalletId: null,
  isLoading: false,
  error: null,
};

const merchantWalletSlice = createSlice({
  name: 'merchantWallet',
  initialState,
  reducers: {
    addWallet: (state, action: PayloadAction<Wallet>) => {
      const existing = state.wallets.find(w => w.id === action.payload.id);
      if (existing) {
        Object.assign(existing, action.payload, { updatedAt: Date.now() });
        return;
      }
      state.wallets.push(action.payload);
      if (!state.selectedWalletId) state.selectedWalletId = action.payload.id;
    },
    setSelectedWallet: (state, action: PayloadAction<string>) => {
      state.selectedWalletId = action.payload;
    },
    updateWalletBalance: (state, action: PayloadAction<{ id: string; balance: string }>) => {
      const wallet = state.wallets.find(w => w.id === action.payload.id);
      if (wallet) {
        wallet.balance = action.payload.balance;
        wallet.updatedAt = Date.now();
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearWallets: () => initialState,
  },
});

export const {
  addWallet,
  setSelectedWallet,
  updateWalletBalance,
  setLoading,
  setError,
  clearWallets,
} = merchantWalletSlice.actions;

export default merchantWalletSlice.reducer;
