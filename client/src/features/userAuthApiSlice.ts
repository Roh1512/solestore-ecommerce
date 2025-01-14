import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  UserCreateRequest,
  UserResponse,
  Body_auth_login,
  Token,
} from "@/client";
import { RootState } from "@/app/store";

export const userAuthApi = createApi({
  reducerPath: "userAuthApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/auth",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      console.log("Access token:", token); // Log the token for debugging

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      } else {
        console.warn("No token found!"); // Add a warning if no token is available
      }

      return headers;
    },
  }),
  tagTypes: ["Session", "Register"],
  endpoints: (builder) => ({
    register: builder.mutation<UserResponse, UserCreateRequest>({
      query: (credentials) => ({
        url: "/register",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: [{ type: "Register" }],
    }),
    login: builder.mutation<Token, Body_auth_login>({
      query: (loginData) => ({
        url: "/login",
        method: "POST",
        body: new URLSearchParams({
          grant_type: loginData.grant_type || "password",
          username: loginData.username,
          password: loginData.password,
          scope: loginData.scope || "",
          client_id: loginData.client_id || "",
          client_secret: loginData.client_secret || "",
        }),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded", // FastAPI expects form data for OAuth2
        },
      }),
      invalidatesTags: [{ type: "Session" }],
    }),
    checkAuth: builder.query<{ status: string; user: UserResponse }, void>({
      query: () => ({
        url: "/checkauth",
        method: "GET",
      }),
      providesTags: [{ type: "Session" }],
    }),
    refreshToken: builder.mutation<Token, void>({
      query: () => ({
        url: "/refresh",
        method: "POST",
      }),
      invalidatesTags: [{ type: "Session" }],
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/logout",
        method: "POST",
      }),
      invalidatesTags: [{ type: "Session" }],
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useCheckAuthQuery,
  useLogoutMutation,
} = userAuthApi;
