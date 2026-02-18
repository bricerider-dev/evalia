import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';
import { login } from '@/api/login';
import { getEnseignant, getEnseignants } from '@/api/enseignant';
import { getEtudiants } from '@/api/etudiant';

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
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem('user');
    console.log("AuthContext: Checking localStorage for user...");
    console.log("Stored user:", storedUser);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log("AuthContext: User found in localStorage:", parsedUser);
      setUser(parsedUser);
    } else {
      console.log("AuthContext: No user in localStorage");
    }
    setIsLoading(false);
  }, []);

  const signIn = async (matricule: string, password: string): Promise<boolean> => {
    try {
      const authenticatedUser = await login(matricule, password);
      console.log('Authenticated User:', authenticatedUser);
      
      if (!authenticatedUser) {
        return false;
      }

      // Store basic user info
      setUser(authenticatedUser);
      localStorage.setItem('user', JSON.stringify(authenticatedUser));

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');    
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
