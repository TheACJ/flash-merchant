import { AssetInfo, assetInfoCache } from '@/services/AssetInfoCache';
import { priceCache } from '@/services/PriceCache';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface AssetWithPrice extends AssetInfo {
  price?: number;
  price24hChange?: number;
}

// Timeout for initial load (5 seconds)
const LOAD_TIMEOUT = 5000;

/**
 * useAssetCache - Hook for accessing asset data with cache-first loading
 * 
 * Features:
 * - Sync access to cached asset data
 * - No skeleton on cache hit
 * - Automatic background refresh when cache is stale
 * - Real-time updates via subscription
 */
export function useAssetCache(assetIds: string[]) {
  // Use ref for persistent data across re-renders
  const assetsRef = useRef<Map<string, AssetWithPrice>>(new Map());
  const [assetsArray, setAssetsArray] = useState<AssetWithPrice[]>([]);
  const hasLoaded = useRef(false);
  const prevAssetIdsRef = useRef<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutFired = useRef(false);
  const fetchInProgress = useRef(false);

  // Initialize from cache synchronously on first call
  useEffect(() => {
    const idsString = assetIds.join(',');
    if (prevAssetIdsRef.current === idsString) {
      return;
    }
    prevAssetIdsRef.current = idsString;

    console.log('[useAssetCache] New assetIds detected:', idsString);

    // Step 1: Load from memory cache IMMEDIATELY (synchronous)
    const loadFromMemoryCache = () => {
      const assetMap = assetInfoCache.getAssetsSync(assetIds);
      const result = new Map<string, AssetWithPrice>();

      assetMap.forEach((asset, id) => {
        const priceData = priceCache.getPrice(id);
        result.set(id, {
          ...asset,
          price: priceData?.usd,
          price24hChange: priceData?.usd24hChange,
        });
      });

      return result;
    };

    const cachedData = loadFromMemoryCache();
    console.log(`[useAssetCache] Memory cache loaded: ${cachedData.size} assets`);

    if (cachedData.size > 0) {
      assetsRef.current = cachedData;
      hasLoaded.current = true;
      // Deduplicate by ID before setting state
      const uniqueArray = Array.from(cachedData.values()).filter((asset, index, self) =>
        index === self.findIndex(a => a.id === asset.id)
      );
      setAssetsArray(uniqueArray);
    } else {
      setAssetsArray([]);
      setIsInitialLoad(true);
    }

    // Step 2: Async load/update from full cache in background
    const loadFromFullCache = async () => {
      if (fetchInProgress.current) {
        return;
      }
      fetchInProgress.current = true;

      try {
        const assetMap = await assetInfoCache.getAssets(assetIds);
        const result = new Map<string, AssetWithPrice>();

        assetMap.forEach((asset, id) => {
          const priceData = priceCache.getPrice(id);
          result.set(id, {
            ...asset,
            price: priceData?.usd,
            price24hChange: priceData?.usd24hChange,
          });
        });

        if (result.size > 0) {
          assetsRef.current = result;
          hasLoaded.current = true;
          setIsInitialLoad(false);
          // Deduplicate by ID before setting state
          const uniqueArray = Array.from(result.values()).filter((asset, index, self) =>
            index === self.findIndex(a => a.id === asset.id)
          );
          setAssetsArray(uniqueArray);
          setError(null);
        }
      } catch (err) {
        console.error('[useAssetCache] Failed to load from full cache:', err);
        setError(err instanceof Error ? err.message : 'Failed to load assets');
        setIsInitialLoad(false);
      } finally {
        fetchInProgress.current = false;
      }
    };

    loadFromFullCache();

    // Timeout to stop showing skeleton if API is slow
    const timeoutId = setTimeout(() => {
      timeoutFired.current = true;
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }, LOAD_TIMEOUT);

    // Subscribe to price updates
    const unsubscribePrice = priceCache.subscribeToPrice((id: string) => {
      let hasUpdates = false;
      for (const [existingId, asset] of assetsRef.current) {
        const priceData = priceCache.getPrice(existingId);
        if (priceData) {
          const newPrice = priceData?.usd;
          const newChange = priceData?.usd24hChange;

          if (asset.price !== newPrice || asset.price24hChange !== newChange) {
            assetsRef.current.set(existingId, {
              ...asset,
              price: newPrice,
              price24hChange: newChange,
            });
            hasUpdates = true;
          }
        }
      }

      if (hasUpdates) {
        setAssetsArray(Array.from(assetsRef.current.values()));
      }
    });

    // Sync prices immediately on mount
    const syncPricesFromCache = () => {
      let hasUpdates = false;
      for (const [id, asset] of assetsRef.current) {
        const priceData = priceCache.getPrice(id);
        if (priceData) {
          const newPrice = priceData?.usd;
          const newChange = priceData?.usd24hChange;

          if (asset.price !== newPrice || asset.price24hChange !== newChange) {
            assetsRef.current.set(id, {
              ...asset,
              price: newPrice,
              price24hChange: newChange,
            });
            hasUpdates = true;
          }
        }
      }

      if (hasUpdates) {
        setAssetsArray(Array.from(assetsRef.current.values()));
      }
    };

    syncPricesFromCache();

    return () => {
      clearTimeout(timeoutId);
      unsubscribePrice();
    };
  }, [assetIds.join(',')]);

  const isLoading = isInitialLoad && assetsArray.length === 0;

  // Function to refresh data in background
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const assetMap = await assetInfoCache.getAssets(assetIds);
      const result = new Map<string, AssetWithPrice>();

      assetMap.forEach((asset, id) => {
        const priceData = priceCache.getPrice(id);
        result.set(id, {
          ...asset,
          price: priceData?.usd,
          price24hChange: priceData?.usd24hChange,
        });
      });

      if (result.size > 0) {
        assetsRef.current = result;
        hasLoaded.current = true;
        setIsInitialLoad(false);
        // Deduplicate by ID before setting state
        const uniqueArray = Array.from(result.values()).filter((asset, index, self) =>
          index === self.findIndex(a => a.id === asset.id)
        );
        setAssetsArray(uniqueArray);
        setError(null);
      }
    } catch (err) {
      console.error('[useAssetCache] Failed to refresh assets:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh assets');
    } finally {
      setIsRefreshing(false);
    }
  }, [assetIds.join(',')]);

  return {
    assets: assetsArray,
    isLoading,
    isRefreshing,
    refresh,
    error,
  };
}

export default useAssetCache;