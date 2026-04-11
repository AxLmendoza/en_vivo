import { create } from 'zustand';
import AsyncStorage from 'expo-secure-store';
import { authAPI } from '@/services/api';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user, token } = response.data;

      // Store token
      await AsyncStorage.setItem('token', token);

      set({ user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Continue logout even if API call fails
    } finally {
      await AsyncStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  checkAuth: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        const response = await authAPI.getProfile();
        set({ user: response.data, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      await AsyncStorage.removeItem('token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...userData } });
    }
  },
}));