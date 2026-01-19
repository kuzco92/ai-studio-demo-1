
export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export enum Category {
  WORK = 'WORK',
  PERSONAL = 'PERSONAL',
  HEALTH = 'HEALTH',
  URGENT = 'URGENT'
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  category: Category;
  createdAt: number;
}

export interface ProductivityData {
  day: string;
  count: number;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  username: string;
  password?: string; // Only stored in local storage mock-up
  role: UserRole;
  createdAt: number;
}
