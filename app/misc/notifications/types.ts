export type NotificationType = 
  | 'withdrawal'
  | 'deposit'
  | 'stake'
  | 'update'
  | 'all';

export type NotificationStatus = 'new' | 'completed' | 'pending';

export interface Notification {
  id: string;
  type: NotificationType;
  status: NotificationStatus;
  title: string;
  description: string;
  actionLabel: string;
  timestamp: Date;
  isRead: boolean;
  data?: Record<string, any>;
}

export interface NotificationFilter {
  id: NotificationType;
  label: string;
}

export const NOTIFICATION_FILTERS: NotificationFilter[] = [
  { id: 'all', label: 'All' },
  { id: 'withdrawal', label: 'Withdrawal' },
  { id: 'deposit', label: 'Deposit' },
  { id: 'stake', label: 'Stake' },
  { id: 'update', label: 'Update' },
];

// Mock notifications data
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'withdrawal',
    status: 'new',
    title: 'Remote withdrawal request',
    description: '@Alicejhon222 requesting $500',
    actionLabel: 'Tap to review',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    isRead: false,
  },
  {
    id: '2',
    type: 'stake',
    status: 'new',
    title: 'Stake',
    description: 'Your 500 flash token are now staked',
    actionLabel: 'Tap to view',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    isRead: false,
  },
  {
    id: '3',
    type: 'update',
    status: 'new',
    title: 'New feature is available',
    description: 'We have added a new feature to flash',
    actionLabel: 'Tap to view',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isRead: false,
  },
  {
    id: '4',
    type: 'deposit',
    status: 'completed',
    title: 'Remote deposit',
    description: '@Alicejhon222 deposited $500',
    actionLabel: 'Tap to review',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    isRead: true,
  },
];