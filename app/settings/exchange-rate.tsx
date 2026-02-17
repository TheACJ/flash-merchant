// settings/exchange-rate.tsx
import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ArrowRightLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react-native';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CryptoRate {
  symbol: string;
  name: string;
  yourRate: string;
  marketRate: string;
}

const CRYPTO_RATES: CryptoRate[] = [
  { symbol: 'SOL', name: 'Solana', yourRate: '$2,500.00', marketRate: '$2,670.00' },
  { symbol: 'ZEC', name: 'Zcash', yourRate: '$2,500.00', marketRate: '$2,670.00' },
  { symbol: 'BTC', name: 'Bitcoin', yourRate: '$2,500.00', marketRate: '$2,670.00' },
];

export default function ExchangeRateScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft
            size={layout.iconSize.md}
            color={colors.textPrimary}
            strokeWidth={2}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Exchange Rate</Text>
        <View style={{ width: layout.minTouchTarget }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {CRYPTO_RATES.map((crypto) => (
          <View key={crypto.name} style={styles.cryptoCard}>
            {/* Crypto Header */}
            <View style={styles.cryptoHeader}>
              <View style={styles.cryptoIcon}>
                <Text style={styles.cryptoSymbol}>{crypto.symbol}</Text>
              </View>
              <Text style={styles.cryptoName}>{crypto.name}</Text>
            </View>

            {/* Your Rate */}
            <View style={styles.rateSection}>
              <Text style={styles.rateLabel}>Your Rate</Text>
              <TouchableOpacity style={styles.rateInput} activeOpacity={0.7}>
                <Text style={styles.rateValue}>{crypto.yourRate}</Text>
                <ArrowRightLeft
                  size={14}
                  color={colors.primary}
                  strokeWidth={1.8}
                />
              </TouchableOpacity>
            </View>

            {/* Market Rate */}
            <View style={styles.marketRow}>
              <View style={styles.marketLabelRow}>
                <TrendingUp
                  size={12}
                  color={colors.success}
                  strokeWidth={2}
                />
                <Text style={styles.marketLabel}>Market Rate</Text>
              </View>
              <Text style={styles.marketValue}>{crypto.marketRate}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Save Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text style={styles.saveButtonText}>Save Rates</Text>
          <ChevronRight
            size={layout.iconSize.sm}
            color={colors.textWhite}
            strokeWidth={2.5}
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  backButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
  },
  content: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.base,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  cryptoCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  cryptoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cryptoIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.textPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cryptoSymbol: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
    letterSpacing: typography.letterSpacing.wide,
  },
  cryptoName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  rateSection: {
    gap: spacing.xs,
  },
  rateLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textTertiary,
  },
  rateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  rateValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success,
  },
  marketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  marketLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  marketLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  marketValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.success,
  },
  buttonContainer: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing['2xl'],
  },
  saveButton: {
    height: layout.buttonHeight,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    ...shadows.button,
  },
  saveButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
  },
});