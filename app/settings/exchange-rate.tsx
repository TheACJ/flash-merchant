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
          <Ionicons name="chevron-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle as TextStyle}>Exchange rate</Text>
        <View style={styles.placeholder as ViewStyle} />
      </View>

      <View style={styles.content as ViewStyle}>
        {cryptos.map((crypto, index) => (
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
    backgroundColor: '#F5F5F5',
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
    fontSize: 25,
    fontWeight: '600',
    color: '#000000',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  cryptoCard: {
    backgroundColor: '#F4F6F5',
    borderRadius: 8,
    marginBottom: 15,
    padding: 15,
  },
  cryptoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cryptoIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#232428',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cryptoIconText: {
    color: '#F4F6F5',
    fontSize: 18,
    fontWeight: '600',
  },
  cryptoName: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '510',
  },
  cryptoRates: {
    paddingTop: 5,
  },
  yourRateLabel: {
    fontSize: 14,
    color: '#323333',
    marginBottom: 5,
  },
  rateBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 8,
  },
  rateText: {
    fontSize: 16,
    color: '#128807',
    fontWeight: '510',
  },
  marketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  marketLabel: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '510',
  },
  marketValue: {
    fontSize: 14,
    color: '#128807',
    fontWeight: '510',
  },
  cryptoItem: {
    marginBottom: 20,
  },
  cryptoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cryptoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#232428',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rateContainer: {
    paddingTop: 5,
  },
  rateInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  rateValue: {
    fontSize: 16,
    color: '#128807',
    fontWeight: '510',
  },
  marketRateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  marketRateLabel: {
    fontSize: 14,
    color: '#000000',
    fontWeight: '510',
  },
  marketRateValue: {
    fontSize: 14,
    color: '#128807',
    fontWeight: '510',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  nextButton: {
    height: 60,
    backgroundColor: '#0F6EC0',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#F5F5F5',
    fontWeight: '400',
  },
});
