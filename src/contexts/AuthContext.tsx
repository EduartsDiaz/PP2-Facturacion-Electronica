import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AuthSession } from '../types';
import authService from '../services/auth/authService';

interface AuthCtx {
  session: AuthSession | null;
  login: (username: string, password: string) => AuthSession | null;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => authService.getSession());

  const login = useCallback((username: string, password: string): AuthSession | null => {
    const s = authService.login(username, password);
    setSession(s);
    return s;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setSession(null);
  }, []);

  return (
    <AuthContext.Provider value={{ session, login, logout, isAuthenticated: !!session }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
