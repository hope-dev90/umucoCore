import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignUpPage from '../components/AuthPage';

export default function Signup() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    window.scrollTo(0, 0);
  }, []);

  const handleNavigate = (view) => {
    setVisible(false);
    setTimeout(() => {
      if (view === 'login') navigate('/login');
      else if (view === 'home') navigate('/');
      else if (view === 'dashboard') navigate('/dashboard');
    }, 100);
  };

  return (
    <div className={`transition-opacity duration-150 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <SignUpPage onNavigate={handleNavigate} />
    </div>
  );
}