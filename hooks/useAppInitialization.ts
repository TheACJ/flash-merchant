import { dashboardCache } from '@/services/DashboardCache';
import { globalCacheOrchestrator } from '@/services/GlobalCacheOrchestrator';
import { merchantProfileOrchestrator } from '@/services/MerchantProfileOrchestrator';
import { AppDispatch } from '@/store';
import { loadPreferredCurrency } from '@/store/slices/currencySlice';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useBalanceOrchestrator } from './useBalanceOrchestrator';

/**
 * useAppInitialization - Hook for initializing all app services
 */
export function useAppInitialization() {
  const dispatch = useDispatch<AppDispatch>();
  const isInitialized = useRef(false);

  useBalanceOrchestrator();

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const initializeApp = async () => {
      console.log('[useAppInitialization] Starting app initialization...');

      try {
        // Initialize global caches (prices, assets, etc.)
        await globalCacheOrchestrator.initialize();

        // Load preferred currency from storage
        dispatch(loadPreferredCurrency());

        // Warm merchant profile cache from storage/API
        await merchantProfileOrchestrator.warmCache();

        // Start dashboard cache auto-refresh (every 5 minutes)
        dashboardCache.startAutoRefresh();

        console.log('[useAppInitialization] App initialization complete');
      } catch (error) {
        console.error('[useAppInitialization] Initialization failed:', error);
      }
    };

    initializeApp();

    return () => {
      globalCacheOrchestrator.stop();
      dashboardCache.stopAutoRefresh();
    };
  }, [dispatch]);

  return {
    isReady: globalCacheOrchestrator.isReady(),
  };
}

export default useAppInitialization;