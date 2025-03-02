import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth } from "./beseQuery";

import {
  OrderResponse,
  OrderStatus,
  OrdersBeingProcessedResponse,
} from "@/client";
import { OrderQueryParams } from "@/types/queryTypes";

export const ordersApiSlice = createApi({
  reducerPath: "orderApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Order", "OrderProcessing"],
  endpoints: (builder) => ({
    getOrders: builder.query<OrderResponse[], OrderQueryParams>({
      query: (params) => ({
        url: "/order/",
        method: "GET",
        params: {
          page: String(params.page),
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
      query: ({ orderId }) => ({
        url: `/order/${orderId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, { orderId }) => [
        { type: "Order", id: orderId },
      ],
    }),
    updateOrderStatus: builder.mutation<
      OrderResponse,
      { orderId: string; orderStatus: OrderStatus }
    >({
      query: ({ orderId, orderStatus }) => ({
        url: `/order/${orderId}/update-status`,
        method: "PUT",
        body: {
          order_status: orderStatus,
        },
      }),
      invalidatesTags: (_result) => [{ type: "Order", id: _result?.id }],
    }),
    startHandlingOrder: builder.mutation<
      OrdersBeingProcessedResponse,
      { orderId: string }
    >({
      query: ({ orderId }) => ({
        url: `/order/${orderId}/process`,
        method: "POST",
      }),
      invalidatesTags: (_result) => [{ type: "Order", id: _result?.order_id }],
    }),
    cancelHandlingOrder: builder.mutation<
      OrdersBeingProcessedResponse,
      { orderId: string }
    >({
      query: ({ orderId }) => ({
        url: `/order/${orderId}/cancel-processing`,
        method: "POST",
      }),
      invalidatesTags: (_result) => [{ type: "Order", id: _result?.order_id }],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  useGetOrderQuery,
  useCancelHandlingOrderMutation,
  useStartHandlingOrderMutation,
} = ordersApiSlice;
