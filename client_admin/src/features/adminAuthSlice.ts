import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  isLoggedIn: boolean;
  accessToken: string | null;
}

const initialState: AuthState = {
  isLoggedIn: true,
  accessToken: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ accessToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      state.isLoggedIn = true; // Reset isLoggedOut state
    },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.isLoggedIn = false; // Set isLoggedOut state after logout
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
