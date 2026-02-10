import { hmac } from "@noble/hashes/hmac.js";
import { sha512 } from "@noble/hashes/sha2.js";
import { entropyToMnemonic, mnemonicToSeedSync, validateMnemonic } from "@scure/bip39";
import { wordlist as english } from "@scure/bip39/wordlists/english.js";
import {
    Connection,
    Keypair,
    LAMPORTS_PER_SOL,
    PublicKey,
    sendAndConfirmTransaction,
    SystemProgram,
    Transaction
} from "@solana/web3.js";

// Solana-specific transaction types
export type SolanaTransactionType =
    | 'SOL_TRANSFER'
    | 'TOKEN_TRANSFER'
    | 'SWAP'
    | 'NFT_TRANSFER'
    | 'STAKE'
    | 'UNSTAKE'
    | 'CREATE_ACCOUNT'
    | 'CLOSE_ACCOUNT'
    | 'UNKNOWN';

export type SolanaTransactionStatus =
    | 'finalized'
    | 'confirmed'
    | 'processed'
    | 'failed';

// Enhanced Solana transaction interface
export interface SolanaTransaction {
    signature: string;
    slot: number;
    blockTime: number | null;
    confirmationStatus: SolanaTransactionStatus;
    type: SolanaTransactionType;
    fee: number; // in lamports
    from: string;
    to: string;
    amount: string; // in SOL or token amount
    lamports?: number;
    tokenInfo?: {
        mint: string;
        symbol?: string;
        decimals: number;
    };
    err: any | null;
    memo?: string;
    innerInstructions?: number;
    computeUnitsConsumed?: number;
    parsedInstructions: ParsedSolanaInstruction[];
    meta?: any;
    transaction?: any;
}

export interface ParsedSolanaInstruction {
    programId: string;
    program: string;
    type: string;
    info?: any;
}

// Helper: Convert number to 4-byte big-endian Uint8Array
function uint32BE(n: number) {
    return new Uint8Array([
        (n >>> 24) & 0xff,
        (n >>> 16) & 0xff,
        (n >>> 8) & 0xff,
        n & 0xff,
    ]);
}

// Helper: Hardened index
const HARDENED_OFFSET = 0x80000000;

// SLIP-0010/BIP32-ed25519 derivation (hardened only)
async function deriveEd25519Path(seed: Uint8Array, path: string): Promise<Uint8Array> {
    let key = hmac(sha512, new TextEncoder().encode("ed25519 seed"), seed);
    let priv = key.slice(0, 32);
    let chainCode = key.slice(32);
    const segments = path
        .split("/")
        .slice(1)
        .map((v) => {
            if (v.endsWith("'")) return parseInt(v.slice(0, -1), 10) + HARDENED_OFFSET;
            return parseInt(v, 10);
        });
    for (const index of segments) {
        const data = new Uint8Array(1 + 32 + 4);
        data[0] = 0;
        data.set(priv, 1);
        data.set(uint32BE(index), 33);
        const I = hmac(sha512, chainCode, data);
        priv = I.slice(0, 32);
        chainCode = I.slice(32);
    }
    return priv;
}

class SolanaService {
    private connection: Connection;
    private readonly TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
    private readonly MEMO_PROGRAM_ID = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr';

    constructor(private rpcUrl: string) {
        this.connection = new Connection(rpcUrl, {
            commitment: 'confirmed',
            confirmTransactionInitialTimeout: 60000,
        });
    }

    /**
     * Get SOL balance
     */
    async getBalance(publicKeyString: string): Promise<number> {
        try {
            const publicKey = new PublicKey(publicKeyString);
            const balance = await this.connection.getBalance(publicKey);
            return balance / LAMPORTS_PER_SOL;
        } catch (error) {
            console.error("Error fetching Solana balance:", error);
            throw error;
        }
    }

    /**
     * Create wallet from entropy
     */
    async createWalletFromEntropy(entropy: Uint8Array | string) {
        let mnemonic: string;
        if (typeof entropy === "string") {
            const hex = entropy.replace(/^0x/, "");
            const bytes = Uint8Array.from(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
            mnemonic = entropyToMnemonic(bytes, english);
        } else {
            mnemonic = entropyToMnemonic(entropy, english);
        }

        const seed = mnemonicToSeedSync(mnemonic, "");
        const path = `m/44'/501'/0'/0'`;
        const priv = await deriveEd25519Path(seed, path);
        const keypair = Keypair.fromSeed(priv);

        return {
            address: keypair.publicKey.toBase58(),
            publicKey: keypair.publicKey.toBase58(),
            privateKey: Array.from(keypair.secretKey).map(b => b.toString(16).padStart(2, '0')).join(''),
            mnemonic,
            type: "solana",
            derivationPath: path,
        };
    }

    /**
     * Import wallet from mnemonic
     */
    async importWalletFromMnemonic(mnemonic: string) {
        if (!validateMnemonic(mnemonic, english)) {
            throw new Error("Invalid mnemonic phrase");
        }

        const seed = mnemonicToSeedSync(mnemonic, "");
        const path = `m/44'/501'/0'/0'`;
        const priv = await deriveEd25519Path(seed, path);
        const keypair = Keypair.fromSeed(priv);

        return {
            address: keypair.publicKey.toBase58(),
            publicKey: keypair.publicKey.toBase58(),
            privateKey: Array.from(keypair.secretKey).map(b => b.toString(16).padStart(2, '0')).join(''),
            mnemonic,
            type: "solana",
            derivationPath: path,
        };
    }

    /**
     * Import wallet from private key
     */
    importWalletFromPrivateKey(privateKey: Uint8Array | string) {
        const secretKey = typeof privateKey === "string"
            ? Uint8Array.from(privateKey.replace(/^0x/, "").match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)))
            : privateKey;

        const keypair = Keypair.fromSecretKey(secretKey);

        return {
            address: keypair.publicKey.toBase58(),
            publicKey: keypair.publicKey.toBase58(),
            privateKey: Array.from(keypair.secretKey).map(b => b.toString(16).padStart(2, '0')).join(''),
            type: "solana",
            derivationPath: null,
        };
    }

    /**
     * Send SOL transaction
     */
    async sendTransaction(secretKey: Uint8Array, to: string, amount: number): Promise<string> {
        try {
            const keyPair = Keypair.fromSecretKey(secretKey);
            const balance = await this.connection.getBalance(keyPair.publicKey);

            const amountLamports = amount * LAMPORTS_PER_SOL;
            const estimatedFee = 5000; // Conservative estimate

            if (balance < amountLamports + estimatedFee) {
                throw new Error("Insufficient funds for the transaction including fees");
            }

            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: keyPair.publicKey,
                    toPubkey: new PublicKey(to),
                    lamports: amountLamports,
                })
            );

            const { blockhash } = await this.connection.getLatestBlockhash('finalized');
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = keyPair.publicKey;

            const signature = await sendAndConfirmTransaction(
                this.connection,
                transaction,
                [keyPair],
                {
                    commitment: 'confirmed',
                    preflightCommitment: 'confirmed',
                }
            );

            return signature;
        } catch (err) {
            console.error("Error sending Solana transaction:", err);
            throw err;
        }
    }

}

// Initialize service with proper RPC URL handling
const { EXPO_PUBLIC_HELIUS_RPC_URL, EXPO_PUBLIC_HELIUS_API_KEY, EXPO_PUBLIC_SOLANA_RPC_URL } = process.env;

const customRpcUrl = EXPO_PUBLIC_HELIUS_RPC_URL || EXPO_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

if (!EXPO_PUBLIC_HELIUS_RPC_URL && !EXPO_PUBLIC_SOLANA_RPC_URL) {
    console.warn('Solana RPC URL not provided in env; falling back to public devnet RPC. Set EXPO_PUBLIC_HELIUS_RPC_URL or EXPO_PUBLIC_SOLANA_RPC_URL in EAS if you need a specific RPC.');
}

const solanaService = new SolanaService(customRpcUrl);
export default solanaService;
