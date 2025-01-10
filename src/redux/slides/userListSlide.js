import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
};

export const userListSlide = createSlice({
  name: "users",
  initialState,
  reducers: {
    updateListUser: (state, action) => {
      const { users = [] } = action.payload;
      state.users = users;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateListUser } = userListSlide.actions;

export default userListSlide.reducer;
