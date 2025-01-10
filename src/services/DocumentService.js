import axios from 'axios';
import {API_URL_BACK_END} from '@env';

export const createDocument = async data => {
  const res = await axios.post(`${API_URL_BACK_END}/document/create`, data);
  return res.data;
};

export const createFolder = async data => {
  const res = await axios.post(
    `${API_URL_BACK_END}/document/createFolder`,
    data,
  );
  return res.data;
};

export const uploadFile = async ({id, uniqueName, selectedFile}) => {
  const formData = new FormData();
  formData.append('file', selectedFile);
  formData.append('id', id);
  formData.append('uniqueName', uniqueName);

  try {
    const res = await axios.post(
      `${API_URL_BACK_END}/document/upload-file`,
      formData,
    );

    return res.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const getAllDocument = async () => {
  const res = await axios.get(`${API_URL_BACK_END}/document/`);
  return res.data;
};

export const updateDocument = async (id, data) => {
  const res = await axios.put(
    `${API_URL_BACK_END}/document/update/${id}`,
    data,
  );

  return res.data;
};

export const hideAndShowDocument = async (id, isHide) => {
  const res = await axios.put(`${API_URL_BACK_END}/document/hideShow/${id}`, {
    isHide,
  });

  return res.data;
};

export const signDocument = async ({id, data}) => {
  const res = await axios.put(`${API_URL_BACK_END}/document/sign/${id}`, data);
  console.log('id', id);
  console.log('data', data);

  return res.data;
};

export const getDocumentByCategory = async id => {
  const res = await axios.get(`${API_URL_BACK_END}/document/category/${id}`);
  return res.data;
};

export const deleteDocument = async id => {
  const res = await axios.delete(`${API_URL_BACK_END}/document/delete/${id}`);
  return res.data;
};

export const deleteFolder = async id => {
  const res = await axios.delete(
    `${API_URL_BACK_END}/document/deleteFolder/${id}`,
  );
  return res.data;
};

export const deleteManyDocument = async ids => {
  const res = await axios.post(`${API_URL_BACK_END}/document/deleteMany`, ids);
  return res.data;
};

export const getDocumentById = async id => {
  const res = await axios.get(`${API_URL_BACK_END}/document/${id}`);
  return res.data;
};

export const getNameMany = async data => {
  const res = await axios.post(
    `${API_URL_BACK_END}/document/getNameMany`,
    data,
  );
  return res.data;
};
