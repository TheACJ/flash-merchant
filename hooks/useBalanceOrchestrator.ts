import { balanceCache } from '@/services/BalanceCache';
import { RootState } from '@/store';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

const POLL_INTERVAL_MS = 30000;

export function useBalanceOrchestrator() {
  const wallets = useSelector((state: RootState) => state.merchantWallet.wallets);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (wallets.length === 0) return;

    const fetchBalances = async () => {
      await balanceCache.fetchBalances(
        wallets.map(w => ({ id: w.id, address: w.address, type: w.type }))
      );
    };

    if (isInitialMount.current) {
      console.log('[BalanceOrchestrator] Initial Fetch');
      fetchBalances();
      isInitialMount.current = false;
    } else {
      console.log('[BalanceOrchestrator] Wallets changed, refetching.');
      fetchBalances();
    }
  }, [wallets.length]);

  useEffect(() => {
    if (wallets.length === 0) return;

    const interval = setInterval(() => {
      console.log('[BalanceOrchestrator] Polling balances...');
      balanceCache.fetchBalances(
        wallets.map(w => ({ id: w.id, address: w.address, type: w.type }))
      );
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [wallets.length]);
}

export function useBalanceOrchestratorStatus() {
  const wallets = useSelector((state: RootState) => state.merchantWallet.wallets);
  const balances = balanceCache.getAllBalances();

  return {
    isActive: wallets.length > 0,
    walletCount: wallets.length,
    cachedWalletCount: balances.length,
    lastUpdated: balances.length > 0
      ? Math.max(...balances.map(b => b.lastUpdated))
      : null,
  };
}