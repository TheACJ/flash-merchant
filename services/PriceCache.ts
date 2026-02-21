/**
 * PriceCache - In-memory cache for price and exchange rate data
 * 
 * Provides synchronous getters for instant UI updates and
 * supports real-time updates via subscribers.
 * 
 * IMPORTANT: This cache protects against empty/null data upserts during
 * network downtime or unavailable APIs to preserve existing valid data.
 */

interface PriceData {
  usd: number;
  usd24hChange: number;
  cachedAt: number;
}

class PriceCache {
  private prices: Map<string, PriceData> = new Map();
  private exchangeRates: Map<string, number> = new Map();
  private priceListeners: Set<(id: string) => void> = new Set();
  private rateListeners: Set<(from: string, to: string) => void> = new Set();
  private static instance: PriceCache;

  static getInstance(): PriceCache {
    if (!PriceCache.instance) {
      PriceCache.instance = new PriceCache();
    }
    return PriceCache.instance;
  }

  /**
   * Validates that price data has meaningful values before caching
   * Returns true if the data is valid and should be cached
   */
  private isValidPriceData(data: PriceData | null | undefined): data is PriceData {
    if (!data) return false;
    // usd should be a valid non-negative number
    if (typeof data.usd !== 'number' || isNaN(data.usd) || data.usd < 0) return false;
    // usd24hChange should be a valid number (can be negative)
    if (typeof data.usd24hChange !== 'number' || isNaN(data.usd24hChange)) return false;
    return true;
  }

  /**
   * Validates that an exchange rate has a meaningful value before caching
   * Returns true if the rate is valid and should be cached
   */
  private isValidExchangeRate(rate: number | null | undefined): rate is number {
    if (rate === null || rate === undefined) return false;
    if (typeof rate !== 'number' || isNaN(rate)) return false;
    // Exchange rate should be positive
    if (rate <= 0) return false;
    return true;
  }

  /**
   * Get price for an asset
   */
  getPrice(id: string): PriceData | null {
    const price = this.prices.get(id);
    console.log(`[PriceCache] getPrice(${id}):`, price ? `${price.usd}` : 'null');
    return price || null;
  }

  /**
   * Set price for an asset
   * Only updates cache if the data is valid, preserving existing data during network issues
   */
  setPrice(id: string, data: PriceData): void {
    // Validate before caching
    if (!this.isValidPriceData(data)) {
      console.warn(`[PriceCache] Attempted to set invalid/empty price data for ${id}, preserving existing cache`);
      return;
    }

    const existing = this.prices.get(id);
    this.prices.set(id, { ...data, cachedAt: Date.now() });
    console.log(`[PriceCache] setPrice(${id}): ${data.usd}`);

    // Notify listeners if value changed
    if (!existing || existing.usd !== data.usd) {
      console.log(`[PriceCache] Notifying listeners for ${id}`);
      this.priceListeners.forEach(listener => listener(id));
    }
  }

  /**
   * Get exchange rate between two currencies
   */
  getExchangeRate(from: string, to: string): number | null {
    const key = `${from}_${to}`;
    return this.exchangeRates.get(key) || null;
  }

  /**
   * Set exchange rate between two currencies
   * Only updates cache if the rate is valid, preserving existing data during network issues
   */
  setExchangeRate(from: string, to: string, rate: number): void {
    // Validate before caching
    if (!this.isValidExchangeRate(rate)) {
      console.warn(`[PriceCache] Attempted to set invalid exchange rate for ${from}_${to}, preserving existing cache`);
      return;
    }

    const key = `${from}_${to}`;
    const existing = this.exchangeRates.get(key);
    this.exchangeRates.set(key, rate);

    if (existing !== rate) {
      this.rateListeners.forEach(listener => listener(from, to));
    }
  }

  /**
   * Subscribe to price updates
   */
  subscribeToPrice(listener: (id: string) => void): () => void {
    this.priceListeners.add(listener);
    return () => {
      this.priceListeners.delete(listener);
    };
  }

  /**
   * Subscribe to exchange rate updates
   */
  subscribeToRate(listener: (from: string, to: string) => void): () => void {
    this.rateListeners.add(listener);
    return () => {
      this.rateListeners.delete(listener);
    };
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.prices.clear();
    this.exchangeRates.clear();
  }

  /**
   * Convert USD amount to target currency using cached exchange rates
   * @param usdAmount Amount in USD
   * @param targetCurrency Target currency code (e.g., 'USD', 'EUR', 'NGN')
   * @returns Converted amount, or original USD amount if conversion not available
   */
  async convertFromUsd(usdAmount: number, targetCurrency: string): Promise<number> {
    const target = targetCurrency.toUpperCase();

    // If target is USD, no conversion needed
    if (target === 'USD') {
      return usdAmount;
    }

    // Get exchange rate from cache
    const rate = this.getExchangeRate('USD', target);
    if (rate) {
      return usdAmount * rate;
    }

    // Fallback: return USD amount (exchange rate not cached)
    console.warn(`[PriceCache] Exchange rate USD->${target} not available, returning USD amount`);
    return usdAmount;
  }

  /**
   * Get all cached prices
   */
  getAllPrices(): Map<string, PriceData> {
    return new Map(this.prices);
  }

  /**
   * Get all cached exchange rates
   */
  getAllExchangeRates(): Map<string, number> {
    return new Map(this.exchangeRates);
  }

  /**
   * Check if cache has price for an asset
   */
  hasPrice(id: string): boolean {
    return this.prices.has(id);
  }

  /**
   * Check if cache has exchange rate
   */
  hasExchangeRate(from: string, to: string): boolean {
    return this.exchangeRates.has(`${from}_${to}`);
  }
}

export const priceCache = PriceCache.getInstance();