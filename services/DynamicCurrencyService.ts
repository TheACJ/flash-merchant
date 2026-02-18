import * as SecureStore from 'expo-secure-store';
import FlashApiService from './FlashApiService';

const CACHE_KEY = 'merchant_dynamic_currencies_cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface DynamicCurrency {
  code: string;
  name: string;
  symbol: string;
  countryCode: string;
  countryFlag: string;
  countryName: string;
  decimalPlaces: number;
  isCrypto: boolean;
  enabled: boolean;
  intlCurrency?: string;
  region: string;
}

/**
 * DynamicCurrencyService - Service for managing fiat currencies
 * 
 * Features:
 * - Fetches currencies from FlashAPI
 * - Caches currencies for offline access
 * - Provides currency lookup utilities
 */
export default class DynamicCurrencyService {
  private static instance: DynamicCurrencyService;
  private currencies: DynamicCurrency[] = [];
  private lastFetched: number = 0;

  static getInstance(): DynamicCurrencyService {
    if (!DynamicCurrencyService.instance) {
      DynamicCurrencyService.instance = new DynamicCurrencyService();
    }
    return DynamicCurrencyService.instance;
  }

  /**
   * Fetch currencies from FlashAPI
   */
  async fetchCurrencies(): Promise<DynamicCurrency[]> {
    try {
      console.log('[DynamicCurrencyService] Fetching currencies from API');

      const response = await FlashApiService.getCurrencies();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch currencies');
      }

      // Transform API response to our format
      const currenciesArray = (response.data as any).results || response.data;
      const transformedCurrencies: DynamicCurrency[] = currenciesArray.map((apiCurrency: any) => ({
        code: apiCurrency.currency_code,
        name: apiCurrency.currency_name,
        symbol: apiCurrency.symbol,
        countryCode: apiCurrency.country_code,
        countryFlag: apiCurrency.country_flag,
        countryName: apiCurrency.country_name,
        decimalPlaces: apiCurrency.decimal_places,
        isCrypto: apiCurrency.is_crypto,
        enabled: apiCurrency.enabled,
        intlCurrency: apiCurrency.currency_code,
        region: this.getRegionFromCountryCode(apiCurrency.country_code)
      }));

      // Filter only enabled currencies
      const enabledCurrencies = transformedCurrencies.filter(currency => currency.enabled);

      // Cache the result
      this.currencies = enabledCurrencies;
      this.lastFetched = Date.now();

      await this.saveToCache(enabledCurrencies);

      console.log(`[DynamicCurrencyService] Fetched ${enabledCurrencies.length} currencies`);
      return enabledCurrencies;
    } catch (error) {
      console.error('[DynamicCurrencyService] Error fetching currencies:', error);

      // Try to load from cache as fallback
      const cached = await this.loadFromCache();
      if (cached) {
        console.log('[DynamicCurrencyService] Using cached currencies as fallback');
        this.currencies = cached.currencies;
        this.lastFetched = cached.timestamp;
        return cached.currencies;
      }

      throw error;
    }
  }

  /**
   * Get currencies (from cache if fresh, otherwise fetch)
   */
  async getCurrencies(): Promise<DynamicCurrency[]> {
    const now = Date.now();
    const cacheAge = now - this.lastFetched;

    // If we have cached data and it's fresh, return it
    if (this.currencies.length > 0 && cacheAge < CACHE_DURATION) {
      return this.currencies;
    }

    // Try to load from persistent cache
    const cached = await this.loadFromCache();
    if (cached && (now - (cached.timestamp || 0)) < CACHE_DURATION) {
      this.currencies = cached.currencies;
      this.lastFetched = cached.timestamp || now;
      return this.currencies;
    }

    // Fetch fresh data
    return this.fetchCurrencies();
  }

  /**
   * Get currency by code
   */
  async getCurrencyByCode(code: string): Promise<DynamicCurrency | undefined> {
    const currencies = await this.getCurrencies();
    return currencies.find(currency => currency.code === code.toUpperCase());
  }

  /**
   * Get symbol for currency code
   */
  async getSymbol(code: string): Promise<string> {
    const currency = await this.getCurrencyByCode(code);
    return currency?.symbol || code;
  }

  /**
   * Check if currency is supported
   */
  async isCurrencySupported(code: string): Promise<boolean> {
    const currency = await this.getCurrencyByCode(code);
    return !!currency;
  }

  /**
   * Get region from country code
   */
  private getRegionFromCountryCode(countryCode: string): string {
    const regionMap: Record<string, string> = {
      'BR': 'South America',
      'EU': 'Europe',
      'GB': 'Europe',
      'GH': 'Africa',
      'JP': 'Asia',
      'NG': 'Africa',
      'US': 'North America',
    };
    return regionMap[countryCode] || 'Global';
  }

  /**
   * Save currencies to cache
   */
  private async saveToCache(currencies: DynamicCurrency[]): Promise<void> {
    try {
      const cacheData = {
        currencies,
        timestamp: Date.now()
      };
      await SecureStore.setItemAsync(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('[DynamicCurrencyService] Failed to save cache:', error);
    }
  }

  /**
   * Load currencies from cache
   */
  private async loadFromCache(): Promise<{ currencies: DynamicCurrency[], timestamp: number } | null> {
    try {
      const cached = await SecureStore.getItemAsync(CACHE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (error) {
      console.warn('[DynamicCurrencyService] Failed to load cache:', error);
    }
    return null;
  }

  /**
   * Clear cache
   */
  async clearCache(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(CACHE_KEY);
      this.currencies = [];
      this.lastFetched = 0;
    } catch (error) {
      console.warn('[DynamicCurrencyService] Failed to clear cache:', error);
    }
  }
}