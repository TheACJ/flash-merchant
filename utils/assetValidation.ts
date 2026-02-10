import { Asset, AssetBalance, AssetPrice, AssetValidationResult } from '../types/asset';

// Asset validation utilities for robust data handling

export class AssetValidator {
    // Validate asset data
    static validateAsset(asset: Partial<Asset>): AssetValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Required fields validation
        if (!asset.id || typeof asset.id !== 'string' || asset.id.trim() === '') {
            errors.push('Asset ID is required and must be a non-empty string');
        }

        if (!asset.symbol || typeof asset.symbol !== 'string' || asset.symbol.trim() === '') {
            errors.push('Asset symbol is required and must be a non-empty string');
        }

        if (!asset.name || typeof asset.name !== 'string' || asset.name.trim() === '') {
            errors.push('Asset name is required and must be a non-empty string');
        }

        // Symbol format validation
        if (asset.symbol && !/^[A-Z0-9]{1,10}$/i.test(asset.symbol)) {
            warnings.push('Asset symbol should be 1-10 alphanumeric characters');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    // Validate price data
    static validatePrice(price: Partial<AssetPrice>): AssetValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Required fields
        if (!price.assetId || typeof price.assetId !== 'string') {
            errors.push('Asset ID is required for price data');
        }

        if (!price.currency || typeof price.currency !== 'string') {
            errors.push('Currency is required for price data');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }

    // Validate balance data
    static validateBalance(balance: Partial<AssetBalance>): AssetValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Required fields
        if (!balance.assetId || typeof balance.assetId !== 'string') {
            errors.push('Asset ID is required for balance data');
        }

        if (!balance.walletId || typeof balance.walletId !== 'string') {
            errors.push('Wallet ID is required for balance data');
        }

        if (!balance.currency || typeof balance.currency !== 'string') {
            errors.push('Currency is required for balance data');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
}

// Export utility functions
export const validateAsset = AssetValidator.validateAsset;
export const validatePrice = AssetValidator.validatePrice;
export const validateBalance = AssetValidator.validateBalance;
