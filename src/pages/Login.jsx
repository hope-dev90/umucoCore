import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginPage from '../components/LoginPage';

export default function Login() {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    window.scrollTo(0, 0);
  }, []);

  const handleNavigate = (view) => {
    setVisible(false);
    setTimeout(() => {
      if (view === 'signup') navigate('/signup');
      else if (view === 'home') navigate('/');
      else if (view === 'dashboard') navigate('/dashboard');
    }, 100);
  };

  return (
    <div className={`transition-opacity duration-150 ease-out ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <LoginPage onNavigate={handleNavigate} />
    </div>
  );
}