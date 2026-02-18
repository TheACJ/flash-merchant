import { assetInfoCache } from './AssetInfoCache';
import FlashApiService from './FlashApiService';

const PREFETCH_INTERVAL = 5 * 60 * 1000; // 5 minutes

console.log('[AssetInfoOrchestrator] Module loaded');

/**
 * AssetInfoOrchestrator - Coordinates asset information fetching and caching
 * 
 * Responsibilities:
 * - Initialize asset cache on app launch
 * - Periodic prefetch to keep cache fresh
 * - Manage asset data lifecycle
 * - Fetch asset list dynamically from API (no hardcoded assets)
 */
class AssetInfoOrchestrator {
  private isInitialized: boolean = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private assetIds: string[] = [];

  /**
   * Initialize on app launch - fetches asset list from API
   */
  async initialize(): Promise<void> {
    console.log('[AssetInfoOrchestrator] initialize() called, isInitialized:', this.isInitialized);
    if (this.isInitialized) {
      console.log('[AssetInfoOrchestrator] Already initialized, skipping');
      return;
    }

    console.log('[AssetInfoOrchestrator] Starting initialization...');

    try {
      // Fetch asset list from API
      console.log('[AssetInfoOrchestrator] Fetching asset list from API...');
      const assetsResponse = await FlashApiService.getAssets();
      
      if (assetsResponse.success && assetsResponse.data) {
        // Extract asset IDs from API response
        this.assetIds = assetsResponse.data.assets.map(asset => asset.id);
        console.log('[AssetInfoOrchestrator] Fetched asset IDs from API:', this.assetIds);
        
        // Cache each asset's info
        for (const asset of assetsResponse.data.assets) {
          assetInfoCache.setAsset(asset);
        }
        
        // Also fetch detailed info for all assets
        const assets = await assetInfoCache.getAssets(this.assetIds);
        console.log('[AssetInfoOrchestrator] Cached', assets.size, 'assets');
      } else {
        console.error('[AssetInfoOrchestrator] Failed to fetch asset list:', assetsResponse.error);
        throw new Error(assetsResponse.error || 'Failed to fetch asset list');
      }
      
      this.isInitialized = true;
      console.log('[AssetInfoOrchestrator] Initialization complete');
    } catch (error) {
      console.error('[AssetInfoOrchestrator] Initialization failed:', error);
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
   * Periodic prefetch to keep cache fresh
   */
  startPeriodicPrefetch(): void {
    if (this.timer) return;

    this.timer = setInterval(() => {
      if (this.assetIds.length > 0) {
        assetInfoCache.prefetch(this.assetIds);
        console.log('[AssetInfoOrchestrator] Periodic prefetch complete for', this.assetIds.length, 'assets');
      }
    }, PREFETCH_INTERVAL);
  }

  /**
   * Stop periodic prefetch
   */
  stopPeriodicPrefetch(): void {
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
   * Fetch specific assets
   */
  async fetchAssets(assetIds: string[]): Promise<void> {
    try {
      console.log('[AssetInfoOrchestrator] Fetching specific assets:', assetIds);
      await assetInfoCache.getAssets(assetIds);
    } catch (error) {
      console.error('[AssetInfoOrchestrator] Failed to fetch assets:', error);
    }
  }

  /**
   * Clear cache and reset
   */
  reset(): void {
    assetInfoCache.clear();
    this.isInitialized = false;
    this.stopPeriodicPrefetch();
  }
}

export const assetInfoOrchestrator = new AssetInfoOrchestrator();