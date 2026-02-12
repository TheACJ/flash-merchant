import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  Star,
  AlertTriangle,
  Copy,
} from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { MOCK_REQUEST, Request } from './types';

interface DetailRowProps {
  label: string;
  value: string;
  valueColor?: string;
  showCopy?: boolean;
}

function DetailRow({ label, value, valueColor = '#000000', showCopy }: DetailRowProps) {
  const handleCopy = async () => {
    await Clipboard.setStringAsync(value);
  };

  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={styles.detailValueContainer}>
        <Text style={[styles.detailValue, { color: valueColor }]}>{value}</Text>
        {showCopy && (
          <TouchableOpacity onPress={handleCopy} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Copy size={16} color="#0F6EC0" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

export default function RequestDetails() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [request] = useState<Request>(MOCK_REQUEST); // In real app, fetch by params.id

  const handleNext = () => {
    router.push('/wallet/requests/AwaitingFiat');
  };

  const isDeposit = request.type === 'deposit';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#000000" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isDeposit ? 'Remote deposit' : 'Remote withdrawal'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Customer Information Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer information</Text>
          <View style={styles.card}>
            <DetailRow label="Tag" value={request.tag} />
            <DetailRow 
              label="Completed trades" 
              value={request.completedTrades?.toString() || '0'} 
            />
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Ratings</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4].map((i) => (
                  <Star key={i} size={14} color="#FF9934" fill="#FF9934" />
                ))}
                <Star size={14} color="#FF9934" />
                <Text style={styles.ratingText}>{request.ratings?.toFixed(1)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Transaction Details Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction details</Text>
          <View style={styles.card}>
            <DetailRow 
              label={isDeposit ? 'Customer deposits' : 'Customer sends'} 
              value={`$${request.fiatAmount}`} 
            />
            <DetailRow 
              label={isDeposit ? 'You will send' : 'You will receive'} 
              value={`${request.cryptoAmount} ${request.cryptoType}`} 
            />
            <DetailRow label="Your rate" value={request.exchangeRate} />
          </View>
        </View>

        {/* Payment Details Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {isDeposit ? 'Customer Should Deposit To:' : 'Customer Should Send To:'}
          </Text>
          <View style={styles.card}>
            <DetailRow label="Name" value={request.userName} />
            <DetailRow label="Bank" value={request.bankDetails?.bankName || ''} />
            <DetailRow 
              label="Reference" 
              value={request.reference} 
              showCopy 
            />
            <DetailRow 
              label="Account number" 
              value={request.bankDetails?.accountNumber || ''} 
              showCopy 
            />
          </View>
        </View>

        {/* Warning Banner */}
        <View style={styles.warningBanner}>
          <AlertTriangle size={20} color="#C31D1E" strokeWidth={2} />
          <Text style={styles.warningText}>
            Customer must include reference number above
          </Text>
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryButtonText}>Next</Text>
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
    fontSize: 25,
    fontWeight: '600',
    color: '#000000',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 30,
  },
  section: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 20,
    gap: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    color: '#323333',
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 4,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: 'rgba(195, 29, 30, 0.15)',
    borderRadius: 10,
    padding: 12,
  },
  warningText: {
    fontSize: 14,
    color: '#C31D1E',
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    backgroundColor: '#F5F5F5',
  },
  primaryButton: {
    backgroundColor: '#0F6EC0',
    borderRadius: 15,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F5F5F5',
  },
});