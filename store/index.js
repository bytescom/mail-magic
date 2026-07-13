import { configureStore } from '@reduxjs/toolkit';
import trackingReducer from '../features/tracking/trackingSlice';

export const store = configureStore({
    reducer: {
        tracking: trackingReducer,
    },
});
