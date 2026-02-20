import QRCodeDisplay from '@/components/QRCodeDisplay';
import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import * as Clipboard from 'expo-clipboard';
import {
  ArrowLeft,
  Check,
  Clock,
  Coins,
  Copy,
  QrCode,
  Shield,
  TrendingUp,
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface StakePaymentProps {
  amount: string;
  walletAddress: string;
  qrCodeData: string;
  estimatedReturns: string;
  apr: string;
  stakingPeriod: string;
  onConfirm: () => void;
  onCancel: () => void;
  onBack: () => void;
}

interface SummaryItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  iconColor?: string;
  isLast?: boolean;
}

function SummaryItem({
  icon: Icon,
  label,
  value,
  iconColor = colors.primary,
  isLast = false,
}: SummaryItemProps) {
  return (
    <>
      <View style={styles.summaryItem}>
        <View style={styles.summaryItemLeft}>
          <View
            style={[
              styles.summaryIcon,
              { backgroundColor: `${iconColor}15` },
            ]}
          >
            <Icon size={layout.iconSize.xs} color={iconColor} strokeWidth={2} />
          </View>
          <Text style={styles.summaryLabel}>{label}</Text>
        </View>
        <Text style={styles.summaryValue}>{value}</Text>
      </View>
      {!isLast && <View style={styles.summaryDivider} />}
    </>
  );
}

export default function StakePayment({
  amount,
  walletAddress,
  qrCodeData,
  estimatedReturns,
  apr,
  stakingPeriod,
  onConfirm,
  onCancel,
  onBack,
}: StakePaymentProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy address');
    }
  }, [walletAddress]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: `Stake $${amount} to address: ${walletAddress}`,
        title: 'Staking Payment',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  }, [amount, walletAddress]);

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
          <ArrowLeft
            size={layout.iconSize.md}
            color={colors.textPrimary}
            strokeWidth={2}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, styles.stepDotCompleted]} />
        <View style={[styles.stepLine, styles.stepLineCompleted]} />
        <View style={[styles.stepDot, styles.stepDotActive]} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* Amount Hero Card */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>AMOUNT TO STAKE</Text>
          <Text style={styles.amountValue}>${amount}</Text>
          <View style={styles.amountReturnsBadge}>
            <TrendingUp size={14} color={colors.textWhite} strokeWidth={2} />
            <Text style={styles.amountReturnsText}>
              Est. Returns: {estimatedReturns}
            </Text>
          </View>
        </View>

        {/* QR Code Section */}
        <View style={styles.qrSection}>
          <View style={styles.qrSectionHeader}>
            <QrCode
              size={layout.iconSize.sm}
              color={colors.textTertiary}
              strokeWidth={1.8}
            />
            <Text style={styles.qrSectionTitle}>Scan to Pay</Text>
          </View>

          <View style={styles.qrCodeWrapper}>
            <QRCodeDisplay
              value={qrCodeData || walletAddress}
              size={180}
              backgroundColor={colors.backgroundCard}
              color={colors.textPrimary}
              logoSize={45}
            />
          </View>

          <Text style={styles.qrHint}>
            Scan this QR code with your wallet app to complete the payment
          </Text>
        </View>

        {/* Wallet Address */}
        <View style={styles.addressSection}>
          <Text style={styles.addressLabel}>WALLET ADDRESS</Text>
          <View style={styles.addressContainer}>
            <Text style={styles.addressText} numberOfLines={1}>
              {walletAddress}
            </Text>
            <TouchableOpacity
              style={[
                styles.copyButton,
                copied && styles.copyButtonCopied,
              ]}
              onPress={handleCopyAddress}
              activeOpacity={0.7}
              accessibilityLabel={copied ? 'Copied' : 'Copy address'}
            >
              {copied ? (
                <Check
                  size={layout.iconSize.sm}
                  color={colors.success}
                  strokeWidth={2.5}
                />
              ) : (
                <Copy
                  size={layout.iconSize.sm}
                  color={colors.primary}
                  strokeWidth={2}
                />
              )}
            </TouchableOpacity>
          </View>
          {copied && (
            <Text style={styles.copiedText}>
              Address copied to clipboard
            </Text>
          )}
        </View>

        {/* Staking Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryCardHeader}>
            <Shield
              size={layout.iconSize.sm}
              color={colors.primary}
              strokeWidth={1.8}
            />
            <Text style={styles.summaryTitle}>Staking Summary</Text>
          </View>

          <SummaryItem
            icon={Coins}
            label="Staking Amount"
            value={`$${amount}`}
            iconColor={colors.primary}
          />
          <SummaryItem
            icon={TrendingUp}
            label="APR"
            value={apr}
            iconColor={colors.success}
          />
          <SummaryItem
            icon={Clock}
            label="Lock Period"
            value={stakingPeriod}
            iconColor={colors.warning}
          />
          <SummaryItem
            icon={TrendingUp}
            label="Estimated Returns"
            value={estimatedReturns}
            iconColor={colors.success}
            isLast
          />
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={onConfirm}
          activeOpacity={0.8}
          accessibilityLabel="Confirm payment sent"
        >
          <Check
            size={layout.iconSize.md}
            color={colors.textWhite}
            strokeWidth={2}
          />
          <Text style={styles.confirmButtonText}>I Have Sent It</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={onCancel}
          activeOpacity={0.8}
          accessibilityLabel="Cancel staking"
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.base,
  },
  backButton: {
    width: layout.avatarSize.md,
    height: layout.avatarSize.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.wide,
  },
  headerSpacer: {
    width: layout.avatarSize.md,
  },

  // Step Indicator
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal * 3,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
    backgroundColor: colors.borderLight,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
    width: 12,
    height: 12,
  },
  stepDotCompleted: {
    backgroundColor: colors.success,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.borderLight,
  },
  stepLineCompleted: {
    backgroundColor: colors.success,
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },

  // Amount Hero Card
  amountCard: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  amountLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: 'rgba(255, 255, 255, 0.75)',
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing.sm,
  },
  amountValue: {
    fontSize: typography.fontSize['6xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
    letterSpacing: typography.letterSpacing.tight,
    marginBottom: spacing.md,
  },
  amountReturnsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  amountReturnsText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
  },

  // QR Section
  qrSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  qrSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  qrSectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textTertiary,
    letterSpacing: typography.letterSpacing.wide,
    textTransform: 'uppercase',
  },
  qrCodeWrapper: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.md,
  },
  qrHint: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    marginTop: spacing.md,
    textAlign: 'center',
    lineHeight: typography.fontSize.xs * typography.lineHeight.relaxed,
    paddingHorizontal: spacing.xl,
  },

  // Address
  addressSection: {
    marginBottom: spacing.xl,
  },
  addressLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textTertiary,
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing.sm,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.lg,
    height: layout.inputHeight,
    paddingLeft: spacing.base,
    paddingRight: spacing.xs,
    ...shadows.xs,
  },
  addressText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textPrimary,
    fontFamily: typography.fontFamilyMono,
    marginRight: spacing.sm,
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copyButtonCopied: {
    backgroundColor: colors.successLight,
  },
  copiedText: {
    fontSize: typography.fontSize.xs,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // Summary Card
  summaryCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.base,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  summaryTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.wide,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  summaryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    fontWeight: typography.fontWeight.regular,
  },
  summaryValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: colors.divider,
  },

  // Bottom
  bottomContainer: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: Platform.OS === 'ios' ? spacing['3xl'] : spacing['2xl'],
    paddingTop: spacing.base,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.backgroundElevated,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.button,
  },
  confirmButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
    letterSpacing: typography.letterSpacing.wide,
  },
  cancelButton: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
});