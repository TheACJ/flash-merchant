import { Wallet, Mnemonic } from 'ethers';

export class BinanceService {
  async createWalletFromEntropy(entropy: string) {
    const ethWallet = Wallet.fromPhrase(Mnemonic.fromEntropy(entropy).phrase);
    
    return {
      address: ethWallet.address,
      publicKey: '',
      privateKey: ethWallet.privateKey,
      mnemonic: ethWallet.mnemonic?.phrase || '',
      network: process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' ? 'mainnet' : 'testnet',
    };
  }

  async importWalletFromMnemonic(mnemonic: string) {
    const ethWallet = Wallet.fromPhrase(mnemonic);
    
    return {
      address: ethWallet.address,
      publicKey: '',
      privateKey: ethWallet.privateKey,
      mnemonic: ethWallet.mnemonic?.phrase || '',
      network: process.env.EXPO_PUBLIC_ENVIRONMENT === 'production' ? 'mainnet' : 'testnet',
    };
  }
}

export default new BinanceService();
