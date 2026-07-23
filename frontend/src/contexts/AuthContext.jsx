import React, { createContext, useState, useEffect, useContext, useMemo, useCallback } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper functions to store/retrieve profile image per user (keyed by email)
  const getStoredProfileImageKey = (email) => `profile_image_${email?.toLowerCase()}`;

  const storeProfileImage = (email, imageData) => {
    if (email && imageData) {
      localStorage.setItem(getStoredProfileImageKey(email), imageData);
    }
  };

  const getStoredProfileImage = (email) => {
    if (!email) return null;
    return localStorage.getItem(getStoredProfileImageKey(email)) || null;
  };

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
          // Restore locally-stored profileImage (per user email)
          const localProfileImage = getStoredProfileImage(data.user.email);
          // Prepend backend URL to avatar path if it's a relative path
          const avatarUrl = data.user.avatar && !data.user.avatar.startsWith('http') 
            ? `http://localhost:5000${data.user.avatar}` 
            : data.user.avatar;
          const merged = { 
            ...data.user, 
            profileImage: localProfileImage || avatarUrl || null 
          };
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
        // If profileImage changed and we have an email, store it separately
        if (updatedUser.email && updatedUser.profileImage) {
          storeProfileImage(updatedUser.email, updatedUser.profileImage);
        }
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

    // Restore stored profile image for this user email
    const localProfileImage = getStoredProfileImage(data.user.email);
    // Prepend backend URL to avatar path if it's a relative path
    const avatarUrl = data.user.avatar && !data.user.avatar.startsWith('http') 
      ? `http://localhost:5000${data.user.avatar}` 
      : data.user.avatar;
    const mergedUser = {
      ...data.user,
      profileImage: localProfileImage || avatarUrl || null
    };

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(mergedUser));
    setUser(mergedUser);
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

    // For new registrations, no existing profile image yet, but future updates will store it
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

    // Restore stored profile image for this user email
    const localProfileImage = getStoredProfileImage(data.user.email);
    // Prepend backend URL to avatar path if it's a relative path
    const avatarUrl = data.user.avatar && !data.user.avatar.startsWith('http') 
      ? `http://localhost:5000${data.user.avatar}` 
      : data.user.avatar;
    const mergedUser = {
      ...data.user,
      profileImage: localProfileImage || avatarUrl || null
    };

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(mergedUser));
    setUser(mergedUser);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear riddle preferences and state for new user
    localStorage.removeItem('riddlePreference');
    localStorage.removeItem('riddleShownIds');
    localStorage.removeItem('riddlePaused');
    // Clear read proverbs from localStorage (just in case, since we now use backend)
    localStorage.removeItem('readProverbs');
    // DO NOT remove profile_image_* keys! They stay so they survive logout/login
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
