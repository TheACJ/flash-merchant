export type RequestType = 'withdrawal' | 'deposit';
export type RequestStatus = 'pending' | 'completed' | 'cancelled' | 'awaiting_fiat';

export interface Request {
  id: string;
  type: RequestType;
  status: RequestStatus;
  userName: string;
  tag: string;
  fiatAmount: number;
  cryptoAmount: string;
  cryptoType: string;
  exchangeRate: string;
  reference: string;
  timestamp: Date;
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  gasFee?: number;
  ratings?: number;
  completedTrades?: number;
}

export const MOCK_REQUEST: Request = {
  id: '1',
  type: 'withdrawal', // In context of merchant app, user wants to withdraw crypto (sell)
  status: 'pending',
  userName: 'Bob Trader',
  tag: '@bob_trader',
  fiatAmount: 250,
  cryptoAmount: '125',
  cryptoType: 'USDT',
  exchangeRate: '1 USDT = $2.00',
  reference: 'FsLD-3847-BOB',
  timestamp: new Date(),
  bankDetails: {
    bankName: 'First Bank',
    accountNumber: '0875643278653',
    accountName: 'Bob Trader',
  },
  gasFee: 5,
  ratings: 4.0,
  completedTrades: 89,
};