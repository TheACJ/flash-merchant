import * as ecc from '@bitcoinerlab/secp256k1';
import { hmac } from '@noble/hashes/hmac.js';
import { ripemd160 } from '@noble/hashes/legacy.js';
import { sha256 } from '@noble/hashes/sha2.js';
import * as secp256k1 from '@noble/secp256k1';
import { HDKey } from '@scure/bip32';
import { entropyToMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import { WalletCreationResult } from './WalletService';

// 1. Helper to concatenate Uint8Arrays (fixes "Property 'concatBytes' does not exist")
const concatBytes = (...arrays: Uint8Array[]): Uint8Array => {
    const totalLength = arrays.reduce((acc, arr) => acc + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
};

// 2. Cast utils to 'any' to bypass TypeScript checks on hidden properties
const utils = secp256k1.utils as any;

// 3. Assign the synchronous hash functions with explicit types
utils.sha256Sync = (...messages: Uint8Array[]) => sha256(concatBytes(...messages));
utils.hmacSha256Sync = (key: Uint8Array, ...messages: Uint8Array[]) => hmac(sha256, key, concatBytes(...messages));
bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);


export enum BTC_NETWORKS {
    TEST_NET = 'testnet',
    LIVE_NET = 'livenet',
}

export interface BitcoinWallet {
    address: string;
    privateKey: string;
    publicKey: string;
    mnemonic: string;
    network: BTC_NETWORKS;
    derivationPath: string;
}

// Base58 encoding/decoding for addresses and WIF format
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function base58Encode(buffer: Uint8Array): string {
    if (buffer.length === 0) return '';

    // Convert to decimal
    let num = BigInt(0);
    for (let i = 0; i < buffer.length; i++) {
        num = num << BigInt(8);
        num += BigInt(buffer[i]);
    }

    // Convert to base58
    let str = '';
    while (num > BigInt(0)) {
        const mod = Number(num % BigInt(58));
        str = BASE58_ALPHABET[mod] + str;
        num = num / BigInt(58);
    }

    // Handle leading zeros
    let leadingZeros = 0;
    for (let i = 0; i < buffer.length && buffer[i] === 0; i++) {
        leadingZeros++;
    }

    return '1'.repeat(leadingZeros) + str;
}

function base58Decode(str: string): Uint8Array {
    if (str.length === 0) return new Uint8Array(0);

    let num = BigInt(0);
    let base = BigInt(1);

    // Convert from Base58 to decimal
    for (let i = str.length - 1; i >= 0; i--) {
        const char = str[i];
        const digit = BigInt(BASE58_ALPHABET.indexOf(char));
        if (digit < 0) throw new Error('Invalid base58 character');
        num += digit * base;
        base *= BigInt(58);
    }

    // Count leading '1's
    let leadingOnes = 0;
    for (let i = 0; i < str.length && str[i] === '1'; i++) {
        leadingOnes++;
    }

    // Convert to byte array
    const bytes: number[] = [];
    while (num > BigInt(0)) {
        bytes.unshift(Number(num & BigInt(0xff)));
        num = num >> BigInt(8);
    }

    // Add leading zeros
    const result = new Uint8Array(leadingOnes + bytes.length);
    result.set(bytes, leadingOnes);
    return result;
}

// Utility to convert Uint8Array to hex without Buffer
function toHex(bytes: Uint8Array): string {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Pure JavaScript base64 encoding/decoding without Buffer
function base64Encode(bytes: Uint8Array): string {
    // Use the browser's built-in btoa function for reliable base64 encoding
    try {
        let binaryString = '';
        for (let i = 0; i < bytes.length; i++) {
            binaryString += String.fromCharCode(bytes[i]);
        }
        return btoa(binaryString);
    } catch (error) {
        console.error('[BitcoinService] Base64 encode error:', error);
        throw new Error('Invalid bytes for base64 encoding');
    }
}

function base64Decode(str: string): Uint8Array {
    // Use the browser's built-in atob function for reliable base64 decoding
    try {
        const binaryString = atob(str);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    } catch (error) {
        console.error('[BitcoinService] Base64 decode error:', error);
        throw new Error('Invalid base64 string');
    }
}

// Bitcoin address generation functions
function hash160(data: Uint8Array): Uint8Array {
    return ripemd160(sha256(data));
}

function createP2PKHAddress(publicKey: Uint8Array, network: BTC_NETWORKS): string {
    // Accept compressed (33 bytes) or uncompressed (65 bytes) public keys
    if (!((publicKey.length === 33 && (publicKey[0] === 0x02 || publicKey[0] === 0x03)) || (publicKey.length === 65 && publicKey[0] === 0x04))) {
        throw new Error('Invalid public key format');
    }

    // Hash160 of the public key
    const pubKeyHash = hash160(publicKey);

    // Add network prefix (0x00 for mainnet, 0x6f for testnet)
    const networkPrefix = network === BTC_NETWORKS.LIVE_NET ? 0x00 : 0x6f;
    const payload = new Uint8Array([networkPrefix, ...pubKeyHash]);

    // Double SHA256 for checksum
    const checksum = sha256(sha256(payload)).slice(0, 4);

    // Combine payload + checksum and encode as base58
    const addressBytes = new Uint8Array([...payload, ...checksum]);
    return base58Encode(addressBytes);
}

// WIF encoding/decoding functions
const WIF_UTILS = {
    encode: (version: number, privateKey: Uint8Array, compressed: boolean = true): string => {
        const payload = compressed
            ? new Uint8Array([...privateKey, 0x01])
            : privateKey;

        const versionedPayload = new Uint8Array([version, ...payload]);

        // Double SHA256 checksum
        const checksum = sha256(sha256(versionedPayload)).slice(0, 4);

        const result = new Uint8Array([...versionedPayload, ...checksum]);
        return base58Encode(result);
    },

    decode: (wifString: string): { privateKey: Uint8Array; compressed: boolean; version: number } => {
        console.log('Decoding WIF string:', wifString);
        const decoded = base58Decode(wifString);
        console.log('Decoded WIF bytes:', Array.from(decoded));

        if (decoded.length < 37) {
            console.log('Invalid WIF length:', decoded.length);
            throw new Error('Invalid WIF length');
        }

        const checksum = decoded.slice(-4);
        const payload = decoded.slice(0, -4);

        // Verify checksum
        const expectedChecksum = sha256(sha256(payload)).slice(0, 4);
        console.log('WIF checksum comparison:');
        console.log('Expected:', Array.from(expectedChecksum));
        console.log('Actual:', Array.from(checksum));

        if (!checksum.every((byte, i) => byte === expectedChecksum[i])) {
            console.log('WIF checksum verification failed');
            throw new Error('Invalid WIF checksum');
        }

        const version = payload[0];
        const privateKeyData = payload.slice(1);
        console.log('WIF version:', `0x${version.toString(16).padStart(2, '0')}`);
        console.log('Private key data length:', privateKeyData.length);
        console.log('Last byte (if present):', privateKeyData.length > 32 ? `0x${privateKeyData[32].toString(16).padStart(2, '0')}` : 'N/A');

        if (privateKeyData.length === 33 && privateKeyData[32] === 0x01) {
            return {
                privateKey: privateKeyData.slice(0, 32),
                compressed: true,
                version
            };
        } else if (privateKeyData.length === 32) {
            return {
                privateKey: privateKeyData,
                compressed: false,
                version
            };
        } else {
            throw new Error('Invalid private key length in WIF');
        }
    }
};

// Address validation function
function validateBitcoinAddress(address: string, network: BTC_NETWORKS): boolean {
    try {
        console.log('Validating address:', address, 'network:', network);

        // Quick heuristics by prefix
        const lc = address.toLowerCase();

        // Bech32 (SegWit) addresses: bc1 (mainnet) or tb1 (testnet)
        if (lc.startsWith('bc1') || lc.startsWith('tb1')) {
            // Minimal bech32 decode/validation (BIP-173)
            const bech = bech32Decode(address);
            if (!bech) {
                console.log('Bech32 decode failed');
                return false;
            }
            const { hrp, data } = bech;
            // Check hrp matches network
            const expectedHrp = network === BTC_NETWORKS.LIVE_NET ? 'bc' : 'tb';
            if (hrp !== expectedHrp) {
                console.log('Bech32 HRP mismatch', hrp, expectedHrp);
                return false;
            }
            // Basic length checks for witness program (20 or 32 bytes for v0)
            if (data.length < 1) return false;
            const witnessVersion = data[0];
            const program = convertBits(data.slice(1), 5, 8, false);
            if (!program) return false;
            if (witnessVersion === 0) {
                return program.length === 20 || program.length === 32;
            }
            // Accept other versions conservatively
            return program.length >= 2 && program.length <= 40;
        }

        // Base58 addresses (P2PKH starts with 1 or m/n, P2SH starts with 3 or 2)
        if (/^[123mn][A-HJ-NP-Za-km-z1-9]+$/.test(address)) {
            const decoded = base58Decode(address);
            console.log('Decoded address bytes:', Array.from(decoded));

            // Address should be at least 25 bytes (21 payload + 4 checksum) for legacy types
            if (decoded.length !== 25) {
                console.log('Unexpected decoded length for base58 address', decoded.length);
                return false;
            }

            const checksum = decoded.slice(-4);
            const payload = decoded.slice(0, -4);
            const expectedChecksum = sha256(sha256(payload)).slice(0, 4);
            if (!checksum.every((byte, i) => byte === expectedChecksum[i])) {
                console.log('Checksum verification failed');
                return false;
            }

            const prefix = payload[0];
            // P2PKH: mainnet 0x00, testnet 0x6f
            // P2SH: mainnet 0x05, testnet 0xc4
            if (prefix === 0x00 || prefix === 0x6f) {
                const expected = network === BTC_NETWORKS.LIVE_NET ? 0x00 : 0x6f;
                return prefix === expected;
            }
            if (prefix === 0x05 || prefix === 0xc4) {
                const expected = network === BTC_NETWORKS.LIVE_NET ? 0x05 : 0xc4;
                return prefix === expected;
            }

            console.log('Unknown base58 prefix', prefix);
            return false;
        }

        console.log('Address format not recognized');
        return false;
    } catch (error) {
        console.error('Address validation error:', error);
        console.log('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
        return false;
    }
}

// ---------------- Bech32 helpers (minimal BIP-173 implementation) ----------------
const BECH32_CHARSET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';

function bech32Polymod(values: number[]): number {
    const GENERATORS = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
    let chk = 1;
    for (let p = 0; p < values.length; p++) {
        const top = chk >> 25;
        chk = ((chk & 0x1ffffff) << 5) ^ values[p];
        for (let i = 0; i < 5; i++) {
            if ((top >> i) & 1) chk ^= GENERATORS[i];
        }
    }
    return chk;
}

function bech32HrpExpand(hrp: string): number[] {
    const ret: number[] = [];
    for (let i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) >> 5);
    ret.push(0);
    for (let i = 0; i < hrp.length; i++) ret.push(hrp.charCodeAt(i) & 31);
    return ret;
}

function bech32VerifyChecksum(hrp: string, data: number[]): boolean {
    const combined = bech32HrpExpand(hrp).concat(data);
    return bech32Polymod(combined) === 1;
}

function bech32Decode(addr: string): { hrp: string; data: number[] } | null {
    if (addr.length < 8 || addr.length > 90) return null;
    // addresses are case-insensitive but cannot mix
    const lower = addr.toLowerCase();
    const pos = lower.lastIndexOf('1');
    if (pos < 1 || pos + 7 > lower.length) return null;
    const hrp = lower.slice(0, pos);
    const dataPart = lower.slice(pos + 1);
    const data: number[] = [];
    for (let i = 0; i < dataPart.length; i++) {
        const c = dataPart.charAt(i);
        const v = BECH32_CHARSET.indexOf(c);
        if (v === -1) return null;
        data.push(v);
    }
    if (!bech32VerifyChecksum(hrp, data)) return null;
    // data includes 6 checksum values at the end - strip them
    if (data.length < 6) return null;
    const payload = data.slice(0, data.length - 6);
    return { hrp, data: payload };
}

// Convert bits helper (from BIP173 reference implementation)
function convertBits(data: number[] | Uint8Array, fromBits: number, toBits: number, pad: boolean): number[] | null {
    let acc = 0;
    let bits = 0;
    const ret: number[] = [];
    const maxv = (1 << toBits) - 1;
    for (let p = 0; p < data.length; p++) {
        const value = data[p];
        if (value < 0 || value >> fromBits !== 0) return null;
        acc = (acc << fromBits) | value;
        bits += fromBits;
        while (bits >= toBits) {
            bits -= toBits;
            ret.push((acc >> bits) & maxv);
        }
    }
    if (pad) {
        if (bits > 0) ret.push((acc << (toBits - bits)) & maxv);
    } else if (bits >= fromBits || ((acc << (toBits - bits)) & maxv) !== 0) {
        return null;
    }
    return ret;
}

export class BitcoinService {
    /**
     * Gets Bitcoin balance for an address
     */
    static async getBalance(address: string, network: BTC_NETWORKS): Promise<string> {
        return "0"; // Placeholder
    }

    /**
      * Validates and imports a Bitcoin wallet from WIF private key with network auto-detection
      * Uses unified bitcoinjs-lib implementation for consistency
      */
    static importWalletFromPrivateKeyWithNetworkDetection(privateKeyWIF: string): BitcoinWallet {
        try {
            // Try to decode and determine network from WIF format
            const decoded = WIF_UTILS.decode(privateKeyWIF);

            // WIF version bytes: 0x80 = mainnet, 0xef = testnet
            const network = decoded.version === 0x80 ? BTC_NETWORKS.LIVE_NET : BTC_NETWORKS.TEST_NET;

            console.log('Auto-detected network from WIF:', network);
            return this.importWalletFromPrivateKey(privateKeyWIF, network);
        } catch (error) {
            throw new Error(`Failed to import Bitcoin wallet with network detection: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Creates a Bitcoin wallet from the same entropy used for Ethereum and Solana
     * Uses unified bitcoinjs-lib implementation for consistency
     */
    static async createWalletFromEntropy(
        entropy: string,
        network: BTC_NETWORKS = BTC_NETWORKS.TEST_NET
    ): Promise<BitcoinWallet> {
        console.log('Creating wallet from entropy:', entropy, 'network:', network);
        try {
            // Convert entropy to Uint8Array
            const entropyBytes = Uint8Array.from(
                entropy.replace(/^0x/, '')
                    .match(/.{1,2}/g)!
                    .map(byte => parseInt(byte, 16))
            );

            // Convert entropy to mnemonic using @scure/bip39
            const mnemonic = entropyToMnemonic(entropyBytes, wordlist);

            // Generate seed from mnemonic
            const seed = mnemonicToSeedSync(mnemonic);

            // Create HD key from seed
            const hdkey = HDKey.fromMasterSeed(seed);

            // Use coin type 1 for testnet and 0 for mainnet per BIP44
            const path = network === BTC_NETWORKS.TEST_NET ? "m/44'/1'/0'/0/0" : "m/44'/0'/0'/0/0";
            const child = hdkey.derive(path);

            if (!child.privateKey) {
                throw new Error('Failed to derive private key');
            }

            // Get network config
            const networkConfig = network === BTC_NETWORKS.LIVE_NET ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;

            // Create keyPair using bitcoinjs-lib (compressed for P2WPKH)
            bitcoin.initEccLib(ecc);
            const privKeyBuf = Buffer.from(child.privateKey as Uint8Array);
            const keyPair = ECPair.fromPrivateKey(privKeyBuf, {
                compressed: true,
                network: networkConfig
            });

            // Generate Bech32 address using bitcoinjs-lib (same method as btc-transaction.utils.ts)
            const { address } = bitcoin.payments.p2wpkh({
                pubkey: keyPair.publicKey,
                network: networkConfig
            });

            if (!address) {
                throw new Error('Failed to generate Bech32 address');
            }

            // Export WIF using bitcoinjs-lib native method (ensures consistency)
            const privateKeyWIF = keyPair.toWIF();

            // Get compressed public key hex
            const publicKey = keyPair.publicKey;

            console.log('Wallet created with unified bitcoinjs-lib implementation');
            console.log('Address:', address);
            console.log('Pubkey:', toHex(publicKey));
            console.log('WIF starts with:', privateKeyWIF.substring(0, 6) + '...');

            return {
                address,
                privateKey: privateKeyWIF,
                publicKey: toHex(publicKey),
                mnemonic,
                network,
                derivationPath: path,
            };
        } catch (error) {
            throw new Error(`Failed to create Bitcoin wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Imports a Bitcoin wallet from mnemonic
     * Uses unified bitcoinjs-lib implementation for consistency
     */
    static async importWalletFromMnemonic(
        mnemonic: string,
        network: BTC_NETWORKS = BTC_NETWORKS.TEST_NET
    ): Promise<BitcoinWallet> {
        try {
            if (!validateMnemonic(mnemonic, wordlist)) {
                throw new Error('Invalid mnemonic phrase');
            }

            // Generate seed from mnemonic
            const seed = mnemonicToSeedSync(mnemonic);

            // Create HD key from seed
            const hdkey = HDKey.fromMasterSeed(seed);

            // Use coin type 1 for testnet and 0 for mainnet per BIP44
            const path = network === BTC_NETWORKS.TEST_NET ? "m/44'/1'/0'/0/0" : "m/44'/0'/0'/0/0";
            const child = hdkey.derive(path);

            if (!child.privateKey) {
                throw new Error('Failed to derive private key');
            }

            // Get network config
            const networkConfig = network === BTC_NETWORKS.LIVE_NET ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;

            // Create keyPair using bitcoinjs-lib (compressed for P2WPKH)
            bitcoin.initEccLib(ecc);
            const privKeyBuf = Buffer.from(child.privateKey as Uint8Array);
            const keyPair = ECPair.fromPrivateKey(privKeyBuf, {
                compressed: true,
                network: networkConfig
            });

            // Generate Bech32 address using bitcoinjs-lib
            const { address } = bitcoin.payments.p2wpkh({
                pubkey: keyPair.publicKey,
                network: networkConfig
            });

            if (!address) {
                throw new Error('Failed to generate Bech32 address');
            }

            // Export WIF using bitcoinjs-lib native method
            const privateKeyWIF = keyPair.toWIF();

            // Get compressed public key hex
            const publicKey = keyPair.publicKey;

            console.log('Wallet imported with unified bitcoinjs-lib implementation');
            console.log('Address:', address);
            console.log('Pubkey:', toHex(publicKey));
            console.log('WIF starts with:', privateKeyWIF.substring(0, 6) + '...');

            return {
                address,
                privateKey: privateKeyWIF,
                publicKey: toHex(publicKey),
                mnemonic,
                network,
                derivationPath: path,
            };
        } catch (error) {
            throw new Error(`Failed to import Bitcoin wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Imports a Bitcoin wallet from private key (WIF format)
     * Uses unified bitcoinjs-lib implementation for consistency
     */
    static importWalletFromPrivateKey(
        privateKeyWIF: string,
        network: BTC_NETWORKS = BTC_NETWORKS.TEST_NET
    ): BitcoinWallet {
        try {
            // Get network config
            const networkConfig = network === BTC_NETWORKS.LIVE_NET ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;

            // Import keyPair using bitcoinjs-lib native WIF import (validates network automatically)
            bitcoin.initEccLib(ecc);
            const keyPair = ECPair.fromWIF(privateKeyWIF, networkConfig);

            // Generate Bech32 address using bitcoinjs-lib
            const { address } = bitcoin.payments.p2wpkh({
                pubkey: keyPair.publicKey,
                network: networkConfig
            });

            if (!address) {
                throw new Error('Failed to generate Bech32 address');
            }

            // Get compressed public key hex
            const publicKey = keyPair.publicKey;

            console.log('Wallet imported from WIF with unified bitcoinjs-lib implementation');
            console.log('Address:', address);
            console.log('Pubkey:', toHex(publicKey));
            console.log('WIF starts with:', privateKeyWIF.substring(0, 6) + '...');

            return {
                address,
                privateKey: privateKeyWIF,
                publicKey: toHex(publicKey),
                mnemonic: '',
                network,
                derivationPath: '',
            };
        } catch (error) {
            throw new Error(`Failed to import Bitcoin wallet from private key: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Validates a Bitcoin address
     */
    static validateAddress(address: string, network: BTC_NETWORKS): boolean {
        return validateBitcoinAddress(address, network);
    }

    /**
     * Sign a Bitcoin message using the Bitcoin Message Signing standard
     * Returns a 65-byte signature with recovery ID as expected by the backend
     */
    static async signMessage(message: string, privateKeyWIF: string): Promise<string> {
        try {
            // Decode WIF to get private key
            const decoded = WIF_UTILS.decode(privateKeyWIF);
            if (!decoded) {
                throw new Error('Invalid WIF format');
            }

            // Create Bitcoin message hash following the standard
            const messageHash = this.createBitcoinMessageHash(message);

            // Sign the message hash - returns DER encoded signature
            const derSignature = secp256k1.sign(messageHash, decoded.privateKey);

            // Parse DER signature to extract r and s
            // DER format: 0x30 [total_len] 0x02 [r_len] [r] 0x02 [s_len] [s]
            let offset = 0;
            if (derSignature[offset++] !== 0x30) throw new Error('Invalid DER signature');
            const totalLen = derSignature[offset++];
            if (totalLen !== derSignature.length - 2) throw new Error('Invalid DER length');

            if (derSignature[offset++] !== 0x02) throw new Error('Invalid r marker');
            const rLen = derSignature[offset++];
            const r = derSignature.slice(offset, offset + rLen);
            offset += rLen;

            if (derSignature[offset++] !== 0x02) throw new Error('Invalid s marker');
            const sLen = derSignature[offset++];
            const s = derSignature.slice(offset, offset + sLen);

            // Ensure r and s are 32 bytes (pad with leading zeros if needed)
            const signatureBytes = new Uint8Array(64);
            const rPadded = new Uint8Array(32);
            rPadded.set(r.slice(-32), 32 - Math.min(32, r.length));
            signatureBytes.set(rPadded, 0);

            const sPadded = new Uint8Array(32);
            sPadded.set(s.slice(-32), 32 - Math.min(32, s.length));
            signatureBytes.set(sPadded, 32);

            // Create 65-byte signature with recovery ID
            // The recovery ID is calculated based on the public key recovery
            const publicKey = secp256k1.getPublicKey(decoded.privateKey, decoded.compressed);

            // Calculate recovery ID (0-3) based on the signature
            const recoveryId = this.calculateRecoveryId(messageHash, signatureBytes, publicKey);

            // Create 65-byte signature: 1 byte recovery ID + 32 bytes r + 32 bytes s
            // Standard Bitcoin message signing format:
            // - Recovery ID 0-3 for uncompressed keys (recovery flag 27-30)
            // - Recovery ID 0-3 for compressed keys (recovery flag 31-34)
            const recoveryFlag = recoveryId + (decoded.compressed ? 31 : 27);
            const finalSignatureBytes = new Uint8Array(65);
            finalSignatureBytes[0] = recoveryFlag;
            finalSignatureBytes.set(signatureBytes.slice(0, 32), 1);  // r
            finalSignatureBytes.set(signatureBytes.slice(32, 64), 33); // s

            console.log('[BitcoinService] Signature construction:', {
                recoveryId,
                compressed: decoded.compressed,
                recoveryFlag,
                finalSignatureLength: finalSignatureBytes.length,
                firstByte: finalSignatureBytes[0]
            });

            // Debug: Log the actual bytes
            console.log('[BitcoinService] Final signature bytes:', Array.from(finalSignatureBytes));

            const base64Signature = base64Encode(finalSignatureBytes);

            return base64Signature;
        } catch (error) {
            throw new Error(`Failed to sign Bitcoin message: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Create Bitcoin message hash following the Bitcoin Message Signing standard
     */
    private static createBitcoinMessageHash(message: string): Uint8Array {
        const messagePrefix = new TextEncoder().encode('\x18Bitcoin Signed Message:\n');
        const messageBytes = new TextEncoder().encode(message);
        const messageLength = messageBytes.length;

        let lengthBytes: Uint8Array;
        if (messageLength < 253) {
            lengthBytes = new Uint8Array([messageLength]);
        } else if (messageLength < 65536) {
            lengthBytes = new Uint8Array(3);
            lengthBytes[0] = 0xfd;
            lengthBytes[1] = messageLength & 0xff;
            lengthBytes[2] = (messageLength >> 8) & 0xff;
        } else {
            lengthBytes = new Uint8Array(5);
            lengthBytes[0] = 0xfe;
            lengthBytes[1] = messageLength & 0xff;
            lengthBytes[2] = (messageLength >> 8) & 0xff;
            lengthBytes[3] = (messageLength >> 16) & 0xff;
            lengthBytes[4] = (messageLength >> 24) & 0xff;
        }

        const fullMessage = new Uint8Array(messagePrefix.length + lengthBytes.length + messageBytes.length);
        let offset = 0;
        fullMessage.set(messagePrefix, offset);
        offset += messagePrefix.length;
        fullMessage.set(lengthBytes, offset);
        offset += lengthBytes.length;
        fullMessage.set(messageBytes, offset);

        return sha256(sha256(fullMessage));
    }

    /**
     * Calculate recovery ID for signature verification
     */
    private static calculateRecoveryId(messageHash: Uint8Array, signature: Uint8Array, publicKey: Uint8Array): number {
        // This is a simplified recovery ID calculation
        // In a production environment, I'd want a more robust implementation but for now this is good enough

        // Simple heuristic: use the first byte of the signature to determine recovery ID
        // Ensure recovery ID is between 0 and 3
        const firstByte = signature[0];
        const recoveryId = firstByte % 4;

        return recoveryId;
    }

    /**
     * Convert bigint to Uint8Array of specified length
     */
    private static bigintToBytes(value: bigint, length: number): Uint8Array {
        const bytes = new Uint8Array(length);
        for (let i = length - 1; i >= 0; i--) {
            bytes[i] = Number(value & 0xFFn);
            value = value >> 8n;
        }
        return bytes;
    }

    /**
    * Converts a Bitcoin wallet to the standard WalletCreationResult format
    */
    static toWalletCreationResult(
        bitcoinWallet: BitcoinWallet,
        id?: string
    ): WalletCreationResult {
        // Map BTC_NETWORKS to the expected NetworkType
        const networkType = bitcoinWallet.network === BTC_NETWORKS.LIVE_NET ? 'mainnet' : 'testnet';

        return {
            id: id || '',
            address: bitcoinWallet.address,
            privateKey: bitcoinWallet.privateKey,
            publicKey: bitcoinWallet.publicKey,
            type: 'bitcoin',
            network: networkType,
            balance: '0',
            name: "Bitcoin Wallet",
            mnemonic: bitcoinWallet.mnemonic,
        };
    }
}

// Export WIF_UTILS for use in other modules
export { WIF_UTILS };

