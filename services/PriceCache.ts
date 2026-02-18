/**
 * PriceCache - In-memory cache for price and exchange rate data
 * 
 * Provides synchronous getters for instant UI updates and
 * supports real-time updates via subscribers.
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
   * Get price for an asset
   */
  getPrice(id: string): PriceData | null {
    const price = this.prices.get(id);
    console.log(`[PriceCache] getPrice(${id}):`, price ? `${price.usd}` : 'null');
    return price || null;
  }

  /**
   * Set price for an asset
   */
  setPrice(id: string, data: PriceData): void {
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
   */
  setExchangeRate(from: string, to: string, rate: number): void {
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