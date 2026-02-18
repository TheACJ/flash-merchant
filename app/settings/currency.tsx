// settings/currency.tsx
import {
  borderRadius,
  colors,
  layout,
  spacing,
  typography,
} from '@/constants/theme';
import { useCurrencies, usePreferredCurrency } from '@/hooks';
import { AppDispatch } from '@/store';
import { setPreferredCurrency } from '@/store/slices/currencySlice';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Check
} from 'lucide-react-native';
import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

export default function CurrencyScreen() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  // Get currencies from API
  const { currencies, isLoading, error } = useCurrencies();
  const { code: selectedCurrency } = usePreferredCurrency();

  const handleCurrencySelect = async (currencyCode: string) => {
    dispatch(setPreferredCurrency(currencyCode));
  };

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
        <Text style={styles.headerTitle}>Currency</Text>
        <View style={{ width: layout.minTouchTarget }} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading currencies...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {currencies.map((currency) => {
            const isSelected = selectedCurrency === currency.code;

            return (
              <TouchableOpacity
                key={currency.code}
                style={[
                  styles.currencyItem,
                  isSelected && styles.currencyItemSelected,
                ]}
                onPress={() => handleCurrencySelect(currency.code)}
                activeOpacity={0.7}
              >
                <View style={styles.currencyLeft}>
                  <View
                    style={[
                      styles.symbolContainer,
                      isSelected && styles.symbolContainerSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.symbolText,
                        isSelected && styles.symbolTextSelected,
                      ]}
                    >
                      {currency.symbol}
                    </Text>
                  </View>
                  <View style={styles.currencyInfo}>
                    <Text style={styles.currencyCode}>{currency.code}</Text>
                    <Text style={styles.currencyName}>{currency.name}</Text>
                  </View>
                </View>

                {isSelected && (
                  <View style={styles.checkContainer}>
                    <Check
                      size={layout.iconSize.sm}
                      color={colors.primary}
                      strokeWidth={2.5}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
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
    gap: spacing.sm,
    paddingBottom: spacing['2xl'],
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  currencyItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  currencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  symbolContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbolContainerSelected: {
    backgroundColor: colors.primaryMedium,
  },
  symbolText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  symbolTextSelected: {
    color: colors.primary,
  },
  currencyInfo: {
    gap: spacing['2xs'],
  },
  currencyCode: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  currencyName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textTertiary,
  },
  checkContainer: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  errorText: {
    fontSize: typography.fontSize.md,
    color: colors.error,
    textAlign: 'center',
  },
});