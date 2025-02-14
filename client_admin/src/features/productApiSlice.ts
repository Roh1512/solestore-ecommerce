import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./beseQuery";

import { ProductResponse, ProductCreateRequest } from "@/client";

import { ProductQueryParams } from "@/types/queryTypes";

export const productApi = createApi({
  reducerPath: "productApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Product"],
  endpoints: (builder) => ({
    addProduct: builder.mutation<ProductResponse, ProductCreateRequest>({
      query: (data) => ({
        url: "/product/",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Product" }],
    }),
    addImages: builder.mutation<
      ProductResponse,
      { productId: string; formData: FormData }
    >({
      query: ({ productId, formData }) => ({
        url: `/product/${productId}/add-image`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: "Product", id: productId },
      ],
    }),
    deleteImages: builder.mutation<
      ProductResponse,
      { public_ids: string[]; productId: string }
    >({
      query: ({ public_ids, productId }) => ({
        url: `/product/${productId}/delete-images`,
        method: "PUT",
        body: { public_ids },
      }),
      invalidatesTags: (_result, _error, { productId }) => [
        { type: "Product", id: productId },
      ],
    }),
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

export const {
  useGetProductsQuery,
  useGetProductQuery,
  useAddProductMutation,
  useAddImagesMutation,
  useDeleteImagesMutation,
} = productApi;
