export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'image' | 'file';
}

export interface Conversation {
  id: string;
  participant: User;
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: Date;
}

export type ChatFilter = 'all' | 'unread' | 'read';

export interface ChatFilterOption {
  id: ChatFilter;
  label: string;
}

export const CHAT_FILTERS: ChatFilterOption[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'read', label: 'Read' },
];

// Current user
export const MOCK_USER: User = {
  id: 'current-user',
  name: 'You',
  isOnline: true,
};

// Mock conversations
export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    participant: {
      id: 'user-1',
      name: 'Alice Johnson',
      isOnline: true,
    },
    lastMessage: {
      id: 'msg-1',
      conversationId: '1',
      senderId: 'user-1',
      content: 'Hello, please are you available?',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isRead: false,
      type: 'text',
    },
    unreadCount: 2,
    updatedAt: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: '2',
    participant: {
      id: 'user-2',
      name: 'Bob Williams',
      isOnline: false,
      lastSeen: new Date(Date.now() - 30 * 60 * 1000),
    },
    lastMessage: {
      id: 'msg-2',
      conversationId: '2',
      senderId: 'user-2',
      content: 'Thanks for the quick response!',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      isRead: false,
      type: 'text',
    },
    unreadCount: 1,
    updatedAt: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: '3',
    participant: {
      id: 'user-3',
      name: 'Carol Davis',
      isOnline: true,
    },
    lastMessage: {
      id: 'msg-3',
      conversationId: '3',
      senderId: 'current-user',
      content: 'Sure, I can help with that.',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      isRead: true,
      type: 'text',
    },
    unreadCount: 0,
    updatedAt: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    id: '4',
    participant: {
      id: 'user-4',
      name: 'David Miller',
      isOnline: false,
      lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    lastMessage: {
      id: 'msg-4',
      conversationId: '4',
      senderId: 'user-4',
      content: 'When will the funds be available?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: false,
      type: 'text',
    },
    unreadCount: 3,
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
];

// Mock messages per conversation
export const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    {
      id: 'msg-1-1',
      conversationId: '1',
      senderId: 'user-1',
      content: 'Hi, are you available?',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg-1-2',
      conversationId: '1',
      senderId: 'current-user',
      content: 'Hi! Yes, how can I help you?',
      timestamp: new Date(Date.now() - 8 * 60 * 1000),
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg-1-3',
      conversationId: '1',
      senderId: 'user-1',
      content: 'I need help with a withdrawal. Can you guide me through the process?',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      isRead: false,
      type: 'text',
    },
  ],
  '2': [
    {
      id: 'msg-2-1',
      conversationId: '2',
      senderId: 'current-user',
      content: 'Your deposit has been processed.',
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg-2-2',
      conversationId: '2',
      senderId: 'user-2',
      content: 'Thanks for the quick response!',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      isRead: false,
      type: 'text',
    },
  ],
  '3': [
    {
      id: 'msg-3-1',
      conversationId: '3',
      senderId: 'user-3',
      content: 'Can you help me stake some tokens?',
      timestamp: new Date(Date.now() - 90 * 60 * 1000),
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg-3-2',
      conversationId: '3',
      senderId: 'current-user',
      content: 'Sure, I can help with that.',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      isRead: true,
      type: 'text',
    },
  ],
  '4': [
    {
      id: 'msg-4-1',
      conversationId: '4',
      senderId: 'user-4',
      content: 'I made a deposit earlier today.',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg-4-2',
      conversationId: '4',
      senderId: 'current-user',
      content: 'Let me check that for you.',
      timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg-4-3',
      conversationId: '4',
      senderId: 'user-4',
      content: 'When will the funds be available?',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      isRead: false,
      type: 'text',
    },
  ],
};