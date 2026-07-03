import React, { useState, useEffect } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import authLeftBg from '../assets/login/tra.png';
import authLeftBg2 from '../assets/login/tra2.png';
import TribalLogo from './UmucoLogo';
import { useAuth } from '../contexts/AuthContext';

const SLIDES = [
  {
    src: authLeftBg,
    heading: "Heritage is our",
    accent: "Legacy.",
    quote: '"Heritage connects ancestral wisdom to the digital future."',
  },
  {
    src: authLeftBg2,
    heading: "Culture is our",
    accent: "Identity.",
    quote: '"Every tradition shapes who we are becoming."',
  }
];

function LeftSlideshow() {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setCurrent(prev => (prev + 1) % SLIDES.length);
        setTransitioning(false);
      }, 500);
    }, 3900);
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
          Preserving Rwandan Roots and Culture.
        </div>
      </div>
    </div>
  );
}

function LoginPage({ onNavigate }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [verificationStep, setVerificationStep] = useState('email');
  const [resetEmail, setResetEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [formData, setFormData] = useState({ email: '', password: '', rememberMe: false });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, googleLogin } = useAuth();

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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password);
      onNavigate('dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (resetEmail) setVerificationStep('code');
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (verificationCode.join('').length === 6) setVerificationStep('success');
  };

  return (
    <section className="w-full min-h-screen flex font-sans bg-[#FDFBF7]">
      <LeftSlideshow />

      <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-10 bg-[#FDFBF7]">
        <div className="flex items-center justify-between w-full mb-8">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center space-x-2 text-xs font-semibold text-[#8D493A] hover:text-[#3E2723] transition-colors focus:outline-none"
          >
            <ArrowLeft className="w-4 h-4" />
            <span style={{ fontFamily: 'Poppins, sans-serif' }} className="font-semibold">Back to Home</span>
          </button>
          <div className="flex items-center space-x-1.5">
            <TribalLogo style={{ width: 50, height: 50, display: 'block', flexShrink: 0, overflow: 'hidden', borderRadius: '50%' }} />
          </div>
        </div>

        <div className="w-full max-w-sm mx-auto my-auto">
          {!isForgotPassword ? (
            <>
              <div className="text-left mb-8">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#8D493A] mb-2">Welcome Back!</h1>
                <p className="text-xs md:text-sm text-[#6F5B55]">Ready to access your heritage gateway.</p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="relative text-left">
                  <label className="block text-[10px] font-bold text-[#2C1A14] tracking-wider uppercase mb-1.5">Email Address</label>
                  <div className="relative">
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange}
                      placeholder="name@domain.com"
                      className="w-full bg-white border border-[#EADBC8] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2C1A14] placeholder-neutral-400 focus:outline-none focus:border-[#8D493A] transition-colors"
                      required />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"><Mail className="w-4 h-4" /></span>
                  </div>
                </div>

                <div className="relative text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold text-[#2C1A14] tracking-wider uppercase">Password</label>
                    <button type="button" onClick={() => { setIsForgotPassword(true); setVerificationStep('email'); }}
                      className="text-[10px] font-bold text-[#8D493A] hover:underline focus:outline-none">
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password}
                      onChange={handleInputChange} placeholder="••••••••"
                      className="w-full bg-white border border-[#EADBC8] rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#2C1A14] placeholder-neutral-400 focus:outline-none focus:border-[#8D493A] transition-colors"
                      required />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"><Lock className="w-4 h-4" /></span>
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex items-center space-x-2 cursor-pointer select-none pt-1">
                  <input type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleInputChange}
                    className="accent-[#8D493A] h-4 w-4 rounded border-neutral-300" />
                  <span className="text-xs text-[#6F5B55]">Remember me for 30 days</span>
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#8D493A] hover:bg-[#3E2723] disabled:opacity-70 text-white py-3 px-4 rounded-xl font-semibold text-xs tracking-widest uppercase transition-colors duration-200 mt-2 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </form>

              <div className="flex items-center my-6">
                <div className="flex-grow border-t border-[#EADBC8]" />
                <span className="mx-4 text-xs text-[#6F5B55]">or continue with</span>
                <div className="flex-grow border-t border-[#EADBC8]" />
              </div>

              <div className="w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  useOneTap
                  theme="outline"
                  shape="pill"
                  size="large"
                  width="100%"
                />
              </div>

              <p className="text-xs text-[#6F5B55] mt-6">
                Don't have an account?{' '}
                <button onClick={() => onNavigate('signup')} className="font-bold text-[#8D493A] hover:underline bg-transparent border-none p-0 cursor-pointer">
                  Sign Up
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="text-left mb-8">
                <button onClick={() => setIsForgotPassword(false)}
                  className="inline-flex items-center space-x-2 text-xs font-semibold text-[#8D493A] hover:text-[#3E2723] mb-5 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Sign In</span>
                </button>

                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#8D493A] mb-2">Reset Password</h1>
                <p className="text-xs md:text-sm text-[#6F5B55]">
                  {verificationStep === 'email' && "Enter your verified account email to receive a verification code."}
                  {verificationStep === 'code' && `Enter the 6-digit code sent to ${resetEmail}.`}
                  {verificationStep === 'success' && "Your verification is complete."}
                </p>
              </div>

              {verificationStep === 'email' && (
                <form onSubmit={handleEmailSubmit} className="space-y-5">
                  <div className="relative text-left">
                    <label className="block text-[10px] font-bold text-[#2C1A14] tracking-wider uppercase mb-1.5">Email Address</label>
                    <div className="relative">
                      <input type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="name@domain.com"
                        className="w-full bg-white border border-[#EADBC8] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2C1A14] placeholder-neutral-400 focus:outline-none focus:border-[#8D493A] transition-colors"
                        required />
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"><Mail className="w-4 h-4" /></span>
                    </div>
                  </div>
                  <button type="submit"
                    className="w-full bg-[#8D493A] hover:bg-[#3E2723] text-white py-3 px-4 rounded-xl font-semibold text-xs tracking-widest uppercase transition-colors duration-200">
                    Send Code
                  </button>
                </form>
              )}

              {verificationStep === 'code' && (
                <form onSubmit={handleCodeSubmit} className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold text-[#2C1A14] tracking-wider uppercase mb-3 text-center">Verification Code</label>
                    <div className="flex justify-between gap-2 max-w-sm mx-auto">
                      {verificationCode.map((data, index) => (
                        <input key={index} type="text" name="code" maxLength="1" value={data}
                          onChange={(e) => handleCodeChange(e.target, index)}
                          onKeyDown={(e) => handleKeyDown(e, index)}
                          onFocus={(e) => e.target.select()}
                          className="w-12 h-12 bg-white border border-[#EADBC8] rounded-xl text-center text-sm font-bold text-[#2C1A14] focus:outline-none focus:border-[#8D493A] focus:ring-1 focus:ring-[#8D493A] transition-all"
                        />
                      ))}
                    </div>
                  </div>
                  <button type="submit"
                    className="w-full bg-[#8D493A] hover:bg-[#3E2723] text-white py-3 px-4 rounded-xl font-semibold text-xs tracking-widest uppercase transition-colors duration-200">
                    Verify Code
                  </button>
                </form>
              )}

              {verificationStep === 'success' && (
                <div className="bg-[#FCDFD3]/15 border border-[#EADBC8]/30 rounded-xl p-5 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-[var(--primary)]/20 rounded-full flex items-center justify-center mb-3">
                    <span className="text-[#8D493A] text-2xl">✅</span>
                  </div>
                  <p className="text-sm font-bold text-[#8D493A] mb-1">Identity Verified</p>
                  <p className="text-xs text-[#6F5B55] leading-relaxed max-w-xs">
                    Security gateway validation complete. You may now continue inside your secure user instance panel.
                  </p>
                  <button onClick={() => setIsForgotPassword(false)}
                    className="mt-5 w-full bg-[#8D493A] hover:bg-[#3E2723] text-white py-2.5 px-4 rounded-xl font-semibold text-xs tracking-wide transition-colors">
                    Return to Log In
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default LoginPage;