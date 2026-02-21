import { STORAGE_KEYS } from '@/constants/storage';
import { determineCurrencyFromLocationObject } from '@/utils/locationCurrency';
import * as SecureStore from 'expo-secure-store';
import { store } from '../store';
import { setPreferredCurrency } from '../store/slices/currencySlice';
import { MerchantProfile, setMerchantProfile } from '../store/slices/merchantAuthSlice';
import MerchantApiService from './MerchantApiService';
import { merchantProfileCache } from './MerchantProfileCache';

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * MerchantProfileOrchestrator - Coordinates merchant profile lifecycle
 * 
 * Responsibilities:
 * - Map API response to MerchantProfile interface
 * - Synchronize profile across Cache, Store, Storage, and API
 * - Periodic refresh (every 5 minutes)
 * - Persist profile to SecureStore for app restarts
 */
class MerchantProfileOrchestrator {
    private timer: ReturnType<typeof setInterval> | null = null;
    private isInitialized: boolean = false;

    /**
     * Initialize with profile data from login/storage
     */
    async initialize(apiProfileData: any): Promise<void> {
        console.log('[MerchantProfileOrchestrator] initialize()');
        const profile = this.mapToProfile(apiProfileData);
        await this.updateLocalState(profile);

        if (!this.isInitialized) {
            this.startPeriodicRefresh();
            this.isInitialized = true;
        }
    }

    /**
     * Warm cache from storage or API on app startup
     * Call this when app starts to restore profile from storage
     */
    async warmCache(): Promise<MerchantProfile | null> {
        console.log('[MerchantProfileOrchestrator] Warming cache from storage...');

        try {
            // Try to load from storage first
            const storedProfile = await this.loadFromStorage();

            if (storedProfile) {
                console.log('[MerchantProfileOrchestrator] Found stored profile, updating state');
                // Update Redux and cache
                store.dispatch(setMerchantProfile(storedProfile));
                merchantProfileCache.setProfile(storedProfile);

                // Start periodic refresh
                if (!this.isInitialized) {
                    this.startPeriodicRefresh();
                    this.isInitialized = true;
                }

                // Refresh from API in background to get latest data
                this.refresh().catch(err => {
                    console.warn('[MerchantProfileOrchestrator] Background refresh failed:', err);
                });

                return storedProfile;
            }

            // No stored profile, try to fetch from API
            console.log('[MerchantProfileOrchestrator] No stored profile, fetching from API...');
            await this.refresh();

            // Return the profile from cache after refresh
            return merchantProfileCache.getProfile();
        } catch (error) {
            console.error('[MerchantProfileOrchestrator] Cache warming failed:', error);
            return null;
        }
    }

    /**
     * Force refresh profile from API
     */
    async refresh(): Promise<void> {
        console.log('[MerchantProfileOrchestrator] Manual refresh initiated');
        try {
            const response = await MerchantApiService.getMerchantProfile();
            if (response && (response.data || response.merchant)) {
                const profileData = response.data || response.merchant;
                const profile = this.mapToProfile(profileData);
                await this.updateLocalState(profile);
                console.log('[MerchantProfileOrchestrator] Refresh successful');
            }
        } catch (error) {
            console.error('[MerchantProfileOrchestrator] Refresh failed:', error);
        }
    }

    /**
     * Start periodic refresh every 5 minutes
     */
    startPeriodicRefresh(): void {
        if (this.timer) return;

        this.timer = setInterval(() => {
            this.refresh();
        }, REFRESH_INTERVAL);
        console.log('[MerchantProfileOrchestrator] Periodic refresh started (5m)');
    }

    /**
     * Stop periodic refresh
     */
    stopPeriodicRefresh(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.isInitialized = false;
    }

    /**
     * Clear all profile data (logout)
     */
    async clear(): Promise<void> {
        console.log('[MerchantProfileOrchestrator] Clearing profile data');
        this.stopPeriodicRefresh();

        // Clear storage
        await SecureStore.deleteItemAsync(STORAGE_KEYS.merchant_profile).catch(() => { });

        // Clear Redux
        store.dispatch(setMerchantProfile(null));

        // Clear cache
        merchantProfileCache.clear();
    }

    /**
     * Map API snake_case response to MerchantProfile camelCase interface
     */
    mapToProfile(apiData: any): MerchantProfile {
        return {
            normalizedTag: apiData.normalized_tag || apiData.tag || '',
            name: apiData.name || '',
            businessName: apiData.business_name || '',
            email: apiData.email || '',
            phoneNumber: apiData.phone_number || '',
            description: apiData.description || null,
            agentId: apiData.agent_id || '',
            tier: apiData.tier || 'tier_1',
            isVerified: apiData.is_verified || false,
            verifiedAt: apiData.verified_at || null,
            reputationScore: apiData.reputation_score || '0.00',
            verificationScore: apiData.verification_score || '0.00',
            status: apiData.status || 'inactive',
            dailyLimit: apiData.daily_limit || '0.00',
            transactionLimit: apiData.transaction_limit || '0.00',
            availableFiatLiquidity: apiData.available_fiat_liquidity || '0.00',
            ratePercentage: apiData.rate_percentage || '0.00',
            flashFeePercent: apiData.flash_fee_percent || 0,
            reviewCount: apiData.review_count || 0,
            totalTrades: apiData.total_trades || 0,
            completedTrades: apiData.completed_trades || 0,
            location: {
                address: apiData.location?.address || '',
                state: apiData.location?.state || '',
                latitude: apiData.location?.latitude || 0,
                longitude: apiData.location?.longitude || 0,
            },
            bankDetails: apiData.bank_details || {},
            orderLimit: apiData.order_limit || {},
            stakeAsset: apiData.stake_asset || {},
            paymentMethods: apiData.payment_methods || [],
        };
    }

    /**
     * Set preferred currency based on merchant location
     * This is called during initialization to set currency from location
     */
    async setCurrencyFromLocation(profile: MerchantProfile): Promise<void> {
        try {
            if (profile.location && (profile.location.latitude || profile.location.state)) {
                const currencyCode = await determineCurrencyFromLocationObject(profile.location);
                console.log(`[MerchantProfileOrchestrator] Setting preferred currency to ${currencyCode} based on location`);

                // Dispatch to Redux store (which will also persist to SecureStore)
                await store.dispatch(setPreferredCurrency(currencyCode));
            }
        } catch (error) {
            console.error('[MerchantProfileOrchestrator] Failed to set currency from location:', error);
        }
    }

    /**
     * Update Redux store, in-memory cache, and persistent storage
     */
    private async updateLocalState(profile: MerchantProfile): Promise<void> {
        // Update Store
        store.dispatch(setMerchantProfile(profile));

        // Update Cache
        merchantProfileCache.setProfile(profile);

        // Persist to SecureStore
        await this.saveToStorage(profile);

        // Set preferred currency based on location
        await this.setCurrencyFromLocation(profile);
    }

    /**
     * Save profile to SecureStore
     */
    private async saveToStorage(profile: MerchantProfile): Promise<void> {
        try {
            await SecureStore.setItemAsync(
                STORAGE_KEYS.merchant_profile,
                JSON.stringify(profile)
            );
            console.log('[MerchantProfileOrchestrator] Profile saved to storage');
        } catch (error) {
            console.error('[MerchantProfileOrchestrator] Failed to save profile to storage:', error);
        }
    }

    /**
     * Load profile from SecureStore
     */
    private async loadFromStorage(): Promise<MerchantProfile | null> {
        try {
            const stored = await SecureStore.getItemAsync(STORAGE_KEYS.merchant_profile);
            if (stored) {
                const profile = JSON.parse(stored) as MerchantProfile;
                console.log('[MerchantProfileOrchestrator] Profile loaded from storage');
                return profile;
            }
        } catch (error) {
            console.error('[MerchantProfileOrchestrator] Failed to load profile from storage:', error);
        }
        return null;
    }
}

export const merchantProfileOrchestrator = new MerchantProfileOrchestrator();
