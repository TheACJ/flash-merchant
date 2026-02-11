export interface Asset {
  id: string;
  symbol: string;
  name: string;
  iconBgColor: string;
  iconType: 'ethereum' | 'solana' | 'polygon' | 'zcash' | 'bitcoin';
}

export interface CustomerInfo {
  flashTag: string;
  name: string;
  walletAddress: string;
  avatarUrl?: string;
}

export interface WithdrawalData {
  customer: CustomerInfo | null;
  asset: Asset | null;
  amount: string;
  cryptoAmount: string;
  exchangeRate: string;
  networkFee: string;
  customerReceives: string;
  pin: string;
}

export interface TransactionSummary {
  amount: string;
  exchangeRate: string;
  customerReceives: string;
  networkFee: string;
}

export type WithdrawalStep =
  | 'selectFlashTagAsset'
  | 'enterAmount'
  | 'enterPin'
  | 'processing'
  | 'success'
  | 'error';

export const ASSETS: Asset[] = [
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    iconBgColor: '#F4F6F5',
    iconType: 'ethereum',
  },
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    iconBgColor: '#232428',
    iconType: 'solana',
  },
  {
    id: 'pol',
    symbol: 'POL',
    name: 'Polygon',
    iconBgColor: '#F4F6F5',
    iconType: 'polygon',
  },
  {
    id: 'zec',
    symbol: 'ZEC',
    name: 'Zcash',
    iconBgColor: '#232428',
    iconType: 'zcash',
  },
  {
    id: 'btc',
    symbol: 'BTC',
    name: 'Bitcoin',
    iconBgColor: '#F7931A',
    iconType: 'bitcoin',
  },
];

export const EXCHANGE_RATES: Record<string, number> = {
  btc: 40000,
  eth: 2500,
  sol: 100,
  pol: 0.85,
  zec: 25,
};