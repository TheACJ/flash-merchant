/**
 * Location-based Currency Detection Utility
 * 
 * Determines the preferred currency based on user's location.
 * Used during onboarding (Login and Signup flows) to set preferredCurrency.
 * 
 * IMPORTANT: This utility now uses the global location from Redux store
 * instead of directly accessing location services. The location is fetched
 * once at app startup in app/_layout.tsx and stored in Redux.
 */

import DynamicCurrencyService from '@/services/DynamicCurrencyService';
import { LocationData } from '@/services/LocationService';
import { store } from '@/store';

/**
 * Country code to currency code mapping for common countries
 * This serves as a fallback when API data is not available
 */
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
    // Africa
    'NG': 'NGN', // Nigeria - Naira
    'GH': 'GHS', // Ghana - Cedi
    'KE': 'KES', // Kenya - Shilling
    'ZA': 'ZAR', // South Africa - Rand
    'EG': 'EGP', // Egypt - Pound
    'MA': 'MAD', // Morocco - Dirham
    'TZ': 'TZS', // Tanzania - Shilling
    'UG': 'UGX', // Uganda - Shilling
    'RW': 'RWF', // Rwanda - Franc
    'CM': 'XAF', // Cameroon - CFA Franc
    'CI': 'XOF', // Ivory Coast - CFA Franc
    'SN': 'XOF', // Senegal - CFA Franc

    // Americas
    'US': 'USD', // United States - Dollar
    'CA': 'CAD', // Canada - Dollar
    'BR': 'BRL', // Brazil - Real
    'MX': 'MXN', // Mexico - Peso
    'AR': 'ARS', // Argentina - Peso
    'CO': 'COP', // Colombia - Peso
    'CL': 'CLP', // Chile - Peso

    // Europe
    'GB': 'GBP', // United Kingdom - Pound
    'DE': 'EUR', // Germany - Euro
    'FR': 'EUR', // France - Euro
    'IT': 'EUR', // Italy - Euro
    'ES': 'EUR', // Spain - Euro
    'NL': 'EUR', // Netherlands - Euro
    'BE': 'EUR', // Belgium - Euro
    'PT': 'EUR', // Portugal - Euro
    'AT': 'EUR', // Austria - Euro
    'GR': 'EUR', // Greece - Euro
    'IE': 'EUR', // Ireland - Euro
    'FI': 'EUR', // Finland - Euro
    'PL': 'PLN', // Poland - Zloty
    'SE': 'SEK', // Sweden - Krona
    'NO': 'NOK', // Norway - Krone
    'DK': 'DKK', // Denmark - Krone
    'CH': 'CHF', // Switzerland - Franc
    'RU': 'RUB', // Russia - Ruble

    // Asia
    'JP': 'JPY', // Japan - Yen
    'CN': 'CNY', // China - Yuan
    'KR': 'KRW', // South Korea - Won
    'IN': 'INR', // India - Rupee
    'SG': 'SGD', // Singapore - Dollar
    'HK': 'HKD', // Hong Kong - Dollar
    'TH': 'THB', // Thailand - Baht
    'MY': 'MYR', // Malaysia - Ringgit
    'ID': 'IDR', // Indonesia - Rupiah
    'PH': 'PHP', // Philippines - Peso
    'VN': 'VND', // Vietnam - Dong

    // Oceania
    'AU': 'AUD', // Australia - Dollar
    'NZ': 'NZD', // New Zealand - Dollar

    // Middle East
    'AE': 'AED', // UAE - Dirham
    'SA': 'SAR', // Saudi Arabia - Riyal
    'IL': 'ILS', // Israel - Shekel
    'TR': 'TRY', // Turkey - Lira
};

/**
 * Get the global location from Redux store
 * Returns null if location is not available
 */
export function getGlobalLocation(): LocationData | null {
    const state = store.getState();
    return state.location?.location || null;
}

/**
 * Get the country code from the global location in Redux store
 * This is the preferred method - uses cached location from app startup
 */
export function getCountryCodeFromGlobalLocation(): string | null {
    const location = getGlobalLocation();
    if (location?.countryCode) {
        return location.countryCode;
    }
    return null;
}

/**
 * Get the country code from a LocationData object
 * This is used when you already have location data (e.g., from Redux)
 */
export function getCountryCodeFromLocationData(location: LocationData): string | null {
    return location.countryCode || null;
}

/**
 * Get currency code from country code
 * First tries the API via DynamicCurrencyService, then falls back to local mapping
 */
export async function getCurrencyCodeFromCountryCode(countryCode: string): Promise<string> {
    const upperCountryCode = countryCode.toUpperCase();

    try {
        // Try to get currency from API
        const currencyService = DynamicCurrencyService.getInstance();
        const currency = await currencyService.getCurrencyByCountryCode(upperCountryCode);

        if (currency && currency.enabled) {
            console.log(`[locationCurrency] Found currency ${currency.code} for country ${upperCountryCode} from API`);
            return currency.code;
        }
    } catch (error) {
        console.warn('[locationCurrency] Could not fetch currency from API, using fallback:', error);
    }

    // Fallback to local mapping
    const fallbackCurrency = COUNTRY_CURRENCY_MAP[upperCountryCode];
    if (fallbackCurrency) {
        console.log(`[locationCurrency] Using fallback currency ${fallbackCurrency} for country ${upperCountryCode}`);
        return fallbackCurrency;
    }

    // Ultimate fallback to USD
    console.warn(`[locationCurrency] No currency found for country ${upperCountryCode}, defaulting to USD`);
    return 'USD';
}

/**
 * Determine preferred currency from location coordinates
 * This is the main function to use during onboarding
 * 
 * DEPRECATED: Use determineCurrencyFromGlobalLocation() instead
 * This function is kept for backward compatibility
 */
export async function determineCurrencyFromLocation(
    latitude: number,
    longitude: number
): Promise<string> {
    console.log(`[locationCurrency] Determining currency for coordinates: ${latitude}, ${longitude}`);
    console.warn('[locationCurrency] Note: This function is deprecated. Use determineCurrencyFromGlobalLocation() instead.');

    // Try to get country code from global location first
    const globalCountryCode = getCountryCodeFromGlobalLocation();
    if (globalCountryCode) {
        return await getCurrencyCodeFromCountryCode(globalCountryCode);
    }

    // Fallback to USD if we couldn't determine the country
    console.warn('[locationCurrency] Could not determine country from coordinates, defaulting to USD');
    return 'USD';
}

/**
 * Determine preferred currency from the global location in Redux store
 * This is the preferred method - uses cached location from app startup
 */
export async function determineCurrencyFromGlobalLocation(): Promise<string> {
    console.log('[locationCurrency] Determining currency from global location...');

    // Get country code from global location
    const countryCode = getCountryCodeFromGlobalLocation();

    if (countryCode) {
        console.log(`[locationCurrency] Found country code from global location: ${countryCode}`);
        return await getCurrencyCodeFromCountryCode(countryCode);
    }

    // Fallback to USD if we couldn't determine the country
    console.warn('[locationCurrency] No global location available, defaulting to USD');
    return 'USD';
}

/**
 * Determine preferred currency from location object
 * Accepts the location object format used in merchant profile
 */
export async function determineCurrencyFromLocationObject(
    location: {
        address?: string;
        state?: string;
        latitude?: number;
        longitude?: number;
    }
): Promise<string> {
    // If we have coordinates with country code in global location, use that
    const globalLocation = getGlobalLocation();
    if (globalLocation?.countryCode) {
        return await getCurrencyCodeFromCountryCode(globalLocation.countryCode);
    }

    // If we only have state/region, try to infer from that
    // This is a best-effort approach for Nigerian states
    if (location.state) {
        const stateToCurrency = inferCurrencyFromState(location.state);
        if (stateToCurrency) {
            return stateToCurrency;
        }
    }

    // Default to USD
    console.warn('[locationCurrency] Insufficient location data, defaulting to USD');
    return 'USD';
}

/**
 * Infer currency from state/region name
 * Currently only handles Nigerian states, returns NGN
 */
function inferCurrencyFromState(state: string): string | null {
    // List of Nigerian states
    const nigerianStates = [
        'abia', 'adamawa', 'akwa ibom', 'anambra', 'bauchi', 'bayelsa', 'benue',
        'borno', 'cross river', 'delta', 'ebonyi', 'edo', 'ekiti', 'enugu',
        'fct', 'federal capital territory', 'gombe', 'imo', 'jigawa', 'kaduna',
        'kano', 'katsina', 'kebbi', 'kogi', 'kwara', 'lagos', 'nasarawa',
        'niger', 'ogun', 'ondo', 'osun', 'oyo', 'plateau', 'rivers', 'sokoto',
        'taraba', 'yobe', 'zamfara'
    ];

    const stateLower = state.toLowerCase().trim();

    if (nigerianStates.some(s => stateLower.includes(s) || s.includes(stateLower))) {
        return 'NGN';
    }

    return null;
}

/**
 * Get all supported country codes
 * Useful for validation or UI purposes
 */
export function getSupportedCountryCodes(): string[] {
    return Object.keys(COUNTRY_CURRENCY_MAP);
}
