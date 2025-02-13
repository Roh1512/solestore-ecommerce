import { configureStore } from "@reduxjs/toolkit";
import { adminAuthApi } from "@/features/adminAuthApiSlice";
import authReducer from "@/features/adminAuthSlice";
import { profileApi } from "@/features/profileApiSLice";
import { brandApi } from "@/features/brandApiSlice";
import { categoryApi } from "@/features/categoryApiSlice";
import { allAdminsApi } from "@/features/allAdminsApiSlice";
import { productApi } from "@/features/productApiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [adminAuthApi.reducerPath]: adminAuthApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [brandApi.reducerPath]: brandApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [allAdminsApi.reducerPath]: allAdminsApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(adminAuthApi.middleware)
      .prepend(profileApi.middleware)
      .prepend(brandApi.middleware)
      .prepend(categoryApi.middleware)
      .prepend(allAdminsApi.middleware)
      .prepend(productApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
