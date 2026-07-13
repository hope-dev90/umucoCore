import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginPage from '../components/LoginPage';
import LoginWelcomeModal from '../components/LoginWelcomeModal';

export default function Login() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNavigate = (view) => {
    setLeaving(true);
    setTimeout(() => {
      if (view === 'signup') navigate('/signup');
      else if (view === 'home') navigate('/');
      else if (view === 'dashboard') navigate('/dashboard');
    }, 250);
  };

  return (
    <div className={`transition-all duration-250 ${leaving ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
      {showWelcomeModal && (
        <LoginWelcomeModal
          onMaybeLater={() => setShowWelcomeModal(false)}
          onLogin={() => setShowWelcomeModal(false)}
          onCreateAccount={() => handleNavigate('signup')}
        />
      )}

      <LoginPage onNavigate={handleNavigate} />
    </div>
  );
}
