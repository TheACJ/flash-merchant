/**
 * DashboardCache - In-memory cache for merchant dashboard data
 * 
 * Provides synchronous getters for instant UI updates and
 * supports real-time updates via subscribers.
 * Auto-refreshes every 5 minutes globally.
 * 
 * IMPORTANT: This cache protects against empty/null data upserts during
 * network downtime or unavailable APIs to preserve existing valid data.
 */

import merchantApiService from './MerchantApiService';

export interface DashboardData {
    total_transactions_today: number;
    total_amount_today: number;
    pending_requests: number;
    available_liquidity: number;
    daily_limit_remaining: number;
    reputation_score: number;
    tier: string;
    recent_transactions: RecentTransaction[];
    lastUpdated: number;
}

export interface RecentTransaction {
    id: string;
    transaction_type: string;
    amount_fiat: number;
    currency: string;
    status: string;
    created_at: string;
    customer_tag?: string;
}

// Default empty dashboard data
const DEFAULT_DASHBOARD_DATA: Omit<DashboardData, 'lastUpdated'> = {
    total_transactions_today: 0,
    total_amount_today: 0,
    pending_requests: 0,
    available_liquidity: 0,
    daily_limit_remaining: 0,
    reputation_score: 0,
    tier: 'tier_1',
    recent_transactions: [],
};

class DashboardCache {
    private cache: DashboardData | null = null;
    private listeners: Set<(data: DashboardData | null) => void> = new Set();
    private isRefreshing: boolean = false;
    private refreshInterval: ReturnType<typeof setInterval> | null = null;
    private static instance: DashboardCache;

    // Cache validity period: 5 minutes
    private readonly CACHE_VALIDITY_MS = 5 * 60 * 1000;

    // Auto-refresh interval: 5 minutes
    private readonly AUTO_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

    static getInstance(): DashboardCache {
        if (!DashboardCache.instance) {
            DashboardCache.instance = new DashboardCache();
        }
        return DashboardCache.instance;
    }

    /**
     * Validates that dashboard data has meaningful values before caching
     * Returns true if the data is valid and should be cached
     */
    private isValidDashboardData(data: any): data is Omit<DashboardData, 'lastUpdated'> {
        if (!data) return false;
        // Check that we have at least some meaningful numeric data
        // At least one of these should be a valid number
        const hasValidTransactions = typeof data.total_transactions_today === 'number';
        const hasValidAmount = typeof data.total_amount_today === 'number';
        const hasValidPending = typeof data.pending_requests === 'number';
        const hasValidLiquidity = typeof data.available_liquidity === 'number';

        // Must have at least one valid numeric field
        if (!hasValidTransactions && !hasValidAmount && !hasValidPending && !hasValidLiquidity) {
            return false;
        }

        // Tier should be a non-empty string if present
        if (data.tier !== undefined && (typeof data.tier !== 'string' || data.tier.trim() === '')) {
            return false;
        }

        return true;
    }

    // --------------------------------------------------------------------------
    // Sync Getters - for instant UI access
    // --------------------------------------------------------------------------

    /**
     * Get dashboard data (sync, returns null if not cached or stale)
     */
    getDashboardSync(): DashboardData | null {
        if (!this.cache) {
            return null;
        }

        // Check if cache is stale
        if (Date.now() - this.cache.lastUpdated > this.CACHE_VALIDITY_MS) {
            // Cache is stale, trigger background refresh but still return stale data
            this.fetchDashboard();
            return this.cache;
        }

        return this.cache;
    }

    /**
     * Get dashboard data even if stale (for optimistic UI)
     */
    getDashboardEvenIfStale(): DashboardData | null {
        return this.cache;
    }

    /**
     * Check if cache has valid data
     */
    hasValidCache(): boolean {
        if (!this.cache) return false;
        return Date.now() - this.cache.lastUpdated <= this.CACHE_VALIDITY_MS;
    }

    /**
     * Check if currently refreshing
     */
    getIsRefreshing(): boolean {
        return this.isRefreshing;
    }

    // --------------------------------------------------------------------------
    // Setters - update cache and notify listeners
    // --------------------------------------------------------------------------

    /**
     * Set dashboard data and notify listeners
     * Only updates cache if the data is valid, preserving existing data during network issues
     */
    setDashboard(data: Omit<DashboardData, 'lastUpdated'>): void {
        // Validate before caching
        if (!this.isValidDashboardData(data)) {
            console.warn('[DashboardCache] Attempted to set invalid/empty dashboard data, preserving existing cache');
            return;
        }

        console.log('[DashboardCache] Setting dashboard data:', {
            transactions: data.total_transactions_today,
            amount: data.total_amount_today,
            pending: data.pending_requests,
        });

        this.cache = {
            ...data,
            lastUpdated: Date.now(),
        };

        this.notifyListeners();
    }

    /**
     * Clear cached dashboard data
     */
    clear(): void {
        console.log('[DashboardCache] Clearing cached dashboard data');
        this.cache = null;
        this.notifyListeners();
    }

    // --------------------------------------------------------------------------
    // Subscription Methods - for real-time updates
    // --------------------------------------------------------------------------

    /**
     * Subscribe to dashboard updates
     */
    subscribe(callback: (data: DashboardData | null) => void): () => void {
        this.listeners.add(callback);

        // Immediately call with current data if available
        if (this.cache) {
            callback(this.cache);
        }

        // Return unsubscribe function
        return () => {
            this.listeners.delete(callback);
        };
    }

    // --------------------------------------------------------------------------
    // Refresh Methods - orchestrate data fetching
    // --------------------------------------------------------------------------

    /**
     * Fetch and cache dashboard data from API
     */
    async fetchDashboard(): Promise<DashboardData | null> {
        // Don't fetch if already refreshing
        if (this.isRefreshing) {
            console.log('[DashboardCache] Already refreshing, skipping');
            return this.cache;
        }

        this.isRefreshing = true;

        try {
            console.log('[DashboardCache] Fetching dashboard data from API');

            const response = await merchantApiService.getMerchantDashboard();

            if (response && !response.error) {
                // Validate the response data before caching
                if (!this.isValidDashboardData(response)) {
                    console.warn('[DashboardCache] API returned invalid/empty data, preserving existing cache');
                    return this.cache;
                }

                const dashboardData: DashboardData = {
                    total_transactions_today: response.total_transactions_today ?? 0,
                    total_amount_today: response.total_amount_today ?? 0,
                    pending_requests: response.pending_requests ?? 0,
                    available_liquidity: response.available_liquidity ?? 0,
                    daily_limit_remaining: response.daily_limit_remaining ?? 0,
                    reputation_score: response.reputation_score ?? 0,
                    tier: response.tier ?? 'tier_1',
                    recent_transactions: response.recent_transactions ?? [],
                    lastUpdated: Date.now(),
                };

                this.cache = dashboardData;
                this.notifyListeners();

                console.log('[DashboardCache] Dashboard data updated successfully');
                return dashboardData;
            }

            console.error('[DashboardCache] API returned error:', response?.error);
            // Return existing cache on error, don't update with empty data
            return this.cache;
        } catch (error) {
            console.error('[DashboardCache] Error fetching dashboard:', error);
            // Return existing cache on error, don't update with empty data
            return this.cache;
        } finally {
            this.isRefreshing = false;
        }
    }

    /**
     * Force refresh dashboard data (ignores cache)
     */
    async forceRefresh(): Promise<DashboardData | null> {
        this.isRefreshing = false; // Reset to allow fetch
        return this.fetchDashboard();
    }

    // --------------------------------------------------------------------------
    // Auto-Refresh Methods - global background updates
    // --------------------------------------------------------------------------

    /**
     * Start auto-refresh interval (call once at app startup)
     */
    startAutoRefresh(): void {
        // Don't start if already running
        if (this.refreshInterval) {
            console.log('[DashboardCache] Auto-refresh already running');
            return;
        }

        console.log('[DashboardCache] Starting auto-refresh (every 5 minutes)');

        // Initial fetch
        this.fetchDashboard();

        // Set up interval for subsequent refreshes
        this.refreshInterval = setInterval(() => {
            console.log('[DashboardCache] Auto-refresh triggered');
            this.fetchDashboard();
        }, this.AUTO_REFRESH_INTERVAL_MS);
    }

    /**
     * Stop auto-refresh interval (call on logout)
     */
    stopAutoRefresh(): void {
        if (this.refreshInterval) {
            console.log('[DashboardCache] Stopping auto-refresh');
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    /**
     * Check if auto-refresh is running
     */
    isAutoRefreshRunning(): boolean {
        return this.refreshInterval !== null;
    }

    // --------------------------------------------------------------------------
    // Private Helpers
    // --------------------------------------------------------------------------

    private notifyListeners(): void {
        this.listeners.forEach(callback => {
            try {
                callback(this.cache);
            } catch (error) {
                console.error('[DashboardCache] Error in listener:', error);
            }
        });
    }

    // --------------------------------------------------------------------------
    // Debug Methods
    // --------------------------------------------------------------------------

    /**
     * Get cache stats for debugging
     */
    getStats(): { hasCache: boolean; lastUpdated: number | null; ageMs: number | null; isStale: boolean } {
        const hasCache = this.cache !== null;
        const lastUpdated = this.cache?.lastUpdated ?? null;
        const ageMs = lastUpdated ? Date.now() - lastUpdated : null;
        const isStale = ageMs !== null ? ageMs > this.CACHE_VALIDITY_MS : true;

        return {
            hasCache,
            lastUpdated,
            ageMs,
            isStale,
        };
    }

    /**
     * Log cache state for debugging
     */
    logState(): void {
        const stats = this.getStats();
        console.log('[DashboardCache] Cache State:', {
            hasCache: stats.hasCache,
            lastUpdated: stats.lastUpdated
                ? new Date(stats.lastUpdated).toISOString()
                : 'N/A',
            ageMs: stats.ageMs ? `${Math.round(stats.ageMs / 1000)}s` : 'N/A',
            isStale: stats.isStale,
            isRefreshing: this.isRefreshing,
            autoRefreshRunning: this.isAutoRefreshRunning(),
        });
    }
}

export const dashboardCache = DashboardCache.getInstance();
