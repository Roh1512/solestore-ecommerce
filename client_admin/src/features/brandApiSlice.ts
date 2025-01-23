import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BrandCreateRequest, BrandResponse, SuccessMessage } from "@/client";
import { RootState } from "@/app/store";
import { CBQueryParams } from "@/types/queryTypes";

export const brandApi = createApi({
  reducerPath: "brandApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/admin/brand",
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
  tagTypes: ["Brand"],
  endpoints: (builder) => ({
    getBrands: builder.query<BrandResponse[], CBQueryParams>({
      query: (params) => ({
        url: "/",
        method: "GET",
        params: {
          search: params.search,
          skip: params.skip,
          limit: params.limit,
          sort_by: params.sort_by,
          sort_order: params.sort_order,
        },
      }),
      providesTags: [{ type: "Brand" }],
    }),
    deleteBrand: builder.mutation<SuccessMessage, { brandId: string }>({
      query: ({ brandId }) => ({
        url: `/${brandId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Brand" }],
    }),
    editBrand: builder.mutation<
      BrandResponse,
      { brandId: string; data: BrandCreateRequest }
    >({
      query: ({ brandId, data }) => ({
        url: `/${brandId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [{ type: "Brand" }],
    }),
  }),
});

export const {
  useGetBrandsQuery,
  useDeleteBrandMutation,
  useEditBrandMutation,
} = brandApi;
