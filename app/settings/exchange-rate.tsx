import { borderRadius, colors, layout, spacing, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CryptoRateItem: React.FC<{
  icon: string;
  name: string;
  yourRate: string;
  marketRate: string;
}> = ({ icon, name, yourRate, marketRate }) => (
  <View style={styles.cryptoItem as ViewStyle}>
    <View style={styles.cryptoHeader as ViewStyle}>
      <View style={styles.cryptoIcon as ViewStyle}>
        <Text style={styles.cryptoIconText as TextStyle}>{icon}</Text>
      </View>
      <Text style={styles.cryptoName as TextStyle}>{name}</Text>
    </View>
    <View style={styles.rateContainer as ViewStyle}>
      <Text style={styles.yourRateLabel as TextStyle}>Your rate</Text>
      <View style={styles.rateInput as ViewStyle}>
        <Text style={styles.rateValue as TextStyle}>{yourRate}</Text>
      </View>
      <View style={styles.marketRateRow as ViewStyle}>
        <Text style={styles.marketRateLabel as TextStyle}>Market rate</Text>
        <Text style={styles.marketRateValue as TextStyle}>{marketRate}</Text>
      </View>
    </View>
  </View>
);

export default function ExchangeRateScreen() {
  const router = useRouter();

  const cryptos = [
    { icon: '◎', name: 'Solana', yourRate: '$2,500.00', marketRate: '2,6700' },
    { icon: 'Z', name: 'Zcash', yourRate: '$2,500.00', marketRate: '2,6700' },
    { icon: '₿', name: 'Bitcoin', yourRate: '$2,500.00', marketRate: '2,6700' },
  ];

  return (
    <SafeAreaView style={styles.container as ViewStyle}>
      <View style={styles.header as ViewStyle}>
        <TouchableOpacity
          style={styles.backButton as ViewStyle}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle as TextStyle}>Exchange rate</Text>
        <View style={styles.placeholder as ViewStyle} />
      </View>

      <View style={styles.content as ViewStyle}>
        {cryptos.map((crypto) => (
          <View key={crypto.name} style={styles.cryptoCard as ViewStyle}>
            <View style={styles.cryptoInfo as ViewStyle}>
              <View style={styles.cryptoIconBg as ViewStyle}>
                <Text style={styles.cryptoIconText as TextStyle}>{crypto.icon}</Text>
              </View>
              <Text style={styles.cryptoName as TextStyle}>{crypto.name}</Text>
            </View>
            <View style={styles.cryptoRates as ViewStyle}>
              <Text style={styles.yourRateLabel as TextStyle}>Your rate</Text>
              <View style={styles.rateBox as ViewStyle}>
                <Text style={styles.rateText as TextStyle}>{crypto.yourRate}</Text>
              </View>
              <View style={styles.marketRow as ViewStyle}>
                <Text style={styles.marketLabel as TextStyle}>Market rate</Text>
                <Text style={styles.marketValue as TextStyle}>{crypto.marketRate}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.buttonContainer as ViewStyle}>
        <TouchableOpacity
          style={styles.nextButton as ViewStyle}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.nextButtonText as TextStyle}>Next</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  cryptoCard: {
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cryptoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cryptoIconBg: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.shadow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  cryptoIconText: {
    color: colors.backgroundInput,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  cryptoName: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  cryptoRates: {
    paddingTop: spacing.xs,
  },
  yourRateLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  rateBox: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  rateText: {
    fontSize: typography.fontSize.md,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
  },
  marketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  marketLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  marketValue: {
    fontSize: typography.fontSize.base,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
  },
  cryptoItem: {
    marginBottom: spacing.lg,
  },
  cryptoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cryptoIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.shadow,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  rateContainer: {
    paddingTop: spacing.xs,
  },
  rateInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
  },
  rateValue: {
    fontSize: typography.fontSize.md,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
  },
  marketRateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  marketRateLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.medium,
  },
  marketRateValue: {
    fontSize: typography.fontSize.base,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  nextButton: {
    height: layout.buttonHeight,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.textLight,
    fontWeight: typography.fontWeight.regular,
  },
});
