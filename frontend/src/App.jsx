import React from 'react';
import { MemoryRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './styles/global.css';
import './styles/publicJourney.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { GamificationProvider } from './contexts/GamificationContext';
import { RewardToastContainer } from './components/Gamification/RewardToastContainer';
import UmucoLogo from './components/UmucoLogo';
import ChatWidget from './components/ChatWidget';

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
import Profile     from './pages/Profile';
import History     from './pages/History';

// Redirect logged-in users away from public-only routes - NO LOADING SCREEN
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return children; // Show landing page immediately instead of loading
  return user ? <Navigate to="/dashboard" replace /> : children;
}

// Redirect logged-out users away from protected routes
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh', 
      background: '#FDFBF7' 
    }}>
      <div style={{
        animation: 'spin 1s linear infinite',
        width: '80px',
        height: '80px'
      }}>
        <UmucoLogo />
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

// Only render the chat widget when a user is logged in
function ChatWidgetGate() {
  const { user } = useAuth();
  return user ? <ChatWidget /> : null;
}

export default function App() {
  const googleClientId = "829742825170-qu62f7f662o16iv6hcpgcep8g80fotb9.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <AuthProvider>
        <GamificationProvider>
          <LanguageProvider>
            <Router>
              <Routes>
                {/* Public — redirect to dashboard if already logged in */}
                <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

                {/* Protected */}
                <Route path="/dashboard"   element={<PrivateRoute><Home /></PrivateRoute>} />
                <Route path="/explore"     element={<PrivateRoute><Explore /></PrivateRoute>} />
                <Route path="/listen"      element={<PrivateRoute><Listen /></PrivateRoute>} />
                <Route path="/videos"      element={<PrivateRoute><Videos /></PrivateRoute>} />
                <Route path="/collections" element={<PrivateRoute><Collections /></PrivateRoute>} />
                <Route path="/kwibuka"     element={<PrivateRoute><Kwibuka /></PrivateRoute>} />
                <Route path="/intl-days"   element={<PrivateRoute><IntlDays /></PrivateRoute>} />
                <Route path="/contribute"  element={<PrivateRoute><Contribute /></PrivateRoute>} />
                <Route path="/saved"       element={<PrivateRoute><Saved /></PrivateRoute>} />
                <Route path="/history"     element={<PrivateRoute><History /></PrivateRoute>} />
                <Route path="/settings"    element={<PrivateRoute><Settings /></PrivateRoute>} />
                <Route path="/profile"     element={<PrivateRoute><Profile /></PrivateRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <RewardToastContainer />
              {/* Global floating chat widget — only shown to authenticated users */}
              <ChatWidgetGate />
            </Router>
          </LanguageProvider>
        </GamificationProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}
