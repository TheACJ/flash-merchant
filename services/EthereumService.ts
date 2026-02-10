import "@ethersproject/shims";
import "react-native-get-random-values";

import { Alchemy, Network } from "alchemy-sdk";
import {
    Contract,
    JsonRpcProvider,
    Mnemonic,
    Wallet,
    WebSocketProvider,
    ethers,
    formatEther,
    formatUnits,
    isAddress,
    parseEther,
    parseUnits
} from "ethers";
import { v4 as uuidv4 } from 'uuid';
import { Transaction, TransactionStatus } from '../types/transaction';
import { Wallet as WalletData, WalletType } from '../types/wallet';
import { WalletService } from './WalletService';

// Alias WalletData to WalletSlice to minimize code changes
type WalletSlice = WalletData;

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
const TOKEN_ADDRESSES: Record<'eth' | 'sepolia', Record<string, string>> = {
    eth: {
        USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum Mainnet USDT
    },
    sepolia: {
        USDT: '0x881364744ef5CC586D698297607F05d48d73adde', // Sepolia Testnet USDT
    }
};

interface SendTransactionResponse {
    gasEstimate: string;
    totalCost: string;
    totalCostMinusGas: string;
    gasFee: bigint;
}

interface AssetTransferParams {
    fromBlock: string;
    excludeZeroValue: boolean;
    withMetadata: boolean;
    maxCount?: number;
    toAddress?: string;
    fromAddress?: string;
    pageKey?: string;
    category: string[];
}

export type TransactionSpeed = 'slow' | 'normal' | 'fast' | 'custom';

export class EthereumService {
    private provider: JsonRpcProvider;
    private webSocketProvider: WebSocketProvider | null = null; // Initialize with null
    private alchemy: Alchemy;
    private readonly network: 'mainnet' | 'sepolia';
    private apiKey: string;
    private walletService: WalletService;

    constructor(config: { network: 'mainnet' | 'sepolia'; apiKey: string }, walletService: WalletService) {
        this.network = config.network;
        this.apiKey = config.apiKey;
        this.walletService = walletService;

        // Validate API key
        if (!this.apiKey || this.apiKey.trim() === '') {
            // Allow empty for optional initialization, but warn
            console.warn('Alchemy API key is missing. Ethereum functionality will be limited.');
        }

        const network = config.network === 'mainnet' ? Network.ETH_MAINNET : Network.ETH_SEPOLIA;

        try {
            this.alchemy = new Alchemy({
                apiKey: this.apiKey,
                network,
                maxRetries: 3,
            });

            // Initialize HTTP provider with proper network configuration
            const httpUrl = config.network === 'mainnet'
                ? `https://eth-mainnet.g.alchemy.com/v2/${this.apiKey}`
                : `https://eth-sepolia.g.alchemy.com/v2/${this.apiKey}`;

            this.provider = new ethers.JsonRpcProvider(httpUrl, {
                name: config.network,
                chainId: config.network === 'mainnet' ? 1 : 11155111, // Sepolia chainId
            });

            // Initialize WebSocket provider
            try {
                const wsUrl = config.network === 'mainnet'
                    ? `wss://eth-mainnet.g.alchemy.com/v2/${this.apiKey}`
                    : `wss://eth-sepolia.g.alchemy.com/v2/${this.apiKey}`;

                this.webSocketProvider = new WebSocketProvider(wsUrl, {
                    name: config.network,
                    chainId: config.network === 'mainnet' ? 1 : 11155111,
                });

                if (this.webSocketProvider.websocket) {
                    this.webSocketProvider.websocket.onerror = (error: any) => {
                        console.warn('WebSocket connection error:', error);
                        this.webSocketProvider = null; // Reset on error
                    };
                }
            } catch (wsError) {
                console.warn('WebSocket initialization failed:', wsError);
                this.webSocketProvider = null;
            }

        } catch (error) {
            console.error('Failed to initialize Ethereum service:', error);
            throw new Error('Failed to initialize Ethereum service. Please check your API key and network configuration.');
        }
    }

    async createWallet(): Promise<WalletSlice> {
        try {
            // Get secure entropy from WalletService
            const entropy = await this.walletService.generateSecureEntropy();

            // Create mnemonic from entropy
            const mnemonic = Mnemonic.fromEntropy(entropy);
            const wallet = Wallet.fromPhrase(mnemonic.phrase);

            const now = Date.now();
            return {
                id: uuidv4(),
                address: wallet.address,
                privateKey: wallet.privateKey,
                publicKey: '', // Wallet from ethers v6 doesn't expose publicKey
                type: 'ethereum',
                network: this.network,
                balance: '0',
                name: 'Ethereum Wallet',
                createdAt: now,
                updatedAt: now
            };
        } catch (error) {
            throw new Error(`Failed to create wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async restoreWalletFromPhrase(mnemonic: string): Promise<WalletSlice> {
        try {
            const wallet = Wallet.fromPhrase(mnemonic);
            const now = Date.now();
            return {
                id: uuidv4(),
                address: wallet.address,
                privateKey: wallet.privateKey,
                publicKey: '', // Wallet from ethers v6 doesn't expose publicKey
                type: 'ethereum',
                network: this.network,
                balance: '0',
                name: 'Ethereum Wallet',
                createdAt: now,
                updatedAt: now
            };
        } catch (error) {
            throw new Error(`Failed to restore wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getBalance(address: string): Promise<string> {
        if (!isAddress(address)) {
            throw new Error('Invalid address');
        }

        try {
            const balance = await this.provider.getBalance(address);
            return formatEther(balance);
        } catch (error) {
            console.error('Failed to get ETH balance:', error);
            throw new Error(`Failed to get ETH balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async sendTransaction(
        fromWallet: WalletSlice,
        toAddress: string,
        amount: string
    ): Promise<Transaction> {
        try {
            const wallet = new ethers.Wallet(fromWallet.privateKey, this.provider);
            const tx = await wallet.sendTransaction({
                to: toAddress,
                value: ethers.parseEther(amount),
            });

            const receipt = await tx.wait();
            if (!receipt) {
                throw new Error('Transaction receipt is null');
            }

            return {
                id: tx.hash,
                walletId: fromWallet.address,
                type: 'send',
                status: receipt.status === 1 ? 'completed' as TransactionStatus : 'failed' as TransactionStatus,
                amount,
                token: 'ETH',
                from: fromWallet.address,
                to: toAddress,
                timestamp: new Date().getTime(),
                hash: tx.hash,
                network: 'ethereum' as WalletType,
                fee: ethers.formatEther(receipt.gasUsed * receipt.gasPrice),
                blockNumber: receipt.blockNumber,
            };
        } catch (error) {
            console.error('Error sending Ethereum transaction:', error);
            throw error;
        }
    }

    getProvider(): JsonRpcProvider {
        return this.provider;
    }

    async getGasPriceEstimates(): Promise<{
        slow: bigint;
        standard: bigint;
        fast: bigint;
        maxPriorityFeePerGas: bigint;
        baseFee: bigint;
    }> {
        try {
            const feeData = await this.provider.getFeeData();
            const gasPrice = feeData.gasPrice || feeData.maxFeePerGas || BigInt(0);

            return {
                slow: (gasPrice * BigInt(90)) / BigInt(100),
                standard: gasPrice,
                fast: (gasPrice * BigInt(120)) / BigInt(100),
                maxPriorityFeePerGas: feeData.maxPriorityFeePerGas || BigInt(0),
                baseFee: feeData.maxFeePerGas || BigInt(0)
            };
        } catch (error) {
            // Fallback or rethrow
            console.warn('Failed to fetch gas price, using defaults');
            return {
                slow: BigInt(0),
                standard: BigInt(0),
                fast: BigInt(0),
                maxPriorityFeePerGas: BigInt(0),
                baseFee: BigInt(0)
            }
        }
    }

    async getERC20TokenInfo(tokenAddress: string, address: string): Promise<any> {
        if (!isAddress(address) || !isAddress(tokenAddress)) {
            throw new Error('Invalid address or token address');
        }

        try {
            console.log(`Fetching token info for ${this.network} network, token: ${tokenAddress}, address: ${address}`);

            // Get the correct token address based on network
            let networkTokenAddress = tokenAddress;
            if (tokenAddress.toLowerCase() === TOKEN_ADDRESSES.eth.USDT.toLowerCase()) {
                networkTokenAddress = TOKEN_ADDRESSES[this.network === 'mainnet' ? 'eth' : 'sepolia']?.USDT || tokenAddress;
            }

            const contract = new Contract(networkTokenAddress, ERC20_ABI, this.provider);

            const [balance, decimals, symbol, name] = await Promise.all([
                contract.balanceOf(address),
                contract.decimals(),
                contract.symbol(),
                contract.name()
            ]);

            return {
                address: networkTokenAddress,
                balance: formatUnits(balance, decimals),
                decimals,
                symbol,
                name
            };
        } catch (error) {
            console.error(`Failed to get ERC20 token info:`, error);
            throw new Error(`Failed to get ERC20 token info: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async sendNativeToken(
        fromWallet: Wallet,
        toAddress: string,
        amount: string,
        options: {
            maxFeePerGas?: string;
            maxPriorityFeePerGas?: string;
            retries?: number;
        } = {}
    ): Promise<string> {
        const { maxFeePerGas, maxPriorityFeePerGas, retries = 3 } = options;

        if (!isAddress(toAddress)) {
            throw new Error('Invalid recipient address');
        }

        if (isNaN(Number(amount)) || Number(amount) <= 0) {
            throw new Error('Invalid amount');
        }

        const tx = {
            to: toAddress,
            value: parseEther(amount),
        };

        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const [feeData, gasLimit, block] = await Promise.all([
                    this.provider.getFeeData(),
                    fromWallet.estimateGas(tx),
                    this.provider.getBlock('latest')
                ]);

                if (!block) {
                    throw new Error('Failed to get latest block');
                }

                const maxFee = maxFeePerGas
                    ? parseUnits(maxFeePerGas, 'gwei')
                    : (feeData.maxFeePerGas || feeData.gasPrice || 0n) * 2n;

                const maxPriorityFee = maxPriorityFeePerGas
                    ? parseUnits(maxPriorityFeePerGas, 'gwei')
                    : (feeData.maxPriorityFeePerGas || feeData.gasPrice || 0n) / 2n;

                const finalTx = {
                    ...tx,
                    gasLimit: gasLimit * 120n / 100n,
                    maxFeePerGas: maxFee,
                    maxPriorityFeePerGas: maxPriorityFee,
                    nonce: await fromWallet.getNonce(),
                    chainId: (await this.provider.getNetwork()).chainId
                };

                const txResponse = await fromWallet.sendTransaction(finalTx);
                const receipt = await txResponse.wait();

                if (!receipt || receipt.status === 0) {
                    throw new Error('Transaction failed');
                }

                return receipt.hash;
            } catch (error) {
                if (attempt === retries) {
                    throw new Error(`Failed to send ETH after ${retries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
        throw new Error('Transaction failed after all retries');
    }

    async sendERC20Token(
        fromWallet: Wallet,
        tokenAddress: string,
        toAddress: string,
        amount: string,
        options: {
            maxFeePerGas?: string;
            maxPriorityFeePerGas?: string;
        } = {}
    ): Promise<string> {
        if (!isAddress(toAddress) || !isAddress(tokenAddress)) {
            throw new Error('Invalid address or token address');
        }

        if (isNaN(Number(amount)) || Number(amount) <= 0) {
            throw new Error('Invalid amount');
        }

        const contract = new Contract(tokenAddress, ERC20_ABI, fromWallet);

        try {
            const decimals = await contract.decimals();
            const parsedAmount = parseUnits(amount, decimals);

            const feeData = await this.provider.getFeeData();

            const maxFee = options.maxFeePerGas
                ? parseUnits(options.maxFeePerGas, 'gwei')
                : (feeData.maxFeePerGas || feeData.gasPrice || 0n) * 2n;

            const maxPriorityFee = options.maxPriorityFeePerGas
                ? parseUnits(options.maxPriorityFeePerGas, 'gwei')
                : (feeData.maxPriorityFeePerGas || feeData.gasPrice || 0n) / 2n;

            const tx = await contract.transfer(toAddress, parsedAmount, {
                maxFeePerGas: maxFee,
                maxPriorityFeePerGas: maxPriorityFee,
                nonce: await fromWallet.getNonce(),
                chainId: (await this.provider.getNetwork()).chainId
            });

            const receipt = await tx.wait();

            if (!receipt || receipt.status === 0) {
                throw new Error('Transaction failed');
            }

            return receipt.hash;
        } catch (error) {
            throw new Error(`Failed to send ERC20 token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
