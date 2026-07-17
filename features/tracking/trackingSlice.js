import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks for API calls
export const fetchApplications = createAsyncThunk(
    'tracking/fetchApplications',
    async (params, { rejectWithValue }) => {
        try {
            const query = new URLSearchParams(params).toString();
            const response = await fetch(`/api/tracking/applications?${query}`);
            if (!response.ok) throw new Error('Failed to fetch applications');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchApplicationDetails = createAsyncThunk(
    'tracking/fetchApplicationDetails',
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`/api/tracking/applications/${id}`);
            if (!response.ok) throw new Error('Failed to fetch application details');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const initialState = {
    applications: [],
    metrics: {
        total: 0,
        sent: 0,
        followUps: 0,
        replied: 0,
        interviews: 0,
        rejected: 0,
        closed: 0
    },
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 15
    },
    currentFilters: {
        tab: 'ALL',
        search: '',
        dateRange: 'LAST_7_DAYS', // TODAY, LAST_7_DAYS, LAST_30_DAYS, ALL
    },
    selectedApplicationId: null,
    selectedApplicationDetails: null, // Full details loaded lazily
    isDrawerOpen: false,
    loading: {
        list: false,
        details: false
    },
    error: null
};

const trackingSlice = createSlice({
    name: 'tracking',
    initialState,
    reducers: {
        setFilter: (state, action) => {
            state.currentFilters = { ...state.currentFilters, ...action.payload };
            state.pagination.currentPage = 1; // Reset to page 1 on filter change
        },
        setPage: (state, action) => {
            state.pagination.currentPage = action.payload;
        },
        openDrawer: (state, action) => {
            state.selectedApplicationId = action.payload;
            state.isDrawerOpen = true;
        },
        closeDrawer: (state) => {
            state.isDrawerOpen = false;
        },
        clearSelectedApplication: (state) => {
            state.selectedApplicationId = null;
            state.selectedApplicationDetails = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Applications List
            .addCase(fetchApplications.pending, (state) => {
                state.loading.list = true;
                state.error = null;
            })
            .addCase(fetchApplications.fulfilled, (state, action) => {
                state.loading.list = false;
                state.applications = action.payload.data;
                state.metrics = action.payload.metrics || state.metrics;
                state.pagination = action.payload.pagination || state.pagination;
            })
            .addCase(fetchApplications.rejected, (state, action) => {
                state.loading.list = false;
                state.error = action.payload;
            })
            // Fetch Application Details
            .addCase(fetchApplicationDetails.pending, (state) => {
                state.loading.details = true;
            })
            .addCase(fetchApplicationDetails.fulfilled, (state, action) => {
                state.loading.details = false;
                state.selectedApplicationDetails = action.payload.data;
            })
            .addCase(fetchApplicationDetails.rejected, (state, action) => {
                state.loading.details = false;
                state.error = action.payload;
            });
    }
});

export const { setFilter, setPage, openDrawer, closeDrawer, clearSelectedApplication } = trackingSlice.actions;

export default trackingSlice.reducer;
