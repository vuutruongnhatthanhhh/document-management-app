import axios from 'axios';
import {API_URL_BACK_END} from '@env';

export const getRoleById = async id => {
  const res = await axios.get(`${API_URL_BACK_END}/role/${id}`);
  return res.data;
};

export const getAllRole = async () => {
  const res = await axios.get(`${API_URL_BACK_END}/role/`);
  return res.data;
};
