import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isShowDrawer: false,
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    toggleDrawer: (state) => {
      state.isShowDrawer = !state.isShowDrawer;
    },
  },
});

export const { toggleDrawer } = settingsSlice.actions;
export default settingsSlice.reducer;
