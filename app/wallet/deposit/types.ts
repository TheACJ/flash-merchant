import { Asset as APIAsset } from '@/services/FlashApiService';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  iconBgColor: string;
  iconType: 'ethereum' | 'solana' | 'polygon' | 'zcash' | 'bitcoin' | 'usdt' | 'bnb';
  iconUrl?: string;
  price?: number;
  price24hChange?: number;
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

/**
 * Convert API Asset to local Asset format
 * All asset data comes from the API - no hardcoded fallbacks
 */
export function convertAPIAsset(apiAsset: APIAsset & { price?: number; price24hChange?: number }): Asset {
  // Determine icon type based on symbol
  const getIconType = (symbol: string): Asset['iconType'] => {
    const s = symbol.toLowerCase();
    if (s.includes('btc') || s.includes('bitcoin')) return 'bitcoin';
    if (s.includes('eth') || s.includes('ethereum')) return 'ethereum';
    if (s.includes('sol') || s.includes('solana')) return 'solana';
    if (s.includes('pol') || s.includes('polygon') || s.includes('matic')) return 'polygon';
    if (s.includes('zec') || s.includes('zcash')) return 'zcash';
    if (s.includes('usdt') || s.includes('tether')) return 'usdt';
    if (s.includes('bnb') || s.includes('binance')) return 'bnb';
    return 'ethereum'; // default
  };

  // Get background color based on icon type
  const getIconBgColor = (iconType: Asset['iconType']): string => {
    const colors: Record<string, string> = {
      ethereum: '#F4F6F5',
      solana: '#232428',
      polygon: '#F4F6F5',
      zcash: '#232428',
      bitcoin: '#F7931A',
      usdt: '#26A17B',
      bnb: '#F3BA2F',
    };
    return colors[iconType] || '#F4F6F5';
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