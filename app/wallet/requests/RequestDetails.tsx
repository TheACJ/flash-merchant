import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  Copy,
  Star
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { borderRadius, colors, layout, spacing, typography } from '@/constants/theme';
import { MOCK_REQUEST, Request } from './types';

interface DetailRowProps {
  label: string;
  value: string;
  valueColor?: string;
  showCopy?: boolean;
}

function DetailRow({ label, value, valueColor = colors.textPrimary, showCopy }: DetailRowProps) {
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
            <Copy size={16} color={colors.primary} />
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
          <ArrowLeft size={24} color={colors.textPrimary} strokeWidth={2} />
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
                  <Star key={i} size={14} color={colors.warning} fill={colors.warning} />
                ))}
                <Star size={14} color={colors.warning} />
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
          <AlertTriangle size={20} color={colors.error} strokeWidth={2} />
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
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
    gap: spacing['2xl'],
  },
  section: {
    gap: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: typography.fontSize.md,
    color: colors.textSecondary,
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailValue: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginLeft: spacing.xs,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: 'rgba(195, 29, 30, 0.15)',
    borderRadius: borderRadius.md,
    padding: spacing.sm,
  },
  warningText: {
    fontSize: typography.fontSize.base,
    color: colors.error,
    fontWeight: typography.fontWeight.medium,
    flex: 1,
    textAlign: 'center',
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
    backgroundColor: colors.background,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textLight,
  },
});
