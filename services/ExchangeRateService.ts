import * as SecureStore from 'expo-secure-store';
import FlashApiService, { ExchangeRate } from './FlashApiService';

const CACHE_KEY = 'merchant_exchange_rates_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * ExchangeRateService - Service for managing exchange rates
 * 
 * Features:
 * - Fetches exchange rates from FlashAPI
 * - Caches rates for offline access
 * - Provides currency conversion utilities
 * 
 * IMPORTANT: This cache protects against empty/null data upserts during
 * network downtime or unavailable APIs to preserve existing valid data.
 */
export default class ExchangeRateService {
  private static instance: ExchangeRateService;
  private rates: ExchangeRate[] = [];
  private lastFetched: number = 0;

  static getInstance(): ExchangeRateService {
    if (!ExchangeRateService.instance) {
      ExchangeRateService.instance = new ExchangeRateService();
    }
    return ExchangeRateService.instance;
  }

  /**
   * Validates that an exchange rate has meaningful data
   * Returns true if the rate is valid
   */
  private isValidExchangeRate(rate: any): rate is ExchangeRate {
    if (!rate) return false;
    if (!rate.base_currency || rate.base_currency.trim() === '') return false;
    if (!rate.target_currency || rate.target_currency.trim() === '') return false;
    if (!rate.rate) return false;
    const rateNum = parseFloat(rate.rate);
    if (isNaN(rateNum) || rateNum <= 0) return false;
    return true;
  }

  /**
   * Validates that an array of exchange rates has meaningful data
   * Returns true if the array is valid and has at least one valid rate
   */
  private isValidRatesArray(rates: any[] | null | undefined): rates is ExchangeRate[] {
    if (!rates) return false;
    if (!Array.isArray(rates)) return false;
    if (rates.length === 0) return false;
    // At least some rates should be valid
    const validCount = rates.filter(r => this.isValidExchangeRate(r)).length;
    return validCount > 0;
  }

  /**
   * Fetch exchange rates from FlashAPI
   * Preserves existing cache if API returns empty/error during network issues
   */
  async fetchExchangeRates(): Promise<ExchangeRate[]> {
    try {
      console.log('[ExchangeRateService] Fetching exchange rates from FlashAPI');

      const response = await FlashApiService.getExchangeRates();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch exchange rates');
      }

      // Handle the response format
      let rates: ExchangeRate[];
      const data = response.data as any;

      if (data.rates && Array.isArray(data.rates)) {
        rates = data.rates;
      } else if (Array.isArray(data)) {
        rates = data;
      } else if (data.base_currency && data.target_currency) {
        rates = [data];
      } else {
        console.error('[ExchangeRateService] Unexpected response format:', data);
        throw new Error('Invalid exchange rates response format');
      }

      // Validate rates before caching
      if (!this.isValidRatesArray(rates)) {
        console.warn('[ExchangeRateService] API returned invalid/empty rates, preserving existing cache');
        // Return existing rates if available
        if (this.rates.length > 0) {
          return this.rates;
        }
        throw new Error('Invalid exchange rates data');
      }

      // Filter to only valid rates
      const validRates = rates.filter(r => this.isValidExchangeRate(r));

      // Cache the result
      this.rates = validRates;
      this.lastFetched = Date.now();

      await this.saveToCache(validRates);

      console.log(`[ExchangeRateService] Fetched ${validRates.length} exchange rates`);
      return validRates;
    } catch (error) {
      console.error('[ExchangeRateService] Error fetching exchange rates:', error);

      // Try to load from cache as fallback
      const cached = await this.loadFromCache();
      if (cached && this.isValidRatesArray(cached.rates)) {
        console.log('[ExchangeRateService] Using cached exchange rates as fallback');
        this.rates = cached.rates;
        this.lastFetched = cached.timestamp;
        return cached.rates;
      }

      // Return existing in-memory rates if available
      if (this.rates.length > 0) {
        console.log('[ExchangeRateService] Using existing in-memory rates as fallback');
        return this.rates;
      }

      throw error;
    }
  }

  /**
   * Get exchange rates (from cache if fresh, otherwise fetch)
   */
  async getExchangeRates(): Promise<ExchangeRate[]> {
    const now = Date.now();
    const cacheAge = now - this.lastFetched;

    // If we have cached data and it's fresh, return it
    if (this.rates.length > 0 && cacheAge < CACHE_DURATION) {
      return this.rates;
    }

    // Try to load from persistent cache
    const cached = await this.loadFromCache();
    if (cached && (now - (cached.timestamp || 0)) < CACHE_DURATION) {
      this.rates = cached.rates;
      this.lastFetched = cached.timestamp || now;
      return this.rates;
    }

    // Fetch fresh data
    return this.fetchExchangeRates();
  }

  /**
   * Get exchange rate for specific currency pair
   */
  async getExchangeRate(targetCurrency: string, baseCurrency: string = 'USD'): Promise<ExchangeRate | null> {
    const rates = await this.getExchangeRates();
    const found = rates.find(rate =>
      rate.base_currency === baseCurrency &&
      rate.target_currency === targetCurrency
    ) || null;

    if (found) {
      console.log(`[ExchangeRateService] Rate for ${baseCurrency} to ${targetCurrency}: ${found.rate}`);
    } else {
      console.warn(`[ExchangeRateService] NO rate found for ${baseCurrency} to ${targetCurrency}`);
    }

    return found;
  }

  /**
   * Convert amount from one currency to another
   */
  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    // If converting from USD, use direct rate
    if (fromCurrency === 'USD') {
      const rate = await this.getExchangeRate(toCurrency, 'USD');
      if (rate) {
        return amount * parseFloat(rate.rate);
      }
    }

    // If converting to USD, use inverse rate
    if (toCurrency === 'USD') {
      const rate = await this.getExchangeRate(fromCurrency, 'USD');
      if (rate) {
        return amount * rate.inverse_rate;
      }
    }

    // For cross-currency conversion, convert through USD
    const fromRate = await this.getExchangeRate(fromCurrency, 'USD');
    const toRate = await this.getExchangeRate(toCurrency, 'USD');

    if (fromRate && toRate) {
      // Convert to USD first, then to target currency
      const usdAmount = amount * fromRate.inverse_rate;
      return usdAmount * parseFloat(toRate.rate);
    }

    throw new Error(`Exchange rate not available for ${fromCurrency} to ${toCurrency}`);
  }

  /**
   * Get all available target currencies
   */
  async getAvailableCurrencies(): Promise<string[]> {
    const rates = await this.getExchangeRates();
    return rates.map(rate => rate.target_currency);
  }

  /**
   * Get currency info by code
   */
  async getCurrencyInfo(currencyCode: string): Promise<ExchangeRate | null> {
    return this.getExchangeRate(currencyCode, 'USD');
  }

  /**
   * Save exchange rates to cache
   */
  private async saveToCache(rates: ExchangeRate[]): Promise<void> {
    try {
      const cacheData = {
        rates,
        timestamp: Date.now()
      };
      await SecureStore.setItemAsync(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('[ExchangeRateService] Failed to save cache:', error);
    }
  }

  /**
   * Load exchange rates from cache
   */
  private async loadFromCache(): Promise<{ rates: ExchangeRate[], timestamp: number } | null> {
    try {
      const cached = await SecureStore.getItemAsync(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.rates && Array.isArray(parsed.rates) && parsed.timestamp) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn('[ExchangeRateService] Failed to load cache:', error);
    }
    return null;
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(CACHE_KEY);
      this.rates = [];
      this.lastFetched = 0;
    } catch (error) {
      console.warn('[ExchangeRateService] Failed to clear cache:', error);
    }
  }

  /**
   * Check if cache is fresh
   */
  isCacheFresh(): boolean {
    return this.rates.length > 0 && (Date.now() - this.lastFetched) < CACHE_DURATION;
  }
}