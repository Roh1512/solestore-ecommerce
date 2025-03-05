import io, { Socket } from "socket.io-client";
import { Store } from "@reduxjs/toolkit";
import {
  receiveResponse,
  setConnectionStatus,
  setError,
} from "@/features/webSocketSlice";
import { OrderResponse } from "@/client";
import { orderApiSlice } from "@/features/orderApiSlice";

// WebSocket server URL
const ENDPOINT = "https://solestore-ecommerce-3e19.onrender.com"; // "http://127.0.0.1:8000";

// webSocketService.ts
let socket: Socket | null = null;
let currentToken: string | null = null;

export const initWebSocket = (store: Store, token: string | null) => {
  // Disconnect if token changes or becomes null
  if (socket && token !== currentToken) {
    socket.disconnect();
    socket = null;
    currentToken = null;
  }

  console.log("Token: ", token);

  if (token && !socket) {
    currentToken = token;
    socket = io(ENDPOINT, {
      path: "/api/ws",
      transports: ["websocket"],
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 3, // Reduced from 5
      reconnectionDelay: 5000, // Increased from 3000
      withCredentials: true,
      query: { v: Date.now() }, // Cache buster
    });

    const handleConnect = () => {
      store.dispatch(setConnectionStatus("connected"));
      console.log("WebSocket connected");
    };

    const handleDisconnect = () => {
      store.dispatch(setConnectionStatus("disconnected"));
      console.log("WebSocket disconnected");
    };

    const handleError = (error: Error) => {
      store.dispatch(setError(error.message));
      console.error("WebSocket error:", error);
    };

    const handleOrderUpdate = (data: OrderResponse) => {
      console.log("Order update received:", data);

      store.dispatch(
        orderApiSlice.util.invalidateTags([{ type: "Order", id: data.id }])
      );
    };

    // Single setup for event listeners
    socket
      .on("connect", handleConnect)
      .on("disconnect", handleDisconnect)
      .on("connect_error", handleError)
      .on("response", (data: unknown) => {
        store.dispatch(receiveResponse(data));
      })
      .on("order-updated", handleOrderUpdate);

    // Return cleanup with connection check
    return () => {
      if (socket?.connected) {
        console.log("Cleaning up WebSocket connection");
        socket.off("connect", handleConnect);
        socket.off("disconnect", handleDisconnect);
        socket.off("connect_error", handleError);
        socket.disconnect();
        socket = null;
        currentToken = null;
      }
    };
  }

  // Return empty cleanup if no connection
  return () => {};
};
