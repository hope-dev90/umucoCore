import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setLoading(false); // Ensure loading ends after 1 second max
    }, 1000);

    const token = localStorage.getItem('token');
    if (!token) {
      clearTimeout(timeoutId); // Clear timeout if no token, we don't need to wait
      setLoading(false);
      return;
    }
    // Always fetch fresh user from server — never trust stale localStorage user object
    fetch('http://localhost:5000/auth/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (r.status === 401) return Promise.reject('unauthorized');
        return r.ok ? r.json() : Promise.reject('server_error');
      })
      .then(data => {
        if (data.user) {
          // Restore locally-stored profileImage since it's not persisted to the backend
          const cached = localStorage.getItem('user');
          let localProfileImage = null;
          if (cached) {
            try { localProfileImage = JSON.parse(cached)?.profileImage || null; } catch (_) {}
          }
          const merged = { ...data.user, profileImage: localProfileImage || data.user.avatar || null };
          setUser(merged);
          localStorage.setItem('user', JSON.stringify(merged));
        } else {
          localStorage.removeItem('token');
        }
      })
      .catch((reason) => {
        // Only clear the token if the server explicitly rejected it (401)
        // Network errors / server down → keep the token and use cached user
        if (reason === 'unauthorized') {
          localStorage.removeItem('token');
        } else {
          // Server unreachable — restore from cached user so the page doesn't disappear
          const cached = localStorage.getItem('user');
          if (cached) {
            try { setUser(JSON.parse(cached)); } catch (_) { localStorage.removeItem('token'); }
          } else {
            localStorage.removeItem('token');
          }
        }
      })
      .finally(() => {
        clearTimeout(timeoutId); // Clear timeout if fetch finishes before 1 sec
        setLoading(false);
      });
  }, []);

  const updateUser = useCallback((newUser) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...newUser };
      // Check if anything actually changed
      const hasChanges = JSON.stringify(prevUser) !== JSON.stringify(updatedUser);
      if (hasChanges) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      return prevUser; // No changes, return previous to avoid re-render
    });
  }, []);

  const login = useCallback(async (email, password) => {
    const response = await fetch('http://localhost:5000/auth/login', {
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

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const register = useCallback(async (name, email, password, explorerType) => {
    const response = await fetch('http://localhost:5000/auth/register', {
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
    const response = await fetch('http://localhost:5000/auth/google', {
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

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    googleLogin,
    logout,
    updateUser,
  }), [user, loading, login, register, googleLogin, logout, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
