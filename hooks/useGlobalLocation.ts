/**
 * useGlobalLocation Hook
 * 
 * Provides easy access to the global location from Redux store.
 * Location is fetched once at app startup and stored in Redux.
 */

import { LocationData, LocationPermissionStatus } from '@/services/LocationService';
import { AppDispatch, RootState } from '@/store';
import {
    clearLocation,
    fetchGlobalLocation,
    fetchLocationIfPermitted,
    requestPermissionAndFetchLocation
} from '@/store/slices/locationSlice';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface UseGlobalLocationReturn {
    // Location data
    location: LocationData | null;

    // Status
    status: 'idle' | 'loading' | 'success' | 'failed';
    permissionStatus: LocationPermissionStatus;
    error: string | null;

    // Computed properties
    isLoading: boolean;
    hasLocation: boolean;
    isPermissionGranted: boolean;
    isPermissionDenied: boolean;

    // Actions
    fetchLocation: () => void;
    fetchLocationIfPermitted: () => void;
    requestPermissionAndFetch: () => void;
    clearLocationData: () => void;

    // Country code from location
    countryCode: string | null;
}

/**
 * Hook to access and manage global location
 */
export function useGlobalLocation(): UseGlobalLocationReturn {
    const dispatch = useDispatch<AppDispatch>();
    const locationState = useSelector((state: RootState) => state.location);

    const fetchLocation = useCallback(() => {
        dispatch(fetchGlobalLocation());
    }, [dispatch]);

    const fetchLocationIfPermittedCallback = useCallback(() => {
        dispatch(fetchLocationIfPermitted());
    }, [dispatch]);

    const requestPermissionAndFetch = useCallback(() => {
        dispatch(requestPermissionAndFetchLocation());
    }, [dispatch]);

    const clearLocationData = useCallback(() => {
        dispatch(clearLocation());
    }, [dispatch]);

    return {
        // Location data
        location: locationState.location,

        // Status
        status: locationState.status,
        permissionStatus: locationState.permissionStatus,
        error: locationState.error,

        // Computed properties
        isLoading: locationState.status === 'loading',
        hasLocation: locationState.location !== null,
        isPermissionGranted: locationState.permissionStatus === 'granted',
        isPermissionDenied: locationState.permissionStatus === 'denied',

        // Actions
        fetchLocation,
        fetchLocationIfPermitted: fetchLocationIfPermittedCallback,
        requestPermissionAndFetch,
        clearLocationData,

        // Country code from location
        countryCode: locationState.location?.countryCode || null,
    };
}

export default useGlobalLocation;
