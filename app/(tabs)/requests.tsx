import { useRouter } from 'expo-router';
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowUpFromLine,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  LayoutAnimation,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type RequestType = 'withdrawal' | 'deposit';
type RequestFilter = 'all' | 'withdrawal' | 'deposit';
type RequestStatus = 'pending' | 'accepted' | 'declined' | 'expired';

interface Request {
  id: string;
  type: RequestType;
  status: RequestStatus;
  userName: string;
  amount: number;
  paymentMethod: string;
  cryptoAmount: string;
  cryptoType: string;
  timeLeft?: string;
  timestamp: Date;
  isExpanded: boolean;
}

const REQUEST_FILTERS = [
  { id: 'all' as RequestFilter, label: 'All' },
  { id: 'withdrawal' as RequestFilter, label: 'Withdrawal' },
  { id: 'deposit' as RequestFilter, label: 'Deposit' },
];

const MOCK_REQUESTS: Request[] = [
  {
    id: '1',
    type: 'withdrawal',
    status: 'pending',
    userName: 'Alicce999',
    amount: 50,
    paymentMethod: 'Bank transfer',
    cryptoAmount: '0.00034',
    cryptoType: 'Btc',
    timeLeft: '19:45',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    isExpanded: true,
  },
  {
    id: '2',
    type: 'deposit',
    status: 'pending',
    userName: 'Bob123',
    amount: 100,
    paymentMethod: 'Card',
    cryptoAmount: '0.0025',
    cryptoType: 'Eth',
    timestamp: new Date(Date.now() - 10 * 60 * 1000),
    isExpanded: false,
  },
  {
    id: '3',
    type: 'withdrawal',
    status: 'pending',
    userName: 'Carol456',
    amount: 200,
    paymentMethod: 'Bank transfer',
    cryptoAmount: '0.005',
    cryptoType: 'Btc',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    isExpanded: false,
  },
  {
    id: '4',
    type: 'deposit',
    status: 'pending',
    userName: 'David789',
    amount: 75,
    paymentMethod: 'Card',
    cryptoAmount: '75',
    cryptoType: 'USDT',
    timestamp: new Date(Date.now() - 20 * 60 * 1000),
    isExpanded: false,
  },
];

interface RequestCardProps {
  request: Request;
  onToggle: (id: string) => void;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

function RequestCard({ request, onToggle, onAccept, onDecline }: RequestCardProps) {
  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    return `${diffHours} hr ago`;
  };

  const isWithdrawal = request.type === 'withdrawal';

  if (!request.isExpanded) {
    return (
      <TouchableOpacity
        style={styles.collapsedCard}
        onPress={() => onToggle(request.id)}
        activeOpacity={0.7}
      >
        <View style={styles.collapsedLeft}>
          {isWithdrawal ? (
            <ArrowUpFromLine size={24} color="#323333" strokeWidth={1.5} />
          ) : (
            <ArrowDownToLine size={24} color="#323333" strokeWidth={1.5} />
          )}
          <Text style={styles.collapsedTitle}>
            {isWithdrawal ? 'Withdrawal request' : 'Deposit request'}
          </Text>
        </View>
        <View style={styles.collapsedRight}>
          <Text style={styles.collapsedTimestamp}>
            {formatTimestamp(request.timestamp)}
          </Text>
          <ChevronDown size={12} color="#000000" strokeWidth={2} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.expandedCard}>
      {/* Header */}
      <TouchableOpacity
        style={styles.expandedHeader}
        onPress={() => onToggle(request.id)}
        activeOpacity={0.7}
      >
        <View style={styles.expandedHeaderLeft}>
          {isWithdrawal ? (
            <ArrowUpFromLine size={24} color="#128807" strokeWidth={1.5} />
          ) : (
            <ArrowDownToLine size={24} color="#128807" strokeWidth={1.5} />
          )}
          <Text style={styles.expandedTitle}>
            {isWithdrawal ? 'Withdrawal request' : 'Deposit request'}
          </Text>
        </View>
        <View style={styles.expandedHeaderRight}>
          <Text style={styles.expandedTimestamp}>
            {formatTimestamp(request.timestamp)}
          </Text>
          <ChevronUp size={12} color="#000000" strokeWidth={2} />
        </View>
      </TouchableOpacity>

      {/* Details */}
      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Name</Text>
          <Text style={styles.detailValue}>{request.userName}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Amount</Text>
          <Text style={styles.detailValue}>${request.amount.toFixed(2)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>You will send through</Text>
          <Text style={styles.detailValue}>{request.paymentMethod}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>You will receive</Text>
          <Text style={styles.detailValue}>
            {request.cryptoAmount} {request.cryptoType}
          </Text>
        </View>
        {request.timeLeft && (
          <View style={styles.detailRow}>
            <Text style={styles.timeLeftLabel}>Time left: {request.timeLeft}</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => onAccept(request.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.declineButton}
          onPress={() => onDecline(request.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RequestScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<RequestFilter>('all');
  const [requests, setRequests] = useState<Request[]>(MOCK_REQUESTS);
  const [refreshing, setRefreshing] = useState(false);

  const filteredRequests = useMemo(() => {
    if (selectedFilter === 'all') return requests;
    return requests.filter((r) => r.type === selectedFilter);
  }, [requests, selectedFilter]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const handleToggle = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setRequests((prev) =>
      prev.map((r) => ({
        ...r,
        isExpanded: r.id === id ? !r.isExpanded : false,
      }))
    );
  }, []);

  const handleAccept = useCallback((id: string) => {
    Alert.alert(
      'Accept Request',
      'Are you sure you want to accept this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            setRequests((prev) => prev.filter((r) => r.id !== id));
          },
        },
      ]
    );
  }, []);

  const handleDecline = useCallback((id: string) => {
    Alert.alert(
      'Decline Request',
      'Are you sure you want to decline this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => {
            setRequests((prev) => prev.filter((r) => r.id !== id));
          },
        },
      ]
    );
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const handlePress = () => {
  router.push({
    pathname: '/wallet/requests/RequestDetails',
    params: { id: requests.id }
  });
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
        <Text style={styles.headerTitle}>Requests</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <View style={styles.filterWrapper}>
          {REQUEST_FILTERS.map((filter) => {
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

      {/* Requests List */}
      <FlatList
        data={filteredRequests}
        renderItem={({ item }) => (
          <RequestCard
            request={item}
            onToggle={handlePress}
            onAccept={handleAccept}
            onDecline={handleDecline}
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
            <Text style={styles.emptyText}>No requests</Text>
          </View>
        }
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
  collapsedCard: {
    backgroundColor: '#F4F6F5',
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  collapsedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  collapsedTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
  },
  collapsedRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  collapsedTimestamp: {
    fontSize: 12,
    color: '#323333',
  },
  expandedCard: {
    backgroundColor: '#F4F6F5',
    borderRadius: 10,
    padding: 20,
    gap: 20,
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#D2D6E1',
  },
  expandedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandedTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#000000',
  },
  expandedHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandedTimestamp: {
    fontSize: 14,
    color: '#323333',
  },
  detailsContainer: {
    gap: 15,
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
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
  },
  timeLeftLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#C31D1E',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 21,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#0F6EC0',
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#F5F5F5',
  },
  declineButton: {
    flex: 1,
    backgroundColor: 'rgba(15, 114, 199, 0.1)',
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
  },
  declineButtonText: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
  },
  emptyContainer: {
    paddingTop: 100,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#657084',
  },
});