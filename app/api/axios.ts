import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('Не авторизован. Перенаправляем на логин.');

      localStorage.removeItem('accessToken');
      router.replace("/login");

      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export const getProfile = async () => {
  try {
    const response = await api.get('/account/profile');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAbsences = async (params: { [key: string]: any }) => {
  try {
    const response = await api.get('/absences', { params });
    console.log(response.data)
    return response.data.absences;
  } catch (error) {
    console.error('Ошибка при получении заявок:', error);
    throw error;
  }
};

export const createAbsenceRequest = async (requestData: {
  type: string;
  startDate: string;
  endDate: string;
  declarationToDean: boolean;
  attachment?: any;
}) => {
  const formData = new FormData();

  formData.append('Type', requestData.type);
  formData.append('StartDate', new Date(requestData.startDate).toISOString());
  formData.append('EndDate', new Date(requestData.endDate).toISOString());
  formData.append('DeclarationToDean', requestData.declarationToDean.toString());

  if (requestData.attachment) {
    formData.append('Attachment', {
      uri: requestData.attachment.uri,
      type: requestData.attachment.mimeType || 'application/octet-stream',
      name: requestData.attachment.name || 'file',
    } as any);
  }

  try {
    const response = await api.post('/absences', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Ошибка при создании заявки:', error);
    throw error;
  }
};

export const getAbsenceById = async (id: string) => {
  try {
    const response = await api.get(`/absences/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении заявки ${id}:`, error);
    throw error;
  }
};

export const updateAbsenceRequest = async (id: string, requestData: {
  type: string;
  startDate: string;
  endDate: string;
  declarationToDean: boolean;
  attachment?: any;
}) => {
  const formData = new FormData();

  formData.append('Type', requestData.type);
  formData.append('StartDate', new Date(requestData.startDate).toISOString());
  formData.append('EndDate', new Date(requestData.endDate).toISOString());
  formData.append('DeclarationToDean', requestData.declarationToDean.toString());

  if (requestData.attachment) {
    formData.append('Attachment', {
      uri: requestData.attachment.uri,
      type: requestData.attachment.mimeType || 'application/octet-stream',
      name: requestData.attachment.name || 'file',
    } as any);
  }

  try {
    const response = await api.put(`/absences/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error(`Ошибка при обновлении заявки ${id}:`, error);
    throw error;
  }
};

export default api;