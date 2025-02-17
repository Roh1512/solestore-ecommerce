import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";
import { CategoryResponse } from "@/client";
import { CBQueryParams } from "@/types/queryTypes";

export const categoryApiSlice = createApi({
  reducerPath: "categoryApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    getCategories: builder.query<CategoryResponse[], CBQueryParams>({
      query: (params) => ({
        url: "/category/",
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
      providesTags: (result) =>
        result
          ? [
              { type: "Category", id: "LIST" },
              ...result.map((category) => ({
                type: "Category" as const,
                id: category.id,
              })),
            ]
          : [{ type: "Category", id: "LIST" }],
    }),
  }),
});

export const { useGetCategoriesQuery } = categoryApiSlice;
