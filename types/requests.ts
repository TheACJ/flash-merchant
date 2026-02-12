export type RequestType = 'withdrawal' | 'deposit';
export type RequestFilter = 'all' | 'withdrawal' | 'deposit';
export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface Request {
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

export interface RequestFilterOption {
  id: RequestFilter;
  label: string;
}

export const REQUEST_FILTERS: RequestFilterOption[] = [
  { id: 'all', label: 'All' },
  { id: 'withdrawal', label: 'Withdrawal' },
  { id: 'deposit', label: 'Deposit' },
];

export const MOCK_REQUESTS: Request[] = [
  {
    id: '1',
    type: 'withdrawal',
    status: 'pending',
    userName: 'Alicce999',
    amount: 50,
    paymentMethod: 'Bank transfer',
    cryptoAmount: '0.00034',
    cryptoType: 'Btc',
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
    cryptoType: 'Eth',
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
    cryptoType: 'Btc',
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