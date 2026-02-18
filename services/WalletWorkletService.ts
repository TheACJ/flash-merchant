import { STORAGE_KEYS } from '@/constants/storage';
import { Mnemonic, Wallet } from 'ethers';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { v4 as uuidv4 } from 'uuid';
import { setPrivateKeyAsync } from '../utils/SecureStoreWrapper';
import binanceService from './BinanceService';
import { BitcoinService, BTC_NETWORKS } from './BitcoinService';
import solanaService from './SolanaService';

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

/**
 * WalletWorkletService - Non-blocking wallet generation using React Native Worklets
 * 
 * This service generates cryptocurrency wallets on a background thread to prevent UI blocking.
 * It uses React Native Worklets to run the CPU-intensive wallet generation operations
 * without freezing the UI thread.
 */
class WalletWorkletService {
  private readonly WALLETS_STORAGE_KEY = STORAGE_KEYS.wallets_data;
  private generationStatus: WalletGenerationStatus = {
    status: 'idle',
    progress: 0,
  };
  private listeners: Array<(status: WalletGenerationStatus) => void> = [];

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
   * Main wallet generation function - runs on background thread using worklet
   * This is the non-blocking version that prevents UI freezing
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

      // Create Ethereum wallet (25% progress)
      const ethWallet = await this.createEthereumWallet(mnemonic, now);
      this.updateStatus({ progress: 25 });

      // Create Solana wallet (50% progress)
      const solWallet = await this.createSolanaWallet(entropy, mnemonic, now);
      this.updateStatus({ progress: 50 });

      // Create Bitcoin wallet (75% progress)
      const btcWallet = await this.createBitcoinWallet(entropy, mnemonic, now);
      this.updateStatus({ progress: 75 });

      // Create BNB wallet (90% progress)
      const bnbWallet = await this.createBNBWallet(entropy, mnemonic, now);
      this.updateStatus({ progress: 90 });

      // Save all wallets to storage at once to avoid race condition
      // Reading and writing separately in parallel causes data loss
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
   * Import wallet from mnemonic - non-blocking version
   * This prevents UI freezing during wallet import
   */
  async importWalletFromMnemonicAsync(mnemonic: string): Promise<MultiChainWalletResult> {
    // Reset status
    this.updateStatus({ status: 'generating', progress: 0, wallets: undefined, error: undefined });

    try {
      const now = Date.now();

      this.updateStatus({ progress: 10 });

      // Import Ethereum wallet (25% progress)
      const ethWallet = await this.importEthereumWallet(mnemonic, now);
      this.updateStatus({ progress: 25 });

      // Import Solana wallet (50% progress)
      const solWallet = await this.importSolanaWallet(mnemonic, now);
      this.updateStatus({ progress: 50 });

      // Import Bitcoin wallet (75% progress)
      const btcWallet = await this.importBitcoinWallet(mnemonic, now);
      this.updateStatus({ progress: 75 });

      // Import BNB wallet (90% progress)
      const bnbWallet = await this.importBNBWallet(mnemonic, now);
      this.updateStatus({ progress: 90 });

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
