import axios from 'axios';

const API_URL = 'http://localhost:8000';  

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const login = (username: string, password: string) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  return api.post('/token', formData, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
};

export const register = (username: string, email: string, password: string) =>
  api.post('/register', { username, email, password });

export const searchMedia = (query: string, mediaType: number) =>
  api.get(`/bangumi/search/${mediaType}/${query}`);

export const addMedia = (bangumiId: number) =>
  api.post(`/bangumi/add/${bangumiId}`);

export const getUserMedia = () =>
  api.get('/media/getAll');

export default api;
