// src/api/index.js
import axiosInstance from './axiosInstance'; // Pastikan path ini benar

export const authAPI = {
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  register: (userData) => axiosInstance.post('/auth/register', userData),
  getMe: () => axiosInstance.get('/auth/me'),
  logout: () => axiosInstance.get('/auth/logout'),
};

export const inventoryAPI = {
  getAll: (params = {}) => { 
    return axiosInstance.get('/inventory', { params });
  },
  getById: (id) => axiosInstance.get(`/inventory/${id}`),
  create: (itemData) => axiosInstance.post('/inventory', itemData),
  update: (id, itemData) => axiosInstance.put(`/inventory/${id}`, itemData),
  delete: (id) => axiosInstance.delete(`/inventory/${id}`),
};