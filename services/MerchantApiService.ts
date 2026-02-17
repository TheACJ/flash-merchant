import { STORAGE_KEYS } from '@/constants/storage';
import axios, { AxiosError, AxiosInstance } from 'axios';
import * as SecureStore from 'expo-secure-store';

// API Configuration
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/agents';

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

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
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
        // Log error response
        console.error('\n❌ API ERROR:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          data: error.response?.data,
          message: error.message,
        });

        // Only clear auth token on 401 for authenticated requests
        const skipAuth = (error.config as any)?.skipAuth === true;
        if (error.response?.status === 401 && !skipAuth) {
          console.log('🔒 Unauthorized - Clearing auth token');
          await this.clearAuth();
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== Auth Management ====================
  
  async setAuthToken(token: string): Promise<void> {
    console.log('🔑 Setting auth token:', token.substring(0, 20) + '...');
    this.authToken = token;
    await SecureStore.setItemAsync(STORAGE_KEYS.session_token, token);
    // Verify it was stored
    const verified = await SecureStore.getItemAsync(STORAGE_KEYS.session_token);
    console.log('🔑 Token verified in SecureStore:', verified ? 'YES' : 'NO');
  }

  async clearAuth(): Promise<void> {
    console.log('🗑️ Clearing auth token');
    this.authToken = null;
    await SecureStore.deleteItemAsync(STORAGE_KEYS.session_token);
  }

  // ==================== Onboarding Endpoints ====================

  async registerInitiate(data: MerchantRegistrationInitiate): Promise<ApiResponse> {
    console.log('📝 Initiating registration for:', data.phone_number);
    const response = await this.api.post('/register/initiate/', data);
    return response.data;
  }

  async registerComplete(data: MerchantRegistrationComplete): Promise<ApiResponse> {
    console.log('✅ Completing registration with session:', data.session_token.substring(0, 10) + '...');
    const response = await this.api.post('/register/complete/', data);
    // Backend returns 'access' token (JWT), not 'token'
    if (response.data.access) {
      await this.setAuthToken(response.data.access);
    }
    return response.data;
  }

  async loginInitiate(data: MerchantLoginInitiate): Promise<ApiResponse> {
    console.log('🔐 Initiating login for:', data.phone_number);
    const response = await this.api.post('/login/initiate/', data);
    return response.data;
  }

  async loginComplete(data: MerchantLoginComplete): Promise<ApiResponse> {
    console.log('🔓 Completing login for:', data.phone_number);
    const response = await this.api.post('/login/complete/', data);
    // Backend returns 'access' token (JWT), not 'token'
    if (response.data.access) {
      await this.setAuthToken(response.data.access);
    }
    return response.data;
  }

  async addMerchantTag(data: AddMerchantTag): Promise<ApiResponse> {
    console.log('🏷️ Adding merchant tag:', data.tag);
    const response = await this.api.post('/add-tag/', data);
    return response.data;
  }

  // ==================== Tag Endpoints ====================

  async updateMerchantTag(data: UpdateMerchantTag): Promise<ApiResponse> {
    const response = await this.api.post('/tag/update-tag/', data);
    return response.data;
  }

  async checkTagAvailability(tag: string): Promise<ApiResponse<{ available: boolean }>> {
    // This is a public endpoint - don't require auth
    const response = await this.api.get('/tag/check-tag/', { params: { tag }, skipAuth: true } as any);
    return response.data;
  }

  async resolveTag(tag: string): Promise<ApiResponse> {
    const response = await this.api.get('/tag/resolve/', { params: { tag } });
    return response.data;
  }

  // ==================== Merchant Details Endpoints ====================

  async getMerchantList(params?: { page?: number; search?: string }): Promise<ApiResponse> {
    const response = await this.api.get('/list/', { params });
    return response.data;
  }

  async addBankDetails(data: AddBankDetails): Promise<ApiResponse> {
    const response = await this.api.post('/bank/add/', data);
    return response.data;
  }

  async getMerchantProfile(): Promise<ApiResponse> {
    const response = await this.api.get('/profile/');
    return response.data;
  }

  async getMerchantPublicProfile(id: string): Promise<ApiResponse> {
    const response = await this.api.get(`/profile/${id}/`);
    return response.data;
  }

  async getMerchantDashboard(): Promise<ApiResponse> {
    const response = await this.api.get('/dashboard/');
    return response.data;
  }

  // ==================== Transaction Endpoints ====================

  async initiatePhysicalWithdrawal(data: PhysicalWithdrawalInitiate): Promise<ApiResponse> {
    const response = await this.api.post('/physical/withdrawal/initiate/', data);
    return response.data;
  }

  async initiatePhysicalDeposit(data: PhysicalDepositInitiate): Promise<ApiResponse> {
    const response = await this.api.post('/physical/deposit/initiate/', data);
    return response.data;
  }

  async confirmPhysicalDeposit(data: PhysicalDepositConfirm): Promise<ApiResponse> {
    const response = await this.api.post('/physical/deposit/confirm/', data);
    return response.data;
  }

  async confirmRemoteWithdrawal(data: RemoteWithdrawalConfirm): Promise<ApiResponse> {
    const response = await this.api.post('/remote/withdrawal/confirm/', data);
    return response.data;
  }

  async confirmRemoteDeposit(data: RemoteDepositConfirm): Promise<ApiResponse> {
    const response = await this.api.post('/remote/deposit/confirm/', data);
    return response.data;
  }

  async getMerchantTransactions(params?: { 
    page?: number; 
    status?: string;
    type?: string;
  }): Promise<ApiResponse> {
    const response = await this.api.get('/transactions/', { params });
    return response.data;
  }

  // ==================== Public Endpoints ====================

  async getActiveMerchants(params?: { page?: number }): Promise<ApiResponse> {
    const response = await this.api.get('/active-merchants/', { params });
    return response.data;
  }

  // ==================== OTP Endpoints ====================

  async sendOTP(phone_number: string): Promise<ApiResponse> {
    const response = await this.api.post('/otp/send/', { phone_number });
    return response.data;
  }

  async verifyOTP(phone_number: string, otp: string): Promise<ApiResponse> {
    const response = await this.api.post('/otp/verify/', { phone_number, otp });
    return response.data;
  }

  async resendOTP(phone_number: string): Promise<ApiResponse> {
    const response = await this.api.post('/otp/resend/', { phone_number });
    return response.data;
  }

  // ==================== Staking Endpoints ====================

  async getStakingStatus(): Promise<ApiResponse> {
    const response = await this.api.get('/staking/status/');
    return response.data;
  }

  async stakeTokens(data: StakeTokens): Promise<ApiResponse> {
    const response = await this.api.post('/staking/stake/', data);
    return response.data;
  }

  async unstakeTokens(stake_id: string): Promise<ApiResponse> {
    const response = await this.api.post('/staking/unstake/', { stake_id });
    return response.data;
  }

  async claimStakingRewards(stake_id: string): Promise<ApiResponse> {
    const response = await this.api.post('/staking/claim-rewards/', { stake_id });
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

