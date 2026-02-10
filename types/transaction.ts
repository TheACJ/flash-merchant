import { WalletType } from './wallet';

export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface Transaction {
    id: string;
    walletId: string;
    type: 'send' | 'receive';
    status: TransactionStatus;
    amount: string;
    token: string;
    from: string;
    to: string;
    timestamp: number;
    hash: string;
    network: WalletType;
    fee: string;
    blockNumber?: number;
}
