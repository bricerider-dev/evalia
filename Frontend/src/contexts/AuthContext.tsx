import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';
import { authenticateUser, getCurrentUser, setCurrentUser, initializeStorage, getUserById } from '@/lib/storage';
import { login } from '@/api/login';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (matricule: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize storage with default data
    initializeStorage();

    // Check for existing session
    const storedUser = getCurrentUser();
    if (storedUser) {
      const fullUser = getUserById(storedUser.id);
      if (fullUser) {
        setUser(fullUser);
      }
    }
    setIsLoading(false);
  }, []);

  const signIn = async (matricule: string, password: string): Promise<boolean> => {
    const authenticatedUser = await login(matricule, password);
    if (authenticatedUser) {
      setUser(authenticatedUser);
      setCurrentUser(authenticatedUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login: signIn, logout }}>
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
