import {
  configureStore /* createListenerMiddleware */,
  createListenerMiddleware,
} from "@reduxjs/toolkit";
import { userAuthApi } from "@/features/userAuthApiSlice";
import authReducer from "@/features/accessTokenApiSlice";
import { userProfileApiSlice } from "@/features/userProfileApiSlice";
import { brandApiSlice } from "@/features/brandApiSlice";
import { categoryApiSlice } from "@/features/categoryApiSlice";
import { productApiSlice } from "@/features/productApiSlice";
import { cartApiSlice } from "@/features/cartApiSlice";
import { orderApiSlice } from "@/features/orderApiSlice";
import webSocketReducer from "@/features/webSocketSlice";

const logoutListener = createListenerMiddleware();
logoutListener.startListening({
  matcher: userAuthApi.endpoints.logout.matchFulfilled,
  effect: async (_action, { dispatch }) => {
    dispatch(userAuthApi.util.resetApiState());
    dispatch(userProfileApiSlice.util.resetApiState());
    dispatch(brandApiSlice.util.resetApiState());
    dispatch(cartApiSlice.util.resetApiState());
    dispatch(productApiSlice.util.resetApiState());
    dispatch(cartApiSlice.util.resetApiState());
    dispatch(orderApiSlice.util.resetApiState());
  },
});

export const store = configureStore({
  reducer: {
    auth: authReducer,
    webSocket: webSocketReducer,
    [userAuthApi.reducerPath]: userAuthApi.reducer,
    [userProfileApiSlice.reducerPath]: userProfileApiSlice.reducer,
    [brandApiSlice.reducerPath]: brandApiSlice.reducer,
    [categoryApiSlice.reducerPath]: categoryApiSlice.reducer,
    [productApiSlice.reducerPath]: productApiSlice.reducer,
    [cartApiSlice.reducerPath]: cartApiSlice.reducer,
    [orderApiSlice.reducerPath]: orderApiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .prepend(logoutListener.middleware)
      .prepend(userAuthApi.middleware)
      .prepend(userProfileApiSlice.middleware)
      .prepend(brandApiSlice.middleware)
      .prepend(categoryApiSlice.middleware)
      .prepend(productApiSlice.middleware)
      .prepend(cartApiSlice.middleware)
      .prepend(orderApiSlice.middleware),

  // devTools: false //in production
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
