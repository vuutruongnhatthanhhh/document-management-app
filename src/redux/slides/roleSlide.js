import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "",
};

export const roleSlide = createSlice({
  name: "role",
  initialState,
  reducers: {
    updateRole: (state, action) => {
      const { name = "" } = action.payload;
      state.name = name;
    },

    // Để khi logout reset lại mấy cái này
    // resetUser: (state) => {
    //   state.name = "";
    //   state.username = "";
    //   state.id_role = 2;
    //   state.avatar = "";
    //   state.publicKey = "";
    //   state.privateKey = "";
    //   state.isHide = 1;
    // },
  },
});

// Action creators are generated for each case reducer function
export const { updateRole } = roleSlide.actions;

export default roleSlide.reducer;
