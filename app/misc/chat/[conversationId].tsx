import {
  borderRadius,
  colors,
  layout,
  shadows,
  spacing,
  typography,
} from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCheck,
  Paperclip,
  Send,
  User,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Conversation,
  Message,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
  MOCK_USER,
} from './types';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  showAvatar: boolean;
  showTimestamp: boolean;
}

function MessageBubble({
  message,
  isCurrentUser,
  showAvatar,
  showTimestamp,
}: MessageBubbleProps) {
  const formatTime = (date: Date): string =>
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <View
      style={[
        styles.messageBubbleContainer,
        isCurrentUser
          ? styles.messageBubbleRight
          : styles.messageBubbleLeft,
      ]}
    >
      {!isCurrentUser && (
        <View style={styles.avatarColumn}>
          {showAvatar ? (
            <View style={styles.messageAvatar}>
              <User
                size={layout.iconSize.xs}
                color={colors.textWhite}
                strokeWidth={2}
              />
            </View>
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
        </View>
      )}

      <View
        style={[
          styles.bubbleColumn,
          isCurrentUser && styles.bubbleColumnRight,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isCurrentUser
              ? styles.messageBubbleSent
              : styles.messageBubbleReceived,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isCurrentUser && styles.messageTextSent,
            ]}
          >
            {message.content}
          </Text>
        </View>

        {showTimestamp && (
          <View
            style={[
              styles.timestampRow,
              isCurrentUser && styles.timestampRowRight,
            ]}
          >
            <Text style={styles.timestampText}>
              {formatTime(message.timestamp)}
            </Text>
            {isCurrentUser && (
              <CheckCheck
                size={14}
                color={
                  message.isRead ? colors.primary : colors.textPlaceholder
                }
                strokeWidth={2}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
}

interface DateSeparatorProps {
  date: Date;
}

function DateSeparator({ date }: DateSeparatorProps) {
  const formatDate = (d: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const isToday = d.toDateString() === today.toDateString();
    const isYesterday = d.toDateString() === yesterday.toDateString();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';
    return d.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.dateSeparator}>
      <View style={styles.dateLine} />
      <View style={styles.dateBadge}>
        <Text style={styles.dateSeparatorText}>{formatDate(date)}</Text>
      </View>
      <View style={styles.dateLine} />
    </View>
  );
}

export default function ConversationScreen() {
  const router = useRouter();
  const { conversationId } = useLocalSearchParams<{
    conversationId: string;
  }>();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    const conv = MOCK_CONVERSATIONS.find((c) => c.id === conversationId);
    setConversation(conv || null);
    const msgs = MOCK_MESSAGES[conversationId || ''] || [];
    setMessages(msgs);
  }, [conversationId]);

  const handleSendMessage = useCallback(() => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId: conversationId || '',
      senderId: MOCK_USER.id,
      content: message.trim(),
      timestamp: new Date(),
      isRead: false,
      type: 'text',
    };

    setMessages((prev) => [...prev, newMessage]);
    setMessage('');

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [message, conversationId]);

  const renderMessage = ({
    item,
    index,
  }: {
    item: Message;
    index: number;
  }) => {
    const isCurrentUser = item.senderId === MOCK_USER.id;
    const prevMessage = messages[index - 1];
    const nextMessage = messages[index + 1];
    const showAvatar =
      !prevMessage || prevMessage.senderId !== item.senderId;
    const showTimestamp =
      !nextMessage || nextMessage.senderId !== item.senderId;

    return (
      <MessageBubble
        message={item}
        isCurrentUser={isCurrentUser}
        showAvatar={showAvatar}
        showTimestamp={showTimestamp}
      />
    );
  };

  if (!conversation) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

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

        <TouchableOpacity
          style={styles.headerProfile}
          activeOpacity={0.7}
          accessibilityLabel={`${conversation.participant.name}'s profile`}
        >
          <View style={styles.headerAvatar}>
            <User
              size={layout.iconSize.sm}
              color={colors.textWhite}
              strokeWidth={2}
            />
            {conversation.participant.isOnline && (
              <View style={styles.headerOnlineDot} />
            )}
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.headerName} numberOfLines={1}>
              {conversation.participant.name}
            </Text>
            <Text
              style={[
                styles.headerStatus,
                conversation.participant.isOnline && styles.headerStatusOnline,
              ]}
            >
              {conversation.participant.isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerSpacer} />
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.messagesWrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }}
          ListHeaderComponent={
            messages.length > 0 ? (
              <DateSeparator date={messages[0].timestamp} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.emptyMessages}>
              <Text style={styles.emptyMessagesText}>
                No messages yet. Say hello!
              </Text>
            </View>
          }
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachButton}
            activeOpacity={0.7}
            accessibilityLabel="Attach file"
          >
            <Paperclip
              size={layout.iconSize.md}
              color={colors.textTertiary}
              strokeWidth={1.8}
            />
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              placeholderTextColor={colors.textPlaceholder}
              multiline
              maxLength={1000}
              returnKeyType="default"
            />
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              !message.trim() && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!message.trim()}
            activeOpacity={0.7}
            accessibilityLabel="Send message"
          >
            <Send
              size={layout.iconSize.sm}
              color={colors.textWhite}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.md,
    color: colors.textTertiary,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  backButton: {
    width: layout.avatarSize.md,
    height: layout.avatarSize.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundInput,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    justifyContent: 'center',
  },
  headerAvatar: {
    width: layout.avatarSize.sm,
    height: layout.avatarSize.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerOnlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.backgroundElevated,
  },
  headerInfo: {
    alignItems: 'flex-start',
    gap: spacing['2xs'],
  },
  headerName: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textPrimary,
  },
  headerStatus: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.regular,
    color: colors.textTertiary,
  },
  headerStatusOnline: {
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
  },
  headerSpacer: {
    width: layout.avatarSize.md,
  },

  // Messages
  messagesWrapper: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.xs,
  },

  // Date Separator
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  dateLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dateBadge: {
    backgroundColor: colors.backgroundInput,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  dateSeparatorText: {
    fontSize: typography.fontSize.xs,
    color: colors.textTertiary,
    fontWeight: typography.fontWeight.medium,
  },

  // Message Bubbles
  messageBubbleContainer: {
    flexDirection: 'row',
    marginBottom: spacing['2xs'],
  },
  messageBubbleLeft: {
    justifyContent: 'flex-start',
  },
  messageBubbleRight: {
    justifyContent: 'flex-end',
  },
  avatarColumn: {
    width: 32,
    marginRight: spacing.sm,
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.textTertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 28,
  },
  bubbleColumn: {
    maxWidth: '75%',
    alignItems: 'flex-start',
  },
  bubbleColumnRight: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  messageBubbleReceived: {
    backgroundColor: colors.backgroundCard,
    borderBottomLeftRadius: borderRadius.xs,
    ...shadows.xs,
  },
  messageBubbleSent: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: borderRadius.xs,
    ...shadows.xs,
  },
  messageText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
  },
  messageTextSent: {
    color: colors.textWhite,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2xs'],
    marginTop: spacing['2xs'],
    paddingHorizontal: spacing.xs,
  },
  timestampRowRight: {
    justifyContent: 'flex-end',
  },
  timestampText: {
    fontSize: typography.fontSize['2xs'],
    color: colors.textPlaceholder,
    fontWeight: typography.fontWeight.regular,
  },

  // Empty
  emptyMessages: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing['6xl'],
  },
  emptyMessagesText: {
    fontSize: typography.fontSize.base,
    color: colors.textTertiary,
  },

  // Input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: spacing.md,
    backgroundColor: colors.backgroundElevated,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: spacing.sm,
  },
  attachButton: {
    width: layout.avatarSize.md,
    height: layout.avatarSize.md,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: colors.backgroundInput,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.base,
    paddingVertical: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  input: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    maxHeight: 80,
    lineHeight: typography.fontSize.base * typography.lineHeight.normal,
  },
  sendButton: {
    width: layout.avatarSize.md,
    height: layout.avatarSize.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.button,
  },
  sendButtonDisabled: {
    backgroundColor: colors.borderLight,
    shadowOpacity: 0,
    elevation: 0,
  },
});