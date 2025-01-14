import axios from 'axios';
import {API_URL_BACK_END} from '@env';

export const getAllUser = async () => {
  const res = await axios.get(`${API_URL_BACK_END}/user`); // URL sử dụng axiosJWT với base URL đã cấu hình
  return res.data;
};

export const loginUser = async data => {
  const res = await axios.post(`${API_URL_BACK_END}/user/login`, data);
  return res.data;
};

export const getUserById = async id => {
  const res = await axios.get(`${API_URL_BACK_END}/user/${id}`);
  return res.data;
};

export const updateeUser = async (id, data) => {
  const res = await axios.put(`${API_URL_BACK_END}/user/update/${id}`, data);

  return res.data;
};

export const uploadAvatar = async (userId, selectedFile) => {
  const formData = new FormData();
  formData.append('avatar', selectedFile);

  try {
    const res = await axios.post(
      `${API_URL_BACK_END}/user/upload-avatar/${userId}`,
      formData,
    );

    return res.data;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

export const createUser = async data => {
  const res = await axios.post(`${API_URL_BACK_END}/user/create`, data);
  return res.data;
};

export const hideUser = async (id, data) => {
  const res = await axios.put(`${API_URL_BACK_END}/user/hideShow/${id}`, data);

  return res.data;
};

export const deleteUser = async id => {
  const res = await axios.delete(`${API_URL_BACK_END}/user/delete/${id}`);
  return res.data;
};
