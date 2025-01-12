import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { UserCreateRequest, UserResponse } from "@/client";

export const userAuthApi = createApi({
  reducerPath: "userAuthApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/auth",
    credentials: "include",
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
  }),
});

export const { useRegisterMutation } = userAuthApi;
