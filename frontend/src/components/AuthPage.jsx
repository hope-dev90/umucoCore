import React, { useState, useEffect, useRef } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Milestone, ArrowLeft, ShieldCheck } from 'lucide-react';
import authLeftBg from '../assets/signup/tra.png';
import authLeftBg2 from '../assets/signup/tra2.png';
import authLeftBg3 from '../assets/signup/tra3.jpg';
import TribalLogo from './UmucoLogo';

// ── Slideshow data ────────────────────────────────────────────────────────────
const SLIDES = [
  {
    src: authLeftBg,
    heading: 'Begin your',
    accent: 'Journey.',
    quote:
      '"Preserve Rwanda’s living heritage start your journey today."',
  },
  {
    src: authLeftBg2,
    heading: 'Enter the',
    accent: 'Archive.',
    quote:
      '"Be part of Rwanda’s living treasury of culture and tradition."',
  },
  {
    src: authLeftBg3,
    heading: 'Become part of',
    accent: 'History.',
    quote:
      '"Your story matters—preserved, celebrated, and passed on."',
  },
];

// ── Left slideshow ────────────────────────────────────────────────────────────
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

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.90) 0%, rgba(0,0,0,0.40) 50%, rgba(0,0,0,0.10) 100%)',
          zIndex: 2,
        }}
      />

      {/* Text + dots */}
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

        {/* Dot indicators */}
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

// ── Confetti celebration ──────────────────────────────────────────────────────
function Confetti() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ['var(--primary)', 'var(--primary)', 'var(--primary)', 'var(--primary)', '#8D493A', '#FCDFD3', '#fff', 'var(--primary-soft)', 'var(--primary)'];
    const SHAPES = ['circle', 'rect', 'star', 'ribbon'];

    const particles = Array.from({ length: 220 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 200,
      size: 6 + Math.random() * 12,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      speedY: 2.5 + Math.random() * 4,
      speedX: (Math.random() - 0.5) * 3,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 8,
      opacity: 1,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.05 + Math.random() * 0.08,
    }));

    function drawStar(ctx, x, y, r) {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const fn = i === 0 ? 'moveTo' : 'lineTo';
        ctx[fn](x + r * Math.cos(angle), y + r * Math.sin(angle));
      }
      ctx.closePath();
      ctx.fill();
    }

    let animId;
    let frame = 0;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frame++;

      particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.wobble) * 1.2;
        p.wobble += p.wobbleSpeed;
        p.rotation += p.rotSpeed;
        if (frame > 120) p.opacity = Math.max(0, p.opacity - 0.008);

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else if (p.shape === 'star') {
          drawStar(ctx, 0, 0, p.size / 2);
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 6, p.size, p.size / 3);
        }

        ctx.restore();
      });

      if (particles.some(p => p.opacity > 0)) {
        animId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    animate();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 50 }}
    />
  );
}

// ── Main SignUpPage ───────────────────────────────────────────────────────────
function SignUpPage({ onNavigate }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', termsAccepted: false });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleCodeChange = (element, index) => {
    if (isNaN(element.value)) return false;
    setVerificationCode([...verificationCode.map((d, idx) => (idx === index ? element.value : d))]);
    if (element.nextSibling && element.value) element.nextSibling.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !verificationCode[index] && e.target.previousSibling)
      e.target.previousSibling.focus();
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); setIsVerifying(true); }, 800);
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    if (verificationCode.join('').length === 6) setIsSuccess(true);
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <>
        <Confetti />
        <div className="fixed inset-0 w-full min-h-screen flex items-center justify-center bg-[#FDFBF7]" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <div className="flex flex-col items-center text-center px-8 max-w-md mx-auto">

            {/* Logo + golden glow ring */}
            <div className="relative mb-8">
              <div
                style={{
                  position: 'absolute',
                  inset: '-12px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,215,0,0.35) 0%, rgba(255,140,0,0.12) 60%, transparent 80%)',
                  animation: 'pulse-glow 1.5s ease-in-out infinite',
                }}
              />
              <TribalLogo style={{ width: 100, height: 100, display: 'block', overflow: 'hidden', borderRadius: '50%', position: 'relative', zIndex: 1 }} />

              {/* Orbiting gold dots */}
              {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                <span
                  key={i}
                  style={{
                    position: 'absolute',
                    width: i % 2 === 0 ? '10px' : '7px',
                    height: i % 2 === 0 ? '10px' : '7px',
                    borderRadius: '50%',
                    background: i % 3 === 0 ? 'var(--primary)' : i % 3 === 1 ? 'var(--primary)' : '#FCDFD3',
                    top: `${50 - 55 * Math.cos((deg * Math.PI) / 180)}%`,
                    left: `${50 + 55 * Math.sin((deg * Math.PI) / 180)}%`,
                    transform: 'translate(-50%, -50%)',
                    animation: `bounce-dot 0.8s ease-in-out infinite`,
                    animationDelay: `${i * 0.13}s`,
                  }}
                />
              ))}
            </div>

            <h1 className="text-3xl font-bold text-[#2C1A14] mb-3 leading-tight">
              You're in! 🎉
            </h1>
            <p className="text-sm text-[#6F5B55] leading-relaxed mb-1">
              Welcome to UmucoCore,{' '}
              <span className="font-semibold text-[#2C1A14]">{formData.name}</span>.
            </p>
            <p className="text-xs text-[#8D493A]/70 mb-10 tracking-wide">
              Your cultural gateway is ready.
            </p>

            <div className="w-12 h-[2px] bg-[#8D493A]/30 rounded-full mb-10" />

            <button
              onClick={() => onNavigate('dashboard')}
              className="w-full bg-[#8D493A] hover:bg-[#3E2723] text-white py-3.5 px-6 rounded-xl font-semibold text-sm tracking-wide transition-colors duration-200 mb-3"
            >
              Enter the Archive →
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="w-full border border-[#EADBC8] text-[#6F5B55] hover:bg-[#FCDFD3]/20 py-3 px-6 rounded-xl text-xs font-medium transition-colors duration-200"
            >
              Back to Home
            </button>

            <p className="text-[10px] text-[#8D493A]/40 mt-8 tracking-widest uppercase">
              Preserving Rwandan Roots and Culture
            </p>
          </div>

          <style>{`
            @keyframes pulse-glow {
              0%, 100% { opacity: 0.7; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.08); }
            }
            @keyframes bounce-dot {
              0%, 100% { transform: translate(-50%, -50%) scale(1); }
              50% { transform: translate(-50%, -50%) scale(1.5); }
            }
          `}</style>
        </div>
      </>
    );
  }

  return (
    <section className="w-full min-h-screen flex font-sans bg-[#FDFBF7]">

      {/* LEFT — slideshow */}
      <LeftSlideshow />

      {/* RIGHT — form */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-10 bg-[#FDFBF7]">

        {/* Top bar */}
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

        {/* Form content */}
        <div className="w-full max-w-sm mx-auto my-auto">
          {!isVerifying ? (
            <>
              <div className="text-left mb-8">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#8D493A] mb-2">Create Account</h1>
                <p className="text-xs md:text-sm text-[#6F5B55]">Set up your profile to the heritage gateway.</p>
              </div>

              <form onSubmit={handleSignUpSubmit} className="space-y-5">
                <div className="relative text-left">
                  <label className="block text-[10px] font-bold text-[#2C1A14] tracking-wider uppercase mb-1.5">Full Name</label>
                  <div className="relative">
                    <input type="text" name="name" value={formData.name} onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full bg-white border border-[#EADBC8] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#2C1A14] placeholder-neutral-400 focus:outline-none focus:border-[#8D493A] transition-colors"
                      required />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400"><User className="w-4 h-4" /></span>
                  </div>
                </div>

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
                  <label className="block text-[10px] font-bold text-[#2C1A14] tracking-wider uppercase mb-1.5">Password</label>
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

                <label className="flex items-start space-x-2 cursor-pointer select-none pt-1">
                  <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted}
                    onChange={handleInputChange}
                    className="accent-[#8D493A] h-4 w-4 rounded border-neutral-300 mt-0.5" required />
                  <span className="text-xs text-[#6F5B55] leading-normal">
                    I agree to the <a href="#" className="text-[#8D493A] font-medium hover:underline">Terms of Service</a> and <a href="#" className="text-[#8D493A] font-medium hover:underline">Privacy Policy</a>.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#8D493A] hover:bg-[#3E2723] disabled:opacity-70 text-white py-3 px-4 rounded-xl font-semibold text-xs tracking-widest uppercase transition-colors duration-200 mt-2 flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Sign Up</span>
                  )}
                </button>
              </form>

              <p className="text-xs text-[#6F5B55] mt-6">
                Already have an account?{' '}
                <button onClick={() => onNavigate('login')} className="font-bold text-[#8D493A] hover:underline bg-transparent border-none p-0 cursor-pointer">
                  Sign In
                </button>
              </p>
            </>
          ) : (
            <>
              <div className="text-left mb-8">
                {/* Back link — no arrow, plain text */}
                <button
                  onClick={() => setIsVerifying(false)}
                  className="text-xs font-semibold text-[#8D493A] hover:text-[#3E2723] mb-5 transition-colors block"
                >
                  Back to Sign Up
                </button>

                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#8D493A] mb-2">Verify Your Email</h1>
                <p className="text-xs md:text-sm text-[#6F5B55]">
                  Enter the 6-digit verification code sent to{' '}
                  <span className="font-semibold text-[#2C1A14]">{formData.email}</span>.
                </p>
              </div>

              <form onSubmit={handleCodeSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold text-[#2C1A14] tracking-wider uppercase mb-3">
                    Verification Code
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
                        onFocus={(e) => e.target.select()}
                        className="w-12 h-12 bg-white border border-[#EADBC8] rounded-xl text-center text-sm font-bold text-[#2C1A14] focus:outline-none focus:border-[#8D493A] focus:ring-1 focus:ring-[#8D493A] transition-all"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#8D493A] hover:bg-[#3E2723] text-white py-3 px-4 rounded-xl font-semibold text-xs tracking-widest uppercase transition-colors duration-200"
                >
                  Confirm Account
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default SignUpPage;