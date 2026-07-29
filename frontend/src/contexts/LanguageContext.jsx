import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { translations } from '../translations';
import { useAuth } from './AuthContext';
import { API_BASE } from '../config/api';

const LanguageContext = createContext();

const mapLanguageCode = (lang) => {
  // Map between frontend codes ('en', 'rw', 'fr') and database values ('English (UK)', etc.)
  const codeToDb = {
    'en': 'English (UK)',
    'rw': 'Kinyarwanda',
    'fr': 'French (France)'
  };
  const dbToCode = {
    'English (UK)': 'en',
    'Kinyarwanda': 'rw',
    'French (France)': 'fr'
  };
  if (codeToDb[lang]) return codeToDb[lang];
  if (dbToCode[lang]) return dbToCode[lang];
  return 'en';
};

export function LanguageProvider({ children }) {
  const { user, updateUser } = useAuth();
  const [language, setLanguageState] = useState('en');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize language from user data when available
  useEffect(() => {
    if (user?.language) {
      const code = mapLanguageCode(user.language);
      setLanguageState(code);
    }
  }, [user?.language]);

  const setLanguage = useCallback(async (newLang) => {
    setLanguageState(newLang);
    if (user?.id) {
      setIsSaving(true);
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_BASE}/api/users/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            language: mapLanguageCode(newLang)
          })
        });
        updateUser({ language: mapLanguageCode(newLang) });
      } catch (err) {
        console.error('Failed to save language preference:', err);
      } finally {
        setIsSaving(false);
      }
    }
  }, [user, updateUser]);

  const t = (key) => {
    return translations[language]?.[key] || translations.en?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isSaving }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
