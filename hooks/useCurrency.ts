import { RootState } from '@/store';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import useCurrencies from './useCurrencies';

/**
 * usePreferredCurrency - Hook for accessing the user's preferred currency
 * 
 * Currency code comes from Redux state which is loaded from API.
 * No hardcoded default - if no currency is set, returns empty string
 * and components should show loading state.
 */
export const usePreferredCurrency = () => {
  const code = useSelector((s: RootState) => s.currency?.code) as string;
  const { getCurrencyByCode, currencies, isLoading } = useCurrencies();

  const formatCurrency = useCallback((amount: number) => {
    if (!code) return `${amount.toFixed(2)}`;
    
    const currency = getCurrencyByCode(code);
    const symbol = currency?.symbol || code;
    const decimals = currency?.decimalPlaces || 2;
    
    return `${symbol}${amount.toFixed(decimals)}`;
  }, [code, getCurrencyByCode]);

  const formatCurrencyWithCode = useCallback((amount: number) => {
    if (!code) return `${amount.toFixed(2)}`;
    
    const currency = getCurrencyByCode(code);
    const symbol = currency?.symbol || code;
    const decimals = currency?.decimalPlaces || 2;
    
    return `${symbol}${amount.toFixed(decimals)} ${code}`;
  }, [code, getCurrencyByCode]);

  const getCurrencyInfo = useCallback(() => {
    if (!code) return undefined;
    return getCurrencyByCode(code);
  }, [getCurrencyByCode, code]);

  return {
    code,
    formatCurrency,
    formatCurrencyWithCode,
    getCurrencyInfo,
    isLoading: isLoading || !code,
    currencies,
  } as const;
};

export default usePreferredCurrency;