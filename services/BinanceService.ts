import "@ethersproject/shims";
import "react-native-get-random-values";

import {
    Contract,
    JsonRpcProvider,
    Mnemonic,
    Wallet,
    ethers,
    formatEther,
    formatUnits,
    isAddress,
    parseEther,
    parseUnits,
} from "ethers";
import { v4 as uuidv4 } from 'uuid';
import { TokenInfo } from '../types/wallet';
import { WalletService } from './WalletService';

// ERC20 ABI (same as BEP20)
const BEP20_ABI = [
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

export interface BinanceWalletResult {
    id: string;
    address: string;
    privateKey: string;
    publicKey: string;
    type: 'bnb';
    network: 'mainnet' | 'testnet';
    balance: string;
    name: string;
    mnemonic?: string;
}

export class BinanceService {
    private provider: JsonRpcProvider;
    private readonly network: 'mainnet' | 'testnet';
    private walletService: WalletService;

    constructor(config: { network: 'mainnet' | 'testnet' }, walletService: WalletService) {
        this.network = config.network;
        this.walletService = walletService;

        // BSC RPC URLs
        const rpcUrl = config.network === 'mainnet'
            ? 'https://bsc-dataseed1.binance.org/'
            : 'https://data-seed-prebsc-1-s1.binance.org:8545/';

        try {
            this.provider = new ethers.JsonRpcProvider(rpcUrl, {
                name: 'bnb',
                chainId: config.network === 'mainnet' ? 56 : 97,
            });
        } catch (error) {
            console.error('Failed to initialize Binance service:', error);
            throw new Error('Failed to initialize Binance service. Please check network configuration.');
        }
    }

    async createWalletFromEntropy(entropy: string): Promise<BinanceWalletResult> {
        try {
            // Create mnemonic from entropy
            const mnemonic = Mnemonic.fromEntropy(entropy);
            const wallet = Wallet.fromPhrase(mnemonic.phrase);

            return {
                id: uuidv4(),
                address: wallet.address,
                privateKey: wallet.privateKey,
                publicKey: '', // Wallet from ethers v6 doesn't expose publicKey
                type: 'bnb',
                network: this.network,
                balance: '0',
                name: `BNB Wallet`,
                mnemonic: mnemonic.phrase
            };
        } catch (error) {
            throw new Error(`Failed to create BNB wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async importWalletFromMnemonic(mnemonic: string): Promise<BinanceWalletResult> {
        try {
            const wallet = Wallet.fromPhrase(mnemonic);

            return {
                id: uuidv4(),
                address: wallet.address,
                privateKey: wallet.privateKey,
                publicKey: '',
                type: 'bnb',
                network: this.network,
                balance: '0',
                name: `BNB Wallet`,
                mnemonic
            };
        } catch (error) {
            throw new Error(`Failed to import BNB wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    static toWalletCreationResult(wallet: BinanceWalletResult, id?: string): any {
        return {
            id: id || wallet.id,
            address: wallet.address,
            privateKey: wallet.privateKey,
            publicKey: wallet.publicKey,
            type: 'bnb',
            network: wallet.network,
            balance: wallet.balance,
            name: wallet.name,
            mnemonic: wallet.mnemonic
        };
    }

    async getBalance(address: string): Promise<string> {
        if (!isAddress(address)) {
            throw new Error('Invalid address');
        }

        try {
            const balance = await this.provider.getBalance(address);
            return formatEther(balance);
        } catch (error) {
            console.error('Failed to get BNB balance:', error);
            throw new Error(`Failed to get BNB balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getBEP20TokenInfo(tokenAddress: string, address: string): Promise<TokenInfo> {
        if (!isAddress(address) || !isAddress(tokenAddress)) {
            throw new Error('Invalid address or token address');
        }

        try {
            console.log(`Fetching BEP20 token info for ${this.network} network, token: ${tokenAddress}, address: ${address}`);

            const contract = new Contract(tokenAddress, BEP20_ABI, this.provider);

            const [balance, decimals, symbol, name] = await Promise.all([
                contract.balanceOf(address),
                contract.decimals(),
                contract.symbol(),
                contract.name()
            ]);

            return {
                address: tokenAddress,
                balance: formatUnits(balance, decimals),
                decimals,
                symbol,
                name
            };
        } catch (error) {
            console.error(`Failed to get BEP20 token info:`, error);
            throw new Error(`Failed to get BEP20 token info: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async sendNativeToken(
        fromWallet: Wallet,
        toAddress: string,
        amount: string,
        options: {
            gasPrice?: string;
            retries?: number;
        } = {}
    ): Promise<string> {
        const { gasPrice, retries = 3 } = options;

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
                const [gasEstimate, block] = await Promise.all([
                    fromWallet.estimateGas(tx),
                    this.provider.getBlock('latest')
                ]);

                if (!block) {
                    throw new Error('Failed to get latest block');
                }

                const gasPriceValue = gasPrice
                    ? parseUnits(gasPrice, 'gwei')
                    : (await this.provider.getFeeData()).gasPrice || BigInt(5000000000); // 5 gwei default

                const finalTx = {
                    ...tx,
                    gasLimit: gasEstimate * 120n / 100n,
                    gasPrice: gasPriceValue,
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
                    throw new Error(`Failed to send BNB after ${retries} attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }

        throw new Error('Transaction failed after all retries');
    }

    async sendBEP20Token(
        fromWallet: Wallet,
        tokenAddress: string,
        toAddress: string,
        amount: string,
        options: {
            gasPrice?: string;
        } = {}
    ): Promise<string> {
        if (!isAddress(toAddress) || !isAddress(tokenAddress)) {
            throw new Error('Invalid address or token address');
        }

        if (isNaN(Number(amount)) || Number(amount) <= 0) {
            throw new Error('Invalid amount');
        }

        const contract = new Contract(tokenAddress, BEP20_ABI, fromWallet);

        try {
            const decimals = await contract.decimals();
            const parsedAmount = parseUnits(amount, decimals);

            const gasPriceValue = options.gasPrice
                ? parseUnits(options.gasPrice, 'gwei')
                : (await this.provider.getFeeData()).gasPrice || BigInt(5000000000); // 5 gwei default

            const tx = await contract.transfer(toAddress, parsedAmount, {
                gasPrice: gasPriceValue,
                nonce: await fromWallet.getNonce(),
                chainId: (await this.provider.getNetwork()).chainId
            });

            const receipt = await tx.wait();

            if (!receipt || receipt.status === 0) {
                throw new Error('Transaction failed');
            }

            return receipt.hash;
        } catch (error) {
            throw new Error(`Failed to send BEP20 token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    getProvider(): JsonRpcProvider {
        return this.provider;
    }

    validateAddress(address: string): boolean {
        return isAddress(address);
    }
}
