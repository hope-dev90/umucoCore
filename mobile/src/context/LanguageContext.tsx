import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import { updateProfile } from '../services/userService';
import {
  mapLanguageFromDb,
  mapLanguageToDb,
  translate,
} from '../utils/localization';
import type { LanguageCode } from '../types';

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  t: (key: string, params?: Record<string, string | number>) => string;
  isSaving: boolean;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);
const LANG_KEY = 'umuco_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useAuth();
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(LANG_KEY);
      if (stored === 'en' || stored === 'rw' || stored === 'fr') {
        setLanguageState(stored);
      }
    })();
  }, []);

  useEffect(() => {
    if (user?.language) {
      setLanguageState(mapLanguageFromDb(user.language));
    }
  }, [user?.language]);

  const setLanguage = useCallback(
    async (newLang: LanguageCode) => {
      setLanguageState(newLang);
      await AsyncStorage.setItem(LANG_KEY, newLang);
      if (user?.id) {
        setIsSaving(true);
        try {
          await updateProfile({ language: mapLanguageToDb(newLang) });
          updateUser({ language: mapLanguageToDb(newLang) });
        } catch {
          // keep local preference even if sync fails
        } finally {
          setIsSaving(false);
        }
      }
    },
    [user?.id, updateUser]
  );

  const t = useCallback(
    (key: string, params?: Record<string, string | number>) =>
      translate(language, key, params),
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, t, isSaving }),
    [language, setLanguage, t, isSaving]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
