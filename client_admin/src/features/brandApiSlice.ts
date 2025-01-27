import { createApi } from "@reduxjs/toolkit/query/react";
import { BrandCreateRequest, BrandResponse, SuccessMessage } from "@/client";

import { CBQueryParams } from "@/types/queryTypes";
import { baseQueryWithReauth } from "./beseQuery";

export const brandApi = createApi({
  reducerPath: "brandApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Brand"],
  endpoints: (builder) => ({
    getBrands: builder.query<BrandResponse[], CBQueryParams>({
      query: (params) => ({
        url: "/admin/brand/",
        method: "GET",
        params: {
          search: params.search,
          skip: params.skip,
          limit: params.limit,
          sort_by: params.sort_by,
          sort_order: params.sort_order,
        },
        credentials: "include",
      }),
      providesTags: [{ type: "Brand" }],
    }),
    deleteBrand: builder.mutation<SuccessMessage, { brandId: string }>({
      query: ({ brandId }) => ({
        url: `/admin/brand/${brandId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: [{ type: "Brand" }],
    }),
    editBrand: builder.mutation<
      BrandResponse,
      { brandId: string; data: BrandCreateRequest }
    >({
      query: ({ brandId, data }) => ({
        url: `/admin/brand/${brandId}`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: [{ type: "Brand" }],
    }),
    createBrand: builder.mutation<BrandResponse, BrandCreateRequest>({
      query: (data) => ({
        url: "/admin/brand/",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: [{ type: "Brand" }],
    }),
  }),
});

export const {
  useGetBrandsQuery,
  useDeleteBrandMutation,
  useEditBrandMutation,
  useCreateBrandMutation,
} = brandApi;
