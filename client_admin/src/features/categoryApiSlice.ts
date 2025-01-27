import { createApi } from "@reduxjs/toolkit/query/react";
import {
  CategoryCreateRequest,
  CategoryResponse,
  SuccessMessage,
} from "@/client";
import { CBQueryParams } from "@/types/queryTypes";
import { baseQueryWithReauth } from "./beseQuery";

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    getCategories: builder.query<CategoryResponse[], CBQueryParams>({
      query: (params) => ({
        url: "/admin/category/",
        method: "GET",
        params: {
          search: params.search,
          skip: params.skip,
          limit: params.limit,
          sort_by: params.sort_by,
          sort_order: params.sort_order,
        },
      }),
      providesTags: [{ type: "Category" }],
    }),
    deleteCategory: builder.mutation<SuccessMessage, { categoryId: string }>({
      query: ({ categoryId }) => ({
        url: `/admin/category/${categoryId}`,
        method: "DELETE",
        credentials: "include",
      }),
      invalidatesTags: [{ type: "Category" }],
    }),
    editCategory: builder.mutation<
      CategoryResponse,
      { categoryId: string; data: CategoryCreateRequest }
    >({
      query: ({ categoryId, data }) => ({
        url: `/admin/category/${categoryId}`,
        method: "PUT",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: [{ type: "Category" }],
    }),
    createCategory: builder.mutation<CategoryResponse, CategoryCreateRequest>({
      query: (data) => ({
        url: "/admin/category/",
        method: "POST",
        body: data,
        credentials: "include",
      }),
      invalidatesTags: [{ type: "Category" }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useEditCategoryMutation,
  useCreateCategoryMutation,
} = categoryApi;
