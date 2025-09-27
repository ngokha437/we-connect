import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessToken: null,
  refreshToken: null,
  userInfo: {},
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
    logout: () => {
      return initialState;
    },
    saveUserInfo: (state, action) => {
      state.userInfo = action.payload;
    },
  },
});

export const { login, logout, saveUserInfo } = authSlice.actions;
export default authSlice.reducer;
