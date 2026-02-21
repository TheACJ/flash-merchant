import { STORAGE_KEYS } from '@/constants/storage';
import { Mnemonic, Wallet } from 'ethers';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { v4 as uuidv4 } from 'uuid';
import { setPrivateKeyAsync } from '../utils/SecureStoreWrapper';
import binanceService from './BinanceService';
import { BitcoinService, BTC_NETWORKS } from './BitcoinService';
import solanaService from './SolanaService';
import { getExecutionEnvironment, getThreadingMethod } from './worklets/CapabilityDetection';

export interface WalletCreationResult {
  id: string;
  address: string;
  publicKey: string;
  type: 'ethereum' | 'solana' | 'bitcoin' | 'bnb';
  network: 'mainnet' | 'testnet' | 'sepolia';
  balance: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export interface MultiChainWalletResult {
  ethereum: WalletCreationResult;
  solana: WalletCreationResult;
  bitcoin: WalletCreationResult;
  bnb: WalletCreationResult;
}

export interface WalletGenerationStatus {
  status: 'idle' | 'generating' | 'completed' | 'error';
  progress: number;
  wallets?: MultiChainWalletResult;
  error?: string;
}

type ThreadingMethod = 'threads' | 'worklets' | 'main-thread';

/**
 * WalletWorkletService - Non-blocking wallet generation
 * 
 * This service generates cryptocurrency wallets without blocking the UI.
 * It uses the best available threading method:
 * 
 * PRIORITY:
 * 1. react-native-threads (dev builds) - Full npm access, true background thread
 * 2. react-native-worklets-core (dev builds) - Limited, requires native crypto
 * 3. Main thread with yield-to-UI (Expo Go) - Compatible but slower
 * 
 * FALLBACK BEHAVIOR:
 * - Dev Build / Production: Uses background threads for wallet generation
 * - Expo Go: Falls back to chunked processing with yield-to-UI pattern
 */
class WalletWorkletService {
  private readonly WALLETS_STORAGE_KEY = STORAGE_KEYS.wallets_data;
  private generationStatus: WalletGenerationStatus = {
    status: 'idle',
    progress: 0,
  };
  private listeners: Array<(status: WalletGenerationStatus) => void> = [];
  private threadingMethod: ThreadingMethod = 'main-thread';
  private threadService: any = null;

  constructor() {
    // Determine the best available threading method
    this.threadingMethod = getThreadingMethod();

    if (this.threadingMethod === 'threads') {
      // Lazy load the thread service
      try {
        const { WalletThreadService } = require('./workers/WalletThreadService');
        this.threadService = WalletThreadService.getInstance();
        console.log('[WalletWorkletService] Using react-native-threads for background wallet generation');
      } catch (error) {
        console.warn('[WalletWorkletService] Failed to load thread service, falling back to main thread:', error);
        this.threadingMethod = 'main-thread';
      }
    } else if (this.threadingMethod === 'worklets') {
      // Worklets have limited crypto support, fall back to main thread
      console.log('[WalletWorkletService] Worklets available but have limited crypto support, using main thread with yield-to-UI');
      this.threadingMethod = 'main-thread';
    } else {
      console.log(`[WalletWorkletService] Running in ${getExecutionEnvironment()} mode, using main thread with yield-to-UI`);
    }
  }

  /**
   * Subscribe to wallet generation status updates
   */
  subscribe(listener: (status: WalletGenerationStatus) => void): () => void {
    this.listeners.push(listener);

    // Create unsubscribe function first
    let unsubscribed = false;
    const unsubscribe = () => {
      if (unsubscribed) return;
      unsubscribed = true;
      this.listeners = this.listeners.filter(l => l !== listener);
    };

    // Notify with current status asynchronously so unsubscribe is defined first
    setTimeout(() => {
      if (!unsubscribed) {
        listener(this.generationStatus);
      }
    }, 0);

    return unsubscribe;
  }

  /**
   * Notify all listeners of status changes
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.generationStatus));
  }

  /**
   * Update generation status and notify listeners
   */
  private updateStatus(update: Partial<WalletGenerationStatus>) {
    this.generationStatus = { ...this.generationStatus, ...update };
    this.notifyListeners();
  }

  /**
   * Yield control back to the UI thread
   * This allows React Native to process pending UI updates
   * Used as a fallback when worklets are not available
   */
  private yieldToUI(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  /**
   * Generate secure entropy for wallet creation
   */
  async generateSecureEntropy(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(16);
    return '0x' + Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Store wallet secrets securely
   */
  private async storeWalletSecrets(walletId: string, privateKey: string, mnemonic?: string): Promise<void> {
    await setPrivateKeyAsync(walletId, privateKey);
    await SecureStore.setItemAsync(`${STORAGE_KEYS.wallet_address}${walletId}`, walletId);

    if (mnemonic) {
      await SecureStore.setItemAsync(`${STORAGE_KEYS.wallet_mnemonic}${walletId}`, mnemonic);
      await SecureStore.setItemAsync(STORAGE_KEYS.wallet_mnemonic_primary, mnemonic);
    }
  }

  /**
   * Save wallet to storage
   */
  private async saveWalletToStorage(wallet: WalletCreationResult): Promise<void> {
    const walletsStr = await SecureStore.getItemAsync(this.WALLETS_STORAGE_KEY);
    const wallets = walletsStr ? JSON.parse(walletsStr) : [];
    wallets.push(wallet);
    await SecureStore.setItemAsync(this.WALLETS_STORAGE_KEY, JSON.stringify(wallets));
  }

  /**
   * Save all wallets to storage in a single atomic operation
   * This prevents race conditions when saving multiple wallets
   */
  private async saveAllWalletsToStorage(walletsList: WalletCreationResult[]): Promise<void> {
    await SecureStore.setItemAsync(this.WALLETS_STORAGE_KEY, JSON.stringify(walletsList));
  }

  /**
   * Create Ethereum wallet
   */
  private async createEthereumWallet(mnemonic: string, now: number): Promise<WalletCreationResult> {
    const ethWallet = Wallet.fromPhrase(mnemonic);
    const ethWalletId = uuidv4();
    await this.storeWalletSecrets(ethWalletId, ethWallet.privateKey, mnemonic);

    return {
      id: ethWalletId,
      address: ethWallet.address,
      publicKey: '',
      type: 'ethereum',
      network: process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' ? 'mainnet' : 'sepolia',
      balance: '0',
      name: 'Ethereum Wallet',
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Create Solana wallet
   */
  private async createSolanaWallet(entropy: string, mnemonic: string, now: number): Promise<WalletCreationResult> {
    const solWallet = await solanaService.createWalletFromEntropy(entropy);
    const solWalletId = uuidv4();
    await this.storeWalletSecrets(solWalletId, solWallet.privateKey, mnemonic);

    return {
      id: solWalletId,
      address: solWallet.address,
      publicKey: solWallet.publicKey,
      type: 'solana',
      network: process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' ? 'mainnet' : 'testnet',
      balance: '0',
      name: 'Solana Wallet',
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Create Bitcoin wallet
   */
  private async createBitcoinWallet(entropy: string, mnemonic: string, now: number): Promise<WalletCreationResult> {
    const btcWallet = await BitcoinService.createWalletFromEntropy(
      entropy,
      process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' ? BTC_NETWORKS.LIVE_NET : BTC_NETWORKS.TEST_NET
    );
    const btcWalletId = uuidv4();
    await this.storeWalletSecrets(btcWalletId, btcWallet.privateKey, mnemonic);

    return BitcoinService.toWalletCreationResult(btcWallet, btcWalletId);
  }

  /**
   * Create BNB wallet
   */
  private async createBNBWallet(entropy: string, mnemonic: string, now: number): Promise<WalletCreationResult> {
    const bnbWallet = await binanceService.createWalletFromEntropy(entropy);
    const bnbWalletId = uuidv4();
    await this.storeWalletSecrets(bnbWalletId, bnbWallet.privateKey, mnemonic);

    return {
      id: bnbWalletId,
      address: bnbWallet.address,
      publicKey: bnbWallet.publicKey,
      type: 'bnb',
      network: bnbWallet.network as 'mainnet' | 'testnet',
      balance: '0',
      name: 'BNB Wallet',
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Import Ethereum wallet from mnemonic
   */
  private async importEthereumWallet(mnemonic: string, now: number): Promise<WalletCreationResult> {
    const ethWallet = Wallet.fromPhrase(mnemonic);
    const ethWalletId = uuidv4();
    await this.storeWalletSecrets(ethWalletId, ethWallet.privateKey, mnemonic);

    return {
      id: ethWalletId,
      address: ethWallet.address,
      publicKey: '',
      type: 'ethereum',
      network: process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' ? 'mainnet' : 'sepolia',
      balance: '0',
      name: 'Ethereum Wallet',
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Import Solana wallet from mnemonic
   */
  private async importSolanaWallet(mnemonic: string, now: number): Promise<WalletCreationResult> {
    const solWallet = await solanaService.importWalletFromMnemonic(mnemonic);
    const solWalletId = uuidv4();
    await this.storeWalletSecrets(solWalletId, solWallet.privateKey, mnemonic);

    return {
      id: solWalletId,
      address: solWallet.address,
      publicKey: solWallet.publicKey,
      type: 'solana',
      network: process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' ? 'mainnet' : 'testnet',
      balance: '0',
      name: 'Solana Wallet',
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Import Bitcoin wallet from mnemonic
   */
  private async importBitcoinWallet(mnemonic: string, now: number): Promise<WalletCreationResult> {
    const btcWallet = await BitcoinService.importWalletFromMnemonic(
      mnemonic,
      process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' ? BTC_NETWORKS.LIVE_NET : BTC_NETWORKS.TEST_NET
    );
    const btcWalletId = uuidv4();
    await this.storeWalletSecrets(btcWalletId, btcWallet.privateKey, mnemonic);

    return BitcoinService.toWalletCreationResult(btcWallet, btcWalletId);
  }

  /**
   * Import BNB wallet from mnemonic
   */
  private async importBNBWallet(mnemonic: string, now: number): Promise<WalletCreationResult> {
    const bnbWallet = await binanceService.importWalletFromMnemonic(mnemonic);
    const bnbWalletId = uuidv4();
    await this.storeWalletSecrets(bnbWalletId, bnbWallet.privateKey, mnemonic);

    return {
      id: bnbWalletId,
      address: bnbWallet.address,
      publicKey: bnbWallet.publicKey,
      type: 'bnb',
      network: bnbWallet.network as 'mainnet' | 'testnet',
      balance: '0',
      name: 'BNB Wallet',
      createdAt: now,
      updatedAt: now
    };
  }

  /**
   * Main wallet generation function - uses worklet thread when available
   * Falls back to yield-to-UI pattern for Expo Go compatibility
   */
  async createWalletAsync(): Promise<MultiChainWalletResult> {
    // Reset status
    this.updateStatus({ status: 'generating', progress: 0, wallets: undefined, error: undefined });

    try {
      // Generate entropy on main thread (uses native crypto)
      const entropy = await this.generateSecureEntropy();
      const mnemonic = Mnemonic.fromEntropy(entropy).phrase;
      const now = Date.now();

      this.updateStatus({ progress: 10 });

      // Use background thread if available, otherwise yield-to-UI pattern
      if (this.threadingMethod === 'threads' && this.threadService) {
        return await this.createWalletsWithThread(entropy, mnemonic, now);
      } else {
        return await this.createWalletsWithYieldToUI(entropy, mnemonic, now);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.updateStatus({ status: 'error', error: errorMessage });
      throw error;
    }
  }

  /**
   * Create wallets using background thread (dev builds only)
   * This runs all crypto operations on a separate JS thread
   */
  private async createWalletsWithThread(
    entropy: string,
    mnemonic: string,
    now: number
  ): Promise<MultiChainWalletResult> {
    try {
      // Run wallet generation on background thread
      const rawWallets = await this.threadService.generateWallets(entropy, (progress: number) => {
        this.updateStatus({ progress });
      });

      this.updateStatus({ progress: 90 });

      // Create wallet results with proper IDs and storage
      const ethWalletId = uuidv4();
      await this.storeWalletSecrets(ethWalletId, rawWallets.ethereum.privateKey, mnemonic);

      const solWalletId = uuidv4();
      await this.storeWalletSecrets(solWalletId, rawWallets.solana.privateKey, mnemonic);

      const btcWalletId = uuidv4();
      await this.storeWalletSecrets(btcWalletId, rawWallets.bitcoin.privateKey, mnemonic);

      const bnbWalletId = uuidv4();
      await this.storeWalletSecrets(bnbWalletId, rawWallets.bnb.privateKey, mnemonic);

      const wallets: MultiChainWalletResult = {
        ethereum: {
          id: ethWalletId,
          address: rawWallets.ethereum.address,
          publicKey: '',
          type: 'ethereum',
          network: process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' ? 'mainnet' : 'sepolia',
          balance: '0',
          name: 'Ethereum Wallet',
          createdAt: now,
          updatedAt: now,
        },
        solana: {
          id: solWalletId,
          address: rawWallets.solana.address,
          publicKey: rawWallets.solana.publicKey,
          type: 'solana',
          network: process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' ? 'mainnet' : 'testnet',
          balance: '0',
          name: 'Solana Wallet',
          createdAt: now,
          updatedAt: now,
        },
        bitcoin: {
          id: btcWalletId,
          address: rawWallets.bitcoin.address,
          publicKey: rawWallets.bitcoin.publicKey,
          type: 'bitcoin',
          network: process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' ? 'mainnet' : 'testnet',
          balance: '0',
          name: 'Bitcoin Wallet',
          createdAt: now,
          updatedAt: now,
        },
        bnb: {
          id: bnbWalletId,
          address: rawWallets.bnb.address,
          publicKey: rawWallets.bnb.publicKey,
          type: 'bnb',
          network: process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' ? 'mainnet' : 'testnet',
          balance: '0',
          name: 'BNB Wallet',
          createdAt: now,
          updatedAt: now,
        },
      };

      // Save all wallets in a single atomic write operation
      await this.saveAllWalletsToStorage([wallets.ethereum, wallets.solana, wallets.bitcoin, wallets.bnb]);

      this.updateStatus({ status: 'completed', progress: 100, wallets });

      return wallets;
    } catch (error) {
      console.warn('[WalletWorkletService] Thread generation failed, falling back to main thread:', error);
      // Fallback to yield-to-UI pattern
      return await this.createWalletsWithYieldToUI(entropy, mnemonic, now);
    }
  }

  /**
   * Create wallets with yield-to-UI pattern (Expo Go compatible)
   * Yields control between each wallet creation to allow UI updates
   */
  private async createWalletsWithYieldToUI(
    entropy: string,
    mnemonic: string,
    now: number
  ): Promise<MultiChainWalletResult> {
    // Yield before starting to allow navigation animation to complete
    await this.yieldToUI();

    // Create Ethereum wallet (25% progress)
    const ethWallet = await this.createEthereumWallet(mnemonic, now);
    this.updateStatus({ progress: 25 });
    await this.yieldToUI();

    // Create Solana wallet (50% progress)
    const solWallet = await this.createSolanaWallet(entropy, mnemonic, now);
    this.updateStatus({ progress: 50 });
    await this.yieldToUI();

    // Create Bitcoin wallet (75% progress)
    const btcWallet = await this.createBitcoinWallet(entropy, mnemonic, now);
    this.updateStatus({ progress: 75 });
    await this.yieldToUI();

    // Create BNB wallet (90% progress)
    const bnbWallet = await this.createBNBWallet(entropy, mnemonic, now);
    this.updateStatus({ progress: 90 });
    await this.yieldToUI();

    // Save all wallets to storage at once to avoid race condition
    const wallets: MultiChainWalletResult = {
      ethereum: ethWallet,
      solana: solWallet,
      bitcoin: btcWallet,
      bnb: bnbWallet
    };

    // Save all wallets in a single atomic write operation
    await this.saveAllWalletsToStorage([ethWallet, solWallet, btcWallet, bnbWallet]);

    this.updateStatus({ status: 'completed', progress: 100, wallets });

    return wallets;
  }

  /**
   * Start wallet generation in the background
   * Returns immediately while generation continues
   */
  async startBackgroundGeneration(): Promise<void> {
    // Start generation without waiting for completion
    this.createWalletAsync().catch(error => {
      console.error('Background wallet generation failed:', error);
    });
  }

  /**
   * Import wallet from mnemonic - uses yield-to-UI pattern for Expo Go compatibility
   * This prevents UI freezing during wallet import
   */
  async importWalletFromMnemonicAsync(mnemonic: string): Promise<MultiChainWalletResult> {
    // Reset status
    this.updateStatus({ status: 'generating', progress: 0, wallets: undefined, error: undefined });

    try {
      const now = Date.now();

      this.updateStatus({ progress: 10 });

      // Yield before starting to allow UI to update
      await this.yieldToUI();

      // Import Ethereum wallet (25% progress)
      const ethWallet = await this.importEthereumWallet(mnemonic, now);
      this.updateStatus({ progress: 25 });
      await this.yieldToUI();

      // Import Solana wallet (50% progress)
      const solWallet = await this.importSolanaWallet(mnemonic, now);
      this.updateStatus({ progress: 50 });
      await this.yieldToUI();

      // Import Bitcoin wallet (75% progress)
      const btcWallet = await this.importBitcoinWallet(mnemonic, now);
      this.updateStatus({ progress: 75 });
      await this.yieldToUI();

      // Import BNB wallet (90% progress)
      const bnbWallet = await this.importBNBWallet(mnemonic, now);
      this.updateStatus({ progress: 90 });
      await this.yieldToUI();

      // Save all wallets to storage at once to avoid race condition
      const wallets: MultiChainWalletResult = {
        ethereum: ethWallet,
        solana: solWallet,
        bitcoin: btcWallet,
        bnb: bnbWallet
      };

      // Save all wallets in a single atomic write operation
      await this.saveAllWalletsToStorage([ethWallet, solWallet, btcWallet, bnbWallet]);

      this.updateStatus({ status: 'completed', progress: 100, wallets });

      return wallets;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      this.updateStatus({ status: 'error', error: errorMessage });
      throw error;
    }
  }

  /**
   * Start wallet import in the background
   * Returns immediately while import continues
   */
  async startBackgroundImport(mnemonic: string): Promise<void> {
    // Start import without waiting for completion
    this.importWalletFromMnemonicAsync(mnemonic).catch(error => {
      console.error('Background wallet import failed:', error);
    });
  }

  /**
   * Get current generation status
   */
  getStatus(): WalletGenerationStatus {
    return this.generationStatus;
  }

  /**
   * Wait for wallet generation to complete
   * Returns immediately if already completed
   */
  async waitForCompletion(): Promise<MultiChainWalletResult> {
    return new Promise((resolve, reject) => {
      const unsubscribe = this.subscribe((status) => {
        if (status.status === 'completed' && status.wallets) {
          unsubscribe();
          resolve(status.wallets);
        } else if (status.status === 'error') {
          unsubscribe();
          reject(new Error(status.error || 'Wallet generation failed'));
        }
      });
    });
  }

  /**
   * Reset the generation status
   */
  reset() {
    this.updateStatus({ status: 'idle', progress: 0, wallets: undefined, error: undefined });
  }
}

export default new WalletWorkletService();
