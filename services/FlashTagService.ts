import FlashApiService, { UserTagInfo } from './FlashApiService';

export interface FlashTagInfo {
    tag: string;
    address: string;
    chain: string;
    username?: string;
    displayName?: string;
    isVerified?: boolean;
    lastActive?: number;
}

export interface TagResolutionRequest {
    tag: string;
    chain: string;
}

export interface TagResolutionResponse {
    success: boolean;
    data?: FlashTagInfo;
    error?: string;
}

export interface FlashTagTransactionRequest {
    fromPrivateKey: string;
    toTag: string;
    amount: string;
    chain: string;
    tokenId: string;
    note?: string;
}

export interface FlashTagTransactionResponse {
    success: boolean;
    txHash?: string;
    error?: string;
}


class FlashTagService {
    private static instance: FlashTagService;
    private tagCache = new Map<string, FlashTagInfo>();
    private allTagsCache: UserTagInfo[] | null = null;
    private allTagsCacheTime: number = 0;
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    private readonly ALL_TAGS_CACHE_TTL = 2 * 60 * 1000; // 2 minutes

    static getInstance(): FlashTagService {
        if (!FlashTagService.instance) {
            FlashTagService.instance = new FlashTagService();
        }
        return FlashTagService.instance;
    }

    /**
     * Validates that a FlashTagInfo has meaningful data before caching
     * Returns true if the data is valid and should be cached
     */
    private isValidTagInfo(data: FlashTagInfo | null | undefined): data is FlashTagInfo {
        if (!data) return false;
        if (!data.tag || data.tag.trim() === '') return false;
        if (!data.address || data.address.trim() === '') return false;
        if (!data.chain || data.chain.trim() === '') return false;
        return true;
    }

    /**
     * Validates that a UserTagInfo array has meaningful data before caching
     * Returns true if the array is valid and should be cached
     */
    private isValidTagsArray(tags: UserTagInfo[] | null | undefined): tags is UserTagInfo[] {
        if (!tags) return false;
        if (!Array.isArray(tags)) return false;
        // Empty array is valid but we should not replace existing cache with empty
        // This is handled separately in fetchAllTags
        return true;
    }

    /**
     * Fetch all tags from API with pagination
     * Preserves existing cache if API returns empty/error during network issues
     */
    private async fetchAllTags(): Promise<UserTagInfo[]> {
        const now = Date.now();
        if (this.allTagsCache && now - this.allTagsCacheTime < this.ALL_TAGS_CACHE_TTL) {
            return this.allTagsCache;
        }

        const allTags: UserTagInfo[] = [];
        let page = 1;
        let hasMore = true;
        let fetchError = false;

        try {
            while (hasMore) {
                const response = await FlashApiService.getAllUserTags(page, 100);
                if (!response.success || !response.data) {
                    fetchError = true;
                    break;
                }

                // Validate the results before adding
                if (Array.isArray(response.data.results)) {
                    allTags.push(...response.data.results);
                }
                hasMore = response.data.next !== null;
                page++;

                if (page > 10) break; // Safety limit
            }

            // Only update cache if we got valid data
            // Don't replace existing cache with empty array unless we had a successful fetch
            if (allTags.length > 0 || !this.allTagsCache) {
                this.allTagsCache = allTags;
                this.allTagsCacheTime = now;
            } else if (fetchError && this.allTagsCache) {
                // On fetch error with existing cache, preserve it and log warning
                console.warn('[FlashTagService] Fetch failed, preserving existing tags cache');
            }
        } catch (error) {
            console.error('[FlashTagService] Error fetching all tags:', error);
            // Preserve existing cache on error
            if (this.allTagsCache) {
                console.warn('[FlashTagService] Preserving existing tags cache due to error');
            }
        }

        return this.allTagsCache || [];
    }

    /**
     * Resolve a Flash Tag to wallet address and user info
     */
    async resolveTag(tag: string, chain: string): Promise<TagResolutionResponse> {
        try {
            const cacheKey = `${tag}-${chain}`;
            const cached = this.tagCache.get(cacheKey);

            if (cached && Date.now() - (cached.lastActive || 0) < this.CACHE_TTL) {
                return { success: true, data: cached };
            }

            const normalizedTag = tag.toLowerCase().trim();
            const normalizedChain = chain.toLowerCase();

            const allTags = await this.fetchAllTags();
            const tagRecord = allTags.find(t => t.normalized_tag === normalizedTag || t.tag.toLowerCase() === normalizedTag);

            if (!tagRecord) {
                return { success: false, error: 'Tag not found' };
            }

            const chainWallets = tagRecord.wallets[normalizedChain as keyof typeof tagRecord.wallets];
            if (!chainWallets || chainWallets.addresses.length === 0) {
                return { success: false, error: `Tag has no ${chain} address` };
            }

            const tagInfo: FlashTagInfo = {
                tag: tagRecord.tag,
                address: chainWallets.addresses[0],
                chain: normalizedChain,
                username: tagRecord.tag,
                displayName: tagRecord.tag,
                isVerified: false,
                lastActive: Date.now()
            };

            // Validate before caching
            if (this.isValidTagInfo(tagInfo)) {
                this.tagCache.set(cacheKey, tagInfo);
            } else {
                console.warn(`[FlashTagService] Resolved tag info is invalid, not caching`);
            }
            return { success: true, data: tagInfo };
        } catch (error) {
            console.error('[FlashTagService] Error resolving tag:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to resolve tag'
            };
        }
    }

    /**
     * Validate a Flash Tag format
     */
    validateTagFormat(tag: string): { isValid: boolean; error?: string } {
        if (!tag || tag.length < 3) {
            return { isValid: false, error: 'Tag must be at least 3 characters' };
        }

        if (tag.length > 20) {
            return { isValid: false, error: 'Tag must be 20 characters or less' };
        }

        // Allow alphanumeric, underscores, and hyphens
        const validPattern = /^[a-zA-Z0-9_-]+$/;
        if (!validPattern.test(tag)) {
            return {
                isValid: false,
                error: 'Tag can only contain letters, numbers, underscores, and hyphens'
            };
        }

        return { isValid: true };
    }

    /**
     * Send transaction via Flash Tag
     */
    async sendTransaction(request: FlashTagTransactionRequest): Promise<FlashTagTransactionResponse> {
        try {
            console.log(`[FlashTagService] Sending transaction to tag: ${request.toTag}`);

            try {
                // For now, we'll use the mock transaction since the backend doesn't have a direct send endpoint
                // In a real implementation, you would call the appropriate transaction service
                console.log('[FlashTagService] Backend send not implemented, using mock transaction');
                return {
                    success: false,
                    error: 'Tag not found in mock data'
                };
            } catch (backendError) {
                console.log('[FlashTagService] Backend not available, using mock data only');
                return {
                    success: false,
                    error: 'Tag not found in mock data'
                };
            }

        } catch (error) {
            console.error('[FlashTagService] Error sending transaction:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to send transaction'
            };
        }
    }

    /**
     * Clear tag cache
     */
    clearCache(): void {
        this.tagCache.clear();
        this.allTagsCache = null;
        this.allTagsCacheTime = 0;
    }

    /**
     * Get cached tag info
     */
    getCachedTag(tag: string, chain: string): FlashTagInfo | null {
        const cacheKey = `${tag}-${chain}`;
        const cached = this.tagCache.get(cacheKey);

        if (cached && Date.now() - (cached.lastActive || 0) < this.CACHE_TTL) {
            return cached;
        }

        return null;
    }

    /**
     * Get users by chain
     */
    async getUsersByChain(chain: string): Promise<FlashTagInfo[]> {
        try {
            const allTags = await this.fetchAllTags();
            const normalizedChain = chain.toLowerCase();

            return allTags
                .filter(t => {
                    const chainWallets = t.wallets[normalizedChain as keyof typeof t.wallets];
                    return chainWallets && chainWallets.addresses.length > 0;
                })
                .map(t => ({
                    tag: t.tag,
                    address: t.wallets[normalizedChain as keyof typeof t.wallets]!.addresses[0],
                    chain: normalizedChain,
                    username: t.tag,
                    displayName: t.tag,
                    isVerified: false,
                    lastActive: Date.now()
                }));
        } catch (error) {
            console.error('[FlashTagService] Error getting users by chain:', error);
            return [];
        }
    }

}

export default FlashTagService.getInstance();
