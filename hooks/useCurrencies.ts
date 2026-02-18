import DynamicCurrencyService, { DynamicCurrency } from '@/services/DynamicCurrencyService';
import { useCallback, useEffect, useState } from 'react';

interface UseCurrenciesReturn {
  // Data
  currencies: DynamicCurrency[];
  isLoading: boolean;
  error: string | null;

  // Actions
  refreshCurrencies: () => Promise<void>;
  getCurrencyByCode: (code: string) => DynamicCurrency | undefined;
  getSymbol: (code: string) => Promise<string>;
  isCurrencySupported: (code: string) => Promise<boolean>;

  // Utilities
  clearError: () => void;
}

/**
 * useCurrencies - Hook for accessing currency data
 * 
 * Features:
 * - Fetches and caches currency list
 * - Provides currency lookup utilities
 * - Auto-loads on mount
 */
export default function useCurrencies(): UseCurrenciesReturn {
  const [currencies, setCurrencies] = useState<DynamicCurrency[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currencyService = DynamicCurrencyService.getInstance();

  // Load currencies on mount
  useEffect(() => {
    loadCurrencies();
  }, []);

  const loadCurrencies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const fetchedCurrencies = await currencyService.getCurrencies();
      setCurrencies(fetchedCurrencies);
    } catch (err) {
      console.error('[useCurrencies] Error loading currencies:', err);
      setError(err instanceof Error ? err.message : 'Failed to load currencies');
    } finally {
      setIsLoading(false);
    }
  }, [currencyService]);

  const refreshCurrencies = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const fetchedCurrencies = await currencyService.fetchCurrencies();
      setCurrencies(fetchedCurrencies);
    } catch (err) {
      console.error('[useCurrencies] Error refreshing currencies:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh currencies');
    } finally {
      setIsLoading(false);
    }
  }, [currencyService]);

  const getCurrencyByCode = useCallback((code: string): DynamicCurrency | undefined => {
    return currencies.find(currency => currency.code === code.toUpperCase());
  }, [currencies]);

  const getSymbol = useCallback(async (code: string): Promise<string> => {
    return await currencyService.getSymbol(code);
  }, [currencyService]);

  const isCurrencySupported = useCallback(async (code: string): Promise<boolean> => {
    return await currencyService.isCurrencySupported(code);
  }, [currencyService]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Data
    currencies,
    isLoading,
    error,

    // Actions
    refreshCurrencies,
    getCurrencyByCode,
    getSymbol,
    isCurrencySupported,

    // Utilities
    clearError
  };
}