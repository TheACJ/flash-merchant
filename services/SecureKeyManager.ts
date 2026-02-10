/**
 * SecureKeyManager - Biometric-Protected Key Storage
 * 
 * Manages encryption keys with biometric authentication binding.
 * Keys are stored in platform secure storage (Expo SecureStore) and require biometric
 * authentication to access.
 */

import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

export interface SecureKey {
    id: string;
    createdAt: number;
    lastUsed: number;
    algorithm: string;
    biometricProtected: boolean;
}

export interface KeyGenerationResult {
    success: boolean;
    keyId?: string;
    error?: string;
}

export interface KeyAccessResult {
    success: boolean;
    key?: string;
    error?: string;
}

class SecureKeyManager {
    private static instance: SecureKeyManager;
    private readonly KEY_SERVICE = 'com.flashmerchant.secure';

    private constructor() { }

    static getInstance(): SecureKeyManager {
        if (!SecureKeyManager.instance) {
            SecureKeyManager.instance = new SecureKeyManager();
        }
        return SecureKeyManager.instance;
    }

    /**
     * Generate and store a new encryption key with biometric protection
     */
    async generateKey(keyId: string): Promise<KeyGenerationResult> {
        try {
            console.log(`[SecureKeyManager] Generating key: ${keyId}`);

            // Generate cryptographically secure key
            const keyBytes = await Crypto.getRandomBytesAsync(32); // 256 bits
            const keyHex = this.bytesToHex(keyBytes);

            // Store with biometric protection
            // SecureStore.setItemAsync options: { keychainAccessible: ..., requireAuthentication: true }
            await SecureStore.setItemAsync(keyId, keyHex, {
                requireAuthentication: true,
                keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY
            });

            // Store key metadata (not secured by auth, just for info)
            const metadata: SecureKey = {
                id: keyId,
                createdAt: Date.now(),
                lastUsed: Date.now(),
                algorithm: 'AES-256-GCM',
                biometricProtected: true,
            };

            await this.storeMetadata(keyId, metadata);

            console.log(`[SecureKeyManager] Key generated and stored: ${keyId}`);
            return { success: true, keyId };
        } catch (error) {
            console.error(`[SecureKeyManager] Failed to generate key:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Key generation failed',
            };
        }
    }

    /**
     * Retrieve a key from secure storage with biometric authentication
     */
    async getKey(keyId: string): Promise<KeyAccessResult> {
        try {
            console.log(`[SecureKeyManager] Retrieving key: ${keyId}`);

            const result = await SecureStore.getItemAsync(keyId, {
                requireAuthentication: true,
                authenticationPrompt: 'Authenticate to access your secure key'
            });

            if (!result) {
                return { success: false, error: 'Key not found or access denied' };
            }

            // Update last used timestamp
            await this.updateLastUsed(keyId);

            console.log(`[SecureKeyManager] Key retrieved: ${keyId}`);
            return { success: true, key: result };
        } catch (error) {
            console.error(`[SecureKeyManager] Failed to get key:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to retrieve key',
            };
        }
    }

    /**
     * Check if a key exists
     */
    async hasKey(keyId: string): Promise<boolean> {
        try {
            // expo-secure-store doesn't have a "hasItem" but we can just check if metadata exists
            // or try to get it without auth (if configured that way), but since we need auth...
            // let's rely on metadata for existence check to avoid prompting user just for checking existence.
            const metadata = await this.getMetadata(keyId);
            return !!metadata;
        } catch (error) {
            return false;
        }
    }

    /**
     * Delete a key from secure storage
     */
    async deleteKey(keyId: string): Promise<boolean> {
        try {
            await SecureStore.deleteItemAsync(keyId);
            await this.deleteMetadata(keyId);
            console.log(`[SecureKeyManager] Key deleted: ${keyId}`);
            return true;
        } catch (error) {
            console.error(`[SecureKeyManager] Failed to delete key:`, error);
            return false;
        }
    }

    /**
     * Store key metadata
     */
    private async storeMetadata(keyId: string, metadata: SecureKey): Promise<void> {
        try {
            const metadataKey = `key_metadata_${keyId}`;
            await SecureStore.setItemAsync(metadataKey, JSON.stringify(metadata), {
                requireAuthentication: false // Metadata is public
            });
        } catch (error) {
            console.error(`[SecureKeyManager] Failed to store metadata:`, error);
        }
    }

    /**
     * Get key metadata
     */
    private async getMetadata(keyId: string): Promise<SecureKey | null> {
        try {
            const metadataKey = `key_metadata_${keyId}`;
            const result = await SecureStore.getItemAsync(metadataKey);

            if (!result) {
                return null;
            }

            return JSON.parse(result) as SecureKey;
        } catch (error) {
            console.error(`[SecureKeyManager] Failed to get metadata:`, error);
            return null;
        }
    }

    /**
     * Update last used timestamp
     */
    private async updateLastUsed(keyId: string): Promise<void> {
        try {
            const metadata = await this.getMetadata(keyId);
            if (metadata) {
                metadata.lastUsed = Date.now();
                await this.storeMetadata(keyId, metadata);
            }
        } catch (error) {
            console.error(`[SecureKeyManager] Failed to update last used:`, error);
        }
    }

    /**
     * Delete key metadata
     */
    private async deleteMetadata(keyId: string): Promise<void> {
        try {
            const metadataKey = `key_metadata_${keyId}`;
            await SecureStore.deleteItemAsync(metadataKey);
        } catch (error) {
            console.error(`[SecureKeyManager] Failed to delete metadata:`, error);
        }
    }

    /**
     * Convert bytes to hex
     */
    private bytesToHex(bytes: Uint8Array): string {
        return Array.from(bytes)
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }
}

export default SecureKeyManager;
