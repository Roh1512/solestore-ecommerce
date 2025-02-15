import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";
import { BrandResponse } from "@/client";
import { CBQueryParams } from "@/types/queryTypes";

export const brandApiSlice = createApi({
  reducerPath: "brandApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Brand"],
  endpoints: (builder) => ({
    getBrands: builder.query<BrandResponse[], CBQueryParams>({
      query: (params) => ({
        url: "/brand",
        method: "GET",
        params: {
          search: params.search,
          skip: params.skip,
          limit: params.limit,
          sort_by: params.sort_by,
          sort_order: params.sort_order,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              { type: "Brand", id: "LIST" },
              ...result.map((brand) => ({
                type: "Brand" as const,
                id: brand.id,
              })),
            ]
          : [{ type: "Brand", id: "LIST" }],
    }),
  }),
});

export const { useGetBrandsQuery } = brandApiSlice;
