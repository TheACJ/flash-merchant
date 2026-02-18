import { assetInfoOrchestrator } from './AssetInfoOrchestrator';
import { priceOrchestrator } from './PriceOrchestrator';

/**
 * GlobalCacheOrchestrator - Coordinates all cache and orchestrator services
 */
class GlobalCacheOrchestrator {
  private isInitialized: boolean = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[GlobalCacheOrchestrator] Already initialized, skipping');
      return;
    }

    console.log('[GlobalCacheOrchestrator] Starting initialization...');

    try {
      await Promise.all([
        assetInfoOrchestrator.initialize(),
        priceOrchestrator.initialize(),
      ]);

      assetInfoOrchestrator.startPeriodicPrefetch();
      priceOrchestrator.startPeriodicRefresh();

      this.isInitialized = true;
      console.log('[GlobalCacheOrchestrator] Initialization complete');
    } catch (error) {
      console.error('[GlobalCacheOrchestrator] Initialization failed:', error);
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  stop(): void {
    assetInfoOrchestrator.stopPeriodicPrefetch();
    priceOrchestrator.stopPeriodicRefresh();
    console.log('[GlobalCacheOrchestrator] Stopped all periodic refreshes');
  }

  reset(): void {
    assetInfoOrchestrator.reset();
    priceOrchestrator.reset();
    this.isInitialized = false;
    console.log('[GlobalCacheOrchestrator] Reset all caches');
  }
}

export const globalCacheOrchestrator = new GlobalCacheOrchestrator();