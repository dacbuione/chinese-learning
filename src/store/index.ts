import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

// Import slices
import vocabularySlice from './slices/vocabularySlice';
import writingSlice from './slices/writingSlice';
// import progressSlice from './slices/progressSlice';
// import lessonsSlice from './slices/lessonsSlice';
// import authSlice from './slices/authSlice';
// import settingsSlice from './slices/settingsSlice';

// Configure store
export const store = configureStore({
  reducer: {
    vocabulary: vocabularySlice,
    writing: writingSlice,
    // progress: progressSlice,
    // lessons: lessonsSlice,
    // auth: authSlice,
    // settings: settingsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: __DEV__,
});

// Setup listeners for refetchOnFocus/refetchOnReconnect behaviors
setupListeners(store.dispatch);

// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export default
export default store; 