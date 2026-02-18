import { globalCacheOrchestrator } from '@/services/GlobalCacheOrchestrator';
import { loadPreferredCurrency } from '@/store/slices/currencySlice';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useBalanceOrchestrator } from './useBalanceOrchestrator';

/**
 * useAppInitialization - Hook for initializing all app services
 */
export function useAppInitialization() {
  const dispatch = useDispatch();
  const isInitialized = useRef(false);

  useBalanceOrchestrator();

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const initializeApp = async () => {
      console.log('[useAppInitialization] Starting app initialization...');

      try {
        await globalCacheOrchestrator.initialize();
        dispatch(loadPreferredCurrency());
        console.log('[useAppInitialization] App initialization complete');
      } catch (error) {
        console.error('[useAppInitialization] Initialization failed:', error);
      }
    };

    initializeApp();

    return () => {
      globalCacheOrchestrator.stop();
    };
  }, [dispatch]);

  return {
    isReady: globalCacheOrchestrator.isReady(),
  };
}

export default useAppInitialization;