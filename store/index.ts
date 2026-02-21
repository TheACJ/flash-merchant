import { configureStore } from '@reduxjs/toolkit';
import currencyReducer from './slices/currencySlice';
import deviceReducer from './slices/deviceSlice';
import locationReducer from './slices/locationSlice';
import merchantAuthReducer from './slices/merchantAuthSlice';
import merchantWalletReducer from './slices/merchantWalletSlice';

export const store = configureStore({
  reducer: {
    merchantWallet: merchantWalletReducer,
    merchantAuth: merchantAuthReducer,
    currency: currencyReducer,
    location: locationReducer,
    device: deviceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
