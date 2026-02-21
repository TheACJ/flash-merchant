/**
 * Threading Capability Detection
 * 
 * Detects whether background threading is available at runtime.
 * This allows conditional use of background threads for wallet generation.
 * 
 * Priority:
 * 1. react-native-threads (best for crypto - full npm access)
 * 2. react-native-worklets-core (limited - no npm packages in worklet context)
 * 3. Main thread with yield-to-UI (Expo Go fallback)
 */

let _threadsAvailable: boolean | null = null;
let _workletsAvailable: boolean | null = null;

/**
 * Check if react-native-threads is available
 * This is the preferred option for wallet generation
 */
export function isThreadsAvailable(): boolean {
    if (_threadsAvailable !== null) {
        return _threadsAvailable;
    }

    try {
        // Attempt to require the module
        const threads = require('react-native-threads');
        _threadsAvailable = !!(threads && threads.Thread);
        return _threadsAvailable;
    } catch {
        // Module not available (Expo Go or not installed)
        _threadsAvailable = false;
        return false;
    }
}

/**
 * Check if react-native-worklets-core is available
 * This is a fallback option (limited crypto support)
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
 * Expo Go doesn't support native modules like threads/worklets
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
 * Check if background threading is supported
 * Prioritizes react-native-threads over worklets
 */
export function isBackgroundThreadingSupported(): boolean {
    return (isThreadsAvailable() || isWorkletsAvailable()) && !isExpoGo();
}

/**
 * Get the best available threading method
 */
export function getThreadingMethod(): 'threads' | 'worklets' | 'main-thread' {
    if (isExpoGo()) {
        return 'main-thread';
    }

    if (isThreadsAvailable()) {
        return 'threads';
    }

    if (isWorkletsAvailable()) {
        return 'worklets';
    }

    return 'main-thread';
}

/**
 * Reset cached values (useful for testing)
 */
export function resetCapabilityCache(): void {
    _threadsAvailable = null;
    _workletsAvailable = null;
}
