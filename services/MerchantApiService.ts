import { STORAGE_KEYS } from '@/constants/storage';
import axios, { AxiosError, AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

// API Configuration
const FLASH_API_BASE_URL = process.env.EXPO_PUBLIC_FLASH_API_URL || 'https://flashback.koyeb.app/api/v1';


// Types
interface ApiResponse<T = any> {
  success?: boolean;
  status?: number;
  data?: T;
  message?: string;
  error?: string;
  session_token?: string;
  otp?: string;
  expires_at?: string;
  merchant_exists?: boolean;
  requires_wallet_creation?: boolean;
  merchant?: T;
  access?: string;
  refresh?: string;
}

interface MerchantRegistrationInitiate {
  phone_number: string;
  email: string;
  name: string;
  business_name?: string;
  location?: {
    address?: string;
    state?: string;
    latitude?: number;
    longitude?: number;
  };
}

interface MerchantRegistrationComplete {
  session_token: string;
  otp: string;
  wallets: {
    [chain: string]: { addresses: string[] };
  };
}

interface MerchantLoginInitiate {
  phone_number: string;
}

interface MerchantLoginComplete {
  phone_number: string;
  otp: string;
  session_token: string;
}

interface AddMerchantTag {
  tag: string;
}

interface UpdateMerchantTag {
  new_tag: string;
}

interface AddBankDetails {
  bank_name: string;
  account_number: string;
  account_name: string;
}

interface PhysicalWithdrawalInitiate {
  amount: string;
  currency: string;
  customer_tag?: string;
}

interface PhysicalDepositInitiate {
  amount: string;
  currency: string;
  customer_tag?: string;
}

interface PhysicalDepositConfirm {
  transaction_id: string;
  tx_hash: string;
}

interface RemoteWithdrawalConfirm {
  transaction_id: string;
  tx_hash: string;
}

interface RemoteDepositConfirm {
  transaction_id: string;
  tx_hash: string;
}

interface StakeTokens {
  amount: string;
  duration_days: number;
}

class MerchantApiService {
  private api: AxiosInstance;
  private authToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing: boolean = false;
  private failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

  constructor() {
    this.api = axios.create({
      baseURL: FLASH_API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token and log requests
    this.api.interceptors.request.use(
      async (config) => {
        // Check if this request should skip authentication
        const skipAuth = (config as any).skipAuth === true;

        // Only add auth token if not skipped
        if (!skipAuth) {
          // Always try to get auth token from memory first, then SecureStore
          if (!this.authToken) {
            try {
              const storedToken = await SecureStore.getItemAsync(STORAGE_KEYS.session_token);
              if (storedToken) {
                this.authToken = storedToken;
                console.log('🔑 Retrieved token from SecureStore:', storedToken.substring(0, 20) + '...');
              }
            } catch (e) {
              console.error('Failed to get token from SecureStore:', e);
            }
          }
          if (this.authToken) {
            config.headers.Authorization = `Bearer ${this.authToken}`;
          } else {
            console.log('⚠️ No auth token available for request:', config.url);
          }
        }

        // Log request
        console.log('\n🚀 API REQUEST:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          hasAuth: !!config.headers.Authorization,
          skipAuth: skipAuth,
          data: config.data,
          params: config.params,
        });

        return config;
      },
      (error) => {
        console.error('❌ REQUEST ERROR:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and logging
    this.api.interceptors.response.use(
      (response) => {
        // Log successful response
        console.log('\n✅ API RESPONSE:', {
          status: response.status,
          statusText: response.statusText,
          url: response.config.url,
          data: response.data,
        });
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Log error response
        console.error('\n❌ API ERROR:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          data: error.response?.data,
          message: error.message,
        });

        // Only handle 401 for authenticated requests
        const skipAuth = originalRequest?.skipAuth === true;
        if (error.response?.status === 401 && !skipAuth && !originalRequest?._retry) {
          // Try to refresh the token
          if (this.isRefreshing) {
            // Already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.api(originalRequest);
            }).catch((err) => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            if (newToken) {
              // Process queued requests
              this.failedQueue.forEach(({ resolve }) => resolve(newToken));
              this.failedQueue = [];

              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, clear auth and reject queued requests
            this.failedQueue.forEach(({ reject }) => reject(refreshError));
            this.failedQueue = [];
            await this.clearAuth();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // ==================== Auth Management ====================

  async setAuthToken(accessToken: string, refreshToken?: string): Promise<void> {
    console.log('🔑 Setting auth token:', accessToken.substring(0, 20) + '...');
    this.authToken = accessToken;
    await SecureStore.setItemAsync(STORAGE_KEYS.session_token, accessToken);

    // Store refresh token if provided
    if (refreshToken) {
      this.refreshToken = refreshToken;
      await SecureStore.setItemAsync(STORAGE_KEYS.refresh_token, refreshToken);
      console.log('🔑 Refresh token stored');
    }

    // Verify it was stored
    const verified = await SecureStore.getItemAsync(STORAGE_KEYS.session_token);
    console.log('🔑 Token verified in SecureStore:', verified ? 'YES' : 'NO');
  }

  async clearAuth(): Promise<void> {
    console.log('🗑️ Clearing auth tokens');
    this.authToken = null;
    this.refreshToken = null;
    await SecureStore.deleteItemAsync(STORAGE_KEYS.session_token);
    await SecureStore.deleteItemAsync(STORAGE_KEYS.refresh_token);
  }

  /**
   * Refresh the access token using the refresh token
   */
  private async refreshAccessToken(): Promise<string | null> {
    console.log('🔄 Attempting to refresh access token...');

    try {
      // Get refresh token from memory or storage
      if (!this.refreshToken) {
        this.refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.refresh_token) || null;
      }

      if (!this.refreshToken) {
        console.log('⚠️ No refresh token available');
        return null;
      }

      // Call refresh endpoint
      const response = await axios.post(`${FLASH_API_BASE_URL}/merchant/token/refresh/`, {
        refresh: this.refreshToken,
      });

      if (response.data.access) {
        // Update access token
        this.authToken = response.data.access;
        await SecureStore.setItemAsync(STORAGE_KEYS.session_token, response.data.access);

        // Update refresh token if a new one is provided
        if (response.data.refresh) {
          this.refreshToken = response.data.refresh;
          await SecureStore.setItemAsync(STORAGE_KEYS.refresh_token, response.data.refresh);
        }

        console.log('✅ Token refresh successful');
        return response.data.access;
      }

      return null;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      return null;
    }
  }

  // ==================== Onboarding Endpoints ====================

  async registerInitiate(data: MerchantRegistrationInitiate): Promise<ApiResponse> {
    console.log('📝 Initiating registration for:', data.phone_number);
    const response = await this.api.post('/merchant/register/initiate/', data);
    return response.data;
  }

  async registerComplete(data: MerchantRegistrationComplete): Promise<ApiResponse> {
    console.log('✅ Completing registration with session:', data.session_token.substring(0, 10) + '...');
    const response = await this.api.post('/merchant/register/complete/', data);
    // Backend returns 'access' and 'refresh' tokens (JWT)
    if (response.data.access) {
      await this.setAuthToken(response.data.access, response.data.refresh);
    }
    return response.data;
  }

  async loginInitiate(data: MerchantLoginInitiate): Promise<ApiResponse> {
    console.log('🔐 Initiating login for:', data.phone_number);
    const response = await this.api.post('/merchant/login/initiate/', data);
    return response.data;
  }

  async loginComplete(data: MerchantLoginComplete): Promise<ApiResponse> {
    console.log('🔓 Completing login for:', data.phone_number);
    const response = await this.api.post('/merchant/login/complete/', data);
    // Backend returns 'access' and 'refresh' tokens (JWT)
    if (response.data.access) {
      await this.setAuthToken(response.data.access, response.data.refresh);
    }
    return response.data;
  }

  async addMerchantTag(data: AddMerchantTag): Promise<ApiResponse> {
    console.log('🏷️ Adding merchant tag:', data.tag);
    const response = await this.api.post('/merchant/add-tag/', data);
    return response.data;
  }

  // ==================== Tag Endpoints ====================

  async updateMerchantTag(data: UpdateMerchantTag): Promise<ApiResponse> {
    const response = await this.api.post('/merchant/tag/update-tag/', data);
    return response.data;
  }

  async checkTagAvailability(tag: string): Promise<ApiResponse<{ available: boolean }>> {
    // This is a public endpoint - don't require auth
    const response = await this.api.get('/merchant/tag/check-tag/', { params: { tag }, skipAuth: true } as any);
    return response.data;
  }

  async resolveTag(tag: string): Promise<ApiResponse> {
    const response = await this.api.get('/merchant/tag/resolve/', { params: { tag } });
    return response.data;
  }

  // ==================== Merchant Details Endpoints ====================

  /* async getMerchantList(params?: { page?: number; search?: string }): Promise<ApiResponse> {
    const response = await this.api.get('/list/', { params });
    return response.data;
  } */ // Merchants do not need to see the list of Merchants

  async addBankDetails(data: AddBankDetails): Promise<ApiResponse> {
    const response = await this.api.post('/merchant/bank/add/', data);
    return response.data;
  }

  async getMerchantProfile(): Promise<ApiResponse> {
    const response = await this.api.get('/merchant/profile/');
    return response.data;
  }

  async getMerchantPublicProfile(id: string): Promise<ApiResponse> {
    const response = await this.api.get(`/merchant/profile/${id}/`);
    return response.data;
  }

  async getMerchantDashboard(): Promise<ApiResponse> {
    const response = await this.api.get('/merchant/dashboard/');
    return response.data;
  }

  // ==================== Transaction Endpoints ====================

  async initiatePhysicalWithdrawal(data: PhysicalWithdrawalInitiate): Promise<ApiResponse> {
    const response = await this.api.post('/merchant/physical/withdrawal/initiate/', data);
    return response.data;
  }

  async initiatePhysicalDeposit(data: PhysicalDepositInitiate): Promise<ApiResponse> {
    const response = await this.api.post('/merchant/physical/deposit/initiate/', data);
    return response.data;
  }

  async confirmPhysicalDeposit(data: PhysicalDepositConfirm): Promise<ApiResponse> {
    const response = await this.api.post('/merchant/physical/deposit/confirm/', data);
    return response.data;
  }

  async confirmRemoteWithdrawal(data: RemoteWithdrawalConfirm): Promise<ApiResponse> {
    const response = await this.api.post('/merchant/remote/withdrawal/confirm/', data);
    return response.data;
  }

  async confirmRemoteDeposit(data: RemoteDepositConfirm): Promise<ApiResponse> {
    const response = await this.api.post('/merchant/remote/deposit/confirm/', data);
    return response.data;
  }

  async getMerchantTransactions(params?: {
    page?: number;
    status?: string;
    type?: string;
  }): Promise<ApiResponse> {
    const response = await this.api.get('/merchant/transactions/', { params });
    return response.data;
  }

  // ==================== Public Endpoints ====================

  async getActiveMerchants(params?: { page?: number }): Promise<ApiResponse> {
    const response = await this.api.get('/merchant/active-merchants/', { params });
    return response.data;
  }

  // ==================== OTP Endpoints ====================

  async sendOTP(phone_number: string): Promise<ApiResponse> {
    const response = await this.api.post('/merchant/otp/send/', { phone_number });
    return response.data;
  }

  async verifyOTP(phone_number: string, otp: string): Promise<ApiResponse> {
    const response = await this.api.post('/merchant/otp/verify/', { phone_number, otp });
    return response.data;
  }

  async resendOTP(phone_number: string): Promise<ApiResponse> {
    const response = await this.api.post('/merchant/otp/resend/', { phone_number });
    return response.data;
  }

  // ==================== Staking Endpoints ====================

  async getStakingStatus(): Promise<ApiResponse> {
    const response = await this.api.get('/merchant/staking/status/');
    return response.data;
  }

  async stakeTokens(data: StakeTokens): Promise<ApiResponse> {
    const response = await this.api.post('/merchant/staking/stake/', data);
    return response.data;
  }

  async unstakeTokens(stake_id: string): Promise<ApiResponse> {
    const response = await this.api.post('/merchant/staking/unstake/', { stake_id });
    return response.data;
  }

  async claimStakingRewards(stake_id: string): Promise<ApiResponse> {
    const response = await this.api.post('/merchant/staking/claim-rewards/', { stake_id });
    return response.data;
  }

  // ==================== Error Handling Helper ====================

  handleError(error: any): { success: false; error: string } {
    console.error('\n💥 HANDLING ERROR:', error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<any>;
      const errorMessage = axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        axiosError.message ||
        'An unexpected error occurred';

      console.error('📛 Error details:', {
        status: axiosError.response?.status,
        message: errorMessage,
        data: axiosError.response?.data,
      });

      return {
        success: false,
        error: errorMessage
      };
    }

    console.error('📛 Non-Axios error:', error.message);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
}

export default new MerchantApiService();
export type {
  AddBankDetails, AddMerchantTag, ApiResponse, MerchantLoginComplete, MerchantLoginInitiate, MerchantRegistrationComplete, MerchantRegistrationInitiate, PhysicalDepositConfirm, PhysicalDepositInitiate, PhysicalWithdrawalInitiate, RemoteDepositConfirm, RemoteWithdrawalConfirm, StakeTokens, UpdateMerchantTag
};

