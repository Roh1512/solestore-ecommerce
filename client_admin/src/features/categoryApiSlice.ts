import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  CategoryCreateRequest,
  CategoryResponse,
  SuccessMessage,
} from "@/client";
import { RootState } from "@/app/store";
import { CBQueryParams } from "@/types/queryTypes";

export const categoryApi = createApi({
  reducerPath: "categoryApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api/admin/category",
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
  tagTypes: ["Category"],
  endpoints: (builder) => ({
    getCategories: builder.query<CategoryResponse[], CBQueryParams>({
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
      providesTags: [{ type: "Category" }],
    }),
    deleteCategory: builder.mutation<SuccessMessage, { categoryId: string }>({
      query: ({ categoryId }) => ({
        url: `/${categoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Category" }],
    }),
    editCategory: builder.mutation<
      CategoryResponse,
      { categoryId: string; data: CategoryCreateRequest }
    >({
      query: ({ categoryId, data }) => ({
        url: `/${categoryId}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: [{ type: "Category" }],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useDeleteCategoryMutation,
  useEditCategoryMutation,
} = categoryApi;
