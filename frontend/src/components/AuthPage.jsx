import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, Check, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import authLeftBg from '../assets/signup/tra.png';
import authLeftBg2 from '../assets/signup/tra2.png';
import authLeftBg3 from '../assets/signup/tra3.jpg';
import UmucoLogo from './UmucoLogo';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import ExplorerTypeImage from './ExplorerTypeImage';
import { UmucoGlyph } from './UmucoGlyphs';

const EXPLORER_TYPES = [
  {
    id: 'warrior',
    label: 'Warrior',
    tagline: 'Battles, legends & brave deeds',
    adventureTitle: 'Ready your shield, Warrior',
    adventureSubtitle: 'Your saga begins the moment you sign up. Stories of courage, battle and honor await.',
    cta: 'Begin the Battle',
  },
  {
    id: 'nature-lover',
    label: 'Nature Lover',
    tagline: 'Forests, hills & wild places',
    adventureTitle: 'Step into the wild, Nature Lover',
    adventureSubtitle: "Rwanda's hills, forests and rivers are waiting to share their stories with you.",
    cta: 'Start the Trail',
  },
  {
    id: 'royal-historian',
    label: 'Royal Historian',
    tagline: 'Kings, courts & old dynasties',
    adventureTitle: 'Enter the royal court, Historian',
    adventureSubtitle: 'Centuries of kings, courts and dynasties are ready to be uncovered.',
    cta: 'Claim the Throne',
  },
  {
    id: 'folktale-hunter',
    label: 'Folktale Hunter',
    tagline: 'Myths, proverbs & fireside tales',
    adventureTitle: 'Follow the tale, Folktale Hunter',
    adventureSubtitle: 'Myths, proverbs and fireside stories are hidden throughout the archive, waiting to be found.',
    cta: 'Chase the Legend',
  },
  {
    id: 'music-explorer',
    label: 'Music Explorer',
    tagline: 'Rhythms, songs & instruments',
    adventureTitle: 'Follow the rhythm, Music Explorer',
    adventureSubtitle: 'Songs, instruments and rhythms passed down for generations are ready to be heard.',
    cta: 'Strike the First Note',
  },
];

const getExplorerCopy = (t, id, fallback = {}) => ({
  label: t(`explorer.${id}.label`) || fallback.label,
  tagline: t(`explorer.${id}.tagline`) || fallback.tagline,
  adventureTitle: t(`auth.explorer.${id}.title`) || fallback.adventureTitle,
  adventureSubtitle: t(`auth.explorer.${id}.subtitle`) || fallback.adventureSubtitle,
  cta: t(`auth.explorer.${id}.cta`) || fallback.cta,
});

/**
 * Single-choice onboarding modal: "What kind of explorer are you?"
 * Calls onContinue(explorerTypeId) once the person picks a card and taps Continue.
 */
function ExplorerTypeModal({ onContinue }) {
  const { t } = useLanguage();
  const [selected, setSelected] = useState(null);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(44,26,20,0.35)' }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{
          background: 'rgba(253,251,247,0.72)',
          backdropFilter: 'blur(18px)',
          border: '1px solid rgba(234,219,200,0.6)',
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        {/* Header */}
        <div className="px-8 pt-10 pb-2 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: '#8D493A' }}>
            {t('auth.explorer.kicker')}
          </p>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#2C1A14' }}>
            {t('explorerPicker.title')}
          </h1>
          <p className="text-xs" style={{ color: '#6F5B55' }}>
            {t('auth.explorer.subtitle')}
          </p>
        </div>

        {/* Options */}
        <div className="px-6 py-6 space-y-3">
          {EXPLORER_TYPES.map((type) => {
            const isSelected = selected === type.id;
            const copy = getExplorerCopy(t, type.id, type);
            return (
              <button
                key={type.id}
                type="button"
                onClick={() => setSelected(type.id)}
                className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all"
                style={{
                  background: isSelected ? 'rgba(141,73,58,0.10)' : 'rgba(255,255,255,0.5)',
                  border: isSelected ? '2px solid #8D493A' : '1px solid rgba(234,219,200,0.8)',
                }}
              >
                <ExplorerTypeImage type={type.id} label={copy.label} selected={isSelected} size={42} />
                <span className="flex-1">
                  <span className="block text-sm font-bold" style={{ color: '#2C1A14' }}>
                    {copy.label}
                  </span>
                  <span className="block text-xs" style={{ color: '#6F5B55' }}>
                    {copy.tagline}
                  </span>
                </span>
                <span
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{
                    border: `2px solid ${isSelected ? '#8D493A' : '#D9C6BC'}`,
                    background: isSelected ? '#8D493A' : 'transparent',
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-2">
          <button
            type="button"
            disabled={!selected}
            onClick={() => onContinue(selected)}
            className="w-full py-3.5 rounded-xl font-semibold text-xs tracking-widest uppercase transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: '#8D493A', color: '#FFFFFF' }}
          >
            {t('auth.continue')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function VerificationNotice({ email }) {
  const { t } = useLanguage();
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(44,26,20,0.28)', backdropFilter: 'blur(8px)' }}
      role="status"
      aria-live="polite"
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 text-center shadow-2xl"
        style={{
          background: '#FDFBF7',
          border: '1px solid rgba(234,219,200,0.9)',
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        <div
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
          style={{ background: 'rgba(141,73,58,0.10)', color: '#8D493A' }}
        >
          <Mail className="h-5 w-5" />
        </div>
        <h2 className="mb-2 text-base font-bold" style={{ color: '#2C1A14' }}>
          {t('auth.checkEmail')}
        </h2>
        <p className="text-xs leading-relaxed" style={{ color: '#6F5B55' }}>
          {t('auth.receiveVerificationCode')}
          {email ? (
            <>
              {' '}at <span className="font-semibold" style={{ color: '#2C1A14' }}>{email}</span>
            </>
          ) : null}
          .
        </p>
        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#8D493A' }}>
          <span
            className="h-3 w-3 rounded-full border-2 border-current border-t-transparent"
            style={{ animation: 'spin 0.8s linear infinite' }}
          />
          {t('auth.sendingCode')}
        </div>
      </div>
    </div>
  );
}

const getSlides = (t) => [
  {
    src: authLeftBg,
    heading: t('auth.signup.slide.heading1'),
    accent: t('auth.signup.slide.accent1'),
    quote: t('auth.signup.slide.quote1'),
  },
  {
    src: authLeftBg2,
    heading: t('auth.signup.slide.heading2'),
    accent: t('auth.signup.slide.accent2'),
    quote: t('auth.signup.slide.quote2'),
  },
    {
    src: authLeftBg3,
    heading: t('auth.signup.slide.heading3'),
    accent: t('auth.signup.slide.accent3'),
    quote: t('auth.signup.slide.quote3'),
  }
];

function LeftSlideshow() {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const SLIDES = getSlides(t);

  useEffect(() => {
    const timer = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % SLIDES.length);
        setTransitioning(false);
      }, 500);
    }, 3700);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
      {SLIDES.map((s, idx) => (
        <img
          key={idx}
          src={s.src}
          alt=""
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
            opacity: idx === current && !transitioning ? 1 : 0,
            transform:
              idx === current && !transitioning
                ? 'translateY(0px)'
                : transitioning && idx === current
                ? 'translateY(-16px)'
                : 'translateY(24px)',
            zIndex: idx === current ? 1 : 0,
          }}
        />
      ))}

      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.40) 50%, rgba(0,0,0,0.10) 100%)',
          zIndex: 2,
        }}
      />

      <div className="absolute inset-0 flex flex-col justify-end p-12" style={{ zIndex: 3 }}>
        <div
          style={{
            transition: 'opacity 0.6s ease, transform 0.6s ease',
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? 'translateY(10px)' : 'translateY(0px)',
          }}
        >
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            {slide.heading}{' '}
            <span className="text-[#FCDFD3]">{slide.accent}</span>
          </h2>

          <div className="w-16 h-[2px] bg-[#8D493A] mb-6" />

          <p className="text-sm text-gray-200/90 leading-relaxed font-light max-w-sm">
            {slide.quote}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-10">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTransitioning(true);
                setTimeout(() => { setCurrent(idx); setTransitioning(false); }, 400);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                width: idx === current ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                background: idx === current ? '#FCDFD3' : 'rgba(255,255,255,0.35)',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transition: 'width 0.4s ease, background 0.4s ease',
              }}
            />
          ))}
        </div>

        <div className="mt-6 text-xs font-semibold tracking-widest text-white/40">
          {t('auth.slide.footer')}
        </div>
      </div>
    </div>
  );
}

function SignUpPage({ onNavigate }) {
  const [showExplorerModal, setShowExplorerModal] = useState(false);
  const [explorerType, setExplorerType] = useState(null);

  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', termsAccepted: false });
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationNotice, setShowVerificationNotice] = useState(false);
  const [error, setError] = useState('');
  const { register, googleLogin, updateUser } = useAuth();
  const { t } = useLanguage();

  const selectedExplorer = EXPLORER_TYPES.find((type) => type.id === explorerType) || null;
  const selectedExplorerCopy = selectedExplorer ? getExplorerCopy(t, selectedExplorer.id, selectedExplorer) : null;

  const handleExplorerContinue = (typeId) => {
    setExplorerType(typeId);
    setShowExplorerModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCodeChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newCode = [...verificationCode];
    newCode[index] = element.value;
    setVerificationCode(newCode);
    if (element.nextSibling && element.value) element.nextSibling.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !verificationCode[index] && e.target.previousSibling)
      e.target.previousSibling.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newCode = [...verificationCode];
    pasted.split('').forEach((char, i) => { newCode[i] = char; });
    setVerificationCode(newCode);
    // Focus the next empty box or the last one
    const nextIndex = Math.min(pasted.length, 5);
    const inputs = e.target.closest('.flex').querySelectorAll('input');
    if (inputs[nextIndex]) inputs[nextIndex].focus();
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setShowVerificationNotice(true);
    setError('');

    try {
      await register(formData.name, formData.email, formData.password, explorerType);
      setIsVerifying(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setShowVerificationNotice(false);
    }
  };

  const handleCodeSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const code = verificationCode.join('');

    try {
      const response = await fetch('http://localhost:5000/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email, otp: code }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      // Store the token and user in localStorage and AuthContext
      if (data.token && data.user) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        const userToSet = { ...data.user, explorerType: data.user.explorerType || explorerType };
        updateUser(userToSet);
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to resend OTP');
      setResendCooldown(30);
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) { clearInterval(interval); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    setIsLoading(true);
    setError('');

    try {
      await googleLogin(response.credential);
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleFailure = (err) => {
    console.error('Google login error:', err);
    setError('Google login failed. Please try again.');
  };

  if (isSuccess) {
    const explorerInfo = EXPLORER_TYPES.find(type => type.id === explorerType);
    const explorerCopy = explorerInfo ? getExplorerCopy(t, explorerInfo.id, explorerInfo) : null;
    return (
      <div className="youth-auth-shell fixed inset-0 w-full min-h-screen flex items-center justify-center bg-[#FDFBF7]" style={{ fontFamily: 'Poppins, sans-serif' }}>
        <div className="flex flex-col items-center text-center px-8 max-w-md mx-auto">

          {/* Glowing logo */}
          <div className="relative mb-6">
            <div style={{ position: 'absolute', inset: '-12px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,215,0,0.35) 0%, rgba(255,140,0,0.12) 60%, transparent 80%)', animation: 'pulse-glow 1.5s ease-in-out infinite' }} />
            <UmucoLogo style={{ width: 90, height: 90, display: 'block', overflow: 'hidden', borderRadius: '50%', position: 'relative', zIndex: 1 }} />
          </div>

          {/* Explorer badge */}
          {explorerInfo && (
            <div className="flex items-center gap-2 mb-4 px-4 py-2 rounded-full" style={{ background: 'rgba(141,73,58,0.10)', border: '1px solid rgba(141,73,58,0.2)' }}>
              <ExplorerTypeImage type={explorerInfo.id} label={explorerCopy.label} size={24} />
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#8D493A' }}>{explorerCopy.label}</span>
            </div>
          )}

          <h1 className="text-3xl font-bold text-[#2C1A14] mb-2 leading-tight">
            {explorerInfo ? explorerCopy.adventureTitle : t('auth.youreIn')}
          </h1>
          <p className="text-sm text-[#6F5B55] leading-relaxed mb-1">
            {t('auth.welcomeTo')} <span className="font-semibold text-[#2C1A14]">{formData.name}</span>.
          </p>
          <p className="text-xs text-[#8D493A]/70 mb-3 tracking-wide">
            {explorerInfo ? explorerCopy.adventureSubtitle : t('auth.yourGatewayReady')}
          </p>

          {/* XP badge */}
          <div className="flex items-center gap-2 mb-8 px-4 py-2 rounded-full" style={{ background: 'linear-gradient(135deg, #8D493A, #C4724A)', color: '#fff' }}>
            <UmucoGlyph type="spark" size={18} style={{ color: '#fff' }} />
            <span className="text-xs font-bold tracking-wide">{t('auth.explorerUnlocked')}</span>
          </div>

          <div className="w-12 h-[2px] bg-[#8D493A]/30 rounded-full mb-8" />

          <button onClick={() => onNavigate('dashboard')}
            className="w-full bg-[#8D493A] hover:bg-[#3E2723] text-white py-3.5 px-6 rounded-xl font-semibold text-sm tracking-wide transition-colors duration-200 mb-3">
            {explorerInfo ? `${explorerCopy.cta} ->` : t('auth.enterArchive')}
          </button>
          <button onClick={() => onNavigate('home')}
            className="w-full border border-[#EADBC8] text-[#6F5B55] hover:bg-[#FCDFD3]/20 py-3 px-6 rounded-xl text-xs font-medium transition-colors duration-200">
            {t('auth.backToHome')}
          </button>

          <p className="text-[10px] text-[#8D493A]/40 mt-8 tracking-widest uppercase">
            {t('auth.success.preservingText')}
          </p>
        </div>

        <style>{`
          @keyframes pulse-glow {
            0%, 100% { opacity: 0.7; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.08); }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <section className="youth-auth-shell w-full min-h-screen flex font-sans bg-[#FDFBF7]">
      {showVerificationNotice && !isVerifying && (
        <VerificationNotice email={formData.email} />
      )}

      <LeftSlideshow />

      <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-10 bg-[#FDFBF7]">
        <div className="flex items-center justify-between w-full mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center space-x-2 text-xs font-semibold text-[#8D493A] hover:text-[#3E2723] transition-colors focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span style={{ fontFamily: 'Poppins, sans-serif' }} className="font-semibold">{t('auth.backToHome')}</span>
          </button>
          <div className="flex items-center space-x-1.5">
            <UmucoLogo style={{ width: 50, height: 50, display: 'block', flexShrink: 0, overflow: 'hidden', borderRadius: '50%' }} />
          </div>
        </div>

        <div className="w-full max-w-sm mx-auto my-auto">
          {!isVerifying ? (
            <>
              <div className="text-left mb-8">
                {selectedExplorer && (
                  <div
                    className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full"
                    style={{ background: 'rgba(141,73,58,0.10)' }}
                  >
                    <ExplorerTypeImage type={selectedExplorer.id} label={selectedExplorerCopy.label} size={22} />
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest"
                      style={{ color: '#8D493A' }}
                    >
                      {selectedExplorerCopy.label}
                    </span>
                  </div>
                )}
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#8D493A] mb-2">
                  {selectedExplorer ? selectedExplorerCopy.adventureTitle : t('auth.createAccount')}
                </h1>
                <p className="text-xs md:text-sm text-[#6F5B55]">
                  {selectedExplorer ? selectedExplorerCopy.adventureSubtitle : t('auth.setUpProfile')}
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-xl overflow-hidden" style={{ border: '1px solid #e8dcd0', background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
                  <div className="flex items-start gap-3 p-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#e8dcd0', color: '#6b3e26' }}>
                      <UmucoGlyph type="shield" size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold mb-0.5" style={{ color: '#4b2e1e' }}>
                        {error.toLowerCase().includes('already exists') ? 'Account already exists' : 'Something went wrong'}
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: '#6b4c3b' }}>{error}</p>
                      {error.toLowerCase().includes('already exists') && (
                        <p className="text-[11px] mt-1" style={{ color: '#8a6a58' }}>
                          <button
                            type="button"
                            onClick={() => onNavigate('login')}
                            className="font-bold bg-transparent border-none p-0 cursor-pointer hover:underline"
                            style={{ color: '#6b3e26' }}
                          >
                            Sign in instead
                          </button>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSignUpSubmit} className="space-y-5">
                <div className="relative text-left">
                  <label className="block text-[10px] font-bold text-[#2C1A14] tracking-wider uppercase mb-1.5">{t('auth.labelFullName')}</label>
                  <div className="relative">
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                      placeholder={t('auth.placeholder.name')}
                      className="w-full bg-white border border-[#EADBC8] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2C1A14] placeholder-neutral-400 focus:outline-none focus:border-[#8D493A] transition-colors"
                      required />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"><User className="w-4 h-4" /></span>
                  </div>
                </div>

                <div className="relative text-left">
                  <label className="block text-[10px] font-bold text-[#2C1A14] tracking-wider uppercase mb-1.5">{t('auth.labelEmail')}</label>
                  <div className="relative">
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                      placeholder={t('auth.placeholder.email')}
                      className="w-full bg-white border border-[#EADBC8] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2C1A14] placeholder-neutral-400 focus:outline-none focus:border-[#8D493A] transition-colors"
                      required />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"><Mail className="w-4 h-4" /></span>
                  </div>
                </div>

                <div className="relative text-left">
                  <label className="block text-[10px] font-bold text-[#2C1A14] tracking-wider uppercase mb-1.5">{t('auth.labelPassword')}</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                      onChange={handleInputChange} placeholder={t('auth.placeholder.password')}
                      className="w-full bg-white border border-[#EADBC8] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#2C1A14] placeholder-neutral-400 focus:outline-none focus:border-[#8D493A] transition-colors"
                      minLength={8}
                      required />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"><Lock className="w-4 h-4" /></span>
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex items-start space-x-2 cursor-pointer select-none pt-1">
                  <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted}
                    onChange={handleInputChange}
                    className="accent-[#8D493A] h-4 w-4 rounded border-neutral-300 mt-0.5" required />
                  <span className="text-xs text-[#6F5B55] leading-normal">
                    {t('auth.agreePrefix')} <a href="#" className="text-[#8D493A] font-medium hover:underline">{t('auth.termsLink')}</a> {t('auth.agreeAnd')} <a href="#" className="text-[#8D493A] font-medium hover:underline">{t('auth.privacyLink')}</a>.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#8D493A] hover:bg-[#3E2723] disabled:opacity-70 text-white py-3 px-4 rounded-xl font-semibold text-xs tracking-widest uppercase transition-colors duration-200 mt-2 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }}>
                        <UmucoLogo />
                      </div>
                      <span>{t('auth.loading.creatingAccount')}</span>
                    </>
                  ) : (
                    <span>{selectedExplorer ? selectedExplorerCopy.cta : t('auth.signUp')}</span>
                  )}
                </button>
              </form>

              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-[#EADBC8]" />
                <span className="mx-4 text-xs text-[#6F5B55]">{t('auth.orContinueWith')}</span>
                <div className="flex-grow border-t border-[#EADBC8]" />
              </div>

              <div className="w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  theme="outline"
                  shape="pill"
                  size="large"
                  width="100%"
                />
              </div>

              <p className="text-xs text-[#6F5B55] mt-6">
                {t('auth.hasAccount')}{' '}
                <button onClick={() => onNavigate('login')} className="font-bold text-[#8D493A] hover:underline bg-transparent border-none p-0 cursor-pointer">
                  {t('auth.signIn')}
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="text-left mb-8">
                <button
                  onClick={() => setIsVerifying(false)}
                  className="text-xs font-semibold text-[#8D493A] hover:text-[#3E2723] mb-5 transition-colors block"
                >
                  {t('auth.backToSignup')}
                </button>

                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#8D493A] mb-2">{t('auth.verifyEmail')}</h1>
                <p className="text-xs md:text-sm text-[#6F5B55]">
                  {t('auth.enterCodeSentTo')}{' '}
                  <span className="font-semibold text-[#2C1A14]">{formData.email}</span>.
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-xl overflow-hidden" style={{ border: '1px solid #e8dcd0', background: '#fff', boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}>
                  <div className="flex items-start gap-3 p-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#e8dcd0', color: '#6b3e26' }}>
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold mb-0.5" style={{ color: '#4b2e1e' }}>Verification failed</p>
                      <p className="text-xs leading-relaxed" style={{ color: '#6b4c3b' }}>{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleCodeSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-[#2C1A14] tracking-wider uppercase mb-3 text-center">
                    {t('auth.verificationCode')}
                  </label>
                  <div className="flex justify-between gap-2">
                    {verificationCode.map((data, index) => (
                      <input
                        key={index}
                        type="text"
                        name="code"
                        maxLength="1"
                        value={data}
                        onChange={(e) => handleCodeChange(e.target, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        onPaste={handlePaste}
                        onFocus={(e) => e.target.select()}
                        className="w-12 h-12 bg-white border border-[#EADBC8] rounded-xl text-center text-sm font-bold text-[#2C1A14] focus:outline-none focus:border-[#8D493A] focus:ring-1 focus:ring-[#8D493A] transition-all"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#8D493A] hover:bg-[#3E2723] text-white py-3 px-4 rounded-xl font-semibold text-xs tracking-widest uppercase transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }}>
                        <UmucoLogo />
                      </div>
                      <span>{t('auth.loading.verifying')}</span>
                    </>
                  ) : (
                    <span>{t('auth.confirmAccount')}</span>
                  )}
                </button>
              </form>

              <p className="text-xs text-[#6F5B55] mt-5 text-center">
                {t('auth.didntReceive')}{' '}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || resendLoading}
                  className="font-bold text-[#8D493A] hover:underline bg-transparent border-none p-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resendLoading ? t('auth.sending') : resendCooldown > 0 ? t('auth.resendIn').replace('{seconds}', resendCooldown) : t('auth.resendOtp')}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default SignUpPage;


