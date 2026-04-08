// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
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
  dueDate?: Date;
  projectId: string;
  userId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  aiInsights?: AIInsight[];
  project?: Project;
  timeEntries?: TimeEntry[];
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
  createdAt: Date;
  updatedAt: Date;
  tasks?: Task[];
}

// Time Tracking Types
export interface TimeEntry {
  id: string;
  taskId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  note?: string;
  createdAt: Date;
}

// AI Types
export interface AIInsight {
  id: string;
  type: 'priority' | 'prediction' | 'suggestion';
  content: string;
  taskId?: string;
  userId: string;
  confidence: number;
  createdAt: Date;
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

// Form Types
export interface TaskFormData {
  title: string;
  description?: string;
  priority: Priority;
  estimatedHours?: number;
  dueDate?: Date;
  projectId: string;
  tags: string[];
}

export interface ProjectFormData {
  name: string;
  description?: string;
  color: string;
}

// Chart Data Types
export interface ProductivityData {
  date: string;
  completed: number;
  planned: number;
  efficiency: number;
}

export interface PriorityDistribution {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

// Auth Types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Session {
  user: AuthUser;
  expires: Date;
  token: string;
}