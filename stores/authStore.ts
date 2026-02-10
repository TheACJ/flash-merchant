import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface User {
    id: string;
    name: string;
    merchantName: string;
    email: string;
    verified: boolean;
}

interface AuthState {
    isAuthenticated: boolean;
    hasPin: boolean;
    user: User | null;
    isLoading: boolean;

    // Actions
    login: (pin: string) => Promise<boolean>;
    setPin: (pin: string) => Promise<void>;
    checkPin: (pin: string) => Promise<boolean>;
    logout: () => void;
    register: (name: string, merchantName: string, email: string) => Promise<void>;
    checkHasPin: () => Promise<void>;
}

// Secure storage adapter for Zustand
const secureStorage = {
    getItem: async (name: string): Promise<string | null> => {
        return await SecureStore.getItemAsync(name);
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await SecureStore.setItemAsync(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
        await SecureStore.deleteItemAsync(name);
    },
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            isAuthenticated: false,
            hasPin: false,
            user: null,
            isLoading: false,

            register: async (name, merchantName, email) => {
                set({ isLoading: true });
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                set({
                    user: {
                        id: '1', // Mock ID
                        name,
                        merchantName,
                        email,
                        verified: false // Needs verification
                    },
                    isLoading: false
                });
            },

            setPin: async (pin: string) => {
                set({ isLoading: true });
                try {
                    await SecureStore.setItemAsync('user_pin', pin);
                    set({ hasPin: true, isLoading: false });
                } catch (e) {
                    console.error('Failed to set PIN', e);
                    set({ isLoading: false });
                }
            },

            checkPin: async (pin: string) => {
                try {
                    const storedPin = await SecureStore.getItemAsync('user_pin');
                    return storedPin === pin;
                } catch (e) {
                    return false;
                }
            },

            login: async (pin: string) => {
                set({ isLoading: true });
                const isValid = await get().checkPin(pin);
                if (isValid) {
                    set({ isAuthenticated: true, isLoading: false });
                    return true;
                }
                set({ isLoading: false });
                return false;
            },

            logout: () => {
                set({ isAuthenticated: false });
            },

            checkHasPin: async () => {
                const pin = await SecureStore.getItemAsync('user_pin');
                set({ hasPin: !!pin });
            }
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => secureStorage),
            partialize: (state) => ({
                user: state.user,
                hasPin: state.hasPin
            }), // Persist only user and hasPin flag, not auth state (session)
        }
    )
);
