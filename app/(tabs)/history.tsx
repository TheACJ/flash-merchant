import { useRouter } from 'expo-router';
import {
  ArrowLeft
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

const HISTORY_FILTERS = [
  { id: 'all' as HistoryFilter, label: 'All' },
  { id: 'withdrawal' as HistoryFilter, label: 'Withdrawal' },
  { id: 'deposit' as HistoryFilter, label: 'Deposit' },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    type: 'withdrawal',
    status: 'success',
    title: 'Physical withdrawal',
    userName: '@Alicejhon222',
    amount: 500,
    cryptoAmount: '0.00034 Btc',
    exchangeRate: '1 Btc=$40,000',
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
    exchangeRate: '1 Btc=$40,000',
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
    exchangeRate: '1 Btc=$40,000',
    reference: 'FLH-7831-CAROL',
    gasFee: 5,
    method: 'Fiat',
    timestamp: new Date(2025, 10, 23, 12, 30),
  },
];

interface TransactionCardProps {
  transaction: Transaction;
  onPress: (transaction: Transaction) => void;
}

function TransactionCard({ transaction, onPress }: TransactionCardProps) {
  const formatDate = (date: Date): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${months[date.getMonth()]} ${date.getDate()}, ${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const isWithdrawal = transaction.type === 'withdrawal';
  const amountColor = isWithdrawal ? '#C31D1E' : '#128807';
  const amountPrefix = isWithdrawal ? '-' : '+';

  const getStatusColor = (status: TransactionStatus): string => {
    switch (status) {
      case 'success':
        return '#128807';
      case 'pending':
        return '#FF9934';
      case 'failed':
        return '#C31D1E';
    }
  };

  const getStatusLabel = (status: TransactionStatus): string => {
    switch (status) {
      case 'success':
        return 'Success';
      case 'pending':
        return 'Pending fiat';
      case 'failed':
        return 'Failed';
    }
  };

  return (
    <TouchableOpacity
      style={styles.transactionCard}
      onPress={() => onPress(transaction)}
      activeOpacity={0.7}
    >
      <View style={styles.transactionContent}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionTitle}>{transaction.title}</Text>
          <Text style={styles.transactionDate}>{formatDate(transaction.timestamp)}</Text>
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionUser}>{transaction.userName} requesting</Text>
          <Text style={[styles.transactionAmount, { color: amountColor }]}>
            {amountPrefix}${transaction.amount}
          </Text>
        </View>
        <Text style={[styles.transactionStatus, { color: getStatusColor(transaction.status) }]}>
          {getStatusLabel(transaction.status)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

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

  const formatDate = (date: Date): string => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}, ${formattedHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const isWithdrawal = transaction.type === 'withdrawal';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Close Button */}
        <TouchableOpacity
          style={styles.closeButton}
          onPress={onClose}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#000000" strokeWidth={2} />
        </TouchableOpacity>

        {/* Content */}
        <View style={styles.modalContent}>
          {/* Logo Placeholder */}
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>F</Text>
          </View>

          {/* Amount */}
          <View style={styles.amountSection}>
            <Text style={styles.modalAmount}>
              ${transaction.amount.toLocaleString()}.00
            </Text>
            <Text style={styles.modalStatus}>
              {isWithdrawal ? 'Withdraw' : 'Deposit'} successfully
            </Text>
          </View>

          {/* Details */}
          <View style={styles.detailsList}>
            {transaction.exchangeRate && (
              <View style={styles.detailItem}>
                <Text style={styles.detailItemLabel}>Exchange rate</Text>
                <Text style={styles.detailItemValue}>{transaction.exchangeRate}</Text>
              </View>
            )}
            {transaction.cryptoAmount && (
              <View style={styles.detailItem}>
                <Text style={styles.detailItemLabel}>Customer receives</Text>
                <Text style={styles.detailItemValue}>₦100,000</Text>
              </View>
            )}
            <View style={styles.detailItem}>
              <Text style={styles.detailItemLabel}>Reference</Text>
              <Text style={styles.detailItemValue}>{transaction.reference}</Text>
            </View>
            {transaction.gasFee && (
              <View style={styles.detailItem}>
                <Text style={styles.detailItemLabel}>Gas fee</Text>
                <Text style={styles.detailItemValue}>${transaction.gasFee}</Text>
              </View>
            )}
            <View style={styles.detailItem}>
              <Text style={styles.detailItemLabel}>Method</Text>
              <Text style={styles.detailItemValue}>{transaction.method}</Text>
            </View>
            <View style={[styles.detailItem, styles.detailItemNoBorder]}>
              <Text style={styles.detailItemLabel}>Date</Text>
              <Text style={styles.detailItemValue}>{formatDate(transaction.timestamp)}</Text>
            </View>
          </View>
        </View>

        {/* Print Receipt Button */}
        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={styles.printButton}
            onPress={onPrintReceipt}
            activeOpacity={0.8}
          >
            <Text style={styles.printButtonText}>Print receipt</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

export default function HistoryScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<HistoryFilter>('all');
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filteredTransactions = useMemo(() => {
    if (selectedFilter === 'all') return transactions;
    return transactions.filter((t) => t.type === selectedFilter);
  }, [transactions, selectedFilter]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const handleTransactionPress = useCallback((transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setSelectedTransaction(null);
  }, []);

  const handlePrintReceipt = useCallback(() => {
    // Implement print functionality
    console.log('Print receipt for:', selectedTransaction?.id);
  }, [selectedTransaction]);

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
        >
          <ArrowLeft size={24} color="#000000" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction history</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <View style={styles.filterWrapper}>
          {HISTORY_FILTERS.map((filter) => {
            const isActive = selectedFilter === filter.id;
            return (
              <TouchableOpacity
                key={filter.id}
                style={[styles.filterTab, isActive && styles.filterTabActive]}
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
      </View>

      {/* Transactions List */}
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
            tintColor="#0F6EC0"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions</Text>
          </View>
        }
      />

      {/* Transaction Detail Modal */}
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
  },
  headerSpacer: {
    width: 50,
  },
  filterContainer: {
    paddingHorizontal: 52,
    marginBottom: 20,
  },
  filterWrapper: {
    flexDirection: 'row',
    backgroundColor: '#F4F6F5',
    borderRadius: 10,
    padding: 5,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: '#0F6EC0',
  },
  filterTabText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#323333',
  },
  filterTabTextActive: {
    fontWeight: '500',
    color: '#F4F6F5',
  },
  listContent: {
    paddingHorizontal: 52,
    paddingBottom: 100,
    gap: 20,
  },
  transactionCard: {
    backgroundColor: '#F4F6F5',
    borderRadius: 10,
    padding: 20,
  },
  transactionContent: {
    gap: 20,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
  },
  transactionDate: {
    fontSize: 14,
    color: '#323333',
  },
  transactionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionUser: {
    fontSize: 16,
    color: '#323333',
  },
  transactionAmount: {
    fontSize: 20,
    fontWeight: '500',
  },
  transactionStatus: {
    fontSize: 16,
    fontWeight: '400',
  },
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#657084',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  closeButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F4F6F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
    marginTop: 16,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 52,
    paddingTop: 30,
    alignItems: 'center',
  },
  logoPlaceholder: {
    width: 78,
    height: 51,
    backgroundColor: '#0F6EC0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  amountSection: {
    alignItems: 'center',
    gap: 15,
    marginBottom: 40,
  },
  modalAmount: {
    fontSize: 30,
    fontWeight: '600',
    color: '#0F6EC0',
  },
  modalStatus: {
    fontSize: 18,
    fontWeight: '500',
    color: '#323333',
  },
  detailsList: {
    width: '100%',
    gap: 20,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#D2D6E1',
    borderStyle: 'dashed',
  },
  detailItemNoBorder: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  detailItemLabel: {
    fontSize: 16,
    color: '#323333',
  },
  detailItemValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  modalFooter: {
    paddingHorizontal: 52,
    paddingBottom: Platform.OS === 'ios' ? 50 : 30,
  },
  printButton: {
    backgroundColor: '#0F6EC0',
    borderRadius: 15,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  printButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F5F5F5',
  },
});