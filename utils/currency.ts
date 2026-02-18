import ExchangeRateService from '@/services/ExchangeRateService';
import { priceCache } from '@/services/PriceCache';

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number,
  currencyCode: string = 'USD',
  decimals: number = 2
): string {
  const code = currencyCode.toUpperCase();
  
  // Currency symbols map
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    NGN: '₦',
    JPY: '¥',
    BTC: '₿',
    ETH: 'Ξ',
  };
  
  const symbol = symbols[code] || code;
  
  // Format with thousand separators
  const formatted = amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return `${symbol}${formatted}`;
}

/**
 * Format a number as currency with code
 */
export function formatCurrencyWithCode(
  amount: number,
  currencyCode: string = 'USD',
  decimals: number = 2
): string {
  const formatted = formatCurrency(amount, currencyCode, decimals);
  return `${formatted} ${currencyCode.toUpperCase()}`;
}

/**
 * Convert USD amount to target currency
 */
export async function convertFromUsd(
  usdAmount: number,
  targetCurrency: string
): Promise<number> {
  const target = targetCurrency.toUpperCase();
  
  if (target === 'USD') {
    return usdAmount;
  }
  
  // Try price cache first
  const cachedRate = priceCache.getExchangeRate('USD', target);
  if (cachedRate) {
    return usdAmount * cachedRate;
  }
  
  // Fallback to exchange rate service
  const exchangeService = ExchangeRateService.getInstance();
  const rate = await exchangeService.getExchangeRate(target, 'USD');
  
  if (rate) {
    return usdAmount * parseFloat(rate.rate);
  }
  
  console.warn(`[currencyUtils] No exchange rate found for USD->${target}`);
  return usdAmount;
}

/**
 * Convert amount from one currency to another
 */
export async function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): Promise<number> {
  if (fromCurrency.toUpperCase() === toCurrency.toUpperCase()) {
    return amount;
  }
  
  const exchangeService = ExchangeRateService.getInstance();
  return exchangeService.convertCurrency(amount, fromCurrency, toCurrency);
}

/**
 * Parse a currency string to number
 */
export function parseCurrency(value: string): number {
  // Remove currency symbols and whitespace
  const cleaned = value.replace(/[^0-9.-]/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currencyCode: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    NGN: '₦',
    JPY: '¥',
    BTC: '₿',
    ETH: 'Ξ',
  };
  
  return symbols[currencyCode.toUpperCase()] || currencyCode;
}

/**
 * Check if a string is a valid currency code
 */
export function isValidCurrencyCode(code: string): boolean {
  const validCodes = ['USD', 'EUR', 'GBP', 'NGN', 'JPY', 'BTC', 'ETH', 'SOL', 'BNB', 'USDT'];
  return validCodes.includes(code.toUpperCase());
}