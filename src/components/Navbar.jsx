import React, { useState } from 'react';
import { ArrowRight, Globe, Menu, X } from 'lucide-react';
import UmucoLogo from './UmucoLogo';

function Navbar({ onNavigate, activeSection }) {
  const [currentLang, setCurrentLang] = useState('EN');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Home', id: '#home-section' },
    { label: 'About', id: '#archive' },
    { label: 'Community', id: '#community' }
  ];

  const toggleLanguage = (lang) => {
    setCurrentLang(lang);
    setIsDropdownOpen(false);
  };

  const handleMobileNavClick = (view, sectionId) => {
    setIsMobileMenuOpen(false);
    onNavigate(view);
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId.replace('#', ''));
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <header className="w-full bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#EADBC8] px-4 md:px-6 py-3 font-sans shadow-sm fixed top-0 left-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        <div onClick={() => handleMobileNavClick('home', '#home-section')} className="flex items-center space-x-2 cursor-pointer">
      <UmucoLogo style={{ width: 36, height: 36, minWidth:36, maxWidth:36, overflow: 'hidden', borderRadius: '50%',  display:'block' }} />
      <span className="text-[18px] font-bold tracking-wide text-[#8D493A]">UmucoCore</span>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeSection === item.label;
            return (
              <a
                key={item.label}
                href={item.id}
                className={`relative pb-2 transition-colors duration-200 ${
                  isActive 
                    ? 'text-[#8D493A] font-semibold' 
                    : 'text-[#6F5B55] hover:text-[#8D493A]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#8D493A] animate-fadeIn" />
                )}
              </a>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center space-x-6">
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-1.5 text-sm font-semibold text-[#8D493A] hover:text-[#6f5b55] transition-colors tracking-wide focus:outline-none"
            >
              <Globe size={18} />
              <span className="text-xs uppercase font-bold">{currentLang}</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-[#FDFBF7] border border-[#EADBC8] rounded-xl shadow-lg py-1 z-50 animate-fadeIn">
                {currentLang === 'EN' ? (
                  <button
                    onClick={() => toggleLanguage('KN')}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-[#6F5B55] hover:bg-[#FCDFD3]/30 hover:text-[#8D493A] transition-colors"
                  >
                    Kinyarwanda
                  </button>
                ) : (
                  <button
                    onClick={() => toggleLanguage('EN')}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-[#6F5B55] hover:bg-[#FCDFD3]/30 hover:text-[#8D493A] transition-colors"
                  >
                    English
                  </button>
                )}
              </div>
            )}
          </div>

          <button 
            onClick={() => onNavigate('login')}
            className="text-sm font-medium text-[#8D493A] hover:text-[#6f5b55] transition-colors"
          >
            Login
          </button>

          <button 
            onClick={() => onNavigate('signup')}
            className="flex items-center space-x-2 bg-[#8D493A] hover:bg-[#3E2723] text-[#FDFBF7] px-5 py-2 text-sm font-medium tracking-wide transition-all rounded-[25px] shadow-sm group"
          >
            <span>Join</span>
            <ArrowRight className="w-4 h-4 transform transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div className="flex md:hidden items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-[#8D493A] hover:text-[#3E2723] p-1 focus:outline-none"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-[57px] bg-[#FDFBF7] border-b border-[#EADBC8] shadow-xl z-40 animate-fadeIn flex flex-col px-6 py-6 space-y-6 max-h-[calc(100vh-57px)] overflow-y-auto">
          <nav className="flex flex-col space-y-4">
            {navItems.map((item) => {
              const isActive = activeSection === item.label;
              return (
                <a
                  key={item.label}
                  href={item.id}
                  onClick={() => handleMobileNavClick('home', item.id)}
                  className={`text-base font-semibold py-2 border-b border-[#EADBC8]/30 ${
                    isActive ? 'text-[#8D493A]' : 'text-[#6F5B55]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center justify-between py-2 border-b border-[#EADBC8]/30">
            <span className="text-sm font-medium text-[#6F5B55]">Language / Ururimi</span>
            <div className="flex space-x-2">
              <button
                onClick={() => toggleLanguage('EN')}
                className={`px-3 py-1 text-xs font-bold rounded-lg ${
                  currentLang === 'EN' ? 'bg-[#8D493A] text-white' : 'border border-[#EADBC8] text-[#6F5B55]'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => toggleLanguage('KN')}
                className={`px-3 py-1 text-xs font-bold rounded-lg ${
                  currentLang === 'KN' ? 'bg-[#8D493A] text-white' : 'border border-[#EADBC8] text-[#6F5B55]'
                }`}
              >
                KN
              </button>
            </div>
          </div>

          <div className="flex flex-col space-y-3 pt-2">
            <button
              onClick={() => handleMobileNavClick('login', null)}
              className="w-full text-center border border-[#8D493A] text-[#8D493A] font-semibold py-3 rounded-xl text-sm hover:bg-[#8D493A]/5 transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => handleMobileNavClick('signup', null)}
              className="w-full text-center bg-[#8D493A] hover:bg-[#3E2723] text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center space-x-2 shadow-sm"
            >
             <span className="font-bold tracking-wider">
  <span className="text-xs text-[#FCDFD3]">Umuco</span>
  <span className="text-[10px] text-[#FDFBF7]/70">Core</span>
</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;