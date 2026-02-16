import { entropyToMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { HDKey } from '@scure/bip32';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from '@bitcoinerlab/secp256k1';
import { ECPairFactory } from 'ecpair';

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
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
}

export class BitcoinService {
  static async createWalletFromEntropy(
    entropy: string,
    network: BTC_NETWORKS = BTC_NETWORKS.TEST_NET
  ): Promise<BitcoinWallet> {
    const entropyBytes = Uint8Array.from(
      entropy.replace(/^0x/, '').match(/.{1,2}/g)!.map(byte => parseInt(byte, 16))
    );

    const mnemonic = entropyToMnemonic(entropyBytes, wordlist);
    const seed = mnemonicToSeedSync(mnemonic);
    const hdkey = HDKey.fromMasterSeed(seed);
    const path = network === BTC_NETWORKS.TEST_NET ? "m/44'/1'/0'/0/0" : "m/44'/0'/0'/0/0";
    const child = hdkey.derive(path);

    if (!child.privateKey) throw new Error('Failed to derive private key');

    const networkConfig = network === BTC_NETWORKS.LIVE_NET ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
    const keyPair = ECPair.fromPrivateKey(Buffer.from(child.privateKey), { compressed: true, network: networkConfig });
    const { address } = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: networkConfig });

    if (!address) throw new Error('Failed to generate address');

    return {
      address,
      privateKey: keyPair.toWIF(),
      publicKey: toHex(keyPair.publicKey),
      mnemonic,
      network,
    };
  }

  static async importWalletFromMnemonic(
    mnemonic: string,
    network: BTC_NETWORKS = BTC_NETWORKS.TEST_NET
  ): Promise<BitcoinWallet> {
    if (!validateMnemonic(mnemonic, wordlist)) throw new Error('Invalid mnemonic phrase');

    const seed = mnemonicToSeedSync(mnemonic);
    const hdkey = HDKey.fromMasterSeed(seed);
    const path = network === BTC_NETWORKS.TEST_NET ? "m/44'/1'/0'/0/0" : "m/44'/0'/0'/0/0";
    const child = hdkey.derive(path);

    if (!child.privateKey) throw new Error('Failed to derive private key');

    const networkConfig = network === BTC_NETWORKS.LIVE_NET ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;
    const keyPair = ECPair.fromPrivateKey(Buffer.from(child.privateKey), { compressed: true, network: networkConfig });
    const { address } = bitcoin.payments.p2wpkh({ pubkey: keyPair.publicKey, network: networkConfig });

    if (!address) throw new Error('Failed to generate address');

    return {
      address,
      privateKey: keyPair.toWIF(),
      publicKey: toHex(keyPair.publicKey),
      mnemonic,
      network,
    };
  }

  static toWalletCreationResult(bitcoinWallet: BitcoinWallet, id: string) {
    return {
      id,
      address: bitcoinWallet.address,
      publicKey: bitcoinWallet.publicKey,
      type: 'bitcoin' as const,
      network: bitcoinWallet.network === BTC_NETWORKS.LIVE_NET ? 'mainnet' as const : 'testnet' as const,
      balance: '0',
      name: "Bitcoin Wallet",
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  }
}
