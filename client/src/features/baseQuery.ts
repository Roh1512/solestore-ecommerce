import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "@/app/store";
import { clearCredentials, setCredentials } from "./accessTokenApiSlice";

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: "/api",
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQueryWithAuth(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to get a new token
    try {
      const refreshResult = await baseQueryWithAuth(
        {
          url: "/auth/refresh",
          method: "POST",
          credentials: "include",
        },
        api,
        extraOptions
      );
      if (refreshResult.data) {
        api.dispatch(
          setCredentials({
            accessToken: (refreshResult.data as { access_token: string })
              .access_token,
          })
        );
        // Retry the original query with new token
        result = await baseQueryWithAuth(args, api, extraOptions);
      } else {
        api.dispatch(clearCredentials());
      }
    } catch (error) {
      console.error("Error refreshing token: ", error);
      api.dispatch(clearCredentials());
    }
  }
  return result;
};
