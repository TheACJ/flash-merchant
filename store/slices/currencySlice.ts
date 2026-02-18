import { STORAGE_KEYS } from '@/constants/storage';
import DynamicCurrencyService from '@/services/DynamicCurrencyService';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';

/**
 * Get the default currency from API or fallback to USD
 * This function fetches the first enabled currency from the API
 */
const getDefaultCurrency = async (): Promise<string> => {
  try {
    const currencyService = DynamicCurrencyService.getInstance();
    const currencies = await currencyService.getCurrencies();
    
    // Return the first enabled currency, or USD if none found
    if (currencies.length > 0) {
      return currencies[0].code;
    }
    
    // If no currencies from API, return USD as ultimate fallback
    console.warn('[currencySlice] No currencies from API, using USD fallback');
    return 'USD';
  } catch (error) {
    console.error('[currencySlice] Error getting default currency:', error);
    return 'USD';
  }
};

// Load preferred currency from storage
export const loadPreferredCurrency = createAsyncThunk('currency/load', async () => {
  try {
    const storedCurrency = await SecureStore.getItemAsync(STORAGE_KEYS.preferred_currency);
    
    if (storedCurrency) {
      return storedCurrency;
    }
    
    // No stored preference, get default from API
    return await getDefaultCurrency();
  } catch (error) {
    console.error('[currencySlice] Error loading preferred currency:', error);
    return await getDefaultCurrency();
  }
});

// Set preferred currency in storage
export const setPreferredCurrency = createAsyncThunk(
  'currency/set',
  async (currency: string) => {
    try {
      await SecureStore.setItemAsync(STORAGE_KEYS.preferred_currency, currency);
      return currency;
    } catch (error) {
      console.error('[currencySlice] Error setting preferred currency:', error);
      throw error;
    }
  }
);

interface CurrencyState {
  code: string;
  status: 'idle' | 'loading' | 'failed' | 'success';
}

const initialState: CurrencyState = {
  code: '', // Will be set from API
  status: 'idle',
};

const currencySlice = createSlice({
  name: 'currency',
  initialState,
  reducers: {
    setCurrency(state, action: PayloadAction<string>) {
      state.code = action.payload;
    },
    resetCurrency(state) {
      state.code = '';
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadPreferredCurrency.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadPreferredCurrency.fulfilled, (state, action) => {
        state.status = 'success';
        state.code = action.payload;
      })
      .addCase(loadPreferredCurrency.rejected, (state) => {
        state.status = 'failed';
        state.code = 'USD'; // Fallback only on rejection
      })
      .addCase(setPreferredCurrency.fulfilled, (state, action) => {
        state.code = action.payload;
      });
  },
});

export const { setCurrency, resetCurrency } = currencySlice.actions;
export default currencySlice.reducer;