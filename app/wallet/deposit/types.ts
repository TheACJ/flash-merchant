import { Asset as APIAsset } from '@/services/FlashApiService';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  iconUrl?: string;
  icon_url?: string; // Also support snake_case from API
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
 * All asset data comes from the API/Cache - no hardcoded fallbacks
 */
export function convertAPIAsset(apiAsset: APIAsset & { price?: number; price24hChange?: number }): Asset {
  return {
    id: apiAsset.id,
    symbol: apiAsset.symbol.toUpperCase(),
    name: apiAsset.name,
    iconUrl: apiAsset.icon_url,
    icon_url: apiAsset.icon_url,
    price: apiAsset.price,
    price24hChange: apiAsset.price24hChange,
  };
}