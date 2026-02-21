import { Asset as APIAsset } from '@/services/FlashApiService';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  iconUrl?: string;
  icon_url?: string; // Also support snake_case from API
  price?: number;
  price24hChange?: number;
  chains?: string[]; // Available chains for this asset
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
 * Mapping from asset ID to the chain name used in wallet addresses
 * This maps the asset identifier to the blockchain network identifier
 */
export const ASSET_TO_CHAIN_MAP: Record<string, string> = {
  btc: 'bitcoin',
  eth: 'ethereum',
  sol: 'solana',
  bnb: 'bnb',           // BNB uses BSC (Binance Smart Chain)
  usdt: 'ethereum',     // USDT primarily on Ethereum
  usdc: 'ethereum',     // USDC primarily on Ethereum
  pol: 'ethereum',      // POL (Polygon) - can also be on polygon network
  zec: 'bitcoin',       // Zcash uses its own network, fallback to bitcoin for tag resolution
  matic: 'ethereum',    // MATIC token
  busd: 'bnb',          // Binance USD on BSC
};

/**
 * Get the chain name for an asset ID
 * Returns the chain name used in the wallet system
 */
export function getChainForAsset(assetId: string): string {
  const normalizedId = assetId.toLowerCase();
  return ASSET_TO_CHAIN_MAP[normalizedId] || normalizedId;
}

/**
 * Convert API Asset to local Asset format
 * All asset data comes from the API/Cache - no hardcoded fallbacks
 */
export function convertAPIAsset(apiAsset: APIAsset & { price?: number; price24hChange?: number; chains?: string[] }): Asset {
  return {
    id: apiAsset.id,
    symbol: apiAsset.symbol.toUpperCase(),
    name: apiAsset.name,
    iconUrl: apiAsset.icon_url,
    icon_url: apiAsset.icon_url,
    price: apiAsset.price,
    price24hChange: apiAsset.price24hChange,
    chains: apiAsset.chains,
  };
}