import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./beseQuery";

import { ProductResponse } from "@/client";

import { ProductQueryParams } from "@/types/queryTypes";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    getProducts: builder.query<ProductResponse[], ProductQueryParams>({
      query: (params) => ({
        url: "/product/",
        method: "GET",
        params: {
          search: params.search,
          page: params.page,
          sort_by: params.sort_by,
          sort_order: params.sort_order,
          size: params.size,
          category: params.category,
          brand: params.brand,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Product" as const, id })),
              { type: "Product", id: "List" },
            ]
          : [{ type: "Product", id: "List" }],
    }),
    getProduct: builder.query<ProductResponse, { productId: string }>({
      query: ({ productId }) => ({
        url: `/product/${productId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, { productId }) => [
        { type: "Product", id: productId },
      ],
    }),
  }),
});

export const { useGetProductsQuery, useGetProductQuery } = productApi;
