/**
 * Global Location Service
 * 
 * Handles location permissions and fetching at the app root level.
 * The location is fetched once and stored in Redux for use throughout the app.
 * 
 * Features:
 * - Requests location permissions properly
 * - Fetches location once at app startup
 * - Caches location in Redux store
 * - Provides location data for onboarding and normal app usage
 */

import * as Location from 'expo-location';

export interface LocationData {
    latitude: number;
    longitude: number;
    accuracy: number | null;
    timestamp: number;
    // Geocoded address information
    countryCode?: string | null;
    country?: string | null;
    city?: string | null;
    region?: string | null;
    street?: string | null;
    name?: string | null;
    district?: string | null;
    postalCode?: string | null;
    // Formatted full address
    formattedAddress?: string | null;
}

export type LocationPermissionStatus = 'granted' | 'denied' | 'undetermined';

class LocationService {
    private static instance: LocationService;
    private cachedLocation: LocationData | null = null;
    private permissionStatus: LocationPermissionStatus = 'undetermined';
    private isFetching: boolean = false;

    private constructor() { }

    static getInstance(): LocationService {
        if (!LocationService.instance) {
            LocationService.instance = new LocationService();
        }
        return LocationService.instance;
    }

    /**
     * Get current permission status
     */
    getPermissionStatus(): LocationPermissionStatus {
        return this.permissionStatus;
    }

    /**
     * Get cached location without fetching
     */
    getCachedLocation(): LocationData | null {
        return this.cachedLocation;
    }

    /**
     * Check if location permission has been requested before
     */
    async hasRequestedPermission(): Promise<boolean> {
        const { status } = await Location.getForegroundPermissionsAsync();
        return status !== 'undetermined';
    }

    /**
     * Request location permissions
     * Returns true if permission was granted
     */
    async requestPermissions(): Promise<boolean> {
        try {
            console.log('[LocationService] Requesting location permissions...');

            const { status } = await Location.requestForegroundPermissionsAsync();
            this.permissionStatus = status === 'granted' ? 'granted' : 'denied';

            console.log('[LocationService] Permission status:', this.permissionStatus);
            return status === 'granted';
        } catch (error) {
            console.error('[LocationService] Error requesting permissions:', error);
            this.permissionStatus = 'denied';
            return false;
        }
    }

    /**
     * Check current permission status without requesting
     */
    async checkPermissionStatus(): Promise<LocationPermissionStatus> {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            this.permissionStatus = status === 'granted' ? 'granted' :
                status === 'denied' ? 'denied' : 'undetermined';
            return this.permissionStatus;
        } catch (error) {
            console.error('[LocationService] Error checking permissions:', error);
            return 'undetermined';
        }
    }

    /**
     * Fetch current location
     * Will request permissions if not already granted
     */
    async fetchLocation(): Promise<LocationData | null> {
        // Prevent multiple simultaneous fetches
        if (this.isFetching) {
            console.log('[LocationService] Already fetching location, waiting...');
            return this.cachedLocation;
        }

        this.isFetching = true;

        try {
            // Check/request permissions first
            const permissionGranted = await this.requestPermissions();

            if (!permissionGranted) {
                console.warn('[LocationService] Location permission denied');
                this.isFetching = false;
                return null;
            }

            console.log('[LocationService] Fetching current position...');

            // Get current position with reasonable accuracy for currency detection
            // We don't need high accuracy for determining country/currency but we need it for determining street and exact location
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.BestForNavigation,
            });

            console.log('[LocationService] Location fetched:', location.coords);

            const locationData: LocationData = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy,
                timestamp: location.timestamp,
            };

            // Try to get reverse geocoding data for full address information
            try {
                const reverseGeocode = await Location.reverseGeocodeAsync({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });

                if (reverseGeocode && reverseGeocode.length > 0) {
                    const place = reverseGeocode[0];

                    // Store all address components
                    locationData.countryCode = place.isoCountryCode || null;
                    locationData.country = place.country || null;
                    locationData.city = place.city || null;
                    locationData.region = place.region || null;
                    locationData.street = place.street || null;
                    locationData.name = place.name || null;
                    locationData.district = place.district || null;
                    locationData.postalCode = place.postalCode || null;

                    // Build formatted address like in create-wallet
                    const addressParts = [
                        place.name,
                        place.street,
                        place.district,
                        place.city,
                        place.region,
                        place.country,
                    ].filter(Boolean);
                    locationData.formattedAddress = addressParts.join(', ');

                    console.log('[LocationService] Reverse geocode result:', {
                        countryCode: locationData.countryCode,
                        city: locationData.city,
                        region: locationData.region,
                        street: locationData.street,
                        formattedAddress: locationData.formattedAddress,
                    });
                }
            } catch (geocodeError) {
                // Don't fail the whole location fetch if reverse geocoding fails
                console.warn('[LocationService] Reverse geocoding failed:', geocodeError);
            }

            this.cachedLocation = locationData;
            this.isFetching = false;
            return locationData;
        } catch (error) {
            console.error('[LocationService] Error fetching location:', error);
            this.isFetching = false;
            return null;
        }
    }

    /**
     * Fetch location only if permission is already granted
     * Does not prompt user for permission
     */
    async fetchLocationIfPermitted(): Promise<LocationData | null> {
        const status = await this.checkPermissionStatus();

        if (status !== 'granted') {
            console.log('[LocationService] Permission not granted, skipping location fetch');
            return null;
        }

        return this.fetchLocation();
    }

    /**
     * Clear cached location
     */
    clearCache(): void {
        this.cachedLocation = null;
        console.log('[LocationService] Cache cleared');
    }

    /**
     * Reset the service (for logout, etc.)
     */
    reset(): void {
        this.cachedLocation = null;
        this.permissionStatus = 'undetermined';
        this.isFetching = false;
        console.log('[LocationService] Service reset');
    }
}

export default LocationService.getInstance();
