/**
 * Wallet Generation Worker
 * 
 * This worker runs in a separate JavaScript thread using react-native-threads.
 * It has full access to npm packages and performs wallet generation without
 * blocking the main UI thread.
 * 
 * Communication protocol:
 * - Main thread sends: { type: 'generate', entropy: string }
 * - Worker responds: { type: 'progress', progress: number }
 * - Worker responds: { type: 'result', wallets: RawWalletData }
 * - Worker responds: { type: 'error', error: string }
 */

// Import crypto libraries - these work because this is a separate JS process
const { Wallet } = require('ethers');
const { entropyToMnemonic, mnemonicToSeedSync, validateMnemonic } = require('@scure/bip39');
const { wordlist } = require('@scure/bip39/wordlists/english');
const { HDKey } = require('@scure/bip32');
const { Keypair } = require('@solana/web3.js');
const bitcoin = require('bitcoinjs-lib');
const ecc = require('@bitcoinerlab/secp256k1');
const { ECPairFactory } = require('ecpair');

// Initialize bitcoin library
bitcoin.initEccLib(ecc);
const ECPair = ECPairFactory(ecc);

// Network configurations
const BTC_NETWORKS = {
    TEST_NET: 'testnet',
    LIVE_NET: 'livenet'
};

/**
 * Send progress update to main thread
 */
function sendProgress(progress) {
    self.postMessage(JSON.stringify({ type: 'progress', progress }));
}

/**
 * Send error to main thread
 */
function sendError(error) {
    self.postMessage(JSON.stringify({ type: 'error', error: error.message || String(error) }));
}

/**
 * Send result to main thread
 */
function sendResult(wallets) {
    self.postMessage(JSON.stringify({ type: 'result', wallets }));
}

/**
 * Convert bytes to hex string
 */
function bytesToHex(bytes) {
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Parse entropy hex string to bytes
 */
function parseEntropy(entropy) {
    const hex = entropy.replace(/^0x/, '');
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
}

/**
 * Generate Ethereum wallet from mnemonic
 */
function generateEthereumWallet(mnemonic) {
    const wallet = Wallet.fromPhrase(mnemonic);
    return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        publicKey: ''
    };
}

/**
 * Generate Solana wallet from mnemonic
 */
function generateSolanaWallet(mnemonic) {
    // Derive Solana keypair from mnemonic seed
    const seed = mnemonicToSeedSync(mnemonic, '');

    // Use first 32 bytes of seed for Ed25519 keypair
    // Note: This is a simplified derivation. Production should use proper BIP44 derivation
    const keypair = Keypair.fromSeed(seed.slice(0, 32));

    return {
        address: keypair.publicKey.toBase58(),
        privateKey: bytesToHex(keypair.secretKey),
        publicKey: keypair.publicKey.toBase58()
    };
}

/**
 * Generate Bitcoin wallet from mnemonic
 */
function generateBitcoinWallet(mnemonic, network) {
    const seed = mnemonicToSeedSync(mnemonic);
    const hdkey = HDKey.fromMasterSeed(seed);

    // BIP44 derivation path for Bitcoin
    // m/44'/0'/0'/0/0 for mainnet, m/44'/1'/0'/0/0 for testnet
    const path = network === BTC_NETWORKS.LIVE_NET ? "m/44'/0'/0'/0/0" : "m/44'/1'/0'/0/0";
    const child = hdkey.derive(path);

    if (!child.privateKey) {
        throw new Error('Failed to derive Bitcoin private key');
    }

    const networkConfig = network === BTC_NETWORKS.LIVE_NET
        ? bitcoin.networks.bitcoin
        : bitcoin.networks.testnet;

    const keyPair = ECPair.fromPrivateKey(Buffer.from(child.privateKey), {
        compressed: true,
        network: networkConfig
    });

    const { address } = bitcoin.payments.p2wpkh({
        pubkey: keyPair.publicKey,
        network: networkConfig
    });

    if (!address) {
        throw new Error('Failed to generate Bitcoin address');
    }

    return {
        address,
        privateKey: keyPair.toWIF(),
        publicKey: bytesToHex(keyPair.publicKey)
    };
}

/**
 * Generate BNB wallet from mnemonic
 */
function generateBnbWallet(mnemonic) {
    const seed = mnemonicToSeedSync(mnemonic);
    const hdkey = HDKey.fromMasterSeed(seed);

    // BIP44 derivation path for BNB
    // m/44'/714'/0'/0/0
    const path = "m/44'/714'/0'/0/0";
    const child = hdkey.derive(path);

    if (!child.privateKey) {
        throw new Error('Failed to derive BNB private key');
    }

    // BNB uses Ethereum-style addresses
    const wallet = Wallet.fromPhrase(mnemonic);

    return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        publicKey: bytesToHex(child.publicKey)
    };
}

/**
 * Generate all wallets from entropy
 */
function generateAllWallets(entropy, environment) {
    const network = environment === 'production' ? BTC_NETWORKS.LIVE_NET : BTC_NETWORKS.TEST_NET;

    // Parse entropy and generate mnemonic
    const entropyBytes = parseEntropy(entropy);
    const mnemonic = entropyToMnemonic(entropyBytes, wordlist);

    sendProgress(10);

    // Generate Ethereum wallet
    const ethereum = generateEthereumWallet(mnemonic);
    sendProgress(25);

    // Generate Solana wallet
    const solana = generateSolanaWallet(mnemonic);
    sendProgress(50);

    // Generate Bitcoin wallet
    const bitcoin_wallet = generateBitcoinWallet(mnemonic, network);
    sendProgress(75);

    // Generate BNB wallet
    const bnb = generateBnbWallet(mnemonic);
    sendProgress(90);

    return {
        ethereum,
        solana,
        bitcoin: bitcoin_wallet,
        bnb,
        mnemonic
    };
}

/**
 * Import wallets from mnemonic
 */
function importWalletsFromMnemonic(mnemonic, environment) {
    const network = environment === 'production' ? BTC_NETWORKS.LIVE_NET : BTC_NETWORKS.TEST_NET;

    // Validate mnemonic
    if (!validateMnemonic(mnemonic, wordlist)) {
        throw new Error('Invalid mnemonic phrase');
    }

    sendProgress(10);

    // Generate all wallets from mnemonic
    const ethereum = generateEthereumWallet(mnemonic);
    sendProgress(25);

    const solana = generateSolanaWallet(mnemonic);
    sendProgress(50);

    const bitcoin_wallet = generateBitcoinWallet(mnemonic, network);
    sendProgress(75);

    const bnb = generateBnbWallet(mnemonic);
    sendProgress(90);

    return {
        ethereum,
        solana,
        bitcoin: bitcoin_wallet,
        bnb,
        mnemonic
    };
}

// Message handler
self.onmessage = function (message) {
    try {
        const data = JSON.parse(message);

        switch (data.type) {
            case 'generate':
                const wallets = generateAllWallets(data.entropy, data.environment || 'development');
                sendProgress(100);
                sendResult(wallets);
                break;

            case 'import':
                const importedWallets = importWalletsFromMnemonic(data.mnemonic, data.environment || 'development');
                sendProgress(100);
                sendResult(importedWallets);
                break;

            default:
                sendError(`Unknown message type: ${data.type}`);
        }
    } catch (error) {
        sendError(error);
    }
};

// Signal that worker is ready
self.postMessage(JSON.stringify({ type: 'ready' }));
