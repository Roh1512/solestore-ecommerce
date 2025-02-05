import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./beseQuery";
import { AdminResponse, AdminCreateRequest } from "@/client";

export const allAdminsApi = createApi({
  reducerPath: "allAdminsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Admin"],
  endpoints: (builder) => ({
    registerAdmin: builder.mutation<AdminResponse, AdminCreateRequest>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: [{ type: "Admin" }],
    }),
  }),
});

export const { useRegisterAdminMutation } = allAdminsApi;
