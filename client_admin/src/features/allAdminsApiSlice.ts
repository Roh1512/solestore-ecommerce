import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./beseQuery";
import {
  AdminResponse,
  AdminCreateRequest,
  AdminRoleUpdateRequest,
  SuccessMessage,
} from "@/client";
import { AdminQueryParams } from "@/types/queryTypes";

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
    getAdmins: builder.query<AdminResponse[], AdminQueryParams>({
      query: (params) => ({
        url: "/admincrud/",
        method: "GET",
        params: {
          search: params.search,
          skip: params.skip,
          limit: params.limit,
          sort_by: params.sort_by,
          sort_order: params.sort_order,
          role: params.role,
        },
        credentials: "include",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: "Admin" as const, _id })),
              { type: "Admin", id: "List" },
            ]
          : [{ type: "Admin", id: "List" }],
    }),
    getAdmin: builder.query<AdminResponse, { adminId: string }>({
      query: ({ adminId }) => ({
        url: `/admincrud/${adminId}`,
        method: "GET",
        credentials: "include",
      }),
      providesTags: (_result, _error, { adminId }) => [
        { type: "Admin", id: adminId },
      ],
    }),
    updateAdminRole: builder.mutation<
      AdminResponse,
      { body: AdminRoleUpdateRequest; adminId: string }
    >({
      query: ({ adminId, body }) => ({
        url: `/admincrud/update-role/${adminId}`,
        method: "PUT",
        credentials: "include",
        body: body,
      }),
      invalidatesTags: (_result, _error, { adminId }) => [
        { type: "Admin", id: adminId },
        { type: "Admin", id: "List" },
      ],
    }),
    deleteAdmin: builder.mutation<SuccessMessage, { adminId: string }>({
      query: ({ adminId }) => ({
        url: `/admincrud/${adminId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: (_result, _error, { adminId }) => [
        { type: "Admin", id: adminId },
        { type: "Admin", id: "List" },
      ],
    }),
  }),
});

export const {
  useRegisterAdminMutation,
  useGetAdminQuery,
  useGetAdminsQuery,
  useUpdateAdminRoleMutation,
  useDeleteAdminMutation,
} = allAdminsApi;
