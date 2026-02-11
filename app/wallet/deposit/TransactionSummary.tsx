import { ArrowLeft } from 'lucide-react-native';
import React from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TransactionSummary as TransactionSummaryType } from './types';

interface TransactionSummaryProps {
  data: TransactionSummaryType;
  flashTag: string;
  onConfirm: () => void;
  onBack: () => void;
}

interface SummaryRowProps {
  label: string;
  value: string;
  isHighlighted?: boolean;
}

function SummaryRow({ label, value, isHighlighted = false }: SummaryRowProps) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, isHighlighted && styles.summaryValueHighlighted]}>
        {value}
      </Text>
    </View>
  );
}

export default function TransactionSummary({
  data,
  flashTag,
  onConfirm,
  onBack,
}: TransactionSummaryProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBack}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} color="#000000" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction summary</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Summary Card */}
        <View style={styles.summaryCard}>
          <SummaryRow label="Recipient" value={flashTag} />
          <View style={styles.divider} />
          <SummaryRow label="Your balance" value={data.yourBalance} />
          <View style={styles.divider} />
          <SummaryRow label="Exchange rate" value={data.exchangeRate} />
          <View style={styles.divider} />
          <SummaryRow 
            label="Customer receives" 
            value={data.customerReceives}
            isHighlighted 
          />
          <View style={styles.divider} />
          <SummaryRow label="Network fee" value={data.networkFee} />
        </View>

        {/* Amount Display */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount to deposit</Text>
          <Text style={styles.amountValue}>${data.amount}</Text>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <Text style={styles.disclaimerText}>
            By confirming this transaction, you agree to our terms and conditions. 
            The exchange rate may vary slightly at the time of confirmation.
          </Text>
        </View>
      </View>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={onConfirm}
          activeOpacity={0.8}
          accessibilityLabel="Confirm deposit transaction"
        >
          <Text style={styles.confirmButtonText}>Confirm Deposit</Text>
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
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F4F6F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: 52,
    paddingTop: 40,
  },
  summaryCard: {
    backgroundColor: '#F4F6F5',
    borderRadius: 15,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#323333',
    fontWeight: '400',
  },
  summaryValue: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
    textAlign: 'right',
    maxWidth: '50%',
  },
  summaryValueHighlighted: {
    color: '#0F6EC0',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E8E8E8',
  },
  amountContainer: {
    marginTop: 30,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(15, 110, 192, 0.05)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(15, 110, 192, 0.2)',
  },
  amountLabel: {
    fontSize: 14,
    color: '#657084',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0F6EC0',
  },
  disclaimerContainer: {
    marginTop: 20,
    paddingHorizontal: 10,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#657084',
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomContainer: {
    paddingHorizontal: 52,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
  },
  confirmButton: {
    backgroundColor: '#0F6EC0',
    borderRadius: 15,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F6EC0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F5F5F5',
  },
});