import { useRouter } from 'expo-router';
import {
    ArrowLeft,
    BellOff,
    CheckCircle,
    ChevronRight,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
    FlatList,
    Platform,
    RefreshControl,
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

interface NotificationCardProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
}

function NotificationCard({ notification, onPress }: NotificationCardProps) {
  const getStatusColor = (status: NotificationStatus): string => {
    switch (status) {
      case 'new':
        return '#C31D1E';
      case 'completed':
        return '#128807';
      default:
        return '#657084';
    }
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hr ago`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
  };

  const statusColor = getStatusColor(notification.status);
  const isNew = notification.status === 'new';
  const isCompleted = notification.status === 'completed';

  return (
    <TouchableOpacity
      style={styles.notificationCard}
      onPress={() => onPress(notification)}
      activeOpacity={0.7}
      accessibilityLabel={`${notification.title}. ${notification.description}`}
    >
      {/* Status Row */}
      <View style={styles.statusRow}>
        <View style={styles.statusIndicator}>
          {isCompleted ? (
            <>
              <CheckCircle size={15} color={statusColor} strokeWidth={2} />
              <Text style={[styles.statusText, { color: '#000000' }]}>
                completed
              </Text>
            </>
          ) : (
            <>
              <View
                style={[styles.statusDot, { backgroundColor: statusColor }]}
              />
              <Text style={[styles.statusText, { color: '#000000' }]}>
                {isNew ? 'New' : 'Pending'}
              </Text>
            </>
          )}
        </View>
        <Text style={styles.timestamp}>
          {formatTimestamp(notification.timestamp)}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{notification.title}</Text>
        <Text style={styles.notificationDescription}>
          {notification.description}
        </Text>
      </View>

      {/* Action */}
      <View style={styles.actionRow}>
        <Text style={[styles.actionText, { color: statusColor }]}>
          {notification.actionLabel}
        </Text>
        <ChevronRight size={15} color={statusColor} strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
}

interface EmptyStateProps {
  onGoHome: () => void;
}

function EmptyState({ onGoHome }: EmptyStateProps) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyContent}>
        <BellOff size={100} color="#657084" strokeWidth={1.5} />
        <View style={styles.emptyTextContainer}>
          <Text style={styles.emptyTitle}>No Notifications</Text>
          <Text style={styles.emptyDescription}>
            We will let you know when there will be something to update you
          </Text>
        </View>
      </View>

      <View style={styles.emptyButtonContainer}>
        <TouchableOpacity
          style={styles.goHomeButton}
          onPress={onGoHome}
          activeOpacity={0.8}
        >
          <Text style={styles.goHomeButtonText}>Go back home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<NotificationType>('all');
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);

  const filteredNotifications = useMemo(() => {
    if (selectedFilter === 'all') {
      return notifications;
    }
    return notifications.filter((n) => n.type === selectedFilter);
  }, [notifications, selectedFilter]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const handleNotificationPress = useCallback((notification: Notification) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notification.id ? { ...n, isRead: true } : n
      )
    );

    // Navigate based on notification type
    switch (notification.type) {
      case 'withdrawal':
        // Navigate to withdrawal details
        break;
      case 'deposit':
        // Navigate to deposit details
        break;
      case 'stake':
        // Navigate to stake details
        break;
      default:
        break;
    }
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.replace('/');
  };

  const renderFilterTab = (filter: { id: NotificationType; label: string }) => {
    const isActive = selectedFilter === filter.id;
    return (
      <TouchableOpacity
        key={filter.id}
        style={[styles.filterTab, isActive && styles.filterTabActive]}
        onPress={() => setSelectedFilter(filter.id)}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.filterTabText, isActive && styles.filterTabTextActive]}
        >
          {filter.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const isEmpty = filteredNotifications.length === 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
          activeOpacity={0.7}
          accessibilityLabel="Go back"
        >
          <ArrowLeft size={24} color="#000000" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isEmpty && selectedFilter === 'all' ? (
        <EmptyState onGoHome={handleGoHome} />
      ) : (
        <>
          {/* Filter Tabs */}
          <View style={styles.filterContainer}>
            <FlatList
              horizontal
              data={NOTIFICATION_FILTERS}
              renderItem={({ item }) => renderFilterTab(item)}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
            />
          </View>

          {/* Notifications List */}
          {isEmpty ? (
            <View style={styles.emptyFilterContainer}>
              <Text style={styles.emptyFilterText}>
                No {selectedFilter} notifications
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
                  tintColor="#0F6EC0"
                />
              }
            />
          )}

          {/* Go Home Button */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.goHomeButton}
              onPress={handleGoHome}
              activeOpacity={0.8}
            >
              <Text style={styles.goHomeButtonText}>Go back home</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
  filterContainer: {
    paddingVertical: 10,
  },
  filterList: {
    paddingHorizontal: 52,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 10,
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: '#0F6EC0',
  },
  filterTabText: {
    fontSize: 18,
    fontWeight: '400',
    color: '#323333',
    textAlign: 'center',
  },
  filterTabTextActive: {
    color: '#F4F6F5',
  },
  listContent: {
    paddingHorizontal: 52,
    paddingTop: 10,
    paddingBottom: 100,
    gap: 25,
  },
  notificationCard: {
    backgroundColor: '#F4F6F5',
    borderRadius: 10,
    padding: 20,
    gap: 20,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '400',
  },
  timestamp: {
    fontSize: 14,
    color: '#323333',
  },
  notificationContent: {
    gap: 15,
  },
  notificationTitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000000',
  },
  notificationDescription: {
    fontSize: 16,
    fontWeight: '400',
    color: '#323333',
    lineHeight: 22,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 16,
    fontWeight: '400',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  emptyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 30,
  },
  emptyTextContainer: {
    alignItems: 'center',
    gap: 15,
  },
  emptyTitle: {
    fontSize: 25,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 18,
    fontWeight: '400',
    color: '#323333',
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyButtonContainer: {
    paddingHorizontal: 52,
    paddingBottom: Platform.OS === 'ios' ? 50 : 40,
  },
  emptyFilterContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyFilterText: {
    fontSize: 16,
    color: '#657084',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 52,
    paddingBottom: Platform.OS === 'ios' ? 40 : 30,
    paddingTop: 15,
    backgroundColor: '#F5F5F5',
  },
  goHomeButton: {
    backgroundColor: '#0F6EC0',
    borderRadius: 15,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goHomeButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#F5F5F5',
  },
});