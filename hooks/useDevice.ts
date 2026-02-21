/**
 * useDevice Hook
 * 
 * Provides easy access to device information and fingerprint from Redux store.
 * Device info is initialized at app startup and refreshed periodically.
 */

import { DeviceInfo } from '@/services/DeviceService';
import { AppDispatch, RootState } from '@/store';
import {
    clearDeviceInfo,
    confirmDeviceFingerprint,
    initializeDevice,
    refreshDeviceInfo,
} from '@/store/slices/deviceSlice';
import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface UseDeviceReturn {
    // Device data
    deviceInfo: DeviceInfo | null;
    fingerprint: string | null;

    // Status
    status: 'idle' | 'loading' | 'success' | 'failed';
    error: string | null;
    fingerprintValid: boolean;

    // Computed properties
    isLoading: boolean;
    hasDeviceInfo: boolean;
    needsRefresh: boolean;

    // Actions
    initialize: () => void;
    refresh: () => void;
    confirmFingerprint: () => void;
    clear: () => void;

    // Convenience properties
    platform: string | null;
    osVersion: string | null;
    deviceModel: string | null;
    appVersion: string | null;
}

/**
 * Hook to access and manage device information
 */
export function useDevice(): UseDeviceReturn {
    const dispatch = useDispatch<AppDispatch>();
    const deviceState = useSelector((state: RootState) => state.device);
    const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Check if device info needs refresh (older than 24 hours)
    const needsRefresh = deviceState.lastRefreshed
        ? (Date.now() - deviceState.lastRefreshed) > 24 * 60 * 60 * 1000
        : true;

    const initialize = useCallback(() => {
        dispatch(initializeDevice());
    }, [dispatch]);

    const refresh = useCallback(() => {
        dispatch(refreshDeviceInfo());
    }, [dispatch]);

    const confirmFingerprintCallback = useCallback(() => {
        dispatch(confirmDeviceFingerprint());
    }, [dispatch]);

    const clear = useCallback(() => {
        dispatch(clearDeviceInfo());
    }, [dispatch]);

    // Set up periodic refresh (every 6 hours)
    useEffect(() => {
        // Only set up interval if we have device info
        if (deviceState.deviceInfo) {
            const intervalId = setInterval(() => {
                dispatch(refreshDeviceInfo());
            }, 6 * 60 * 60 * 1000); // 6 hours

            refreshIntervalRef.current = intervalId as unknown as NodeJS.Timeout;
        }

        return () => {
            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }
        };
    }, [dispatch, deviceState.deviceInfo]);

    return {
        // Device data
        deviceInfo: deviceState.deviceInfo,
        fingerprint: deviceState.fingerprint,

        // Status
        status: deviceState.status,
        error: deviceState.error,
        fingerprintValid: deviceState.fingerprintValid,

        // Computed properties
        isLoading: deviceState.status === 'loading',
        hasDeviceInfo: deviceState.deviceInfo !== null,
        needsRefresh,

        // Actions
        initialize,
        refresh,
        confirmFingerprint: confirmFingerprintCallback,
        clear,

        // Convenience properties
        platform: deviceState.deviceInfo?.platform || null,
        osVersion: deviceState.deviceInfo?.osVersion || null,
        deviceModel: deviceState.deviceInfo?.deviceModel || null,
        appVersion: deviceState.deviceInfo?.appVersion || null,
    };
}

export default useDevice;
