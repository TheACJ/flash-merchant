/**
 * AssetIcon Component
 * 
 * Displays asset icons using data from AssetCache.
 * Falls back to local images for supported assets (BTC, ETH, SOL, USDT, BNB).
 */

import React from 'react';
import { Image, StyleSheet, View } from 'react-native';

// Local asset images for fallback
const LOCAL_ASSET_IMAGES: Record<string, any> = {
    btc: require('@/assets/images/btc.png'),
    bitcoin: require('@/assets/images/btc.png'),
    eth: require('@/assets/images/eth.png'),
    ethereum: require('@/assets/images/eth.png'),
    sol: require('@/assets/images/sol.png'),
    solana: require('@/assets/images/sol.png'),
    usdt: require('@/assets/images/usdt.png'),
    tether: require('@/assets/images/usdt.png'),
    bnb: require('@/assets/images/bnb.png'),
    binance: require('@/assets/images/bnb.png'),
};

// Default fallback image
const DEFAULT_IMAGE = require('@/assets/images/default-coin.png');

interface AssetIconProps {
    asset: {
        id: string;
        symbol: string;
        name?: string;
        iconUrl?: string;
        icon_url?: string;
    };
    size?: number;
}

/**
 * AssetIcon - Renders an asset icon from cache data
 * 
 * Priority:
 * 1. Use icon_url from the asset data (provided by AssetCache)
 * 2. Fall back to local image assets for known assets
 * 3. Fall back to default coin image
 */
export function AssetIcon({ asset, size = 40 }: AssetIconProps) {
    // Get icon URL from either iconUrl or icon_url property
    const iconUrl = asset.iconUrl || asset.icon_url;
    const symbolLower = asset.symbol?.toLowerCase() || '';

    // Check if we have a local image for this asset
    const localImage = LOCAL_ASSET_IMAGES[symbolLower];

    const iconStyles = {
        width: size,
        height: size,
        borderRadius: size / 5,
        backgroundColor: getIconBgColor(asset.symbol),
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        overflow: 'hidden' as const,
    };

    const imageStyle = {
        width: size * 0.7,
        height: size * 0.7,
        borderRadius: (size * 0.7) / 4,
    };

    // If we have an icon URL from API, use it
    if (iconUrl) {
        return (
            <View style={iconStyles}>
                <Image
                    source={{ uri: iconUrl }}
                    style={imageStyle}
                    resizeMode="contain"
                />
            </View>
        );
    }

    // If we have a local image, use it
    if (localImage) {
        return (
            <View style={iconStyles}>
                <Image
                    source={localImage}
                    style={imageStyle}
                    resizeMode="contain"
                />
            </View>
        );
    }

    // Fallback: Use default coin image
    return (
        <View style={iconStyles}>
            <Image
                source={DEFAULT_IMAGE}
                style={imageStyle}
                resizeMode="contain"
            />
        </View>
    );
}

/**
 * Get background color based on asset symbol
 */
function getIconBgColor(symbol: string): string {
    const s = symbol?.toLowerCase() || '';

    const colorMap: Record<string, string> = {
        btc: '#F7931A',
        bitcoin: '#F7931A',
        eth: '#F4F6F5',
        ethereum: '#F4F6F5',
        sol: '#232428',
        solana: '#232428',
        usdt: '#26A17B',
        tether: '#26A17B',
        bnb: '#F3BA2F',
        binance: '#F3BA2F',
    };

    // Find matching color
    for (const [key, color] of Object.entries(colorMap)) {
        if (s.includes(key)) {
            return color;
        }
    }

    // Default background
    return '#F4F6F5';
}

const styles = StyleSheet.create({});

export default AssetIcon;
