import axios from 'axios';
import {API_URL_BACK_END} from '@env';

export const createNoti = async data => {
  const res = await axios.post(`${API_URL_BACK_END}/noti/create`, data);
  return res.data;
};

export const createManagerNoti = async data => {
  const res = await axios.post(`${API_URL_BACK_END}/noti/createManager`, data);
  return res.data;
};

export const getAllNoti = async () => {
  const res = await axios.get(`${API_URL_BACK_END}/noti/`);
  return res.data;
};

export const getAllManagerNoti = async () => {
  const res = await axios.get(`${API_URL_BACK_END}/noti/manager`);
  return res.data;
};

export const deleteNoti = async id => {
  const res = await axios.delete(`${API_URL_BACK_END}/noti/delete/${id}`);
  return res.data;
};
