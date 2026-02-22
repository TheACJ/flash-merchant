/**
 * Threading Capability Detection
 * 
 * Detects the execution environment and available threading options.
 * Currently supports main-thread with yield-to-UI pattern for maximum compatibility.
 * 
 * The yield-to-UI pattern breaks up heavy computation into chunks with
 * setTimeout delays, allowing the UI thread to process user interactions
 * between chunks.
 */

let _workletsAvailable: boolean | null = null;

/**
 * Check if react-native-worklets-core is available
 * Note: Worklets have limited crypto support, so we typically use main-thread
 */
export function isWorkletsAvailable(): boolean {
    if (_workletsAvailable !== null) {
        return _workletsAvailable;
    }

    try {
        // Attempt to require the module
        const worklets = require('react-native-worklets-core');
        _workletsAvailable = !!(worklets && worklets.Worklets);
        return _workletsAvailable;
    } catch {
        // Module not available (Expo Go or not installed)
        _workletsAvailable = false;
        return false;
    }
}

/**
 * Check if running in Expo Go
 * Expo Go doesn't support native modules like worklets
 */
export function isExpoGo(): boolean {
    // Expo Go has a specific global constant
    return !!(global as any).expo?.modules?.ExpoGo;
}

/**
 * Get the current execution environment
 */
export function getExecutionEnvironment(): 'expo-go' | 'dev-client' | 'production' {
    if (isExpoGo()) {
        return 'expo-go';
    }

    if (process.env.EXPO_PUBLIC_ENVIRONMENT === 'production') {
        return 'production';
    }

    return 'dev-client';
}

/**
 * Get the best available threading method
 * Currently always returns 'main-thread' for maximum compatibility
 */
export function getThreadingMethod(): 'main-thread' {
    // Always use main-thread with yield-to-UI pattern
    // This works in all environments (Expo Go, dev client, production)
    return 'main-thread';
}

/**
 * Reset cached values (useful for testing)
 */
export function resetCapabilityCache(): void {
    _workletsAvailable = null;
}
