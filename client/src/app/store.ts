import {
  configureStore /* createListenerMiddleware */,
} from "@reduxjs/toolkit";
import { userAuthApi } from "@/features/userAuthApiSlice";
import authReducer from "@/features/accessTokenApiSlice";
import { userProfileApiSlice } from "@/features/userProfileApiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [userAuthApi.reducerPath]: userAuthApi.reducer,
    [userProfileApiSlice.reducerPath]: userProfileApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(userAuthApi.middleware)
      .prepend(userProfileApiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
