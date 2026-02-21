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
 * All asset data comes from the API/Cache — no hardcoded fallbacks
 */
export function convertAPIAsset(
  apiAsset: APIAsset & { price?: number; price24hChange?: number }
): Asset {
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