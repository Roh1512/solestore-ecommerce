// baseQuery.ts
import {
  fetchBaseQuery,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "@/app/store";
import { clearCredentials, setCredentials } from "./adminAuthSlice";

const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: "/api/admin", // Adjust this according to your API base URL
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
  const url = typeof args === "string" ? args : args.url;
  console.log("URL: ", url);

  if (url.includes("/auth/login")) {
    return await baseQueryWithAuth(args, api, extraOptions);
  }
  let result = await baseQueryWithAuth(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    console.log("Error 401 from api request. Request refresh");

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
        console.log("REFRESH: ", refreshResult.data);

        // Store the new token
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
      console.log("Error refreshing token: ", error);
      api.dispatch(clearCredentials());
    }
  }

  return result;
};
