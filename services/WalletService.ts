import { ethers, Wallet } from 'ethers';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { v4 as uuidv4 } from 'uuid';
import { TokenInfo, Wallet as WalletType } from '../types/wallet';
import { BinanceService } from './BinanceService';
import { BitcoinService, BTC_NETWORKS } from './BitcoinService';
import { EthereumService } from './EthereumService';
import solanaService from './SolanaService';


// ERC20 ABI with additional functions
const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
    'function transfer(address to, uint256 amount) returns (bool)',
    'function allowance(address owner, address spender) view returns (uint256)',
    'function approve(address spender, uint256 amount) returns (bool)',
    'function symbol() view returns (string)',
    'function name() view returns (string)',
    'event Transfer(address indexed from, address indexed to, uint256 value)',
    'event Approval(address indexed owner, address indexed spender, uint256 value)'
];

// Common token addresses
const TOKEN_ADDRESSES = {
    eth: {
        USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum Mainnet USDT
    },
    bnb: {
        USDT: '0x55d398326f99059fF775485246999027B3197955', // BSC Mainnet USDT
    },
    sepolia: {
        USDT: '0x881364744ef5CC586D698297607F05d48d73adde',
        USDC: '0x6f14C02Fc1F78322cFd7d707aB90f18baD3B54f5', // Sepolia Testnet USDT
    }
};

export interface WalletCreationResult extends Omit<WalletType, 'id' | 'createdAt' | 'updatedAt'> {
    id?: string;
}

export interface MultiChainWalletResult {
    ethereum: WalletCreationResult;
    solana: WalletCreationResult;
    bitcoin: WalletCreationResult;
    bnb: WalletCreationResult;
}

export class WalletService {
    private ethService: EthereumService;
    private readonly WALLET_KEY = 'wallet_private_key';
    private readonly WALLET_ADDRESS_KEY = 'wallet_address';
    private readonly WALLET_MNEMONIC_KEY = 'wallet_mnemonic';
    private readonly WALLETS_STORAGE_KEY = 'wallets_data';

    constructor(apiKeyEth: string) {
        // Ensure we're using Sepolia for development
        const network = process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' ? 'mainnet' : 'sepolia';
        this.ethService = new EthereumService({ network, apiKey: apiKeyEth }, this);
    }

    /**
     * Generates secure entropy for wallet creation
     * @returns A hex string with 0x prefix containing secure random bytes
     */
    async generateSecureEntropy(): Promise<string> {
        try {
            // Generate secure random bytes using expo-crypto
            const randomBytes = await Crypto.getRandomBytesAsync(16);

            // Convert Uint8Array to hex string with 0x prefix
            return '0x' + Array.from(randomBytes)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');
        } catch (error) {
            throw new Error(`Failed to generate secure entropy: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Creates both Ethereum and Solana wallets from the same entropy and returns them
     */
    async createWallet(): Promise<MultiChainWalletResult> {
        try {
            // Generate secure random bytes using expo-crypto
            const randomBytes = await Crypto.getRandomBytesAsync(16);
            // Convert to hex string
            const entropy = '0x' + Array.from(randomBytes)
                .map(b => b.toString(16).padStart(2, '0'))
                .join('');

            // Create Ethereum wallet from entropy
            const ethWallet = ethers.Wallet.fromPhrase(
                ethers.Mnemonic.fromEntropy(entropy).phrase
            );
            const ethWalletData: WalletCreationResult = {
                id: uuidv4(),
                address: ethWallet.address,
                privateKey: ethWallet.privateKey,
                publicKey: '', // Wallet from ethers v6 doesn't expose publicKey
                type: 'ethereum',
                network: process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' ? 'mainnet' : 'sepolia',
                balance: '0',
                name: "Ethereum Wallet",  //`Wallet ${ethWallet.address.slice(0, 6)}`,
                mnemonic: ethWallet.mnemonic?.phrase || ''
            };
            console.log("Created ETHwallet:", ethWalletData)

            // Create Solana wallet from the same entropy (async)
            const solWallet = await solanaService.createWalletFromEntropy(entropy);

            const btcWallet = await BitcoinService.createWalletFromEntropy(
                entropy,
                process.env.EXPO_PUBLIC_ENVIRONMENT === 'production'
                    ? BTC_NETWORKS.LIVE_NET
                    : BTC_NETWORKS.TEST_NET
            );

            const btcWalletData = BitcoinService.toWalletCreationResult(btcWallet, uuidv4());

            console.log("Created BTCwallet:", btcWalletData);

            // Create BNB wallet from the same entropy
            const bnbService = new BinanceService({
                network: process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' ? 'mainnet' : 'testnet'
            }, this);
            const bnbWallet = await bnbService.createWalletFromEntropy(entropy);
            const bnbWalletData: WalletCreationResult = {
                id: uuidv4(),
                address: bnbWallet.address,
                privateKey: bnbWallet.privateKey,
                publicKey: bnbWallet.publicKey,
                type: 'bnb',
                network: bnbWallet.network,
                balance: '0',
                name: "BNB Wallet",  //`Wallet ${bnbWallet.address.slice(0, 6)}`,
                mnemonic: bnbWallet.mnemonic
            };
            console.log("Created BNBwallet:", bnbWalletData);

            const solWalletData: WalletCreationResult = {
                id: uuidv4(),
                address: solWallet.address,
                privateKey: solWallet.privateKey,
                publicKey: solWallet.publicKey,
                type: 'solana',
                network: process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' ? 'mainnet' : 'testnet',
                balance: '0',
                name: "Solana Wallet",  //`Wallet ${solWallet.address.slice(0, 6)}`,
                mnemonic: solWallet.mnemonic
            };
            console.log("Created SOLwallet:", solWalletData)

            // Save wallets to storage (ETH, SOL, BTC, BNB)
            await this.saveWalletToStorage(ethWalletData);
            await this.saveWalletToStorage(solWalletData);
            await this.saveWalletToStorage(btcWalletData);
            await this.saveWalletToStorage(bnbWalletData);

            return { ethereum: ethWalletData, solana: solWalletData, bitcoin: btcWalletData, bnb: bnbWalletData };
        } catch (error) {
            throw new Error(`Failed to create multi-chain wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Saves wallet data to secure storage
     */
    private async saveWalletToStorage(wallet: WalletCreationResult): Promise<void> {
        try {
            // Get existing wallets
            const existingWalletsStr = await SecureStore.getItemAsync(this.WALLETS_STORAGE_KEY);
            const existingWallets: WalletCreationResult[] = existingWalletsStr ? JSON.parse(existingWalletsStr) : [];

            // Add new wallet
            existingWallets.push(wallet);

            // Store only essential data in SecureStore
            // Save updated wallets list (only essential data)
            await SecureStore.setItemAsync(this.WALLETS_STORAGE_KEY, JSON.stringify(existingWallets.map(w => ({
                id: w.id,
                address: w.address,
                type: w.type,
                network: w.network,
                balance: w.balance,
                name: w.name
            }))));

            // Save sensitive data separately
            await Promise.all([
                SecureStore.setItemAsync(`${this.WALLET_KEY}_${wallet.id}`, wallet.privateKey),
                SecureStore.setItemAsync(`${this.WALLET_ADDRESS_KEY}_${wallet.id}`, wallet.address),
                SecureStore.setItemAsync(`${this.WALLET_MNEMONIC_KEY}_${wallet.id}`, wallet.mnemonic || '')
            ]);
        } catch (error) {
            console.error('Failed to save wallet:', error);
            throw new Error(`Failed to save wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Retrieves all wallets from secure storage
     */
    async getAllWallets(): Promise<WalletCreationResult[]> {
        try {
            const walletsStr = await SecureStore.getItemAsync(this.WALLETS_STORAGE_KEY);
            if (!walletsStr) {
                return [];
            }

            const wallets = JSON.parse(walletsStr);

            // Fetch sensitive data for each wallet
            const completeWallets = await Promise.all(
                wallets.map(async (wallet: any) => {
                    const [privateKey, mnemonic] = await Promise.all([
                        SecureStore.getItemAsync(`${this.WALLET_KEY}_${wallet.id}`),
                        SecureStore.getItemAsync(`${this.WALLET_MNEMONIC_KEY}_${wallet.id}`)
                    ]);

                    return {
                        ...wallet,
                        privateKey: privateKey || '',
                        mnemonic: mnemonic || undefined
                    };
                })
            );

            return completeWallets;
        } catch (error) {
            console.error('Failed to retrieve wallets:', error);
            throw new Error(`Failed to retrieve wallets: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Retrieves a specific wallet by ID
     */
    async getWalletById(id: string): Promise<WalletCreationResult | null> {
        try {
            const wallets = await this.getAllWallets();
            return wallets.find(w => w.id === id) || null;
        } catch (error) {
            throw new Error(`Failed to retrieve wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Updates wallet data in secure storage
     */
    async updateWallet(wallet: WalletCreationResult): Promise<void> {
        try {
            const wallets = await this.getAllWallets();
            const index = wallets.findIndex(w => w.id === wallet.id);

            if (index === -1) {
                throw new Error('Wallet not found');
            }

            wallets[index] = wallet;

            await SecureStore.setItemAsync(this.WALLETS_STORAGE_KEY, JSON.stringify(wallets));
        } catch (error) {
            throw new Error(`Failed to update wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Deletes a wallet from secure storage
     */
    async deleteWallet(id: string): Promise<void> {
        try {
            const wallets = await this.getAllWallets();
            const updatedWallets = wallets.filter(w => w.id !== id);

            await SecureStore.setItemAsync(this.WALLETS_STORAGE_KEY, JSON.stringify(updatedWallets));

            // Delete individual wallet data
            await Promise.all([
                SecureStore.deleteItemAsync(`${this.WALLET_KEY}_${id}`),
                SecureStore.deleteItemAsync(`${this.WALLET_ADDRESS_KEY}_${id}`),
                SecureStore.deleteItemAsync(`${this.WALLET_MNEMONIC_KEY}_${id}`)
            ]);
        } catch (error) {
            throw new Error(`Failed to delete wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Imports wallet from private key
     */
    async importWalletFromPrivateKey(privateKey: string): Promise<WalletCreationResult> {
        try {
            const wallet = new Wallet(privateKey);
            const walletData: WalletCreationResult = {
                id: uuidv4(),
                address: wallet.address,
                privateKey: wallet.privateKey,
                publicKey: '', // Wallet from ethers v6 doesn't expose publicKey
                type: 'ethereum',
                network: 'sepolia',
                balance: '0',
                name: "Ethereum Wallet"//`Wallet ${wallet.address.slice(0, 6)}`
            };

            await this.saveWalletToStorage(walletData);
            return walletData;
        } catch (error) {
            throw new Error(`Failed to import wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Imports both Ethereum and Solana wallets from the same mnemonic phrase
     */
    async importWalletFromMnemonic(mnemonic: string): Promise<MultiChainWalletResult> {
        try {
            // Import Ethereum wallet from mnemonic
            const ethWallet = Wallet.fromPhrase(mnemonic);
            const ethWalletData: WalletCreationResult = {
                id: uuidv4(),
                address: ethWallet.address,
                privateKey: ethWallet.privateKey,
                publicKey: '', // Wallet from ethers v6 doesn't expose publicKey
                type: 'ethereum',
                network: process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' ? 'mainnet' : 'sepolia',
                balance: '0',
                name: "Ethereum Wallet",
                mnemonic
            };

            // Import Solana wallet from the same mnemonic (async)
            const solWallet = await solanaService.importWalletFromMnemonic(mnemonic);
            const solWalletData: WalletCreationResult = {
                id: uuidv4(),
                address: solWallet.address,
                privateKey: solWallet.privateKey,
                publicKey: solWallet.publicKey,
                type: 'solana',
                network: process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' ? 'mainnet' : 'testnet',
                balance: '0',
                name: "Solana Wallet",
                mnemonic
            };

            // Import Bitcoin wallet from the same mnemonic
            // Always use LIVE_NET for Flash API compatibility (backend only accepts bc1 addresses)
            const btcWallet = await BitcoinService.importWalletFromMnemonic(
                mnemonic,
                process.env.EXPO_PUBLIC_ENVIRONMENT === 'production'
                    ? BTC_NETWORKS.LIVE_NET
                    : BTC_NETWORKS.TEST_NET
            );

            const btcWalletData = BitcoinService.toWalletCreationResult(btcWallet, uuidv4());

            // Import BNB wallet from the same mnemonic
            const bnbService = new BinanceService({
                network: process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' ? 'mainnet' : 'testnet'
            }, this);
            const bnbWallet = await bnbService.importWalletFromMnemonic(mnemonic);
            const bnbWalletData: WalletCreationResult = {
                id: uuidv4(),
                address: bnbWallet.address,
                privateKey: bnbWallet.privateKey,
                publicKey: bnbWallet.publicKey,
                type: 'bnb',
                network: bnbWallet.network,
                balance: '0',
                name: "BNB Wallet",
                mnemonic
            };

            // Save all wallets to storage
            await this.saveWalletToStorage(ethWalletData);
            await this.saveWalletToStorage(solWalletData);
            await this.saveWalletToStorage(btcWalletData);
            await this.saveWalletToStorage(bnbWalletData);

            return { ethereum: ethWalletData, solana: solWalletData, bitcoin: btcWalletData, bnb: bnbWalletData };
        } catch (error) {
            throw new Error(`Failed to import multi-chain wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Gets native token balance for both Ethereum and Solana
     */
    async getNativeBalance(address: string, walletType?: 'ethereum' | 'solana' | 'bitcoin'): Promise<string> {
        // If wallet type is not specified, try to determine from address format
        if (!walletType) {
            if (address.startsWith('0x') && address.length === 42) {
                walletType = 'ethereum';
            } else if (address.length >= 43 && address.length <= 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(address)) {
                walletType = 'solana';
            } else if ((address.startsWith('1') || address.startsWith('3') || address.startsWith('bc1')) ||
                (address.startsWith('m') || address.startsWith('n') || address.startsWith('tb1'))) {
                walletType = 'bitcoin';
            }
            else {
                throw new Error('Unable to determine wallet type from address format');
            }
        }

        // Validate address format matches wallet type
        if (walletType === 'ethereum') {
            if (!address.startsWith('0x') || address.length !== 42) {
                throw new Error('Invalid Ethereum address format');
            }
            return this.ethService.getBalance(address);
        } else if (walletType === 'solana') {
            // Validate Solana address format
            if (address.startsWith('0x') || address.length < 43 || address.length > 44 || !/^[1-9A-HJ-NP-Za-km-z]+$/.test(address)) {
                throw new Error('Invalid Solana address format - expected base58 encoded address');
            }

            try {
                const balance = await solanaService.getBalance(address);
                return balance.toString();
            } catch (error) {
                console.error('Failed to get Solana balance:', error);
                throw new Error(`Failed to get Solana balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        } else if (walletType === 'bitcoin') {
            // Determine network from address prefix
            const network = (address.startsWith('1') || address.startsWith('3') || address.startsWith('bc1'))
                ? BTC_NETWORKS.LIVE_NET
                : BTC_NETWORKS.TEST_NET;

            return BitcoinService.getBalance(address, network);
        }

        else {
            throw new Error('Unsupported wallet type for balance check');
        }
    }

    /**
     * Gets ERC20 token information and balance
     */
    async getERC20TokenInfo(tokenAddress: string, address: string): Promise<TokenInfo> {
        return this.ethService.getERC20TokenInfo(tokenAddress, address);
    }

    /**
     * Sends native tokens
     */
    async sendNativeToken(
        fromWallet: WalletCreationResult,
        toAddress: string,
        amount: string,
        options: {
            maxFeePerGas?: string;
            maxPriorityFeePerGas?: string;
            retries?: number;
        } = {}
    ): Promise<string> {
        const wallet = new Wallet(fromWallet.privateKey, this.ethService.getProvider());
        return this.ethService.sendNativeToken(wallet, toAddress, amount, options);
    }

    /**
     * Sends ERC20 tokens
     */
    async sendERC20Token(
        fromWallet: WalletCreationResult,
        tokenAddress: string,
        toAddress: string,
        amount: string,
        options: {
            maxFeePerGas?: string;
            maxPriorityFeePerGas?: string;
        } = {}
    ): Promise<string> {
        const wallet = new Wallet(fromWallet.privateKey, this.ethService.getProvider());
        return this.ethService.sendERC20Token(wallet, tokenAddress, toAddress, amount, options);
    }

    /**
     * Gets gas price estimates
     */
    async getGasPriceEstimates(): Promise<{
        slow: bigint;
        standard: bigint;
        fast: bigint;
        maxPriorityFeePerGas: bigint;
        baseFee: bigint;
    }> {
        return this.ethService.getGasPriceEstimates();
    }

    /**
     * Unified getTokenInfo for ERC20 (Ethereum) and SPL (Solana)
     */
    async getTokenInfo(tokenAddress: string, wallet: WalletCreationResult): Promise<TokenInfo> {
        if (wallet.type === 'ethereum') {
            return this.getERC20TokenInfo(tokenAddress, wallet.address);
        } else if (wallet.type === 'solana') {
            // TODO: Implement getSPLTokenInfo in SolanaService if needed
            throw new Error('Solana token info not yet implemented');
            // return await (solanaService as any).getSPLTokenInfo(tokenAddress, wallet.address);
        } else {
            throw new Error('Unsupported wallet type for token info');
        }
    }

    /**
     * Unified sendToken for ERC20 (Ethereum) and SPL (Solana)
     */
    async sendToken(
        fromWallet: WalletCreationResult,
        tokenAddress: string,
        toAddress: string,
        amount: string,
        options: {
            maxFeePerGas?: string;
            maxPriorityFeePerGas?: string;
        } = {}
    ): Promise<string> {
        if (fromWallet.type === 'ethereum') {
            return this.sendERC20Token(fromWallet, tokenAddress, toAddress, amount, options);
        } else if (fromWallet.type === 'solana') {
            // TODO: Implement sendSPLToken in SolanaService
            throw new Error('Solana token transfer not yet implemented');
            // return await (solanaService as any).sendSPLToken(fromWallet, tokenAddress, toAddress, amount);
        } else {
            throw new Error('Unsupported wallet type for sending token');
        }
    }
}

export default WalletService;
