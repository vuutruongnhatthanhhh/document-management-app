import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  notifications: [],
};

export const notiSlide = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    notiList: (state, action) => {
      const { notifications = [] } = action.payload;
      state.notifications = notifications;
    },
  },
});

export const { notiList } = notiSlide.actions;

export default notiSlide.reducer;
