import { configureStore } from "@reduxjs/toolkit";
import { adminAuthApi } from "@/features/adminAuthApiSlice";
import authReducer from "@/features/adminAuthSlice";
import { profileApi } from "@/features/profileApiSLice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [adminAuthApi.reducerPath]: adminAuthApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(adminAuthApi.middleware)
      .prepend(profileApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
