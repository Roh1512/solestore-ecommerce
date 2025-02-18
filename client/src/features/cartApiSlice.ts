import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";
import {
  CartResponse,
  CartItemResponse,
  AddToCartRequest,
  ChangeItemQtyRequest,
} from "@/client";
import { CartQueryParams } from "@/types/queryTypes";

export const cartApiSlice = createApi({
  reducerPath: "cartApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    getCart: builder.query<CartResponse, CartQueryParams>({
      query: (params) => ({
        url: "/cart/",
        method: "GET",
        params: {
          search: params.search,
          page: params.page,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({
                type: "Cart" as const,
                id: id,
              })),
              { type: "Cart" as const, id: "LIST" },
              { type: "Cart" as const, id: "TOTAL_PRICE" },
              { type: "Cart" as const, id: "TOTAL_COUNT" },
            ]
          : [
              { type: "Cart" as const, id: "LIST" },
              { type: "Cart" as const, id: "TOTAL_PRICE" },
              { type: "Cart" as const, id: "TOTAL_COUNT" },
            ],
    }),

    addToCart: builder.mutation<CartItemResponse, AddToCartRequest>({
      query: (body) => ({
        url: "/cart/add",
        method: "POST",
        body: body,
      }),
      invalidatesTags: (_result) => [
        { type: "Cart", id: _result?.id },
        { type: "Cart", id: "LIST" },
        { type: "Cart", id: "TOTAL_PRICE" },
        { type: "Cart", id: "TOTAL_COUNT" },
      ],
    }),
    removeFromCart: builder.mutation<CartItemResponse, { cartId: string }>({
      query: ({ cartId }) => ({
        url: `/cart/${cartId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result) => [
        { type: "Cart", id: _result?.id },
        { type: "Cart", id: "LIST" },
        { type: "Cart", id: "TOTAL_PRICE" },
        { type: "Cart", id: "TOTAL_COUNT" },
      ],
    }),
    changeQuantity: builder.mutation<
      CartItemResponse,
      { body: ChangeItemQtyRequest; cartId: string }
    >({
      query: ({ body, cartId }) => ({
        url: `/cart/${cartId}/change-quantity`,
        method: "PUT",
        body,
      }),
      async onQueryStarted({ body, cartId }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          cartApiSlice.util.updateQueryData(
            "getCart",
            { page: 1, search: "" }, // Adjust to match your app’s query params
            (draft) => {
              const item = draft.items.find((i) => i.id === cartId);
              if (item) {
                // Ensure the quantity never goes below 1
                item.quantity = item.quantity + body.quantity;

                // Recalculate totals
                draft.total_count = draft.items.reduce(
                  (sum, curr) => sum + curr.quantity,
                  0
                );
                draft.total_price = draft.items.reduce(
                  (sum, curr) => sum + curr.quantity * curr.price,
                  0
                );
                draft.total_price = Math.round(draft.total_price * 100) / 100;
              }
            }
          )
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
      invalidatesTags: (_result) => [
        { type: "Cart", id: _result?.id },
        { type: "Cart", id: "LIST" },
        { type: "Cart", id: "TOTAL_PRICE" },
        { type: "Cart", id: "TOTAL_COUNT" },
      ],
    }),
  }),
});

export const {
  useAddToCartMutation,
  useGetCartQuery,
  useRemoveFromCartMutation,
  useChangeQuantityMutation,
} = cartApiSlice;
