import QRCodeDisplay from '@/components/QRCodeDisplay';
import * as Clipboard from 'expo-clipboard';
import {
  ArrowLeft,
  Check,
  Clock,
  Coins,
  Copy,
  TrendingUp
} from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  Platform,
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
}

function SummaryItem({
  icon: Icon,
  label,
  value,
  iconColor = '#0F6EC0',
}: SummaryItemProps) {
  return (
    <View style={styles.summaryItem}>
      <View style={styles.summaryItemLeft}>
        <View style={[styles.summaryIcon, { backgroundColor: `${iconColor}15` }]}>
          <Icon size={16} color={iconColor} strokeWidth={2} />
        </View>
        <Text style={styles.summaryLabel}>{label}</Text>
      </View>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
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

  const truncateAddress = (address: string): string => {
    if (address.length <= 20) return address;
    return address; // Show full address in this case
  };

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
        <Text style={styles.headerTitle}>Stake</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Amount Display */}
        <View style={styles.amountContainer}>
          <Text style={styles.amountLabel}>Amount to stake</Text>
          <Text style={styles.amountValue}>${amount}</Text>
        </View>

        {/* QR Code Section */}
        <View style={styles.qrContainer}>
          <View style={styles.qrCodeWrapper}>
            <QRCodeDisplay
              value={qrCodeData || walletAddress}
              size={180}
              backgroundColor="#FFFFFF"
              color="#323333"
              logoSize={45}
            />
          </View>
          <Text style={styles.qrHint}>
            Scan this QR code to make the payment
          </Text>
        </View>

        {/* Wallet Address Section */}
        <View style={styles.addressSection}>
          <View style={styles.addressContainer}>
            <Text style={styles.addressText} numberOfLines={1}>
              {truncateAddress(walletAddress)}
            </Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyAddress}
              activeOpacity={0.7}
              accessibilityLabel={copied ? 'Copied' : 'Copy address'}
            >
              {copied ? (
                <Check size={22} color="#22C55E" strokeWidth={2.5} />
              ) : (
                <Copy size={22} color="#0F6EC0" strokeWidth={2} />
              )}
            </TouchableOpacity>
          </View>
          {copied && (
            <Text style={styles.copiedText}>Address copied to clipboard!</Text>
          )}
        </View>

        {/* Staking Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryTitle}>Staking Summary</Text>
          <SummaryItem
            icon={Coins}
            label="Staking Amount"
            value={`$${amount}`}
            iconColor="#0F6EC0"
          />
          <SummaryItem
            icon={TrendingUp}
            label="APR"
            value={apr}
            iconColor="#22C55E"
          />
          <SummaryItem
            icon={Clock}
            label="Lock Period"
            value={stakingPeriod}
            iconColor="#F59E0B"
          />
          <SummaryItem
            icon={TrendingUp}
            label="Estimated Returns"
            value={estimatedReturns}
            iconColor="#22C55E"
          />
        </View>
      </View>

      {/* Bottom Buttons */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={onConfirm}
          activeOpacity={0.8}
          accessibilityLabel="Confirm payment sent"
        >
          <Text style={styles.confirmButtonText}>I have sent it</Text>
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
  content: {
    flex: 1,
    paddingHorizontal: 52,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  amountLabel: {
    fontSize: 14,
    color: '#657084',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0F6EC0',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  qrCodeWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  qrCode: {
    width: 200,
    height: 200,
    backgroundColor: '#F4F6F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  qrCodeInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrLogoContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -25,
    marginLeft: -25,
  },
  qrLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#0F6EC0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrLogoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  qrHint: {
    fontSize: 13,
    color: '#657084',
    marginTop: 12,
    textAlign: 'center',
  },
  addressSection: {
    marginBottom: 20,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F6F5',
    borderWidth: 1,
    borderColor: '#D2D6E1',
    borderRadius: 15,
    height: 60,
    paddingHorizontal: 16,
  },
  addressText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginRight: 10,
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 110, 192, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  copiedText: {
    fontSize: 12,
    color: '#22C55E',
    textAlign: 'center',
    marginTop: 8,
  },
  summaryContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#657084',
    marginBottom: 4,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#657084',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  bottomContainer: {
    paddingHorizontal: 52,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    gap: 12,
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
  cancelButton: {
    backgroundColor: 'rgba(15, 110, 192, 0.1)',
    borderRadius: 15,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
});