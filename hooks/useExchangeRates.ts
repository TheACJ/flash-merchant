import ExchangeRateService from '@/services/ExchangeRateService';
import { ExchangeRate } from '@/services/FlashApiService';
import { useCallback, useEffect, useState } from 'react';

interface UseExchangeRatesReturn {
  // Data
  rates: ExchangeRate[];
  isLoading: boolean;
  error: string | null;

  // Actions
  refreshRates: () => Promise<void>;
  convertCurrency: (amount: number, fromCurrency: string, toCurrency: string) => Promise<number>;
  getExchangeRate: (targetCurrency: string, baseCurrency?: string) => Promise<ExchangeRate | null>;
  getAvailableCurrencies: () => Promise<string[]>;
  getCurrencyInfo: (currencyCode: string) => Promise<ExchangeRate | null>;

  // Cache management
  clearCache: () => Promise<void>;
  isCacheFresh: () => boolean;

  // Error handling
  clearError: () => void;
}

/**
 * useExchangeRates - Hook for accessing exchange rate data
 */
export default function useExchangeRates(): UseExchangeRatesReturn {
  const [rates, setRates] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const exchangeRateService = ExchangeRateService.getInstance();

  // Initialize and load exchange rates
  useEffect(() => {
    const initializeRates = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const fetchedRates = await exchangeRateService.getExchangeRates();
        setRates(fetchedRates);

        console.log('[useExchangeRates] Exchange rates loaded successfully');
      } catch (err) {
        console.error('[useExchangeRates] Failed to load exchange rates:', err);
        setError(err instanceof Error ? err.message : 'Failed to load exchange rates');
      } finally {
        setIsLoading(false);
      }
    };

    initializeRates();
  }, []);

  const refreshRates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const fetchedRates = await exchangeRateService.fetchExchangeRates();
      setRates(fetchedRates);

      console.log('[useExchangeRates] Exchange rates refreshed successfully');
    } catch (err) {
      console.error('[useExchangeRates] Failed to refresh exchange rates:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh exchange rates');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const convertCurrency = useCallback(async (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> => {
    try {
      return await exchangeRateService.convertCurrency(amount, fromCurrency, toCurrency);
    } catch (err) {
      console.error('[useExchangeRates] Currency conversion failed:', err);
      throw err;
    }
  }, []);

  const getExchangeRate = useCallback(async (
    targetCurrency: string,
    baseCurrency: string = 'USD'
  ): Promise<ExchangeRate | null> => {
    try {
      return await exchangeRateService.getExchangeRate(targetCurrency, baseCurrency);
    } catch (err) {
      console.error('[useExchangeRates] Failed to get exchange rate:', err);
      return null;
    }
  }, []);

  const getAvailableCurrencies = useCallback(async (): Promise<string[]> => {
    try {
      return await exchangeRateService.getAvailableCurrencies();
    } catch (err) {
      console.error('[useExchangeRates] Failed to get available currencies:', err);
      return [];
    }
  }, []);

  const getCurrencyInfo = useCallback(async (currencyCode: string): Promise<ExchangeRate | null> => {
    try {
      return await exchangeRateService.getCurrencyInfo(currencyCode);
    } catch (err) {
      console.error('[useExchangeRates] Failed to get currency info:', err);
      return null;
    }
  }, []);

  const clearCache = useCallback(async () => {
    try {
      await exchangeRateService.clearCache();
      setRates([]);
      console.log('[useExchangeRates] Cache cleared successfully');
    } catch (err) {
      console.error('[useExchangeRates] Failed to clear cache:', err);
    }
  }, []);

  const isCacheFresh = useCallback(() => {
    return exchangeRateService.isCacheFresh();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    rates,
    isLoading,
    error,
    refreshRates,
    convertCurrency,
    getExchangeRate,
    getAvailableCurrencies,
    getCurrencyInfo,
    clearCache,
    isCacheFresh,
    clearError
  };
}