import { configureStore } from '@reduxjs/toolkit';
import currencyReducer from './slices/currencySlice';
import merchantAuthReducer from './slices/merchantAuthSlice';
import merchantWalletReducer from './slices/merchantWalletSlice';

export const store = configureStore({
  reducer: {
    merchantWallet: merchantWalletReducer,
    merchantAuth: merchantAuthReducer,
    currency: currencyReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
