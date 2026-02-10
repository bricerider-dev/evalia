import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';
import { login } from '@/api/login';
import { getEnseignant, getEnseignants } from '@/api/enseignant';
import { ca } from 'date-fns/locale';
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
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const signIn = async (matricule: string, password: string): Promise<boolean> => {
    try {
      const authenticatedUser = await login(matricule, password);
      console.log('Authenticated User:', authenticatedUser);
      if (authenticatedUser) {
        setUser(authenticatedUser);
        localStorage.setItem('user', JSON.stringify(authenticatedUser));
        switch (authenticatedUser.role) {
          case 'admin':
          case 'teacher':                    
            const res = await getEnseignants();
            for (const enseignant of res) {
              if (enseignant.user.id === authenticatedUser.id) {
                setUser(enseignant);
                localStorage.setItem('auth_user', JSON.stringify(enseignant.id));
                break;
              }
            }
            break;
          case 'student':
            const etudiants = await getEtudiants();
            for (const etudiant of etudiants) {
              if (etudiant.user.id === authenticatedUser.id) {
                setUser(etudiant);
                localStorage.setItem('auth_user', JSON.stringify(etudiant.id));
                break;
              }
            }
            break;
        }
        return true;
      }
      return false;
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
