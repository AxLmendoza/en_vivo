// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  notifications: NotificationSettings;
  productivity: ProductivitySettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  taskReminders: boolean;
  dailyDigest: boolean;
}

export interface ProductivitySettings {
  workHours: {
    start: string;
    end: string;
    timezone: string;
  };
  defaultPriority: 'low' | 'medium' | 'high' | 'critical';
  autoArchiveCompleted: boolean;
}

// Task Types
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  projectId: string;
  userId: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'todo' | 'in_progress' | 'completed' | 'blocked';

// Project Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// Time Tracking Types
export interface TimeEntry {
  id: string;
  taskId: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  note?: string;
  createdAt: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}