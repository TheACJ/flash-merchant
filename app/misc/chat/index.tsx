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
  MessageSquare,
  Search,
  User,
} from 'lucide-react-native';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const hasUnread = conversation.unreadCount > 0;

  return (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => onPress(conversation)}
      activeOpacity={0.6}
      accessibilityLabel={`Chat with ${conversation.participant.name}. ${hasUnread ? `${conversation.unreadCount} unread messages.` : ''}`}
    >
      <View style={styles.avatarWrapper}>
        <View style={styles.avatar}>
          <User
            size={layout.iconSize.md}
            color={colors.textWhite}
            strokeWidth={1.8}
          />
        </View>
        {conversation.participant.isOnline && (
          <View style={styles.onlineDot} />
        )}
      </View>

      <View style={styles.itemContent}>
        <View style={styles.itemTopRow}>
          <Text style={styles.itemName} numberOfLines={1}>
            {conversation.participant.name}
          </Text>
          <Text
            style={[styles.itemTime, hasUnread && styles.itemTimeUnread]}
          >
            {conversation.lastMessage
              ? formatTime(conversation.lastMessage.timestamp)
              : ''}
          </Text>
        </View>

        <View style={styles.itemBottomRow}>
          <Text
            style={[
              styles.itemMessage,
              hasUnread && styles.itemMessageUnread,
            ]}
            numberOfLines={1}
          >
            {conversation.lastMessage?.senderId === 'current-user'
              ? `You: ${conversation.lastMessage.content}`
              : conversation.lastMessage?.content || 'No messages yet'}
          </Text>
          {hasUnread && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {conversation.unreadCount > 9
                  ? '9+'
                  : conversation.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ChatListScreen() {
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState<ChatFilter>('all');
  const [conversations] = useState(MOCK_CONVERSATIONS);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef<TextInput>(null);

  const filteredConversations = useMemo(() => {
    let result = conversations;

    // Apply filter
    switch (selectedFilter) {
      case 'unread':
        result = result.filter((c) => c.unreadCount > 0);
        break;
      case 'read':
        result = result.filter((c) => c.unreadCount === 0);
        break;
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.participant.name.toLowerCase().includes(query) ||
          c.lastMessage?.content.toLowerCase().includes(query)
      );
    }

    return result;
  }, [conversations, selectedFilter, searchQuery]);

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + c.unreadCount, 0),
    [conversations]
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setRefreshing(false);
  }, []);

  const handleConversationPress = (conversation: Conversation) => {
    router.push(`/misc/chat/${conversation.id}`);
  };

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
    }
  };

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
          <Text style={styles.headerTitle}>Messages</Text>
          {totalUnread > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{totalUnread}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.searchToggle}
          onPress={toggleSearch}
          activeOpacity={0.7}
          accessibilityLabel="Search conversations"
        >
          <Search
            size={layout.iconSize.md}
            color={colors.textPrimary}
            strokeWidth={1.8}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Search
              size={layout.iconSize.sm}
              color={colors.textPlaceholder}
              strokeWidth={1.8}
            />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search conversations..."
              placeholderTextColor={colors.textPlaceholder}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
          </View>
        </View>
      )}

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {CHAT_FILTERS.map((filter) => {
          const isActive = selectedFilter === filter.id;
          const count =
            filter.id === 'all'
              ? conversations.length
              : filter.id === 'unread'
                ? conversations.filter((c) => c.unreadCount > 0).length
                : conversations.filter((c) => c.unreadCount === 0).length;

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
              <View
                style={[
                  styles.filterCount,
                  isActive && styles.filterCountActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterCountText,
                    isActive && styles.filterCountTextActive,
                  ]}
                >
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Conversation List */}
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
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconWrapper}>
              <MessageSquare
                size={48}
                color={colors.textPlaceholder}
                strokeWidth={1.2}
              />
            </View>
            <Text style={styles.emptyTitle}>No conversations</Text>
            <Text style={styles.emptyDescription}>
              {selectedFilter === 'unread'
                ? "You're all caught up! No unread messages."
                : selectedFilter === 'read'
                  ? 'No read conversations yet.'
                  : searchQuery
                    ? `No results for "${searchQuery}"`
                    : 'Start a conversation with a customer.'}
            </Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  searchToggle: {
    width: layout.avatarSize.md,
    height: layout.avatarSize.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundCard,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.xs,
  },

  // Search
  searchContainer: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.md,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.base,
    height: layout.inputHeightSmall,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    fontWeight: typography.fontWeight.regular,
    height: '100%',
  },

  // Filters
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.base,
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
  filterText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontWeight: typography.fontWeight.medium,
  },
  filterTextActive: {
    color: colors.textWhite,
    fontWeight: typography.fontWeight.semibold,
  },
  filterCount: {
    minWidth: 20,
    height: 20,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['2xs'],
  },
  filterCountActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  filterCountText: {
    fontSize: typography.fontSize['2xs'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textTertiary,
  },
  filterCountTextActive: {
    color: colors.textWhite,
  },

  // List
  listContent: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.sm,
    paddingBottom: spacing['4xl'],
  },
  separator: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: layout.avatarSize.lg + spacing.md,
  },

  // Item
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base,
    gap: spacing.md,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: layout.avatarSize.lg,
    height: layout.avatarSize.lg,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 14,
    height: 14,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
    borderWidth: 2.5,
    borderColor: colors.background,
  },
  itemContent: {
    flex: 1,
    gap: spacing.xs,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    flex: 1,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  itemTime: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    fontWeight: typography.fontWeight.regular,
  },
  itemTimeUnread: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemMessage: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textTertiary,
    fontWeight: typography.fontWeight.regular,
    marginRight: spacing.sm,
  },
  itemMessageUnread: {
    fontWeight: typography.fontWeight.medium,
    color: colors.textSecondary,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  badgeText: {
    fontSize: typography.fontSize['2xs'],
    fontWeight: typography.fontWeight.bold,
    color: colors.textWhite,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingTop: spacing['6xl'],
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
});