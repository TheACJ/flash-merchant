/**
 * Device Service
 * 
 * Handles device identification and fingerprinting for the app.
 * Generates a unique device fingerprint that persists across app sessions.
 * This helps the backend identify devices for rate limiting and security purposes.
 */

import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import * as Device from 'expo-device';
import * as SecureStore from 'expo-secure-store';

const DEVICE_FINGERPRINT_KEY = 'merchant_device_fingerprint';
const DEVICE_INFO_KEY = 'merchant_device_info';

export interface DeviceInfo {
    // Unique device fingerprint (generated once, stored securely)
    fingerprint: string;

    // Device identifiers
    deviceId: string;
    deviceName: string;

    // Platform info
    platform: 'ios' | 'android' | 'web';
    osVersion: string;
    osBuildId?: string;

    // App info
    appVersion: string;
    appBuildNumber: string;
    appName: string;

    // Device hardware info
    deviceModel: string;
    deviceBrand?: string;
    deviceManufacturer?: string;

    // Timestamps
    firstRegistered: number;
    lastRefreshed: number;

    // Additional identifiers
    installationId?: string; // iOS: identifierForVendor, Android: installationId
    androidId?: string; // Android only
}

export interface DeviceFingerprintData {
    fingerprint: string;
    lastConfirmed: number;
    needsRefresh: boolean;
}

class DeviceService {
    private static instance: DeviceService;
    private cachedDeviceInfo: DeviceInfo | null = null;
    private cachedFingerprint: string | null = null;

    private constructor() { }

    static getInstance(): DeviceService {
        if (!DeviceService.instance) {
            DeviceService.instance = new DeviceService();
        }
        return DeviceService.instance;
    }

    /**
     * Get or create device fingerprint
     * This is the main method to get the device's unique identifier
     */
    async getDeviceFingerprint(): Promise<string> {
        // Return cached fingerprint if available
        if (this.cachedFingerprint) {
            return this.cachedFingerprint;
        }

        // Try to load from secure storage
        try {
            const stored = await SecureStore.getItemAsync(DEVICE_FINGERPRINT_KEY);
            if (stored) {
                this.cachedFingerprint = stored;
                return stored;
            }
        } catch (error) {
            console.warn('[DeviceService] Could not load fingerprint from storage:', error);
        }

        // Generate new fingerprint
        const fingerprint = await this.generateFingerprint();

        // Store it securely
        try {
            await SecureStore.setItemAsync(DEVICE_FINGERPRINT_KEY, fingerprint);
        } catch (error) {
            console.warn('[DeviceService] Could not store fingerprint:', error);
        }

        this.cachedFingerprint = fingerprint;
        return fingerprint;
    }

    /**
     * Generate a unique device fingerprint
     * Combines multiple device identifiers and hashes them
     */
    private async generateFingerprint(): Promise<string> {
        const components: string[] = [];

        // Platform identifier
        components.push(Platform.OS);
        components.push(Device.osVersion || 'unknown');

        // Device model
        components.push(Device.modelName || 'unknown');
        components.push(Device.deviceName || 'unknown');

        // iOS specific
        if (Platform.OS === 'ios') {
            const iosId = await Application.getIosIdForVendorAsync();
            if (iosId) {
                components.push(iosId);
            }
        }

        // Android specific
        if (Platform.OS === 'android') {
            const androidId = Application.getAndroidId();
            components.push(androidId || 'unknown');
        }

        // App info
        components.push(Application.applicationId || 'unknown');
        components.push(Application.nativeApplicationVersion || '1.0.0');

        // Add a random component for uniqueness (stored, so consistent)
        const randomComponent = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            components.join('|') + Date.now().toString()
        );

        // Create final fingerprint
        const fingerprintInput = components.join('|') + '|' + randomComponent;
        const fingerprint = await Crypto.digestStringAsync(
            Crypto.CryptoDigestAlgorithm.SHA256,
            fingerprintInput
        );

        // Return first 32 characters for a shorter but still unique identifier
        return fingerprint.substring(0, 32).toUpperCase();
    }

    /**
     * Get comprehensive device information
     */
    async getDeviceInfo(): Promise<DeviceInfo> {
        // Return cached info if available
        if (this.cachedDeviceInfo) {
            return this.cachedDeviceInfo;
        }

        // Try to load from storage
        try {
            const stored = await SecureStore.getItemAsync(DEVICE_INFO_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as DeviceInfo;

                // Check if we need to refresh (every 24 hours)
                const now = Date.now();
                const hoursSinceRefresh = (now - parsed.lastRefreshed) / (1000 * 60 * 60);

                if (hoursSinceRefresh < 24) {
                    this.cachedDeviceInfo = parsed;
                    return parsed;
                }
            }
        } catch (error) {
            console.warn('[DeviceService] Could not load device info from storage:', error);
        }

        // Generate fresh device info
        const deviceInfo = await this.collectDeviceInfo();

        // Store it
        try {
            await SecureStore.setItemAsync(DEVICE_INFO_KEY, JSON.stringify(deviceInfo));
        } catch (error) {
            console.warn('[DeviceService] Could not store device info:', error);
        }

        this.cachedDeviceInfo = deviceInfo;
        return deviceInfo;
    }

    /**
     * Collect current device information
     */
    private async collectDeviceInfo(): Promise<DeviceInfo> {
        const fingerprint = await this.getDeviceFingerprint();
        const now = Date.now();

        // Try to get existing firstRegistered timestamp
        let firstRegistered = now;
        try {
            const stored = await SecureStore.getItemAsync(DEVICE_INFO_KEY);
            if (stored) {
                const parsed = JSON.parse(stored) as DeviceInfo;
                firstRegistered = parsed.firstRegistered;
            }
        } catch {
            // Ignore errors
        }

        const deviceInfo: DeviceInfo = {
            fingerprint,

            // Device identifiers
            deviceId: await this.getDeviceId(),
            deviceName: Device.deviceName || 'Unknown Device',

            // Platform info
            platform: Platform.OS as 'ios' | 'android' | 'web',
            osVersion: Device.osVersion || 'unknown',
            osBuildId: Device.osBuildId || undefined,

            // App info
            appVersion: Application.nativeApplicationVersion || '1.0.0',
            appBuildNumber: Application.nativeBuildVersion || '1',
            appName: Application.applicationName || 'Flash Merchant',

            // Device hardware info
            deviceModel: Device.modelName || 'unknown',
            deviceBrand: Device.brand || undefined,
            deviceManufacturer: Device.manufacturer || undefined,

            // Timestamps
            firstRegistered,
            lastRefreshed: now,

            // Platform-specific identifiers
            installationId: undefined,
            androidId: undefined,
        };

        // iOS specific
        if (Platform.OS === 'ios') {
            try {
                deviceInfo.installationId = await Application.getIosIdForVendorAsync() || undefined;
            } catch {
                // Ignore
            }
        }

        // Android specific
        if (Platform.OS === 'android') {
            deviceInfo.androidId = Application.getAndroidId() || undefined;
        }

        return deviceInfo;
    }

    /**
     * Get a unique device ID
     */
    private async getDeviceId(): Promise<string> {
        if (Platform.OS === 'ios') {
            const iosId = await Application.getIosIdForVendorAsync();
            return iosId || 'ios-unknown';
        }

        if (Platform.OS === 'android') {
            return Application.getAndroidId() || 'android-unknown';
        }

        return 'web-unknown';
    }

    /**
     * Refresh device information
     * Call this periodically to keep device info up to date
     */
    async refreshDeviceInfo(): Promise<DeviceInfo> {
        // Clear cache to force refresh
        this.cachedDeviceInfo = null;

        // Get fresh info
        const deviceInfo = await this.getDeviceInfo();

        // Update storage
        try {
            await SecureStore.setItemAsync(DEVICE_INFO_KEY, JSON.stringify(deviceInfo));
        } catch (error) {
            console.warn('[DeviceService] Could not store refreshed device info:', error);
        }

        return deviceInfo;
    }

    /**
     * Confirm device fingerprint is still valid
     * Returns true if fingerprint matches stored value
     */
    async confirmFingerprint(): Promise<boolean> {
        try {
            const stored = await SecureStore.getItemAsync(DEVICE_FINGERPRINT_KEY);
            const current = await this.getDeviceFingerprint();
            return stored === current;
        } catch {
            return false;
        }
    }

    /**
     * Get device info formatted for API requests
     */
    async getDeviceInfoForApi(): Promise<{
        fingerprint: string;
        platform: string;
        osVersion: string;
        deviceModel: string;
        appVersion: string;
        deviceName: string;
    }> {
        const info = await this.getDeviceInfo();

        return {
            fingerprint: info.fingerprint,
            platform: info.platform,
            osVersion: info.osVersion,
            deviceModel: info.deviceModel,
            appVersion: info.appVersion,
            deviceName: info.deviceName,
        };
    }

    /**
     * Clear all device data (for logout/reset)
     */
    async clearDeviceData(): Promise<void> {
        try {
            await SecureStore.deleteItemAsync(DEVICE_FINGERPRINT_KEY);
            await SecureStore.deleteItemAsync(DEVICE_INFO_KEY);
        } catch (error) {
            console.warn('[DeviceService] Could not clear device data:', error);
        }

        this.cachedDeviceInfo = null;
        this.cachedFingerprint = null;
    }

    /**
     * Check if device info needs refresh (older than specified hours)
     */
    async needsRefresh(maxAgeHours: number = 24): Promise<boolean> {
        try {
            const stored = await SecureStore.getItemAsync(DEVICE_INFO_KEY);
            if (!stored) return true;

            const parsed = JSON.parse(stored) as DeviceInfo;
            const hoursSinceRefresh = (Date.now() - parsed.lastRefreshed) / (1000 * 60 * 60);

            return hoursSinceRefresh >= maxAgeHours;
        } catch {
            return true;
        }
    }
}

// Import Platform at the top level
import { Platform } from 'react-native';

export default DeviceService.getInstance();
