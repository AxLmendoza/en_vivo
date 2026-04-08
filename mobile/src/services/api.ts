import axios from 'axios';
import { AsyncStorage } from 'expo-secure-store';
import { API_BASE_URL } from '@env';

const api = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000,
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      AsyncStorage.removeItem('token');
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default api;