import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../components/LoginPage';
import UmucoLogo from '../components/UmucoLogo';

export default function GovLogin() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const handleNavigate = (view) => {
    if (view === 'signup') navigate('/signup');
    else if (view === 'home') navigate('/');
    else if (view === 'login') navigate('/login');
    else if (view === 'dashboard') navigate('/dashboard');
  };

  const handleLoginSuccess = (userData) => {
    const targetPath = userData.role === 'admin' ? '/admin' : '/dashboard';
    setTimeout(() => navigate(targetPath, { replace: true }), 50);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#FDFBF7' }}>
        <div style={{ width: '80px', height: '80px', animation: 'spin 1s linear infinite' }}>
          <UmucoLogo />
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  return (
    <LoginPage
      onNavigate={handleNavigate}
      onLoginSuccess={handleLoginSuccess}
      isGovLogin={true}
    />
  );
}