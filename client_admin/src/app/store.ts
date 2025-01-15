import { configureStore } from "@reduxjs/toolkit";
import { adminAuthApi } from "@/features/adminAuthApiSlice";
import authReducer from "@/features/adminAuthSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [adminAuthApi.reducerPath]: adminAuthApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(adminAuthApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
