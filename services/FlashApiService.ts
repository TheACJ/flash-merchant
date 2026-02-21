import axios, { AxiosError, AxiosInstance } from 'axios';

// API Configuration
const FLASH_API_BASE_URL = process.env.EXPO_PUBLIC_FLASH_API_URL || 'https://flashback.koyeb.app/api/v1';
const FLASH_USERS_BASE_URL = `${FLASH_API_BASE_URL}/users`;

export interface FlashApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface Asset {
  id: string;
  name: string;
  symbol: string;
  icon_url: string;
  chains: string[];
}

export interface AssetsResponse {
  count: number;
  assets: Asset[];
}

export interface PriceResponse {
  asset_id: string;
  vs_currency: string;
  price: string;
  price_24h_change: string;
  market_cap: string;
  volume_24h: string;
  fetched_at: string;
}

export interface TimeseriesPoint {
  timestamp: string;
  price: number;
}

export type TimeseriesResponse = TimeseriesPoint[];

export interface Currency {
  currency_code: string;
  currency_name: string;
  symbol: string;
  country_flag: string;
  country_name: string;
}

export interface PaginatedCurrenciesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Currency[];
}

export type CurrenciesResponse = Currency[];

export interface ExchangeRate {
  base_currency: string;
  target_currency: string;
  rate: string;
  inverse_rate: number;
  symbol: string;
  country_code: string;
  country_flag: string;
  country_name: string;
  fetched_at: string;
  updated_at: string;
}

export interface ExchangeRatesResponse {
  [currency: string]: number;
}

export interface WalletBalanceBreakdownItem {
  asset: string;
  asset_id: string;
  amount: number;
  fiat_value: number;
  price: number;
  type: string;
  source: string;
}

export interface WalletBalanceResponse {
  wallet_id: string;
  total_fiat: number;
  breakdown: WalletBalanceBreakdownItem[];
  snapshot_at: string;
}

export interface UserTagInfo {
  tag: string;
  normalized_tag: string;
  wallets: {
    ethereum?: { addresses: string[] };
    solana?: { addresses: string[] };
    bitcoin?: { addresses: string[] };
    bnb?: { addresses: string[] };
  };
}

export interface UserTagsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserTagInfo[];
}

/**
 * FlashApiService - Service for interacting with the Flash API
 * Handles asset, price, currency, and exchange rate fetching
 */
class FlashApiService {
  private api: AxiosInstance;
  private authToken: string | null = null;
  private ongoingRequests: Map<string, Promise<any>> = new Map();

  constructor() {
    this.api = axios.create({
      baseURL: FLASH_API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      async (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        console.log(`[FlashApiService] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        console.log(`[FlashApiService] Response ${response.status} from ${response.config.url}`);
        return response;
      },
      async (error: AxiosError) => {
        console.error(`[FlashApiService] Error ${error.response?.status} from ${error.config?.url}`);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Set authentication token for API requests
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Get current authentication token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    this.authToken = null;
  }

  /**
   * Generate a unique key for request deduplication
   */
  private generateRequestKey(method: string, url: string, body?: any): string {
    const bodyStr = body ? JSON.stringify(body) : '';
    return `${method}:${url}:${bodyStr}`;
  }

  /**
   * Execute request with deduplication to prevent duplicate simultaneous calls
   */
  private async deduplicateRequest<T>(
    method: string,
    url: string,
    options: any = {}
  ): Promise<T> {
    const requestKey = this.generateRequestKey(method, url, options.data);

    // Check if this request is already in progress
    const existingRequest = this.ongoingRequests.get(requestKey);
    if (existingRequest) {
      return existingRequest;
    }

    // Create new request and store the promise
    const requestPromise = this.makeRequest<T>(method, url, options).finally(() => {
      this.ongoingRequests.delete(requestKey);
    });

    this.ongoingRequests.set(requestKey, requestPromise);
    return requestPromise;
  }

  /**
   * Make the actual HTTP request
   */
  private async makeRequest<T>(method: string, url: string, options: any = {}): Promise<T> {
    const response = await this.api.request<T>({
      method,
      url,
      ...options,
    });

    return response.data;
  }

  // ==================== Asset Endpoints ====================

  /**
   * Get list of all enabled crypto assets
   */
  async getAssets(page: number = 1): Promise<FlashApiResponse<AssetsResponse>> {
    try {
      const url = `${FLASH_API_BASE_URL}/assets/?page=${page}`;
      const data = await this.deduplicateRequest<AssetsResponse>('GET', url);
      return { success: true, data };
    } catch (error) {
      console.error('[FlashApiService] Error fetching assets:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch assets'
      };
    }
  }

  /**
   * Get single asset details
   */
  async getAsset(id: string): Promise<FlashApiResponse<Asset>> {
    try {
      const url = `${FLASH_API_BASE_URL}/assets/${id}/`;
      const responseData = await this.deduplicateRequest<any>('GET', url);

      if (!responseData || !responseData.id) {
        return {
          success: false,
          error: `Asset not found or invalid response: ${id}`
        };
      }

      const transformedData: Asset = {
        id: responseData.id,
        name: responseData.name,
        symbol: responseData.symbol,
        icon_url: responseData.icon_url,
        chains: responseData.chains || []
      };

      return { success: true, data: transformedData };
    } catch (error) {
      console.error('[FlashApiService] Error fetching asset:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch asset'
      };
    }
  }

  /**
   * Get complete asset information including metadata and price
   */
  async getAssetInfo(id: string, vsCurrency: string = 'usd'): Promise<FlashApiResponse<any>> {
    try {
      const [assetResponse, priceResponse] = await Promise.all([
        this.deduplicateRequest<any>('GET', `${FLASH_API_BASE_URL}/assets/${id}/`),
        this.getPrices(id, vsCurrency)
      ]);

      if (!assetResponse || !assetResponse.id) {
        return {
          success: false,
          error: `Asset not found: ${id}`
        };
      }

      const combinedData = {
        ...assetResponse,
        price: priceResponse.success ? priceResponse.data : null
      };

      return { success: true, data: combinedData };
    } catch (error) {
      console.error('[FlashApiService] Error fetching asset info:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch asset info'
      };
    }
  }

  // ==================== Price Endpoints ====================

  /**
   * Get current price of an asset vs fiat currency
   */
  async getPrices(assetId: string, vsCurrency: string): Promise<FlashApiResponse<PriceResponse>> {
    try {
      const url = `${FLASH_API_BASE_URL}/prices/?asset_id=${assetId}&vs_currency=${vsCurrency}`;
      const responseData = await this.deduplicateRequest<any>('GET', url);

      if (!responseData.results || !Array.isArray(responseData.results) || responseData.results.length === 0) {
        console.warn(`[FlashApiService] No price data available for ${assetId} in ${vsCurrency}`);
        return {
          success: false,
          error: `No price data available for ${assetId} in ${vsCurrency}`
        };
      }

      const priceData = responseData.results[0];

      if (priceData.price === null || priceData.price === undefined || priceData.price === '') {
        return {
          success: false,
          error: `No price data available for ${assetId} in ${vsCurrency}`
        };
      }

      const transformedData: PriceResponse = {
        asset_id: priceData.asset_id,
        vs_currency: priceData.vs_currency,
        price: priceData.price,
        price_24h_change: priceData.price_24h_change,
        market_cap: priceData.market_cap,
        volume_24h: priceData.volume_24h,
        fetched_at: priceData.fetched_at
      };

      return { success: true, data: transformedData };
    } catch (error) {
      console.error('[FlashApiService] Error fetching price:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch price'
      };
    }
  }

  /**
   * Get historical price chart data (timeseries)
   */
  async getTimeseries(assetId: string, vsCurrency: string, days: number): Promise<FlashApiResponse<TimeseriesResponse>> {
    try {
      const timeframeMap: Record<number, string> = {
        1: '1d',
        7: '7d',
        30: '30d',
        90: '90d',
        365: '1y'
      };

      const timeframe = timeframeMap[days] || (days >= 365 ? '1y' : days >= 90 ? '90d' : days >= 30 ? '30d' : days >= 7 ? '7d' : '1d');

      const requestBody = {
        asset_id: assetId,
        vs_currency: vsCurrency,
        timeframe,
        points: 100
      };

      const response = await this.deduplicateRequest<any>('POST', `${FLASH_API_BASE_URL}/timeseries/`, {
        data: requestBody
      });

      const data: TimeseriesResponse = (response.series || []).map((point: any) => ({
        timestamp: new Date(point.t).toISOString(),
        price: point.p
      }));

      return { success: true, data };
    } catch (error) {
      console.error('[FlashApiService] Error fetching timeseries:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch timeseries'
      };
    }
  }

  // ==================== Currency Endpoints ====================

  /**
   * Get list of supported fiat currencies
   */
  async getCurrencies(): Promise<FlashApiResponse<PaginatedCurrenciesResponse>> {
    try {
      const url = `${FLASH_API_BASE_URL}/currencies/`;
      const data = await this.deduplicateRequest<PaginatedCurrenciesResponse>('GET', url);
      return { success: true, data };
    } catch (error) {
      console.error('[FlashApiService] Error fetching currencies:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch currencies'
      };
    }
  }

  // ==================== Exchange Rate Endpoints ====================

  /**
   * Get exchange rates (all rates vs USD or single rate)
   */
  async getExchangeRates(targetCurrency?: string): Promise<FlashApiResponse<ExchangeRatesResponse | number>> {
    try {
      const endpoint = targetCurrency
        ? `${FLASH_API_BASE_URL}/exchange-rates/${targetCurrency}/`
        : `${FLASH_API_BASE_URL}/exchange-rates/`;

      const data = await this.deduplicateRequest<ExchangeRatesResponse | number>('GET', endpoint);
      return { success: true, data };
    } catch (error) {
      console.error('[FlashApiService] Error fetching exchange rates:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch exchange rates'
      };
    }
  }

  // ==================== Wallet Balance Endpoints ====================

  /**
   * Get unified wallet balance
   */
  async getWalletBalance(params: {
    network: 'ethereum' | 'bnb' | 'solana' | 'bitcoin';
    address: string;
    network_type?: 'mainnet' | 'testnet';
  }): Promise<FlashApiResponse<WalletBalanceResponse>> {
    try {
      let url = `${FLASH_API_BASE_URL}/transactions/wallet-balance/?network=${params.network}&address=${params.address}`;
      if (params.network_type) {
        url += `&network_type=${params.network_type}`;
      }

      const data = await this.deduplicateRequest<WalletBalanceResponse>('GET', url);
      return { success: true, data };
    } catch (error) {
      console.error('[FlashApiService] Error fetching wallet balance:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch wallet balance'
      };
    }
  }

  /**
 * Get all user tags with pagination support
 */
  async getAllUserTags(page: number = 1, pageSize: number = 100): Promise<FlashApiResponse<UserTagsResponse>> {
    try {
      const url = new URL(`${FLASH_USERS_BASE_URL}/tags/`);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('page_size', pageSize.toString());

      const data = await this.deduplicateRequest<UserTagsResponse>('GET', url.toString());
      return { success: true, data };
    } catch (error) {
      console.error('[FlashApiService] Error fetching tags:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch tags'
      };
    }
  }
}

// Export singleton instance
const flashApiService = new FlashApiService();
export default flashApiService;