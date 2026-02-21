/**
 * Location Redux Slice
 * 
 * Manages global location state for the app.
 * Location is fetched once at app startup and stored here for use throughout the app.
 */

import LocationService, { LocationData, LocationPermissionStatus } from '@/services/LocationService';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

// Async thunk to fetch location
export const fetchGlobalLocation = createAsyncThunk(
    'location/fetchGlobal',
    async (_, { rejectWithValue }) => {
        try {
            const location = await LocationService.fetchLocation();
            if (!location) {
                return rejectWithValue('Failed to fetch location');
            }
            return location;
        } catch (error) {
            console.error('[locationSlice] Error fetching location:', error);
            return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
        }
    }
);

// Async thunk to fetch location only if permission is already granted
export const fetchLocationIfPermitted = createAsyncThunk(
    'location/fetchIfPermitted',
    async (_, { rejectWithValue }) => {
        try {
            const location = await LocationService.fetchLocationIfPermitted();
            if (!location) {
                return rejectWithValue('Permission not granted or location unavailable');
            }
            return location;
        } catch (error) {
            console.error('[locationSlice] Error fetching location:', error);
            return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
        }
    }
);

// Async thunk to request permissions and fetch location
export const requestPermissionAndFetchLocation = createAsyncThunk(
    'location/requestAndFetch',
    async (_, { rejectWithValue }) => {
        try {
            const granted = await LocationService.requestPermissions();
            if (!granted) {
                return rejectWithValue('Location permission denied');
            }

            const location = await LocationService.fetchLocation();
            if (!location) {
                return rejectWithValue('Failed to fetch location after permission granted');
            }
            return location;
        } catch (error) {
            console.error('[locationSlice] Error requesting permission and fetching location:', error);
            return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
        }
    }
);

export interface LocationState {
    location: LocationData | null;
    permissionStatus: LocationPermissionStatus;
    status: 'idle' | 'loading' | 'success' | 'failed';
    error: string | null;
}

const initialState: LocationState = {
    location: null,
    permissionStatus: 'undetermined',
    status: 'idle',
    error: null,
};

const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
        setLocation(state, action: PayloadAction<LocationData | null>) {
            state.location = action.payload;
            if (action.payload) {
                state.status = 'success';
                state.error = null;
            }
        },
        setPermissionStatus(state, action: PayloadAction<LocationPermissionStatus>) {
            state.permissionStatus = action.payload;
        },
        clearLocation(state) {
            state.location = null;
            state.status = 'idle';
            state.error = null;
        },
        resetLocationState(state) {
            state.location = null;
            state.permissionStatus = 'undetermined';
            state.status = 'idle';
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // fetchGlobalLocation
            .addCase(fetchGlobalLocation.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchGlobalLocation.fulfilled, (state, action) => {
                state.status = 'success';
                state.location = action.payload;
                state.permissionStatus = 'granted';
                state.error = null;
            })
            .addCase(fetchGlobalLocation.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
                // If permission was denied, update status
                if (action.payload === 'Failed to fetch location') {
                    state.permissionStatus = 'denied';
                }
            })
            // fetchLocationIfPermitted
            .addCase(fetchLocationIfPermitted.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchLocationIfPermitted.fulfilled, (state, action) => {
                state.status = 'success';
                state.location = action.payload;
                state.permissionStatus = 'granted';
                state.error = null;
            })
            .addCase(fetchLocationIfPermitted.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            })
            // requestPermissionAndFetchLocation
            .addCase(requestPermissionAndFetchLocation.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(requestPermissionAndFetchLocation.fulfilled, (state, action) => {
                state.status = 'success';
                state.location = action.payload;
                state.permissionStatus = 'granted';
                state.error = null;
            })
            .addCase(requestPermissionAndFetchLocation.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
                if (action.payload === 'Location permission denied') {
                    state.permissionStatus = 'denied';
                }
            });
    },
});

export const { setLocation, setPermissionStatus, clearLocation, resetLocationState } = locationSlice.actions;
export default locationSlice.reducer;
