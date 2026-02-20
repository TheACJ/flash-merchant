import { MerchantProfile } from '../store/slices/merchantAuthSlice';

/**
 * MerchantProfileCache - In-memory cache for merchant profile data
 * 
 * Provides synchronous access to the profile and supports
 * real-time updates via subscribers.
 */
class MerchantProfileCache {
    private profile: MerchantProfile | null = null;
    private listeners: Set<(profile: MerchantProfile | null) => void> = new Set();
    private static instance: MerchantProfileCache;

    static getInstance(): MerchantProfileCache {
        if (!MerchantProfileCache.instance) {
            MerchantProfileCache.instance = new MerchantProfileCache();
        }
        return MerchantProfileCache.instance;
    }

    /**
     * Get the current profile
     */
    getProfile(): MerchantProfile | null {
        return this.profile;
    }

    /**
     * Set the profile and notify listeners
     */
    setProfile(profile: MerchantProfile | null): void {
        const prevProfile = this.profile;
        this.profile = profile;

        // Simple deep equality check could be added here if needed
        // For now, notify if reference or any basic check changed
        this.listeners.forEach(listener => listener(profile));
    }

    /**
     * Subscribe to profile updates
     * @param listener Callback function
     * @returns Unsubscribe function
     */
    subscribe(listener: (profile: MerchantProfile | null) => void): () => void {
        this.listeners.add(listener);
        // Call immediately with current value
        listener(this.profile);

        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * Clear the cache
     */
    clear(): void {
        this.profile = null;
        this.listeners.forEach(listener => listener(null));
    }
}

export const merchantProfileCache = MerchantProfileCache.getInstance();
