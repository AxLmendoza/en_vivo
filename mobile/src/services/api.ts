import axios from 'axios';
import AsyncStorage from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token on unauthorized
      await AsyncStorage.removeItem('token');
      // TODO: Navigate to login screen
    }
    return Promise.reject(error);
  }
);

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  projectId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  progress: number;
  taskCount: number;
  completedTasks: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Auth API
export const authAPI = {
  login: (data: LoginData) => api.post('/auth/login', data),
  register: (data: RegisterData) => api.post('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  refreshToken: () => api.post('/auth/refresh'),
};

// Tasks API
export const tasksAPI = {
  getTasks: (params?: {
    projectId?: string;
    status?: string;
    priority?: string;
    search?: string;
  }) => api.get('/tasks', { params }),
  getTask: (id: string) => api.get(`/tasks/${id}`),
  createTask: (data: Partial<Task>) => api.post('/tasks', data),
  updateTask: (id: string, data: Partial<Task>) => api.put(`/tasks/${id}`, data),
  deleteTask: (id: string) => api.delete(`/tasks/${id}`),
  toggleTaskStatus: (id: string) => api.patch(`/tasks/${id}/toggle`),
};

// Projects API
export const projectsAPI = {
  getProjects: () => api.get('/projects'),
  getProject: (id: string) => api.get(`/projects/${id}`),
  createProject: (data: Partial<Project>) => api.post('/projects', data),
  updateProject: (id: string, data: Partial<Project>) => api.put(`/projects/${id}`, data),
  deleteProject: (id: string) => api.delete(`/projects/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getTaskStats: () => api.get('/analytics/tasks'),
  getProductivityTrends: () => api.get('/analytics/productivity'),
  getProjectProgress: (projectId: string) => api.get(`/analytics/projects/${projectId}`),
};

export default api;