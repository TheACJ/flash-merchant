import { dashboardCache, DashboardData } from '@/services/DashboardCache';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseDashboardCacheOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
}

interface UseDashboardCacheReturn {
    // Data
    data: DashboardData | null;
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
 * useDashboardCache - Hook for accessing dashboard data with cache-first loading
 * 
 * Features:
 * - Sync access to cached dashboard data
 * - No skeleton on cache hit
 * - Automatic background refresh when cache is stale
 * - Real-time updates via subscription
 * - Global auto-refresh every 5 minutes (handled by DashboardCache)
 */
export function useDashboardCache(options: UseDashboardCacheOptions = {}): UseDashboardCacheReturn {
    const {
        autoRefresh = false,
        refreshInterval = 300000, // 5 minutes default
    } = options;

    // Local state
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<number | null>(null);

    // Refs for tracking state
    const hasInitiallyLoaded = useRef(false);
    const refreshTimeoutRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // --------------------------------------------------------------------------
    // Load from cache first (instant)
    // --------------------------------------------------------------------------
    useEffect(() => {
        const cachedData = dashboardCache.getDashboardSync();

        if (cachedData) {
            setData(cachedData);
            setLastUpdated(cachedData.lastUpdated);
            hasInitiallyLoaded.current = true;
            setIsLoading(false);
            console.log('[useDashboardCache] Loaded dashboard data from cache');
        }
    }, []);

    // --------------------------------------------------------------------------
    // Subscribe to cache updates
    // --------------------------------------------------------------------------
    useEffect(() => {
        const unsubscribe = dashboardCache.subscribe((newData) => {
            if (newData) {
                setData(newData);
                setLastUpdated(newData.lastUpdated);
                hasInitiallyLoaded.current = true;
                setIsLoading(false);
            }
        });

        return unsubscribe;
    }, []);

    // --------------------------------------------------------------------------
    // Initial data fetch (if cache is empty)
    // --------------------------------------------------------------------------
    useEffect(() => {
        if (hasInitiallyLoaded.current) return;

        const loadData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                console.log('[useDashboardCache] Fetching initial dashboard data from API');
                await dashboardCache.fetchDashboard();
            } catch (e: any) {
                console.error('[useDashboardCache] Error fetching dashboard:', e);
                setError(e.message || 'Failed to fetch dashboard data');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    // --------------------------------------------------------------------------
    // Manual refresh
    // --------------------------------------------------------------------------
    const refresh = useCallback(async () => {
        setIsRefreshing(true);
        setError(null);

        try {
            console.log('[useDashboardCache] Refreshing dashboard data');
            await dashboardCache.fetchDashboard();
        } catch (e: any) {
            console.error('[useDashboardCache] Error refreshing dashboard:', e);
            setError(e.message || 'Failed to refresh dashboard data');
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    const forceRefresh = useCallback(async () => {
        setIsRefreshing(true);
        setError(null);

        try {
            console.log('[useDashboardCache] Force refreshing dashboard data');
            await dashboardCache.forceRefresh();
        } catch (e: any) {
            console.error('[useDashboardCache] Error force refreshing dashboard:', e);
            setError(e.message || 'Failed to refresh dashboard data');
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    // --------------------------------------------------------------------------
    // Auto refresh (additional to global auto-refresh)
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
    // Return
    // --------------------------------------------------------------------------
    return {
        data,
        lastUpdated,
        isLoading: isLoading && !hasInitiallyLoaded.current,
        isRefreshing,
        error,
        refresh,
        forceRefresh,
    };
}

/**
 * Hook for getting dashboard summary stats
 */
export function useDashboardSummary() {
    const { data, isLoading, isRefreshing, error, refresh } = useDashboardCache();

    const summary = {
        totalTransactionsToday: data?.total_transactions_today ?? 0,
        totalAmountToday: data?.total_amount_today ?? 0,
        pendingRequests: data?.pending_requests ?? 0,
        availableLiquidity: data?.available_liquidity ?? 0,
        dailyLimitRemaining: data?.daily_limit_remaining ?? 0,
        reputationScore: data?.reputation_score ?? 0,
        tier: data?.tier ?? 'tier_1',
        recentTransactions: data?.recent_transactions ?? [],
    };

    return {
        summary,
        isLoading,
        isRefreshing,
        error,
        refresh,
    };
}

export default useDashboardCache;
