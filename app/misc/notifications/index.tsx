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
  ArrowLeft,
  ArrowUpFromLine,
  Bell,
  BellOff,
  CheckCircle2,
  ChevronRight,
  Coins,
  CreditCard,
  Info,
  Sparkles,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  MOCK_NOTIFICATIONS,
  Notification,
  NOTIFICATION_FILTERS,
  NotificationStatus,
  NotificationType,
} from './types';

// Icon mapping for notification types
const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case 'withdrawal':
      return ArrowUpFromLine;
    case 'deposit':
      return CreditCard;
    case 'stake':
      return Coins;
    case 'update':
      return Sparkles;
    default:
      return Bell;
  }
};

const getStatusConfig = (
  status: NotificationStatus
): { color: string; bgColor: string; label: string } => {
  switch (status) {
    case 'new':
      return {
        color: colors.error,
        bgColor: colors.errorLight,
        label: 'New',
      };
    case 'completed':
      return {
        color: colors.success,
        bgColor: colors.successLight,
        label: 'Completed',
      };
    case 'pending':
      return {
        color: colors.warning,
        bgColor: colors.warningLight,
        label: 'Pending',
      };
    default:
      return {
        color: colors.textTertiary,
        bgColor: colors.backgroundInput,
        label: 'Unknown',
      };
  }
};

interface NotificationCardProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
}

function NotificationCard({ notification, onPress }: NotificationCardProps) {
  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const statusConfig = getStatusConfig(notification.status);
  const IconComponent = getNotificationIcon(notification.type);
  const isCompleted = notification.status === 'completed';

  return (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        !notification.isRead && styles.notificationCardUnread,
      ]}
      onPress={() => onPress(notification)}
      activeOpacity={0.6}
      accessibilityLabel={`${notification.title}. ${notification.description}`}
    >
      {/* Left accent bar for unread */}
      {!notification.isRead && <View style={styles.unreadAccent} />}

      <View style={styles.cardContent}>
        {/* Top Row */}
        <View style={styles.cardTopRow}>
          <View
            style={[
              styles.typeIconWrapper,
              { backgroundColor: statusConfig.bgColor },
            ]}
          >
            {isCompleted ? (
              <CheckCircle2
                size={layout.iconSize.sm}
                color={statusConfig.color}
                strokeWidth={1.8}
              />
            ) : (
              <IconComponent
                size={layout.iconSize.sm}
                color={statusConfig.color}
                strokeWidth={1.8}
              />
            )}
          </View>

          <View style={styles.cardTopRight}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusConfig.bgColor },
              ]}
            >
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: statusConfig.color },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: statusConfig.color },
                ]}
              >
                {statusConfig.label}
              </Text>
            </View>
            <Text style={styles.timestamp}>
              {formatTimestamp(notification.timestamp)}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.cardBody}>
          <Text style={styles.notificationTitle}>{notification.title}</Text>
          <Text style={styles.notificationDescription}>
            {notification.description}
          </Text>
        </View>

        {/* Action Row */}
        <TouchableOpacity
          style={styles.actionRow}
          activeOpacity={0.6}
          onPress={() => onPress(notification)}
        >
          <Text style={styles.actionText}>{notification.actionLabel}</Text>
          <ChevronRight
            size={layout.iconSize.xs}
            color={colors.primary}
            strokeWidth={2}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ onGoHome }: { onGoHome: () => void }) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyContent}>
        <View style={styles.emptyIconWrapper}>
          <BellOff
            size={56}
            color={colors.textPlaceholder}
            strokeWidth={1.2}
          />
        </View>
        <Text style={styles.emptyTitle}>No Notifications</Text>
        <Text style={styles.emptyDescription}>
          We'll let you know when there's something to update you about. Check
          back soon!
        </Text>
      </View>

      <View style={styles.emptyButtonContainer}>
        <TouchableOpacity
          style={styles.goHomeButton}
          onPress={onGoHome}
          activeOpacity={0.8}
        >
          <Text style={styles.goHomeButtonText}>Go Back Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] =
    useState<NotificationType>('all');
  const [notifications, setNotifications] =
    useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);

  const filteredNotifications = useMemo(() => {
    if (selectedFilter === 'all') return notifications;
    return notifications.filter((n) => n.type === selectedFilter);
  }, [notifications, selectedFilter]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const handleNotificationPress = useCallback(
    (notification: Notification) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notification.id ? { ...n, isRead: true } : n
        )
      );
    },
    []
  );

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, isRead: true }))
    );
  }, []);

  const handleGoHome = () => router.replace('/');

  const isEmpty =
    filteredNotifications.length === 0 && selectedFilter === 'all';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <ArrowLeft
            size={layout.iconSize.md}
            color={colors.textPrimary}
            strokeWidth={2}
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 ? (
          <TouchableOpacity
            style={styles.markReadButton}
            onPress={handleMarkAllRead}
            activeOpacity={0.7}
            accessibilityLabel="Mark all as read"
          >
            <CheckCircle2
              size={layout.iconSize.md}
              color={colors.primary}
              strokeWidth={1.8}
            />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
      </View>

      {isEmpty ? (
        <EmptyState onGoHome={handleGoHome} />
      ) : (
        <>
          {/* Filter Tabs */}
          <View style={styles.filterContainer}>
            <FlatList
              horizontal
              data={NOTIFICATION_FILTERS}
              renderItem={({ item: filter }) => {
                const isActive = selectedFilter === filter.id;
                return (
                  <TouchableOpacity
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
              }}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
            />
          </View>

          {/* Notification List */}
          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyFilterContainer}>
              <View style={styles.emptyFilterIcon}>
                <Info
                  size={layout.iconSize.xl}
                  color={colors.textPlaceholder}
                  strokeWidth={1.5}
                />
              </View>
              <Text style={styles.emptyFilterTitle}>Nothing here</Text>
              <Text style={styles.emptyFilterText}>
                No {selectedFilter} notifications at the moment.
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredNotifications}
              renderItem={({ item }) => (
                <NotificationCard
                  notification={item}
                  onPress={handleNotificationPress}
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
                  colors={[colors.primary]}
                />
              }
            />
          )}
        </>
      )}
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
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    letterSpacing: typography.letterSpacing.wide,
  },
  headerBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: borderRadius.full,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  headerBadgeText: {
    fontSize: typography.fontSize['2xs'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
  },
  markReadButton: {
    width: layout.avatarSize.md,
    height: layout.avatarSize.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSpacer: {
    width: layout.avatarSize.md,
  },

  // Filters
  filterContainer: {
    marginBottom: spacing.sm,
  },
  filterList: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundCard,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.textWhite,
    fontWeight: typography.fontWeight.semibold,
  },

  // List
  listContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.sm,
    paddingBottom: spacing['4xl'],
    gap: spacing.md,
  },

  // Notification Card
  notificationCard: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  notificationCardUnread: {
    borderLeftWidth: 0,
  },
  unreadAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    backgroundColor: colors.primary,
    borderTopLeftRadius: borderRadius.lg,
    borderBottomLeftRadius: borderRadius.lg,
  },
  cardContent: {
    padding: spacing.base,
    gap: spacing.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing['2xs'],
    borderRadius: borderRadius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  timestamp: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    fontWeight: typography.fontWeight.regular,
  },
  cardBody: {
    gap: spacing.xs,
  },
  notificationTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.md * typography.lineHeight.snug,
  },
  notificationDescription: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: colors.textTertiary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2xs'],
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  actionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary,
  },

  // Empty State (full)
  emptyContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal * 2,
    gap: spacing.xl,
  },
  emptyIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  emptyButtonContainer: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: Platform.OS === 'ios' ? spacing['3xl'] : spacing['2xl'],
  },
  goHomeButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    height: layout.buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.button,
  },
  goHomeButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textWhite,
    letterSpacing: typography.letterSpacing.wide,
  },

  // Empty Filter State
  emptyFilterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal * 2,
    gap: spacing.md,
  },
  emptyFilterIcon: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emptyFilterTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  emptyFilterText: {
    fontSize: typography.fontSize.base,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});