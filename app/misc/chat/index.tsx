// misc/chat/index.tsx
import {
  borderRadius,
  colors,
  layout,
  spacing,
  typography
} from '@/constants/theme';
import { useRouter } from 'expo-router';
import { ArrowLeft, User } from 'lucide-react-native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  CHAT_FILTERS,
  ChatFilter,
  Conversation,
  MOCK_CONVERSATIONS,
} from './types';

interface ConversationItemProps {
  conversation: Conversation;
  onPress: (conversation: Conversation) => void;
}

function ConversationItem({ conversation, onPress }: ConversationItemProps) {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const hasUnread = conversation.unreadCount > 0;

  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => onPress(conversation)}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View style={styles.avatar}>
          <User size={24} color={colors.textWhite} strokeWidth={2} />
          {conversation.participant.isOnline && (
            <View style={styles.onlineDot} />
          )}
        </View>
        <View style={styles.itemContent}>
          <Text style={styles.itemName} numberOfLines={1}>
            {conversation.participant.name}
          </Text>
          <Text
            style={[styles.itemMessage, hasUnread && styles.itemMessageUnread]}
            numberOfLines={1}
          >
            {conversation.lastMessage?.content || 'No messages yet'}
          </Text>
        </View>
      </View>

      <View style={styles.itemRight}>
        <Text style={styles.itemTime}>
          {conversation.lastMessage
            ? formatTime(conversation.lastMessage.timestamp)
            : ''}
        </Text>
        {hasUnread && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function ChatListScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<ChatFilter>('all');
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [refreshing, setRefreshing] = useState(false);

  const filteredConversations = useMemo(() => {
    switch (selectedFilter) {
      case 'unread':
        return conversations.filter((c) => c.unreadCount > 0);
      case 'read':
        return conversations.filter((c) => c.unreadCount === 0);
      default:
        return conversations;
    }
  }, [conversations, selectedFilter]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const handleConversationPress = (conversation: Conversation) => {
    router.push(`/misc/chat/${conversation.id}`);
  };

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
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {CHAT_FILTERS.map((filter) => {
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
                  styles.filterText,
                  isActive && styles.filterTextActive,
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
        data={filteredConversations}
        renderItem={({ item }) => (
          <ConversationItem
            conversation={item}
            onPress={handleConversationPress}
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
            <Text style={styles.emptyText}>No conversations found</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  backButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
  },
  placeholder: {
    width: layout.minTouchTarget,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  filterTab: {
    paddingVertical: spacing.md,
    marginRight: spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterTabActive: {
    borderBottomColor: colors.primary,
  },
  filterText: {
    fontSize: typography.fontSize.md,
    color: colors.textTertiary,
    fontWeight: typography.fontWeight.medium,
  },
  filterTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.semibold,
  },
  listContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing['4xl'],
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.full,
    backgroundColor: colors.textTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.background,
  },
  itemContent: {
    flex: 1,
    gap: 4,
  },
  itemName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  itemMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  itemMessageUnread: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  itemTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing['5xl'],
  },
  emptyText: {
    fontSize: typography.fontSize.md,
    color: colors.textTertiary,
  },
});