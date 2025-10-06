'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { get, set, STORAGE_KEYS } from '@/lib/storage/safeStorage';

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'driver';
  passwordHash: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, role: 'admin' | 'driver') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

function hashPassword(email: string, password: string): string {
  // WARNING: Solo por demo, se que esto es como pegarse un tiro en el pie
  return btoa(email + ':' + password);
}

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUsers = () => {
      let users = get<User[]>(STORAGE_KEYS.SAFE_SPEED_USERS) || [];

      if (users.length === 0) {
        const defaultAdmin: User = {
          id: generateId(),
          email: 'admin@fleetsafety.com',
          role: 'admin',
          passwordHash: hashPassword('admin@fleetsafety.com', 'admin123')
        };
        users = [defaultAdmin];
        set(STORAGE_KEYS.SAFE_SPEED_USERS, users);
      }

      return users;
    };

    initializeUsers();

    const currentUserId = localStorage.getItem('fleetsafety_current_user');
    if (currentUserId) {
      const users = get<User[]>(STORAGE_KEYS.SAFE_SPEED_USERS) || [];
      const foundUser = users.find(u => u.id === currentUserId);
      if (foundUser) {
        setUser(foundUser);
      } else {
        localStorage.removeItem('fleetsafety_current_user');
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const users = get<User[]>(STORAGE_KEYS.SAFE_SPEED_USERS) || [];
    const passwordHash = hashPassword(email, password);

    const foundUser = users.find(u =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.passwordHash === passwordHash
    );

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('fleetsafety_current_user', foundUser.id);
      return { success: true };
    } else {
      return { success: false, error: 'Invalid email or password' };
    }
  };

  const register = async (email: string, password: string, role: 'admin' | 'driver'): Promise<{ success: boolean; error?: string }> => {
    const users = get<User[]>(STORAGE_KEYS.SAFE_SPEED_USERS) || [];

    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return { success: false, error: 'User with this email already exists' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }

    const newUser: User = {
      id: generateId(),
      email: email.toLowerCase(),
      role,
      passwordHash: hashPassword(email.toLowerCase(), password)
    };

    const updatedUsers = [...users, newUser];
    set(STORAGE_KEYS.SAFE_SPEED_USERS, updatedUsers);

    setUser(newUser);
    localStorage.setItem('fleetsafety_current_user', newUser.id);

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('fleetsafety_current_user');
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
