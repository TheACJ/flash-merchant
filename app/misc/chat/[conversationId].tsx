import { useLocalSearchParams, useRouter } from 'expo-router';
import {
    ArrowLeft,
    ArrowUp,
    Paperclip,
    User,
} from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
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
}

function MessageBubble({ message, isCurrentUser, showAvatar }: MessageBubbleProps) {
  return (
    <View
      style={[
        styles.messageBubbleContainer,
        isCurrentUser ? styles.messageBubbleRight : styles.messageBubbleLeft,
      ]}
    >
      {!isCurrentUser && showAvatar && (
        <View style={styles.messageAvatar}>
          <User size={16} color="#E7E7E7" strokeWidth={2} />
        </View>
      )}
      {!isCurrentUser && !showAvatar && <View style={styles.avatarPlaceholder} />}

      <View
        style={[
          styles.messageBubble,
          isCurrentUser ? styles.messageBubbleSent : styles.messageBubbleReceived,
        ]}
      >
        <Text style={styles.messageText}>{message.content}</Text>
      </View>

      {isCurrentUser && showAvatar && (
        <View style={styles.messageAvatar}>
          <User size={16} color="#E7E7E7" strokeWidth={2} />
        </View>
      )}
      {isCurrentUser && !showAvatar && <View style={styles.avatarPlaceholder} />}
    </View>
  );
}

export default function ConversationScreen() {
  const router = useRouter();
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Find conversation
    const conv = MOCK_CONVERSATIONS.find((c) => c.id === conversationId);
    setConversation(conv || null);

    // Load messages
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
    Keyboard.dismiss();

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [message, conversationId]);

  const handleGoBack = () => {
    router.back();
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isCurrentUser = item.senderId === MOCK_USER.id;
    const prevMessage = messages[index - 1];
    const showAvatar = !prevMessage || prevMessage.senderId !== item.senderId;

    return (
      <MessageBubble
        message={item}
        isCurrentUser={isCurrentUser}
        showAvatar={showAvatar}
      />
    );
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    if (isToday) return 'Today';
    return date.toLocaleDateString();
  };

  if (!conversation) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={handleGoBack}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color="#000000" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.headerCenter}>
          <Text style={styles.headerName}>{conversation.participant.name}</Text>
          <Text
            style={[
              styles.headerStatus,
              { color: conversation.participant.isOnline ? '#128807' : '#657084' },
            ]}
          >
            {conversation.participant.isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>

        <View style={styles.headerSpacer} />
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.messagesContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Date Separator */}
        {messages.length > 0 && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>
              {formatDate(messages[0].timestamp)}
            </Text>
          </View>
        )}

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
        />

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              placeholderTextColor="#657084"
              multiline
              maxLength={1000}
            />
          </View>

          <TouchableOpacity
            style={styles.attachButton}
            activeOpacity={0.7}
            accessibilityLabel="Attach file"
          >
            <Paperclip size={28} color="#657084" strokeWidth={1.5} />
          </TouchableOpacity>

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
            <ArrowUp size={24} color="#F4F6F5" strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F4F6F5',
  },
  headerLeft: {
    width: 50,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
    gap: 2,
  },
  headerName: {
    fontSize: 25,
    fontWeight: '500',
    color: '#000000',
  },
  headerStatus: {
    fontSize: 14,
    fontWeight: '400',
  },
  headerSpacer: {
    width: 50,
  },
  messagesContainer: {
    flex: 1,
  },
  dateSeparator: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  dateSeparatorText: {
    fontSize: 14,
    color: '#657084',
  },
  messagesList: {
    paddingHorizontal: 52,
    paddingBottom: 16,
    gap: 12,
  },
  messageBubbleContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  messageBubbleLeft: {
    justifyContent: 'flex-start',
  },
  messageBubbleRight: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#657084',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 40,
  },
  messageBubble: {
    maxWidth: '70%',
    padding: 15,
    borderRadius: 20,
  },
  messageBubbleReceived: {
    backgroundColor: '#F4F6F5',
    borderBottomLeftRadius: 2,
  },
  messageBubbleSent: {
    backgroundColor: '#F4F6F5',
    borderBottomRightRadius: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#000000',
    lineHeight: 22,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 52,
    paddingVertical: 16,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#D2D6E1',
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#F4F6F5',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 120,
  },
  input: {
    fontSize: 16,
    color: '#000000',
    maxHeight: 80,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0F6EC0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#D2D6E1',
  },
});