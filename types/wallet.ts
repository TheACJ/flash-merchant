export type WalletType = 'ethereum' | 'bitcoin' | 'solana' | 'bnb';

export interface TokenInfo {
  address: string;
  balance: string;
  decimals: number;
  symbol: string;
  name: string;
}

export interface Wallet {
  id: string;
  address: string;
  privateKey: string;
  publicKey: string;
  type: WalletType;
  network: string;
  balance: string;
  name: string;
  mnemonic?: string;
  createdAt?: number;
  updatedAt?: number;
}
