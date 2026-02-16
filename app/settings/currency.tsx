import { colors, typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CurrencyItemProps {
  code: string;
  name: string;
  selected: boolean;
  onSelect: () => void;
}

const CurrencyItem: React.FC<CurrencyItemProps> = ({ code, name, selected, onSelect }) => (
  <TouchableOpacity
    style={styles.currencyItem as ViewStyle}
    onPress={onSelect}
    activeOpacity={0.7}
  >
    <View style={styles.currencyLeft as ViewStyle}>
      <View style={styles.flagContainer as ViewStyle}>
        <Text style={styles.flagText as TextStyle}>{code}</Text>
      </View>
      <View style={styles.currencyInfo as ViewStyle}>
        <Text style={styles.currencyCode as TextStyle}>{code}</Text>
        <Text style={styles.currencyName as TextStyle}>{name}</Text>
      </View>
    </View>
    <View style={styles.currencyRight as ViewStyle}>
      {selected && (
        <View style={styles.checkCircle as ViewStyle}>
          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
        </View>
      )}
    </View>
  </TouchableOpacity>
);

export default function CurrencyScreen() {
  const router = useRouter();
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  const currencies = [
    { code: 'USD', name: 'United states dollar' },
    { code: 'NGN', name: 'Nigerian Naira' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British pound sterling' },
    { code: 'JPY', name: 'Japanese yen' },
    { code: 'CAD', name: 'Canadian dollar' },
    { code: 'BRL', name: 'Brazilian real' },
    { code: 'AUD', name: 'Australian dollar' },
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
        <Text style={styles.headerTitle as TextStyle}>Currency</Text>
        <View style={styles.placeholder as ViewStyle} />
      </View>

      <View style={styles.content as ViewStyle}>
        {currencies.map((currency) => (
          <CurrencyItem
            key={currency.code}
            code={currency.code}
            name={currency.name}
            selected={selectedCurrency === currency.code}
            onSelect={() => setSelectedCurrency(currency.code)}
          />
        ))}
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
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  currencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  flagText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  currencyInfo: {
    flexDirection: 'column',
  },
  currencyCode: {
    fontSize: typography.fontSize.md,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semibold,
  },
  currencyName: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: 2,
  },
  currencyRight: {
    marginLeft: 12,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
