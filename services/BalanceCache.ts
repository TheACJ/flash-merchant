/**
 * BalanceCache - In-memory cache for wallet balance data
 * 
 * Provides synchronous getters for instant UI updates and
 * supports real-time updates via subscribers.
 */

import FlashApiService, { WalletBalanceBreakdownItem } from './FlashApiService';

export interface BalanceData {
  walletId: string;
  totalFiat: number;
  breakdown: WalletBalanceBreakdownItem[];
  lastUpdated: number;
  snapshotAt?: string;
}

class BalanceCache {
  private cache: Map<string, BalanceData> = new Map();
  private walletListeners: Map<string, Set<(data: BalanceData | null) => void>> = new Map();
  private allBalancesListeners: Set<(data: BalanceData[]) => void> = new Set();
  private isRefreshing: Map<string, boolean> = new Map();
  private static instance: BalanceCache;

  static getInstance(): BalanceCache {
    if (!BalanceCache.instance) {
      BalanceCache.instance = new BalanceCache();
    }
    return BalanceCache.instance;
  }

  // --------------------------------------------------------------------------
  // Sync Getters - for instant UI access
  // --------------------------------------------------------------------------

  /**
   * Get balance for a specific wallet (sync, returns null if not cached)
   */
  getBalanceSync(walletId: string): BalanceData | null {
    const data = this.cache.get(walletId);

    // Check if cache is stale (older than 5 minutes)
    if (data) {
      const FIVE_MINUTES = 5 * 60 * 1000;
      if (Date.now() - data.lastUpdated > FIVE_MINUTES) {
        // Cache is stale, return null to trigger refresh
        return null;
      }
    }

    return data || null;
  }

  /**
   * Get all cached balances
   */
  getAllBalances(): BalanceData[] {
    return Array.from(this.cache.values());
  }

  /**
   * Get total balance across all wallets
   */
  getTotalBalanceSync(): number {
    return Array.from(this.cache.values()).reduce(
      (sum, data) => sum + (data.totalFiat || 0),
      0
    );
  }

  /**
   * Get breakdown for a specific wallet
   */
  getBreakdownSync(walletId: string): WalletBalanceBreakdownItem[] {
    const data = this.cache.get(walletId);
    return data?.breakdown || [];
  }

  /**
   * Check if wallet has cached balance
   */
  hasWallet(walletId: string): boolean {
    return this.cache.has(walletId);
  }

  // --------------------------------------------------------------------------
  // Setters - update cache and notify listeners
  // --------------------------------------------------------------------------

  /**
   * Set balance for a wallet and notify listeners
   */
  setBalance(walletId: string, data: BalanceData): void {
    console.log(`[BalanceCache] Setting balance for ${walletId}: $${data.totalFiat.toFixed(2)}`);

    this.cache.set(walletId, {
      ...data,
      lastUpdated: Date.now(),
    });

    // Notify wallet-specific listeners
    this.notifyWalletListeners(walletId, data);

    // Notify all-balances listeners
    this.notifyAllBalancesListeners();
  }

  /**
   * Delete balance for a wallet
   */
  deleteBalance(walletId: string): void {
    this.cache.delete(walletId);
    this.notifyWalletListeners(walletId, null);
    this.notifyAllBalancesListeners();
  }

  /**
   * Clear all cached balances
   */
  clear(): void {
    console.log('[BalanceCache] Clearing all cached balances');
    this.cache.clear();
    this.notifyAllBalancesListeners();
  }

  // --------------------------------------------------------------------------
  // Subscription Methods - for real-time updates
  // --------------------------------------------------------------------------

  /**
   * Subscribe to balance updates for a specific wallet
   */
  subscribeToWallet(walletId: string, callback: (data: BalanceData | null) => void): () => void {
    if (!this.walletListeners.has(walletId)) {
      this.walletListeners.set(walletId, new Set());
    }

    this.walletListeners.get(walletId)!.add(callback);

    // Immediately call with current data if available
    const currentData = this.cache.get(walletId);
    if (currentData) {
      callback(currentData);
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.walletListeners.get(walletId);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.walletListeners.delete(walletId);
        }
      }
    };
  }

  /**
   * Subscribe to all balance updates
   */
  subscribeToAllBalances(callback: (data: BalanceData[]) => void): () => void {
    this.allBalancesListeners.add(callback);

    // Immediately call with current data if available
    if (this.cache.size > 0) {
      callback(Array.from(this.cache.values()));
    }

    return () => {
      this.allBalancesListeners.delete(callback);
    };
  }

  // --------------------------------------------------------------------------
  // Refresh Methods - orchestrate data fetching
  // --------------------------------------------------------------------------

  /**
   * Check if a wallet is currently being refreshed
   */
  isRefreshingWallet(walletId: string): boolean {
    return this.isRefreshing.get(walletId) || false;
  }

  /**
   * Mark wallet as refreshing
   */
  private setRefreshing(walletId: string, refreshing: boolean): void {
    this.isRefreshing.set(walletId, refreshing);
  }

  /**
   * Fetch and cache balance for a single wallet
   */
  async fetchBalance(
    walletId: string,
    address: string,
    networkType: 'mainnet' | 'testnet' = 'mainnet'
  ): Promise<BalanceData | null> {
    // Don't fetch if already refreshing
    if (this.isRefreshingWallet(walletId)) {
      console.log(`[BalanceCache] Already refreshing ${walletId}, skipping`);
      return this.getBalanceSync(walletId);
    }

    this.setRefreshing(walletId, true);

    try {
      console.log(`[BalanceCache] Fetching balance for ${walletId}`);

      const response = await FlashApiService.getWalletBalance({
        network: this.getNetworkFromWalletType(walletId),
        address,
        network_type: networkType,
      });

      if (response.success && response.data) {
        const balanceData: BalanceData = {
          walletId,
          totalFiat: response.data.total_fiat,
          breakdown: response.data.breakdown,
          lastUpdated: Date.now(),
          snapshotAt: response.data.snapshot_at,
        };

        this.setBalance(walletId, balanceData);
        return balanceData;
      }

      return null;
    } catch (error) {
      console.error(`[BalanceCache] Error fetching balance for ${walletId}:`, error);
      return null;
    } finally {
      this.setRefreshing(walletId, false);
    }
  }

  /**
   * Fetch and cache balances for multiple wallets
   */
  async fetchBalances(
    wallets: Array<{ id: string; address: string; type: string }>,
    networkType: 'mainnet' | 'testnet' = 'mainnet'
  ): Promise<Map<string, BalanceData>> {
    console.log(`[BalanceCache] Fetching balances for ${wallets.length} wallets`);

    const results = new Map<string, BalanceData>();
    const fetchPromises = wallets.map(async (wallet) => {
      const data = await this.fetchBalance(wallet.id, wallet.address, networkType);
      if (data) {
        results.set(wallet.id, data);
      }
    });

    await Promise.all(fetchPromises);
    return results;
  }

  // --------------------------------------------------------------------------
  // Private Helpers
  // --------------------------------------------------------------------------

  private notifyWalletListeners(walletId: string, data: BalanceData | null): void {
    const listeners = this.walletListeners.get(walletId);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[BalanceCache] Error in wallet listener for ${walletId}:`, error);
        }
      });
    }
  }

  private notifyAllBalancesListeners(): void {
    const allData = Array.from(this.cache.values());
    this.allBalancesListeners.forEach(callback => {
      try {
        callback(allData);
      } catch (error) {
        console.error('[BalanceCache] Error in all-balances listener:', error);
      }
    });
  }

  private getNetworkFromWalletType(walletId: string): 'ethereum' | 'bnb' | 'solana' | 'bitcoin' {
    const id = walletId.toLowerCase();
    if (id.includes('eth') && !id.includes('beth')) return 'ethereum';
    if (id.includes('bnb') || id.includes('bsc') || id.includes('binance')) return 'bnb';
    if (id.includes('sol')) return 'solana';
    if (id.includes('btc')) return 'bitcoin';
    return 'ethereum'; // default
  }

  // --------------------------------------------------------------------------
  // Debug Methods
  // --------------------------------------------------------------------------

  /**
   * Get cache stats for debugging
   */
  getStats(): { size: number; walletIds: string[]; oldestUpdate: number | null } {
    const entries = Array.from(this.cache.entries());

    let oldestUpdate: number | null = null;
    entries.forEach(([, data]) => {
      if (!oldestUpdate || data.lastUpdated < oldestUpdate) {
        oldestUpdate = data.lastUpdated;
      }
    });

    return {
      size: this.cache.size,
      walletIds: Array.from(this.cache.keys()),
      oldestUpdate,
    };
  }

  /**
   * Log cache state for debugging
   */
  logState(): void {
    const stats = this.getStats();
    console.log('[BalanceCache] Cache State:', {
      size: stats.size,
      wallets: stats.walletIds,
      oldestUpdate: stats.oldestUpdate
        ? new Date(stats.oldestUpdate).toISOString()
        : 'N/A',
    });
  }
}

export const balanceCache = BalanceCache.getInstance();