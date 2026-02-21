/**
 * Device Redux Slice
 * 
 * Manages device fingerprint and information state.
 * Device info is fetched once at app startup and refreshed periodically.
 */

import DeviceService, { DeviceInfo } from '@/services/DeviceService';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Async thunk to initialize device info
export const initializeDevice = createAsyncThunk(
    'device/initialize',
    async (_, { rejectWithValue }) => {
        try {
            const deviceInfo = await DeviceService.getDeviceInfo();
            return deviceInfo;
        } catch (error) {
            console.error('[deviceSlice] Error initializing device:', error);
            return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
        }
    }
);

// Async thunk to refresh device info
export const refreshDeviceInfo = createAsyncThunk(
    'device/refresh',
    async (_, { rejectWithValue }) => {
        try {
            const deviceInfo = await DeviceService.refreshDeviceInfo();
            return deviceInfo;
        } catch (error) {
            console.error('[deviceSlice] Error refreshing device info:', error);
            return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
        }
    }
);

// Async thunk to confirm fingerprint
export const confirmDeviceFingerprint = createAsyncThunk(
    'device/confirmFingerprint',
    async (_, { rejectWithValue }) => {
        try {
            const isValid = await DeviceService.confirmFingerprint();
            return isValid;
        } catch (error) {
            console.error('[deviceSlice] Error confirming fingerprint:', error);
            return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
        }
    }
);

export interface DeviceState {
    deviceInfo: DeviceInfo | null;
    fingerprint: string | null;
    status: 'idle' | 'loading' | 'success' | 'failed';
    error: string | null;
    lastRefreshed: number | null;
    fingerprintValid: boolean;
}

const initialState: DeviceState = {
    deviceInfo: null,
    fingerprint: null,
    status: 'idle',
    error: null,
    lastRefreshed: null,
    fingerprintValid: true,
};

const deviceSlice = createSlice({
    name: 'device',
    initialState,
    reducers: {
        setDeviceInfo(state, action: PayloadAction<DeviceInfo | null>) {
            state.deviceInfo = action.payload;
            if (action.payload) {
                state.fingerprint = action.payload.fingerprint;
                state.lastRefreshed = action.payload.lastRefreshed;
                state.status = 'success';
                state.error = null;
            }
        },
        setFingerprint(state, action: PayloadAction<string>) {
            state.fingerprint = action.payload;
        },
        setFingerprintValid(state, action: PayloadAction<boolean>) {
            state.fingerprintValid = action.payload;
        },
        clearDeviceInfo(state) {
            state.deviceInfo = null;
            state.fingerprint = null;
            state.status = 'idle';
            state.error = null;
            state.lastRefreshed = null;
            state.fingerprintValid = true;
        },
    },
    extraReducers: (builder) => {
        builder
            // initializeDevice
            .addCase(initializeDevice.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(initializeDevice.fulfilled, (state, action) => {
                state.status = 'success';
                state.deviceInfo = action.payload;
                state.fingerprint = action.payload.fingerprint;
                state.lastRefreshed = action.payload.lastRefreshed;
                state.error = null;
                state.fingerprintValid = true;
            })
            .addCase(initializeDevice.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // refreshDeviceInfo
            .addCase(refreshDeviceInfo.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(refreshDeviceInfo.fulfilled, (state, action) => {
                state.status = 'success';
                state.deviceInfo = action.payload;
                state.fingerprint = action.payload.fingerprint;
                state.lastRefreshed = action.payload.lastRefreshed;
                state.error = null;
            })
            .addCase(refreshDeviceInfo.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // confirmDeviceFingerprint
            .addCase(confirmDeviceFingerprint.fulfilled, (state, action) => {
                state.fingerprintValid = action.payload;
            })
            .addCase(confirmDeviceFingerprint.rejected, (state) => {
                state.fingerprintValid = false;
            });
    },
});

export const { setDeviceInfo, setFingerprint, setFingerprintValid, clearDeviceInfo } = deviceSlice.actions;
export default deviceSlice.reducer;
