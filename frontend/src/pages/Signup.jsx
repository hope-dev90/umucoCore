import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SignUpPage from '../components/AuthPage';

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleNavigate = (view) => {
    setLeaving(true);
    setTimeout(() => {
      if (view === 'login') navigate('/login');
      else if (view === 'home') navigate('/');
      else if (view === 'dashboard') navigate('/dashboard', { state: location.state });
    }, 250);
  };

  return (
    <div className={`transition-all duration-250 ${leaving ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
      <SignUpPage onNavigate={handleNavigate} />
    </div>
  );
}
