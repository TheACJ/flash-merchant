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
  { id: 'update', label: 'Updates' },
];

// Mock notifications
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'withdrawal',
    status: 'new',
    title: 'Remote withdrawal request',
    description: '@Alicejhon222 is requesting $500 withdrawal from your merchant account.',
    actionLabel: 'Tap to review',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    isRead: false,
  },
  {
    id: '2',
    type: 'stake',
    status: 'new',
    title: 'Staking confirmed',
    description: 'Your 500 FLA$H tokens are now staked. Lock period: 30 days.',
    actionLabel: 'View details',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    isRead: false,
  },
  {
    id: '3',
    type: 'update',
    status: 'new',
    title: 'New feature available',
    description: 'Remote deposits are now available! Accept crypto payments from anywhere.',
    actionLabel: 'Learn more',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    isRead: false,
  },
  {
    id: '4',
    type: 'deposit',
    status: 'completed',
    title: 'Deposit completed',
    description: '@Alicejhon222 successfully deposited $500 via physical POS.',
    actionLabel: 'View receipt',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: '5',
    type: 'withdrawal',
    status: 'completed',
    title: 'Withdrawal processed',
    description: '$250 withdrawal to @BobWilliams has been completed successfully.',
    actionLabel: 'View details',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    isRead: true,
  },
  {
    id: '6',
    type: 'stake',
    status: 'pending',
    title: 'Staking reward pending',
    description: 'Your staking reward of $12.50 is ready to claim.',
    actionLabel: 'Claim reward',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    isRead: true,
  },
];