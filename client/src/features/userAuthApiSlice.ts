import { createApi } from "@reduxjs/toolkit/query/react";
import {
  UserCreateRequest,
  UserResponse,
  Body_auth_login,
  Token,
} from "@/client";
import { clearCredentials, setCredentials } from "./accessTokenApiSlice";
import { baseQueryWithReauth } from "./baseQuery";

export const userAuthApi = createApi({
  reducerPath: "userAuthApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Session", "Register"],
  endpoints: (builder) => ({
    register: builder.mutation<UserResponse, UserCreateRequest>({
      query: (credentials) => ({
        url: "/auth/register",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: [{ type: "Register" }],
    }),
    login: builder.mutation<Token, Body_auth_login>({
      query: (loginData) => ({
        url: "/auth/login",
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
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res: Token = (await queryFulfilled).data;
          dispatch(setCredentials({ accessToken: res.access_token }));
        } catch (error) {
          console.error("Logout failed", error);
        }
      },
    }),

    checkAuth: builder.query<{ status: string; user: UserResponse }, void>({
      query: () => ({
        url: "/auth/checkauth",
        method: "GET",
      }),
      providesTags: [{ type: "Session" }],
    }),
    refreshToken: builder.mutation<Token, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
      }),
      invalidatesTags: [{ type: "Session" }],
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: [{ type: "Session" }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(clearCredentials());
        } catch (error) {
          console.error("Logout failed", error);
        }
      },
    }),
    googleLogin: builder.mutation<Token, { token: string }>({
      query: ({ token }) => ({
        url: "/auth/google/login",
        method: "POST",
        body: { token },
      }),
      invalidatesTags: [{ type: "Session" }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res: Token = (await queryFulfilled).data;
          dispatch(setCredentials({ accessToken: res.access_token }));
        } catch (error) {
          console.error("Logout failed", error);
        }
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useRefreshTokenMutation,
  useCheckAuthQuery,
  useLogoutMutation,
  useGoogleLoginMutation,
} = userAuthApi;
