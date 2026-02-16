import { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { mnemonicToSeedSync, entropyToMnemonic, validateMnemonic } from "@scure/bip39";
import { wordlist } from "@scure/bip39/wordlists/english";
import { hmac } from "@noble/hashes/hmac";
import { sha512 } from "@noble/hashes/sha512";

const HARDENED_OFFSET = 0x80000000;

function uint32BE(n: number) {
  return new Uint8Array([(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff]);
}

async function deriveEd25519Path(seed: Uint8Array, path: string): Promise<Uint8Array> {
  let key = hmac(sha512, new TextEncoder().encode("ed25519 seed"), seed);
  let priv = key.slice(0, 32);
  let chainCode = key.slice(32);
  const segments = path.split("/").slice(1).map((v) => {
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

  constructor(rpcUrl: string) {
    this.connection = new Connection(rpcUrl, { commitment: 'confirmed' });
  }

  async createWalletFromEntropy(entropy: Uint8Array | string) {
    let mnemonic: string;
    if (typeof entropy === "string") {
      const hex = entropy.replace(/^0x/, "");
      const bytes = Uint8Array.from(hex.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));
      mnemonic = entropyToMnemonic(bytes, wordlist);
    } else {
      mnemonic = entropyToMnemonic(entropy, wordlist);
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
    };
  }

  async importWalletFromMnemonic(mnemonic: string) {
    if (!validateMnemonic(mnemonic, wordlist)) {
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
    };
  }

  async getBalance(publicKeyString: string): Promise<number> {
    const publicKey = new PublicKey(publicKeyString);
    const balance = await this.connection.getBalance(publicKey);
    return balance / LAMPORTS_PER_SOL;
  }
}

const rpcUrl = process.env.EXPO_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
export default new SolanaService(rpcUrl);
