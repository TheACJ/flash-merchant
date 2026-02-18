import ExchangeRateService from './ExchangeRateService';
import FlashApiService from './FlashApiService';
import { priceCache } from './PriceCache';

const REFRESH_INTERVAL = 15 * 1000; // 15 seconds

console.log('[PriceOrchestrator] Module loaded');

/**
 * PriceOrchestrator - Coordinates price and exchange rate fetching
 * 
 * Responsibilities:
 * - Initialize price cache on app launch
 * - Periodic refresh to keep prices up-to-date
 * - Manage exchange rate updates
 * - Fetch asset list dynamically from API (no hardcoded assets)
 */
class PriceOrchestrator {
  private isInitialized: boolean = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private assetIds: string[] = [];

  /**
   * Initialize on app launch - fetches asset list from API
   */
  async initialize(): Promise<void> {
    console.log('[PriceOrchestrator] initialize() called, isInitialized:', this.isInitialized);
    if (this.isInitialized) {
      console.log('[PriceOrchestrator] Already initialized, skipping');
      return;
    }

    console.log('[PriceOrchestrator] Starting initialization...');

    try {
      // Fetch asset list from API
      console.log('[PriceOrchestrator] Fetching asset list from API...');
      const assetsResponse = await FlashApiService.getAssets();
      
      if (assetsResponse.success && assetsResponse.data) {
        // Extract asset IDs from API response
        this.assetIds = assetsResponse.data.assets.map(asset => asset.id);
        console.log('[PriceOrchestrator] Fetched asset IDs from API:', this.assetIds);
        
        // Fetch initial prices for all assets
        console.log('[PriceOrchestrator] Refreshing prices for', this.assetIds.length, 'assets');
        await this.refreshPrices(this.assetIds);
      } else {
        console.error('[PriceOrchestrator] Failed to fetch asset list:', assetsResponse.error);
        throw new Error(assetsResponse.error || 'Failed to fetch asset list');
      }
      
      // Fetch exchange rates
      await this.refreshExchangeRates();
      
      this.isInitialized = true;
      console.log('[PriceOrchestrator] Initialization complete');
    } catch (error) {
      console.error('[PriceOrchestrator] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get the list of asset IDs fetched from API
   */
  getAssetIds(): string[] {
    return this.assetIds;
  }

  /**
   * Refresh prices for given assets
   */
  async refreshPrices(assetIds: string[]): Promise<void> {
    console.log('[PriceOrchestrator] refreshPrices called for:', assetIds);
    for (const id of assetIds) {
      try {
        console.log(`[PriceOrchestrator] Fetching price for: ${id}`);
        const response = await FlashApiService.getPrices(id, 'usd');
        console.log(`[PriceOrchestrator] Price response for ${id}:`, response.success ? 'SUCCESS' : 'FAILED');
        if (response.success && response.data) {
          priceCache.setPrice(id, {
            usd: parseFloat(response.data.price) || 0,
            usd24hChange: parseFloat(response.data.price_24h_change) || 0,
            cachedAt: Date.now(),
          });
          console.log(`[PriceOrchestrator] Price cached for ${id}:`, parseFloat(response.data.price));
        }
      } catch (error) {
        console.error(`[PriceOrchestrator] Failed to refresh price for ${id}:`, error);
      }
    }
    console.log('[PriceOrchestrator] refreshPrices complete');
  }

  /**
   * Refresh exchange rates - fetches all rates from API
   */
  async refreshExchangeRates(): Promise<void> {
    try {
      const exchangeService = ExchangeRateService.getInstance();
      const rates = await exchangeService.getExchangeRates();
      
      // Cache all exchange rates
      for (const rate of rates) {
        if (rate.target_currency !== 'USD') {
          priceCache.setExchangeRate('USD', rate.target_currency, parseFloat(rate.rate));
        }
      }
      console.log('[PriceOrchestrator] Cached', rates.length, 'exchange rates');
    } catch (error) {
      console.error('[PriceOrchestrator] Failed to refresh exchange rates:', error);
    }
  }

  /**
   * Start periodic refresh
   */
  startPeriodicRefresh(): void {
    if (this.timer) return;

    this.timer = setInterval(async () => {
      if (this.assetIds.length > 0) {
        await this.refreshPrices(this.assetIds);
        await this.refreshExchangeRates();
        console.log('[PriceOrchestrator] Periodic refresh complete for', this.assetIds.length, 'assets');
      }
    }, REFRESH_INTERVAL);
  }

  /**
   * Stop periodic refresh
   */
  stopPeriodicRefresh(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Check if orchestrator is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Clear cache and reset
   */
  reset(): void {
    priceCache.clear();
    this.isInitialized = false;
    this.stopPeriodicRefresh();
  }
}

export const priceOrchestrator = new PriceOrchestrator();