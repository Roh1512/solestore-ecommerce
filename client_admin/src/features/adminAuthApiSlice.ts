import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { Token, Body_admin_admin_login, AdminResponse } from "@/client";
import { RootState } from "@/app/store";
import { clearCredentials, setCredentials } from "./adminAuthSlice";

export const adminAuthApi = createApi({
  reducerPath: "adminAuthApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/admin/auth",
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      } else {
        console.warn("No token found");
        headers.set("Authorization", "Bearer");
      }
      return headers;
    },
  }),
  tagTypes: ["Session", "Register"],
  endpoints: (builder) => ({
    login: builder.mutation<Token, Body_admin_admin_login>({
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
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }),
      invalidatesTags: [{ type: "Session" }],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res: Token = (await queryFulfilled).data;
          dispatch(setCredentials({ accessToken: res.access_token }));
        } catch (error) {
          console.error("Login failed", error);
          dispatch(clearCredentials());
        }
      },
    }),
    checkAuth: builder.query<{ status: string; admin: AdminResponse }, void>({
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
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const res: Token = (await queryFulfilled).data;
          dispatch(setCredentials({ accessToken: res.access_token }));
        } catch (error) {
          console.error("Error refreshing token: ", error);
          dispatch(clearCredentials());
        }
      },
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/logout",
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
  }),
});

export const {
  useLoginMutation,
  useRefreshTokenMutation,
  useCheckAuthQuery,
  useLogoutMutation,
} = adminAuthApi;