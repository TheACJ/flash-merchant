export interface StakeData {
  amount: string;
  walletAddress: string;
  qrCodeData: string;
  estimatedReturns: string;
  stakingPeriod: string;
  apr: string;
}

export type StakeStep =
  | 'enterAmount'
  | 'payment'
  | 'processing'
  | 'success'
  | 'error';

export interface StakingInfo {
  minAmount: number;
  maxAmount: number;
  apr: number;
  lockPeriodDays: number;
}

export const STAKING_CONFIG: StakingInfo = {
  minAmount: 10,
  maxAmount: 100000,
  apr: 12.5,
  lockPeriodDays: 30,
};

// Mock wallet address for staking
export const STAKING_WALLET_ADDRESS = '1FzWZ3X9kP4u7hTqL8dY5sVb9Qm2RxA7Gp';