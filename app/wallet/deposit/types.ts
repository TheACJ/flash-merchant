export interface Asset {
  id: string;
  symbol: string;
  name: string;
  iconBgColor: string;
  iconType: 'ethereum' | 'solana' | 'polygon' | 'zcash' | 'bitcoin';
}

export interface DepositData {
  flashTag: string;
  asset: Asset | null;
  amount: string;
  customerReceives: string;
  exchangeRate: string;
  networkFee: string;
  merchantBalance: string;
}

export interface TransactionSummary {
  yourBalance: string;
  exchangeRate: string;
  customerReceives: string;
  networkFee: string;
  asset: Asset;
  amount: string;
}

export type DepositStep = 
  | 'flashTag'
  | 'selectAsset'
  | 'summary'
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