// (tabs)/history.tsx
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
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpFromLine,
  CheckCircle2,
  Clock,
  Printer,
  Receipt,
  XCircle,
  Zap
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Types ──────────────────────────────────────────────────────────────────

type TransactionType = 'withdrawal' | 'deposit';
type TransactionStatus = 'success' | 'pending' | 'failed';
type HistoryFilter = 'all' | 'withdrawal' | 'deposit';

interface Transaction {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  title: string;
  userName: string;
  amount: number;
  cryptoAmount?: string;
  exchangeRate?: string;
  reference: string;
  gasFee?: number;
  method: string;
  timestamp: Date;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const HISTORY_FILTERS = [
  { id: 'all' as HistoryFilter, label: 'All' },
  { id: 'withdrawal' as HistoryFilter, label: 'Withdrawals' },
  { id: 'deposit' as HistoryFilter, label: 'Deposits' },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'withdrawal',
    status: 'success',
    title: 'Physical withdrawal',
    userName: '@Alicejhon222',
    amount: 500,
    cryptoAmount: '0.00034 BTC',
    exchangeRate: '1 BTC = $40,000',
    reference: 'FLH-7829-ALICE',
    gasFee: 5,
    method: 'Fiat',
    timestamp: new Date(2025, 10, 23, 10, 25),
  },
  {
    id: '2',
    type: 'deposit',
    status: 'success',
    title: 'Physical deposit',
    userName: '@Alicejhon222',
    amount: 500,
    exchangeRate: '1 BTC = $40,000',
    reference: 'FLH-7830-ALICE',
    gasFee: 5,
    method: 'Fiat',
    timestamp: new Date(2025, 10, 23, 11, 15),
  },
  {
    id: '3',
    type: 'deposit',
    status: 'pending',
    title: 'Physical deposit',
    userName: '@Carol456',
    amount: 500,
    exchangeRate: '1 BTC = $40,000',
    reference: 'FLH-7831-CAROL',
    gasFee: 5,
    method: 'Fiat',
    timestamp: new Date(2025, 10, 23, 12, 30),
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatDate = (date: Date): string => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${months[date.getMonth()]} ${date.getDate()}, ${formattedHours}:${minutes
    .toString()
    .padStart(2, '0')} ${ampm}`;
};

const getStatusConfig = (status: TransactionStatus) => {
  switch (status) {
    case 'success':
      return {
        color: colors.success,
        bgColor: colors.successLight,
        label: 'Completed',
        icon: CheckCircle2,
      };
    case 'pending':
      return {
        color: colors.warning,
        bgColor: colors.warningLight,
        label: 'Pending',
        icon: Clock,
      };
    case 'failed':
      return {
        color: colors.error,
        bgColor: colors.errorLight,
        label: 'Failed',
        icon: XCircle,
      };
  }
};

// ─── Transaction Card ───────────────────────────────────────────────────────

interface TransactionCardProps {
  transaction: Transaction;
  onPress: (transaction: Transaction) => void;
}

function TransactionCard({ transaction, onPress }: TransactionCardProps) {
  const isWithdrawal = transaction.type === 'withdrawal';
  const statusConfig = getStatusConfig(transaction.status);
  const StatusIcon = statusConfig.icon;

  return (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() => onPress(transaction)}
      activeOpacity={0.7}
    >
      {/* Icon */}
      <View
        style={[
          styles.txIconContainer,
          {
            backgroundColor: isWithdrawal
              ? colors.errorLight
              : colors.successLight,
          },
        ]}
      >
        {isWithdrawal ? (
          <ArrowUpFromLine
            size={layout.iconSize.sm}
            color={colors.error}
            strokeWidth={2}
          />
        ) : (
          <ArrowDownToLine
            size={layout.iconSize.sm}
            color={colors.success}
            strokeWidth={2}
          />
        )}
      </View>

      {/* Content */}
      <View style={styles.txContent}>
        <View style={styles.txTopRow}>
          <Text style={styles.txTitle}>{transaction.title}</Text>
          <Text
            style={[
              styles.txAmount,
              { color: isWithdrawal ? colors.error : colors.success },
            ]}
          >
            {isWithdrawal ? '-' : '+'}${transaction.amount}
          </Text>
        </View>
        <View style={styles.txBottomRow}>
          <Text style={styles.txUser}>{transaction.userName}</Text>
          <View
            style={[
              styles.txStatusBadge,
              { backgroundColor: statusConfig.bgColor },
            ]}
          >
            <StatusIcon
              size={10}
              color={statusConfig.color}
              strokeWidth={2.5}
            />
            <Text
              style={[
                styles.txStatusText,
                { color: statusConfig.color },
              ]}
            >
              {statusConfig.label}
            </Text>
          </View>
        </View>
        <Text style={styles.txDate}>
          {formatDate(transaction.timestamp)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Transaction Detail Modal ───────────────────────────────────────────────

interface TransactionDetailModalProps {
  visible: boolean;
  transaction: Transaction | null;
  onClose: () => void;
  onPrintReceipt: () => void;
}

function TransactionDetailModal({
  visible,
  transaction,
  onClose,
  onPrintReceipt,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  const isWithdrawal = transaction.type === 'withdrawal';
  const statusConfig = getStatusConfig(transaction.status);

  const details = [
    transaction.exchangeRate && {
      label: 'Exchange Rate',
      value: transaction.exchangeRate,
    },
    transaction.cryptoAmount && {
      label: 'Crypto Amount',
      value: transaction.cryptoAmount,
    },
    { label: 'Reference', value: transaction.reference, mono: true },
    transaction.gasFee && {
      label: 'Gas Fee',
      value: `$${transaction.gasFee}`,
    },
    { label: 'Method', value: transaction.method },
    { label: 'Date', value: formatDate(transaction.timestamp) },
  ].filter(Boolean) as Array<{
    label: string;
    value: string;
    mono?: boolean;
  }>;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        {/* Header */}

        <View style={styles.modalHeader}>
          <TouchableOpacity
            style={styles.modalBackButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <ArrowLeft
              size={layout.iconSize.md}
              color={colors.textPrimary}
              strokeWidth={2}
            />
          </TouchableOpacity>
          <Text style={styles.modalHeaderTitle}>Transaction Details</Text>
          <View style={{ width: layout.minTouchTarget }} />
        </View>

        {/* Content */}
        <View style={styles.modalContent}>
          {/* Logo */}
          <View style={styles.modalLogo}>
            <Zap
              size={layout.iconSize.xl}
              color={colors.textWhite}
              strokeWidth={2}
            />
          </View>

          {/* Amount */}
          <Text style={styles.modalAmount}>
            ${transaction.amount.toLocaleString()}.00
          </Text>

          {/* Status */}
          <View
            style={[
              styles.modalStatusBadge,
              { backgroundColor: statusConfig.bgColor },
            ]}
          >
            <statusConfig.icon
              size={14}
              color={statusConfig.color}
              strokeWidth={2.5}
            />
            <Text
              style={[
                styles.modalStatusText,
                { color: statusConfig.color },
              ]}
            >
              {isWithdrawal ? 'Withdrawal' : 'Deposit'}{' '}
              {statusConfig.label.toLowerCase()}
            </Text>
          </View>

          {/* Details Card */}
          <View style={styles.detailsCard}>
            {details.map((detail, index) => (
              <React.Fragment key={detail.label}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{detail.label}</Text>
                  <Text
                    style={[
                      styles.detailValue,
                      detail.mono && styles.detailValueMono,
                    ]}
                  >
                    {detail.value}
                  </Text>
                </View>
                {index < details.length - 1 && (
                  <View style={styles.detailDivider} />
                )}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.printButton}
            onPress={onPrintReceipt}
            activeOpacity={0.85}
          >
            <Printer
              size={layout.iconSize.sm}
              color={colors.textWhite}
              strokeWidth={1.8}
            />
            <Text style={styles.printButtonText}>Print Receipt</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function HistoryScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] =
    useState<HistoryFilter>('all');
  const [transactions] =
    useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filteredTransactions = useMemo(() => {
    if (selectedFilter === 'all') return transactions;
    return transactions.filter((t) => t.type === selectedFilter);
  }, [transactions, selectedFilter]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1500));
    setRefreshing(false);
  }, []);

  const handleTransactionPress = useCallback((tx: Transaction) => {
    setSelectedTransaction(tx);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedTransaction(null);
  }, []);

  const handlePrintReceipt = useCallback(() => {
    console.log('Print receipt for:', selectedTransaction?.id);
  }, [selectedTransaction]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
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
        <Text style={styles.headerTitle}>History</Text>
        <View style={{ width: layout.minTouchTarget }} />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        {HISTORY_FILTERS.map((filter) => {
          const isActive = selectedFilter === filter.id;
          return (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterTab,
                isActive && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter(filter.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterTabText,
                  isActive && styles.filterTabTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List */}
      <FlatList
        data={filteredTransactions}
        renderItem={({ item }) => (
          <TransactionCard
            transaction={item}
            onPress={handleTransactionPress}
          />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Receipt
              size={layout.iconSize['2xl']}
              color={colors.textMuted}
              strokeWidth={1.2}
            />
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>
              Your transaction history will appear here
            </Text>
          </View>
        }
      />

      <TransactionDetailModal
        visible={modalVisible}
        transaction={selectedTransaction}
        onClose={handleCloseModal}
        onPrintReceipt={handlePrintReceipt}
      />
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
    height: layout.headerHeight,
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
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
  },

  // Filters
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginBottom: spacing.lg,
    backgroundColor: colors.backgroundInput,
    marginHorizontal: layout.screenPaddingHorizontal,
    borderRadius: borderRadius.md,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  filterTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    ...shadows.sm,
  },
  filterTabText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.textTertiary,
  },
  filterTabTextActive: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
  },

  // List
  listContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: 100,
    gap: spacing.md,
  },

  // Transaction Card
  transactionCard: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.xs,
  },
  txIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  txContent: {
    flex: 1,
    gap: spacing.xs,
  },
  txTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  txAmount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
  },
  txBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txUser: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textTertiary,
  },
  txStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing['2xs'],
    borderRadius: borderRadius.full,
  },
  txStatusText: {
    fontSize: typography.fontSize['2xs'],
    fontWeight: typography.fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: typography.letterSpacing.wide,
  },
  txDate: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    color: colors.textMuted,
  },

  // Empty
  emptyContainer: {
    paddingTop: spacing['7xl'],
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginTop: spacing.base,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    color: colors.textTertiary,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    height: layout.headerHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  modalBackButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing['2xl'],
    alignItems: 'center',
  },
  modalLogo: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    ...shadows.md,
  },
  modalAmount: {
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.md,
    letterSpacing: typography.letterSpacing.tight,
  },
  modalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginBottom: spacing['2xl'],
  },
  modalStatusText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  detailsCard: {
    width: '100%',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  detailLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    color: colors.textTertiary,
  },
  detailValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  detailValueMono: {
    fontFamily: typography.fontFamilyMono,
    letterSpacing: typography.letterSpacing.wide,
  },
  detailDivider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  modalFooter: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: Platform.OS === 'ios' ? spacing['3xl'] : spacing['2xl'],
  },
  printButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    ...shadows.button,
  },
  printButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
  },
});