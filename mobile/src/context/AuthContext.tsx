import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as authService from '../services/authService';
import { getToken } from '../services/api';
import type { ExplorerType, User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    explorerType?: ExplorerType | string
  ) => Promise<{ message?: string }>;
  verifyEmail: (email: string, otp: string) => Promise<void>;
  resendOtp: (email: string) => Promise<void>;
  googleLogin: (idToken: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<{ message?: string }>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
  getToken: () => Promise<string | null>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    const token = await getToken();
    if (!token) {
      setUser(null);
      return;
    }
    const profile = await authService.fetchProfile();
    if (profile) setUser(profile);
    else {
      await authService.logout();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        if (!token) {
          if (!cancelled) setLoading(false);
          return;
        }
        const profile = await authService.fetchProfile();
        if (!cancelled) {
          if (profile) setUser(profile);
          else await authService.logout();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: next } = await authService.login(email, password);
    setUser(next);
  }, []);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      explorerType?: ExplorerType | string
    ) => authService.register(name, email, password, explorerType),
    []
  );

  const verifyEmail = useCallback(async (email: string, otp: string) => {
    const { user: next } = await authService.verifyEmail(email, otp);
    setUser(next);
  }, []);

  const resendOtp = useCallback(async (email: string) => {
    await authService.resendOtp(email);
  }, []);

  const googleLogin = useCallback(async (idToken: string) => {
    const { user: next } = await authService.googleLogin(idToken);
    setUser(next);
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    return authService.forgotPassword(email);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      verifyEmail,
      resendOtp,
      googleLogin,
      forgotPassword,
      logout,
      updateUser,
      getToken,
      refreshProfile,
    }),
    [
      user,
      loading,
      login,
      register,
      verifyEmail,
      resendOtp,
      googleLogin,
      forgotPassword,
      logout,
      updateUser,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
