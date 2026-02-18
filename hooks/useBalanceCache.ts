import { balanceCache, BalanceData } from '@/services/BalanceCache';
import { WalletBalanceBreakdownItem } from '@/services/FlashApiService';
import { RootState } from '@/store';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

interface UseBalanceCacheOptions {
  walletId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseBalanceCacheReturn {
  // Data
  data: BalanceData[];
  totalBalance: number;
  breakdown: WalletBalanceBreakdownItem[];
  lastUpdated: number | null;

  // State
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Actions
  refresh: () => Promise<void>;
  forceRefresh: () => Promise<void>;
}

/**
 * useBalanceCache - Hook for accessing balance data with cache-first loading
 * 
 * Features:
 * - Sync access to cached balance data
 * - No skeleton on cache hit
 * - Automatic background refresh when cache is stale
 * - Real-time updates via subscription
 */
export function useBalanceCache(options: UseBalanceCacheOptions = {}): UseBalanceCacheReturn {
  const {
    walletId,
    autoRefresh = false,
    refreshInterval = 30000
  } = options;

  // Redux state
  const wallets = useSelector((state: RootState) => state.merchantWallet.wallets);

  // Local state
  const [data, setData] = useState<BalanceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // Refs for tracking state
  const hasInitiallyLoaded = useRef(false);
  const refreshTimeoutRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeWalletId = useRef<string | null>(null);

  // --------------------------------------------------------------------------
  // Load from cache first (instant)
  // --------------------------------------------------------------------------
  useEffect(() => {
    let cachedData: BalanceData[];

    if (walletId) {
      const walletData = balanceCache.getBalanceSync(walletId);
      cachedData = walletData ? [walletData] : [];
      activeWalletId.current = walletId;
    } else {
      cachedData = balanceCache.getAllBalances();
      activeWalletId.current = null;
    }

    if (cachedData.length > 0) {
      setData(cachedData);
      const latest = cachedData.reduce((max, item) =>
        item.lastUpdated > max ? item.lastUpdated : max, 0
      );
      setLastUpdated(latest);
      hasInitiallyLoaded.current = true;
      setIsLoading(false);
      console.log(`[useBalanceCache] Loaded ${cachedData.length} balances from cache`);
    }
  }, [walletId]);

  // --------------------------------------------------------------------------
  // Subscribe to cache updates
  // --------------------------------------------------------------------------
  useEffect(() => {
    const unsubscribe = balanceCache.subscribeToAllBalances((newData) => {
      let filteredData = newData;

      if (walletId) {
        filteredData = newData.filter(item => item.walletId === walletId);
      }

      if (filteredData.length > 0) {
        setData(filteredData);
        const latest = filteredData.reduce((max, item) =>
          item.lastUpdated > max ? item.lastUpdated : max, 0
        );
        setLastUpdated(latest);
        hasInitiallyLoaded.current = true;
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, [walletId]);

  // --------------------------------------------------------------------------
  // Initial data fetch (if cache is empty)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (hasInitiallyLoaded.current) return;
    if (wallets.length === 0) return;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log('[useBalanceCache] Fetching initial balances from API');
        await balanceCache.fetchBalances(
          wallets.map(w => ({ id: w.id, address: w.address, type: w.type }))
        );
      } catch (e: any) {
        console.error('[useBalanceCache] Error fetching balances:', e);
        setError(e.message || 'Failed to fetch balances');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [wallets.length]);

  // --------------------------------------------------------------------------
  // Manual refresh
  // --------------------------------------------------------------------------
  const refresh = useCallback(async () => {
    if (wallets.length === 0) return;

    setIsRefreshing(true);
    setError(null);

    try {
      console.log('[useBalanceCache] Refreshing balances');
      await balanceCache.fetchBalances(
        wallets.map(w => ({ id: w.id, address: w.address, type: w.type }))
      );
    } catch (e: any) {
      console.error('[useBalanceCache] Error refreshing balances:', e);
      setError(e.message || 'Failed to refresh balances');
    } finally {
      setIsRefreshing(false);
    }
  }, [wallets]);

  const forceRefresh = useCallback(async () => {
    balanceCache.clear();
    hasInitiallyLoaded.current = false;
    await refresh();
  }, [refresh]);

  // --------------------------------------------------------------------------
  // Auto refresh
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!autoRefresh) return;

    refreshTimeoutRef.current = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => {
      if (refreshTimeoutRef.current) {
        clearInterval(refreshTimeoutRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, refresh]);

  // --------------------------------------------------------------------------
  // Computed values
  // --------------------------------------------------------------------------
  const totalBalance = useMemo(() => {
    return data.reduce((sum, item) => sum + (item.totalFiat || 0), 0);
  }, [data]);

  const breakdown = useMemo(() => {
    return data.flatMap(item => item.breakdown || []);
  }, [data]);

  // --------------------------------------------------------------------------
  // Return
  // --------------------------------------------------------------------------
  return {
    data,
    totalBalance,
    breakdown,
    lastUpdated,
    isLoading: isLoading && !hasInitiallyLoaded.current,
    isRefreshing,
    error,
    refresh,
    forceRefresh,
  };
}

/**
 * Hook for getting balance for a specific wallet
 */
export function useWalletBalance(walletId: string) {
  return useBalanceCache({ walletId });
}

/**
 * Hook for getting total balance across all wallets
 */
export function useTotalBalance() {
  return useBalanceCache();
}

/**
 * Hook for getting balance with auto-refresh
 */
export function useAutoRefreshBalance(options?: Omit<UseBalanceCacheOptions, 'autoRefresh'>) {
  return useBalanceCache({ ...options, autoRefresh: true, refreshInterval: 60000 });
}

export default useBalanceCache;