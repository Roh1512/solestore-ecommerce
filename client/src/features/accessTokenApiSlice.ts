// In your Redux slice
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isLoggedOut: boolean;
  accessToken: string | null;
}

const initialState: AuthState = {
  isLoggedOut: false,
  accessToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ accessToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.isLoggedOut = false; // Reset isLoggedOut state
    },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.isLoggedOut = true; // Set isLoggedOut state after logout
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
