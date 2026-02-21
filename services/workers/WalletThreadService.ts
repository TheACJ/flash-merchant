/**
 * Wallet Thread Service
 * 
 * Manages wallet generation in a separate JavaScript thread using react-native-threads.
 * This provides true background execution with full access to npm crypto libraries.
 * 
 * IMPORTANT: This only works in dev builds / production builds, NOT in Expo Go.
 */


// Type for the Thread class from react-native-threads
interface Thread {
    onmessage: (message: string) => void;
    postMessage: (message: string) => void;
    terminate: () => void;
}

interface ThreadModule {
    Thread: new (workerPath: string) => Thread;
}

interface RawWalletData {
    ethereum: { address: string; privateKey: string; publicKey: string };
    bitcoin: { address: string; privateKey: string; publicKey: string };
    solana: { address: string; privateKey: string; publicKey: string };
    bnb: { address: string; privateKey: string; publicKey: string };
    mnemonic: string;
}

interface ProgressCallback {
    (progress: number): void;
}

// Cached thread module
let _threadModule: ThreadModule | null = null;
let _isAvailable: boolean | null = null;

/**
 * Load the react-native-threads module
 */
function loadThreadModule(): ThreadModule | null {
    if (_threadModule !== null) {
        return _threadModule;
    }

    try {
        // Dynamic require to avoid bundling issues in Expo Go
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        _threadModule = require('react-native-threads');
        return _threadModule;
    } catch {
        _threadModule = null;
        return null;
    }
}

/**
 * Wallet Thread Service class
 * Manages a background thread for wallet generation
 */
export class WalletThreadService {
    private static instance: WalletThreadService;
    private thread: Thread | null = null;
    private progressCallback: ProgressCallback | null = null;
    private isGenerating: boolean = false;

    private constructor() { }

    static getInstance(): WalletThreadService {
        if (!WalletThreadService.instance) {
            WalletThreadService.instance = new WalletThreadService();
        }
        return WalletThreadService.instance;
    }

    /**
     * Check if thread-based execution is available
     */
    static isAvailable(): boolean {
        if (_isAvailable !== null) {
            return _isAvailable;
        }

        const module = loadThreadModule();
        _isAvailable = !!(module && module.Thread);
        return _isAvailable;
    }

    /**
     * Initialize the worker thread
     */
    private initializeThread(): Thread {
        const module = loadThreadModule();
        if (!module) {
            throw new Error('react-native-threads not available');
        }

        // Create new thread with the wallet worker
        // The path is relative to the project root
        this.thread = new module.Thread('services/workers/wallet.worker.js');

        return this.thread;
    }

    /**
     * Terminate the worker thread
     */
    private terminateThread(): void {
        if (this.thread) {
            this.thread.terminate();
            this.thread = null;
        }
    }

    /**
     * Generate wallets on background thread
     */
    async generateWallets(
        entropy: string,
        onProgress?: ProgressCallback
    ): Promise<RawWalletData> {
        if (this.isGenerating) {
            throw new Error('Wallet generation already in progress');
        }

        this.isGenerating = true;
        this.progressCallback = onProgress || null;

        try {
            const thread = this.thread || this.initializeThread();

            return new Promise<RawWalletData>((resolve, reject) => {
                // Set up message handler
                thread.onmessage = (message: string) => {
                    try {
                        const data = JSON.parse(message);

                        switch (data.type) {
                            case 'ready':
                                // Worker is ready, send generate command
                                thread.postMessage(JSON.stringify({
                                    type: 'generate',
                                    entropy,
                                    environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development'
                                }));
                                break;

                            case 'progress':
                                // Progress update
                                if (this.progressCallback) {
                                    this.progressCallback(data.progress);
                                }
                                break;

                            case 'result':
                                // Generation complete
                                this.isGenerating = false;
                                resolve(data.wallets);
                                break;

                            case 'error':
                                // Error occurred
                                this.isGenerating = false;
                                reject(new Error(data.error));
                                break;

                            default:
                                console.warn('[WalletThreadService] Unknown message type:', data.type);
                        }
                    } catch (error) {
                        this.isGenerating = false;
                        reject(error);
                    }
                };

                // Handle thread errors
                // Note: react-native-threads doesn't have onerror, errors come through onmessage
            });
        } catch (error) {
            this.isGenerating = false;
            throw error;
        }
    }

    /**
     * Import wallets from mnemonic on background thread
     */
    async importWallets(
        mnemonic: string,
        onProgress?: ProgressCallback
    ): Promise<RawWalletData> {
        if (this.isGenerating) {
            throw new Error('Wallet import already in progress');
        }

        this.isGenerating = true;
        this.progressCallback = onProgress || null;

        try {
            const thread = this.thread || this.initializeThread();

            return new Promise<RawWalletData>((resolve, reject) => {
                thread.onmessage = (message: string) => {
                    try {
                        const data = JSON.parse(message);

                        switch (data.type) {
                            case 'ready':
                                thread.postMessage(JSON.stringify({
                                    type: 'import',
                                    mnemonic,
                                    environment: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development'
                                }));
                                break;

                            case 'progress':
                                if (this.progressCallback) {
                                    this.progressCallback(data.progress);
                                }
                                break;

                            case 'result':
                                this.isGenerating = false;
                                resolve(data.wallets);
                                break;

                            case 'error':
                                this.isGenerating = false;
                                reject(new Error(data.error));
                                break;

                            default:
                                console.warn('[WalletThreadService] Unknown message type:', data.type);
                        }
                    } catch (error) {
                        this.isGenerating = false;
                        reject(error);
                    }
                };
            });
        } catch (error) {
            this.isGenerating = false;
            throw error;
        }
    }

    /**
     * Cancel ongoing generation
     */
    cancel(): void {
        if (this.isGenerating) {
            this.terminateThread();
            this.isGenerating = false;
            this.progressCallback = null;
        }
    }

    /**
     * Clean up resources
     */
    dispose(): void {
        this.terminateThread();
        this.isGenerating = false;
        this.progressCallback = null;
    }

    /**
     * Check if generation is in progress
     */
    isInProgress(): boolean {
        return this.isGenerating;
    }
}

export default WalletThreadService.getInstance();
