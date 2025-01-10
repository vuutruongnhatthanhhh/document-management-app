import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  id: "",
  name: "",
  username: "",
  password: "",
  id_role: 2,
  avatar: "",
  publicKey: "",
  isHide: 1,
  permiss_sign: 0,
};

export const userSlide = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser: (state, action) => {
      const {
        id = "",
        name = "",
        username = "",
        password = "",
        id_role = "",
        avatar = "",
        publicKey = "",
        isHide = 1,
        permiss_sign = 0,
      } = action.payload;
      state.id = id;
      state.name = name;
      state.username = username;
      state.password = password;
      state.id_role = id_role;
      state.avatar = avatar;
      state.publicKey = publicKey;
      state.isHide = isHide;
      state.permiss_sign = permiss_sign;
    },
    partialUpdateUser: (state, action) => {
      const {
        name,
        username,
        password,
        id_role,
        avatar,
        publicKey,
        isHide,
        permiss_sign,
      } = action.payload;
      if (name !== undefined) state.name = name;
      if (username !== undefined) state.username = username;
      if (password !== undefined) state.password = password;
      if (id_role !== undefined) state.id_role = id_role;
      if (avatar !== undefined) state.avatar = avatar;
      if (publicKey !== undefined) state.publicKey = publicKey;
      if (isHide !== undefined) state.isHide = isHide;
      if (permiss_sign !== undefined) state.permiss_sign = permiss_sign;
    },
    resetUser: (state) => {
      state.name = "";
      state.username = "";
      state.password = "";
      state.id_role = 0;
      state.avatar = "";
      state.publicKey = "";
      state.isHide = 1;
      state.id = 0;
      state.permiss_sign = 0;
    },
  },
});

// Action creators are generated for each case reducer function
export const { updateUser, resetUser, partialUpdateUser } = userSlide.actions;

export default userSlide.reducer;
