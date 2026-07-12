import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import DigitalArchive from '../components/Archive';
import Discover from '../components/Discover';
import CommunityGuardian from '../components/Community';
import Footer from '../components/Footer';

export default function Landing() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('Home');
  const [visible, setVisible] = useState(false);

  useEffect(() => { setVisible(true); }, []);

  const handleNavigate = (view) => {
    if (view === 'login') navigate('/login');
    else if (view === 'signup') navigate('/signup');
    else if (view === 'home') navigate('/');
  };

  useEffect(() => {
    const sections = [
      { id: 'home-section', label: 'Home' },
      { id: 'archive', label: 'About' },
      { id: 'discover', label: 'Discover' },
      { id: 'community', label: 'Community' },
    ];
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          const match = sections.find(s => s.id === e.target.id);
          if (match) setActiveSection(match.label);
        }
      }),
      { rootMargin: '-50% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach(s => { const el = document.getElementById(s.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  return (
    <div className={`w-full min-h-screen bg-[#FDFBF7] antialiased scroll-smooth transition-all duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <Navbar onNavigate={handleNavigate} activeSection={activeSection} />
      <div id="home-section"><Hero onNavigate={handleNavigate} /></div>
      <div id="archive" className="scroll-mt-20"><DigitalArchive /></div>
      <div id="discover" className="scroll-mt-20"><Discover onNavigate={handleNavigate} /></div>
      <div id="community" className="scroll-mt-20"><CommunityGuardian onNavigate={handleNavigate} /></div>
      <Footer />
    </div>
  );
}