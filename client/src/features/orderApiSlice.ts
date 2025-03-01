import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./baseQuery";

import {
  CreateOrderResponse,
  OrderCreateRequest,
  OrderResponse,
} from "@/client";
import { OrderQueryParams } from "@/types/queryTypes";

export const orderApiSlice = createApi({
  reducerPath: "orderApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Order"],
  endpoints: (builder) => ({
    getOrders: builder.query<OrderResponse[], OrderQueryParams>({
      query: (params) => ({
        url: "/order/",
        method: "GET",
        params: {
          page: params.page,
        },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Order" as const, id })),
              { type: "Order", id: "List" },
            ]
          : [{ type: "Order", id: "List" }],
    }),
    getOrder: builder.query<OrderResponse, { orderId: string }>({
      query: (data) => ({
        url: `/order/${data.orderId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, { orderId }) => [
        { type: "Order", id: orderId },
      ],
    }),
    createOrder: builder.mutation<CreateOrderResponse, OrderCreateRequest>({
      query: (body) => ({
        url: "/order/create-order",
        method: "POST",
        body: body,
      }),
    }),
    verifyPayment: builder.mutation<
      OrderResponse,
      {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }
    >({
      query: (body) => ({
        url: "/order/verify-payment",
        method: "POST",
        body: body,
      }),
      invalidatesTags: [{ type: "Order" }],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderQuery,
  useGetOrdersQuery,
  useVerifyPaymentMutation,
} = orderApiSlice;
