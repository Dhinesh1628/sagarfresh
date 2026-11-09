import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { api } from '../api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  googleLogin: (credential: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string; address?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const getSavedToken = () => localStorage.getItem('gomeat_token') || localStorage.getItem('frost_token');
  const [token, setToken] = useState<string | null>(getSavedToken());
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const savedToken = getSavedToken();
      if (savedToken) {
        const currentUser = await api.getCurrentUser();
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.warn('Session expired or not authenticated:', err);
      localStorage.removeItem('gomeat_token');
      localStorage.removeItem('frost_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const data = await api.login(email, password);
    localStorage.setItem('gomeat_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const googleLogin = async (credential: string) => {
    const data = await api.googleLogin(credential);
    localStorage.setItem('gomeat_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string; address?: string }) => {
    const res = await api.register(data);
    localStorage.setItem('gomeat_token', res.token);
    setToken(res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('gomeat_token');
    localStorage.removeItem('frost_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        googleLogin,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
