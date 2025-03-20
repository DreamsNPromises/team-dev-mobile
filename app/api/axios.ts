import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: 'https://absences-api.orexi4.ru/api',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getProfile = async () => {
  try {
    const response = await api.get('/account/profile');
    console.log(response.data)
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAbsences = async (params: { [key: string]: any }) => {
  try {
    const response = await api.get('/api/absences', { params });
    return response.data.absences;
  } catch (error) {
    console.error('Ошибка при получении заявок:', error);
    throw error;
  }
};

export default api;