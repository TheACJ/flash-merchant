import { useEffect, useState } from 'react';
import walletWorkletService, { WalletGenerationStatus } from '@/services/WalletWorkletService';

/**
 * Custom hook to manage wallet generation state
 * Provides real-time updates on wallet generation progress
 */
export function useWalletGeneration() {
  const [status, setStatus] = useState<WalletGenerationStatus>(
    walletWorkletService.getStatus()
  );

  useEffect(() => {
    // Subscribe to wallet generation updates
    const unsubscribe = walletWorkletService.subscribe(setStatus);
    
    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  return {
    status: status.status,
    progress: status.progress,
    wallets: status.wallets,
    error: status.error,
    isGenerating: status.status === 'generating',
    isCompleted: status.status === 'completed',
    hasError: status.status === 'error',
  };
}
