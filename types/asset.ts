export interface Asset {
    id: string;
    symbol: string;
    name: string;
    category?: string;
    status?: string;
    decimals?: number;
    website?: string;
    whitepaper?: string;
    description?: string;
    socialLinks?: Record<string, string>;
    createdAt?: number;
    updatedAt?: number;
    [key: string]: any;
}

export interface AssetPrice {
    assetId: string;
    currency: string;
    price?: number;
    change24h?: number;
    change24hPercentage?: number;
    volume24h?: number;
    marketCap?: number;
    timestamp?: number;
    lastUpdated?: number;
}

export interface AssetBalance {
    assetId: string;
    walletId: string;
    currency: string;
    balance?: string;
    balanceFormatted?: string;
    value?: number;
    valueFormatted?: string;
    lastUpdated?: number;
}

export interface AssetValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface AssetError {
    type: string;
    message: string;
    assetId?: string;
    timestamp: number;
    retryable: boolean;
    context?: any;
}
