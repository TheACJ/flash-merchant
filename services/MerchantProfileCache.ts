import { MerchantProfile } from '../store/slices/merchantAuthSlice';

/**
 * MerchantProfileCache - In-memory cache for merchant profile data
 * 
 * Provides synchronous access to the profile and supports
 * real-time updates via subscribers.
 * 
 * IMPORTANT: This cache protects against empty/null data upserts during
 * network downtime or unavailable APIs to preserve existing valid data.
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
     * Validates that a profile has meaningful data before caching
     * Returns true if the profile is valid and should be cached
     */
    private isValidProfileData(profile: MerchantProfile | null | undefined): profile is MerchantProfile {
        if (!profile) return false;
        // Check for required identity fields
        if (!profile.agentId || profile.agentId.trim() === '') return false;
        if (!profile.normalizedTag || profile.normalizedTag.trim() === '') return false;
        // Check for at least some meaningful data
        const hasBusinessName = profile.businessName && profile.businessName.trim() !== '';
        const hasEmail = profile.email && profile.email.trim() !== '';
        const hasName = profile.name && profile.name.trim() !== '';
        if (!hasBusinessName && !hasEmail && !hasName) return false;
        return true;
    }

    /**
     * Get the current profile
     */
    getProfile(): MerchantProfile | null {
        return this.profile;
    }

    /**
     * Set the profile and notify listeners
     * Only updates cache if the profile data is valid, preserving existing data during network issues
     */
    setProfile(profile: MerchantProfile | null): void {
        // If null is passed and we have existing data, preserve it
        if (!profile) {
            if (this.profile) {
                console.warn('[MerchantProfileCache] Attempted to set null profile, preserving existing cache');
                return;
            }
            // Only allow null if we have no existing data (initial state)
            this.profile = null;
            this.listeners.forEach(listener => listener(null));
            return;
        }

        // Validate the profile data before caching
        if (!this.isValidProfileData(profile)) {
            console.warn('[MerchantProfileCache] Attempted to set invalid/empty profile data, preserving existing cache');
            return;
        }

        const prevProfile = this.profile;
        this.profile = profile;

        // Simple deep equality check could be added here if needed
        // For now, notify if reference or any basic check changed
        this.listeners.forEach(listener => listener(profile));
    }

    /**
     * Update specific fields of the profile
     * Only updates if the resulting profile would be valid
     */
    updateProfile(updates: Partial<MerchantProfile>): void {
        if (!this.profile) {
            console.warn('[MerchantProfileCache] Cannot update profile, no existing profile to update');
            return;
        }

        const updatedProfile = {
            ...this.profile,
            ...updates,
        };

        // Validate the merged result before caching
        if (!this.isValidProfileData(updatedProfile)) {
            console.warn('[MerchantProfileCache] Profile update would result in invalid data, skipping');
            return;
        }

        this.profile = updatedProfile;
        this.listeners.forEach(listener => listener(this.profile));
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
     * Clear the cache (use only for logout)
     */
    clear(): void {
        this.profile = null;
        this.listeners.forEach(listener => listener(null));
    }
}

export const merchantProfileCache = MerchantProfileCache.getInstance();
