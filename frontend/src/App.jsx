import React from 'react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './styles/global.css';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';

import Landing     from './pages/Landing';
import Login       from './pages/Login';
import Signup      from './pages/Signup';
import Home        from './pages/Home';
import Explore     from './pages/Explore';
import Listen      from './pages/Listen';
import Videos      from './pages/Videos';
import Collections from './pages/Collections';
import Kwibuka     from './pages/Kwibuka';
import IntlDays    from './pages/Intldays';
import Contribute  from './pages/Contribute';
import Saved       from './pages/Saved';
import Settings    from './pages/Settings';
import Profile     from './pages/Profile';    // ← separate component
import History     from './pages/History';    // ← separate component

export default function App() {
  // Replace with your actual Google Client ID from Google Cloud Console
  const googleClientId = "829742825170-qu62f7f662o16iv6hcpgcep8g80fotb9.apps.googleusercontent.com";
  
  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <LanguageProvider>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              {/* Public */}
              <Route path="/"        element={<Landing />} />
              <Route path="/login"   element={<Login />} />
              <Route path="/signup"  element={<Signup />} />

              {/* App — dashboard is your Home, not Landing */}
              <Route path="/dashboard"    element={<Home />} />
              <Route path="/explore"      element={<Explore />} />
              <Route path="/listen"       element={<Listen />} />
              <Route path="/videos"       element={<Videos />} />
              <Route path="/collections"  element={<Collections />} />
              <Route path="/kwibuka"      element={<Kwibuka />} />
              <Route path="/intl-days"    element={<IntlDays />} />
              <Route path="/contribute"   element={<Contribute />} />
              <Route path="/saved"        element={<Saved />} />
              <Route path="/history"      element={<History />} />   {/* ← own page */}
              <Route path="/settings"     element={<Settings />} />
              <Route path="/profile"      element={<Profile />} />   {/* ← own page */}

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </MemoryRouter>
        </LanguageProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
