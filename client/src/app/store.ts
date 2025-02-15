import {
  configureStore /* createListenerMiddleware */,
} from "@reduxjs/toolkit";
import { userAuthApi } from "@/features/userAuthApiSlice";
import authReducer from "@/features/accessTokenApiSlice";
import { userProfileApiSlice } from "@/features/userProfileApiSlice";
import { brandApiSlice } from "@/features/brandApiSlice";
import { categoryApiSlice } from "@/features/categoryApiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [userAuthApi.reducerPath]: userAuthApi.reducer,
    [userProfileApiSlice.reducerPath]: userProfileApiSlice.reducer,
    [brandApiSlice.reducerPath]: brandApiSlice.reducer,
    [categoryApiSlice.reducerPath]: categoryApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(userAuthApi.middleware)
      .prepend(userProfileApiSlice.middleware)
      .prepend(brandApiSlice.middleware)
      .prepend(categoryApiSlice.middleware),

  // devTools: false //in production
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
