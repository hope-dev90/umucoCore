import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiUrl, assetUrl } from '../config/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Clear stored data on initial load, but keep the token if it exists
  // (same behavior as the web version's localStorage.clear() dance).
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('token');
      await AsyncStorage.clear();
      if (token) {
        await AsyncStorage.setItem('token', token);
      }
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timeoutId = setTimeout(() => {
      if (!cancelled) setLoading(false); // Ensure loading ends after 1 second max
    }, 1000);

    (async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        clearTimeout(timeoutId);
        setLoading(false);
        return;
      }
      // Always fetch fresh user from server
      try {
        const r = await fetch(apiUrl('/auth/profile'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (r.status === 401) throw new Error('unauthorized');
        if (!r.ok) throw new Error('server_error');
        const data = await r.json();
        if (data.user) {
          // Prepend backend URL to avatar path if it's a relative path
          const avatarUrl = assetUrl(data.user.avatar);
          const merged = {
            ...data.user,
            profileImage: avatarUrl || null,
          };
          if (!cancelled) setUser(merged);
        } else {
          await AsyncStorage.removeItem('token');
        }
      } catch (reason) {
        if (reason && reason.message === 'unauthorized') {
          await AsyncStorage.removeItem('token');
        }
      } finally {
        clearTimeout(timeoutId);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateUser = useCallback((newUser) => {
    setUser((prevUser) => {
      const updatedUser = { ...prevUser, ...newUser };
      return updatedUser;
    });
  }, []);

  const getToken = useCallback(() => {
    return AsyncStorage.getItem('token');
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await fetch(apiUrl('/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Prepend backend URL to avatar path if it's a relative path
    const avatarUrl = assetUrl(data.user.avatar);
    const mergedUser = {
      ...data.user,
      profileImage: avatarUrl || null,
    };

    await AsyncStorage.setItem('token', data.token);
    setUser(mergedUser);
    return { success: true, user: mergedUser };
  }, []);

  const register = useCallback(async (name, email, password, explorerType) => {
    const response = await fetch(apiUrl('/auth/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password, explorerType }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  }, []);

  const googleLogin = useCallback(async (idToken) => {
    const response = await fetch(apiUrl('/auth/google'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Google login failed');
    }

    // Prepend backend URL to avatar path if it's a relative path
    const avatarUrl = assetUrl(data.user.avatar);
    const mergedUser = {
      ...data.user,
      profileImage: avatarUrl || null,
    };

    await AsyncStorage.setItem('token', data.token);
    setUser(mergedUser);
    return { success: true, user: mergedUser };
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.clear();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      googleLogin,
      logout,
      updateUser,
      getToken,
    }),
    [user, loading, login, register, googleLogin, logout, updateUser, getToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
}
