// (tabs)/requests.tsx
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
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Inbox,
  X,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  LayoutAnimation,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Types ──────────────────────────────────────────────────────────────────

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

// ─── Constants ──────────────────────────────────────────────────────────────

const REQUEST_FILTERS = [
  { id: 'all' as RequestFilter, label: 'All' },
  { id: 'withdrawal' as RequestFilter, label: 'Withdrawals' },
  { id: 'deposit' as RequestFilter, label: 'Deposits' },
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
    cryptoType: 'BTC',
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
    cryptoType: 'ETH',
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
    cryptoType: 'BTC',
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

// ─── Helpers ────────────────────────────────────────────────────────────────

const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  return `${diffHours}h ago`;
};

// ─── Detail Row ─────────────────────────────────────────────────────────────

const DetailRow: React.FC<{ label: string; value: string; highlight?: boolean }> = ({
  label,
  value,
  highlight,
}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text
      style={[
        styles.detailValue,
        highlight && styles.detailValueHighlight,
      ]}
    >
      {value}
    </Text>
  </View>
);

// ─── Request Card ───────────────────────────────────────────────────────────

interface RequestCardProps {
  request: Request;
  onToggle: (id: string) => void;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

function RequestCard({
  request,
  onToggle,
  onAccept,
  onDecline,
}: RequestCardProps) {
  const isWithdrawal = request.type === 'withdrawal';
  const TypeIcon = isWithdrawal ? ArrowUpFromLine : ArrowDownToLine;
  const typeColor = isWithdrawal ? colors.error : colors.success;
  const typeBg = isWithdrawal ? colors.errorLight : colors.successLight;

  // Collapsed
  if (!request.isExpanded) {
    return (
      <TouchableOpacity
        style={styles.collapsedCard}
        onPress={() => onToggle(request.id)}
        activeOpacity={0.7}
      >
        <View style={styles.collapsedLeft}>
          <View style={[styles.typeIcon, { backgroundColor: typeBg }]}>
            <TypeIcon size={layout.iconSize.sm} color={typeColor} strokeWidth={2} />
          </View>
          <View style={styles.collapsedInfo}>
            <Text style={styles.collapsedTitle}>
              {isWithdrawal ? 'Withdrawal' : 'Deposit'} request
            </Text>
            <Text style={styles.collapsedUser}>@{request.userName}</Text>
          </View>
        </View>
        <View style={styles.collapsedRight}>
          <Text style={styles.collapsedAmount}>${request.amount}</Text>
          <View style={styles.collapsedMeta}>
            <Text style={styles.collapsedTimestamp}>
              {formatTimestamp(request.timestamp)}
            </Text>
            <ChevronDown
              size={14}
              color={colors.textMuted}
              strokeWidth={2}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Expanded
  return (
    <View style={styles.expandedCard}>
      {/* Header */}
      <TouchableOpacity
        style={styles.expandedHeader}
        onPress={() => onToggle(request.id)}
        activeOpacity={0.7}
      >
        <View style={styles.expandedHeaderLeft}>
          <View style={[styles.typeIcon, { backgroundColor: typeBg }]}>
            <TypeIcon
              size={layout.iconSize.sm}
              color={typeColor}
              strokeWidth={2}
            />
          </View>
          <Text style={styles.expandedTitle}>
            {isWithdrawal ? 'Withdrawal' : 'Deposit'} Request
          </Text>
        </View>
        <View style={styles.expandedHeaderRight}>
          <Text style={styles.expandedTimestamp}>
            {formatTimestamp(request.timestamp)}
          </Text>
          <ChevronUp size={14} color={colors.textMuted} strokeWidth={2} />
        </View>
      </TouchableOpacity>

      {/* Details */}
      <View style={styles.detailsContainer}>
        <DetailRow label="Customer" value={`@${request.userName}`} />
        <DetailRow label="Amount" value={`$${request.amount.toFixed(2)}`} />
        <DetailRow label="Payment Method" value={request.paymentMethod} />
        <DetailRow
          label="You receive"
          value={`${request.cryptoAmount} ${request.cryptoType}`}
          highlight
        />
        {request.timeLeft && (
          <View style={styles.timerRow}>
            <Clock size={14} color={colors.error} strokeWidth={2} />
            <Text style={styles.timerText}>
              Time remaining: {request.timeLeft}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => onAccept(request.id)}
          activeOpacity={0.85}
        >
          <Check
            size={layout.iconSize.sm}
            color={colors.textWhite}
            strokeWidth={2.5}
          />
          <Text style={styles.acceptButtonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.declineButton}
          onPress={() => onDecline(request.id)}
          activeOpacity={0.85}
        >
          <X
            size={layout.iconSize.sm}
            color={colors.error}
            strokeWidth={2.5}
          />
          <Text style={styles.declineButtonText}>Decline</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export default function RequestScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] =
    useState<RequestFilter>('all');
  const [requests, setRequests] = useState<Request[]>(MOCK_REQUESTS);
  const [refreshing, setRefreshing] = useState(false);

  const filteredRequests = useMemo(() => {
    if (selectedFilter === 'all') return requests;
    return requests.filter((r) => r.type === selectedFilter);
  }, [requests, selectedFilter]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 1500));
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
    Alert.alert('Accept Request', 'Confirm acceptance of this request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: () =>
          setRequests((prev) => prev.filter((r) => r.id !== id)),
      },
    ]);
  }, []);

  const handleDecline = useCallback((id: string) => {
    Alert.alert('Decline Request', 'Are you sure you want to decline?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: () =>
          setRequests((prev) => prev.filter((r) => r.id !== id)),
      },
    ]);
  }, []);

  const pendingCount = requests.filter(
    (r) => r.status === 'pending'
  ).length;

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
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Requests</Text>
          {pendingCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{pendingCount}</Text>
            </View>
          )}
        </View>
        <View style={{ width: layout.minTouchTarget }} />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        {REQUEST_FILTERS.map((filter) => {
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
        data={filteredRequests}
        renderItem={({ item }) => (
          <RequestCard
            request={item}
            onToggle={handleToggle}
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
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Inbox
              size={layout.iconSize['2xl']}
              color={colors.textMuted}
              strokeWidth={1.2}
            />
            <Text style={styles.emptyTitle}>No requests</Text>
            <Text style={styles.emptySubtitle}>
              Incoming requests will appear here
            </Text>
          </View>
        }
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.tight,
  },
  headerBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing['2xs'],
    borderRadius: borderRadius.full,
    minWidth: 24,
    alignItems: 'center',
  },
  headerBadgeText: {
    fontSize: typography.fontSize['2xs'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
  },

  // Filters
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: layout.screenPaddingHorizontal,
    marginBottom: spacing.lg,
    backgroundColor: colors.backgroundInput,
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

  // Collapsed Card
  collapsedCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.xs,
  },
  collapsedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collapsedInfo: {
    flex: 1,
    gap: spacing['2xs'],
  },
  collapsedTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  collapsedUser: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textTertiary,
  },
  collapsedRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  collapsedAmount: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  collapsedMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  collapsedTimestamp: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    color: colors.textMuted,
  },

  // Expanded Card
  expandedCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    padding: spacing.base,
    gap: spacing.base,
    borderWidth: 1.5,
    borderColor: colors.primaryMedium,
    ...shadows.sm,
  },
  expandedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  expandedHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  expandedTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  expandedHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  expandedTimestamp: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textTertiary,
  },

  // Details
  detailsContainer: {
    gap: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  detailValueHighlight: {
    color: colors.primary,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.errorLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  timerText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
  },

  // Actions
  actionsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeightSmall,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    ...shadows.button,
  },
  acceptButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
  },
  declineButton: {
    flex: 1,
    backgroundColor: colors.errorLight,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeightSmall,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  declineButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.error,
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
});