import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import { adminAuthApi } from "@/features/adminAuthApiSlice";
import authReducer from "@/features/adminAuthSlice";
import { profileApi } from "@/features/profileApiSLice";
import { brandApi } from "@/features/brandApiSlice";
import { categoryApi } from "@/features/categoryApiSlice";
import { allAdminsApi } from "@/features/allAdminsApiSlice";
import { productApi } from "@/features/productApiSlice";
import { ordersApiSlice } from "@/features/orderApiSlice";
import webSocketReducer from "@/features/webSocketSlice";

const logoutListener = createListenerMiddleware();
logoutListener.startListening({
  matcher: adminAuthApi.endpoints.logout.matchFulfilled,
  effect: async (_action, { dispatch }) => {
    dispatch(adminAuthApi.util.resetApiState());
    dispatch(profileApi.util.resetApiState());
    dispatch(brandApi.util.resetApiState());
    dispatch(categoryApi.util.resetApiState());
    dispatch(allAdminsApi.util.resetApiState());
    dispatch(productApi.util.resetApiState());
    dispatch(ordersApiSlice.util.resetApiState());
  },
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    webSocket: webSocketReducer,
    [adminAuthApi.reducerPath]: adminAuthApi.reducer,
    [profileApi.reducerPath]: profileApi.reducer,
    [brandApi.reducerPath]: brandApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [allAdminsApi.reducerPath]: allAdminsApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [ordersApiSlice.reducerPath]: ordersApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(logoutListener.middleware)
      .prepend(adminAuthApi.middleware)
      .prepend(profileApi.middleware)
      .prepend(brandApi.middleware)
      .prepend(categoryApi.middleware)
      .prepend(allAdminsApi.middleware)
      .prepend(productApi.middleware)
      .prepend(ordersApiSlice.middleware),
  devTools: false,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
