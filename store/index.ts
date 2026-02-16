import { configureStore } from '@reduxjs/toolkit';
import merchantWalletReducer from './slices/merchantWalletSlice';
import merchantAuthReducer from './slices/merchantAuthSlice';

export const store = configureStore({
  reducer: {
    merchantWallet: merchantWalletReducer,
    merchantAuth: merchantAuthReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
