import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the state interface
interface WebSocketState {
  responses: unknown[]; // Array of response objects from the server
  connectionStatus: "connected" | "disconnected" | "error";
  error: string | null;
}

// Initial state
const initialState: WebSocketState = {
  responses: [],
  connectionStatus: "disconnected",
  error: null,
};

// Create the slice
const websocketSlice = createSlice({
  name: "websocket",
  initialState,
  reducers: {
    receiveResponse: (state, action: PayloadAction<unknown>) => {
      state.responses.push(action.payload);
    },
    setConnectionStatus: (
      state,
      action: PayloadAction<"connected" | "disconnected" | "error">
    ) => {
      state.connectionStatus = action.payload;
      if (action.payload === "connected") {
        state.error = null;
      }
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.connectionStatus = "error";
    },
  },
});

// Export actions and reducer
export const { receiveResponse, setConnectionStatus, setError } =
  websocketSlice.actions;
export default websocketSlice.reducer;
