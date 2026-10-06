import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../shared/types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  loginAsDemoRole: (role: UserRole) => Promise<UserProfile>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  unreadCount: number;
  decrementUnread: () => void;
  audioEnabled: boolean;
  setAudioEnabled: (val: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('rescuos_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  const initAuth = async () => {
    const savedToken = localStorage.getItem('rescuos_token');
    if (!savedToken) {
      // Default to demo citizen on first load for friction-free judge experience
      try {
        const res = await authApi.login('citizen@rescuos.demo', 'DemoPassword123!');
        localStorage.setItem('rescuos_token', res.token);
        setToken(res.token);
        setUser(res.user);
      } catch (e) {
        // ignore
      }
      setIsLoading(false);
      return;
    }

    try {
      const data = await authApi.getMe();
      setUser(data.user);
      setUnreadCount(data.unreadNotifications || 0);
    } catch (err) {
      console.warn('Session restoration failed:', err);
      // Fallback demo citizen login
      try {
        const res = await authApi.login('citizen@rescuos.demo', 'DemoPassword123!');
        localStorage.setItem('rescuos_token', res.token);
        setToken(res.token);
        setUser(res.user);
      } catch {
        localStorage.removeItem('rescuos_token');
        setToken(null);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem('rescuos_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemoRole = async (role: UserRole) => {
    setIsLoading(true);
    let email = 'citizen@rescuos.demo';
    if (role === 'RESPONDER') email = 'responder@rescuos.demo';
    if (role === 'ADMIN') email = 'admin@rescuos.demo';

    try {
      const res = await authApi.login(email, 'DemoPassword123!');
      localStorage.setItem('rescuos_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('rescuos_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const data = await authApi.getMe();
      setUser(data.user);
      setUnreadCount(data.unreadNotifications || 0);
    } catch (e) {
      // ignore
    }
  };

  const decrementUnread = () => {
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginAsDemoRole,
        logout,
        refreshUser,
        unreadCount,
        decrementUnread,
        audioEnabled,
        setAudioEnabled,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
