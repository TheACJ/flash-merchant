import { Asset as APIAsset } from '@/services/FlashApiService';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  iconBgColor: string;
  iconType:
  | 'ethereum'
  | 'solana'
  | 'polygon'
  | 'zcash'
  | 'bitcoin'
  | 'usdt'
  | 'bnb';
  iconUrl?: string;
  price?: number;
  price24hChange?: number;
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

/** Exchange rates — will be replaced by live API data */
export const EXCHANGE_RATES: Record<string, number> = {
  btc: 40000,
  eth: 2500,
  sol: 100,
  pol: 0.85,
  zec: 25,
};

/**
 * Convert API Asset to local Asset format
 * All asset data comes from the API — no hardcoded fallbacks
 */
export function convertAPIAsset(
  apiAsset: APIAsset & { price?: number; price24hChange?: number }
): Asset {
  const getIconType = (symbol: string): Asset['iconType'] => {
    const s = symbol.toLowerCase();
    if (s.includes('btc') || s.includes('bitcoin')) return 'bitcoin';
    if (s.includes('eth') || s.includes('ethereum')) return 'ethereum';
    if (s.includes('sol') || s.includes('solana')) return 'solana';
    if (s.includes('pol') || s.includes('polygon') || s.includes('matic'))
      return 'polygon';
    if (s.includes('zec') || s.includes('zcash')) return 'zcash';
    if (s.includes('usdt') || s.includes('tether')) return 'usdt';
    if (s.includes('bnb') || s.includes('binance')) return 'bnb';
    return 'ethereum';
  };

  const getIconBgColor = (iconType: Asset['iconType']): string => {
    const colorMap: Record<string, string> = {
      ethereum: '#F2F4F7',
      solana: '#232428',
      polygon: '#F2F4F7',
      zcash: '#232428',
      bitcoin: '#F7931A',
      usdt: '#26A17B',
      bnb: '#F3BA2F',
    };
    return colorMap[iconType] || '#F2F4F7';
  };

  const iconType = getIconType(apiAsset.symbol);

  return {
    id: apiAsset.id,
    symbol: apiAsset.symbol.toUpperCase(),
    name: apiAsset.name,
    iconBgColor: getIconBgColor(iconType),
    iconType,
    iconUrl: apiAsset.icon_url,
    price: apiAsset.price,
    price24hChange: apiAsset.price24hChange,
  };
}