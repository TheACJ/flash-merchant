import FlashApiService, { Asset } from './FlashApiService';

export interface AssetInfo extends Asset {
  cachedAt: number;
}

/**
 * AssetInfoCache - In-memory cache for asset information
 * 
 * Provides synchronous getters for instant UI updates and
 * supports real-time updates via subscribers.
 */
class AssetInfoCache {
  private cache: Map<string, AssetInfo> = new Map();
  private listeners: Set<(id: string) => void> = new Set();
  private static instance: AssetInfoCache;
  private isInitialized: boolean = false;

  static getInstance(): AssetInfoCache {
    if (!AssetInfoCache.instance) {
      AssetInfoCache.instance = new AssetInfoCache();
    }
    return AssetInfoCache.instance;
  }

  /**
   * Synchronous getter - returns what's in memory cache immediately
   */
  getAssetSync(id: string): AssetInfo | null {
    const cached = this.cache.get(id);
    if (cached && Date.now() - cached.cachedAt < 24 * 60 * 60 * 1000) {
      return cached;
    }
    return null;
  }

  /**
   * Synchronous getter for multiple assets
   */
  getAssetsSync(ids: string[]): Map<string, AssetInfo> {
    const result = new Map<string, AssetInfo>();
    for (const id of ids) {
      const cached = this.cache.get(id);
      if (cached && Date.now() - cached.cachedAt < 24 * 60 * 60 * 1000) {
        result.set(id, cached);
      }
    }
    return result;
  }

  /**
   * Async getter - fetches from API if not cached
   */
  async getAsset(id: string): Promise<AssetInfo | null> {
    // Check memory cache first (synchronous)
    const cached = this.cache.get(id);
    if (cached && Date.now() - cached.cachedAt < 24 * 60 * 60 * 1000) {
      console.log(`[AssetInfoCache] Memory cache hit for ${id}`);
      return cached;
    }

    console.log(`[AssetInfoCache] Memory cache miss for ${id}, fetching from API...`);

    // Fetch from API
    try {
      const response = await FlashApiService.getAsset(id);
      if (response.success && response.data) {
        const assetInfo: AssetInfo = {
          ...response.data,
          cachedAt: Date.now()
        };
        this.cache.set(id, assetInfo);
        this.listeners.forEach(listener => listener(id));
        this.isInitialized = true;
        return assetInfo;
      }
    } catch (error) {
      console.error(`[AssetInfoCache] Failed to get asset ${id}:`, error);
      return cached || null;
    }

    return null;
  }

  /**
   * Get multiple assets
   */
  async getAssets(ids: string[]): Promise<Map<string, AssetInfo>> {
    console.log(`[AssetInfoCache] getAssets called for:`, ids);
    const result = new Map<string, AssetInfo>();
    await Promise.all(
      ids.map(async (id) => {
        const asset = await this.getAsset(id);
        if (asset) {
          result.set(id, asset);
        }
      })
    );
    console.log(`[AssetInfoCache] getAssets complete: ${result.size}/${ids.length} assets`);
    return result;
  }

  /**
   * Set asset directly in cache
   */
  setAsset(asset: Asset): void {
    const assetInfo: AssetInfo = {
      ...asset,
      cachedAt: Date.now()
    };
    this.cache.set(asset.id, assetInfo);
    this.listeners.forEach(listener => listener(asset.id));
  }

  /**
   * Check if cache has any data
   */
  hasData(): boolean {
    return this.cache.size > 0;
  }

  /**
   * Get all cached asset IDs
   */
  getCachedIds(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Subscribe to asset updates
   */
  subscribe(listener: (id: string) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Prefetch assets
   */
  prefetch(ids: string[]): void {
    ids.forEach(id => this.getAsset(id));
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Check if initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

export const assetInfoCache = AssetInfoCache.getInstance();