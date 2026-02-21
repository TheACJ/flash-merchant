/**
 * Wallet Worklet Executor
 * 
 * Executes wallet generation on a background thread using react-native-worklets-core.
 * This implementation only runs when worklets are available (dev builds, not Expo Go).
 * 
 * IMPORTANT: This file uses dynamic imports to avoid bundling issues in Expo Go.
 */


// Type definitions for worklet context
type WorkletContextType = {
    runOnJS: <T>(fn: (...args: any[]) => T) => (...args: any[]) => Promise<T>;
};

type WorkletsModuleType = {
    createContext: (name: string) => WorkletContextType;
    createRunOnContext: <T>(
        context: WorkletContextType,
        fn: (...args: any[]) => T
    ) => (...args: any[]) => Promise<T>;
    Worklets: {
        defaultContext: WorkletContextType;
    };
};

// Lazy-loaded modules
let _worklets: WorkletsModuleType | null = null;
let _workletContext: WorkletContextType | null = null;
let _generateWalletsFn: ((entropy: string) => Promise<RawWalletData>) | null = null;
let _isAvailable: boolean | null = null;

/**
 * Raw wallet data returned from the worklet thread
 * Contains only serializable data (no functions, no class instances)
 */
interface RawWalletData {
    ethereum: { address: string; privateKey: string };
    bitcoin: { address: string; privateKey: string; publicKey: string };
    solana: { address: string; privateKey: string; publicKey: string };
    bnb: { address: string; privateKey: string; publicKey: string };
    mnemonic: string;
}

/**
 * Check if worklets module is available
 */
function loadWorkletsModule(): WorkletsModuleType | null {
    if (_worklets !== null) {
        return _worklets;
    }

    try {
        // Dynamic require to avoid bundling issues
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        _worklets = require('react-native-worklets-core');
        return _worklets;
    } catch {
        _worklets = null;
        return null;
    }
}

/**
 * Get or create the worklet context
 */
function getWorkletContext(): WorkletContextType | null {
    if (_workletContext) {
        return _workletContext;
    }

    const worklets = loadWorkletsModule();
    if (!worklets) {
        return null;
    }

    try {
        _workletContext = worklets.createContext('walletGeneration');
        return _workletContext;
    } catch (error) {
        console.error('[WalletWorkletExecutor] Failed to create worklet context:', error);
        return null;
    }
}

/**
 * Create the worklet function for wallet generation
 * This function runs on a separate JS thread
 */
function createWorkletFunction(): ((entropy: string) => Promise<RawWalletData>) | null {
    if (_generateWalletsFn) {
        return _generateWalletsFn;
    }

    const worklets = loadWorkletsModule();
    const context = getWorkletContext();

    if (!worklets || !context) {
        return null;
    }

    try {
        // Define the worklet function
        // Note: This function runs in a separate JS context with limited access
        // All crypto operations must be self-contained
        _generateWalletsFn = worklets.createRunOnContext(
            context,
            (entropy: string): RawWalletData => {
                'worklet';

                // Parse entropy hex string to bytes
                const hex = entropy.replace(/^0x/, '');
                const entropyBytes = new Uint8Array(hex.length / 2);
                for (let i = 0; i < hex.length; i += 2) {
                    entropyBytes[i / 2] = parseInt(hex.substr(i, 2), 16);
                }

                // Note: In a real worklet context, we would need to bundle the crypto libraries
                // For now, this is a placeholder that returns the entropy
                // The actual implementation would require:
                // 1. Bundling @scure/bip39, @scure/bip32, ethers, etc. for the worklet context
                // 2. Or using a native module for crypto operations

                // This placeholder shows the structure - actual crypto would happen here
                return {
                    ethereum: {
                        address: '',
                        privateKey: '',
                    },
                    bitcoin: {
                        address: '',
                        privateKey: '',
                        publicKey: '',
                    },
                    solana: {
                        address: '',
                        privateKey: '',
                        publicKey: '',
                    },
                    bnb: {
                        address: '',
                        privateKey: '',
                        publicKey: '',
                    },
                    mnemonic: '',
                };
            }
        );

        return _generateWalletsFn;
    } catch (error) {
        console.error('[WalletWorkletExecutor] Failed to create worklet function:', error);
        return null;
    }
}

/**
 * Wallet Worklet Executor class
 * Provides an interface to run wallet generation on a background thread
 */
export class WalletWorkletExecutor {
    private static instance: WalletWorkletExecutor;

    private constructor() { }

    static getInstance(): WalletWorkletExecutor {
        if (!WalletWorkletExecutor.instance) {
            WalletWorkletExecutor.instance = new WalletWorkletExecutor();
        }
        return WalletWorkletExecutor.instance;
    }

    /**
     * Check if worklet execution is available
     * Returns false in Expo Go or if react-native-worklets-core is not installed
     */
    isAvailable(): boolean {
        if (_isAvailable !== null) {
            return _isAvailable;
        }

        const worklets = loadWorkletsModule();
        if (!worklets) {
            _isAvailable = false;
            return false;
        }

        const context = getWorkletContext();
        const fn = createWorkletFunction();

        _isAvailable = !!(context && fn);
        return _isAvailable;
    }

    /**
     * Generate wallets on the worklet thread
     * Returns raw wallet data that needs to be processed on the main thread
     * 
     * @throws Error if worklet execution is not available
     */
    async generateWallets(_entropy: string): Promise<RawWalletData> {
        const generateFn = createWorkletFunction();

        if (!generateFn) {
            throw new Error('Worklet execution not available');
        }

        // Note: The current placeholder implementation doesn't actually generate wallets
        // This is because worklets have limited access to npm packages
        // For a production implementation, you would need to either:
        // 1. Bundle crypto libraries specifically for the worklet context
        // 2. Use a native module (JSI) for crypto operations
        // 3. Use a different approach like react-native-threads

        // For now, throw an error to indicate this needs proper implementation
        throw new Error('Worklet wallet generation requires native crypto module or bundled crypto libraries');
    }

    /**
     * Reset the cached state (useful for testing)
     */
    static reset(): void {
        _worklets = null;
        _workletContext = null;
        _generateWalletsFn = null;
        _isAvailable = null;
    }
}

export default WalletWorkletExecutor.getInstance();
