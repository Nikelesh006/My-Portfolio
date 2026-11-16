import { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, Mail, FileText, Menu, X } from 'lucide-react';
import TechText from '../components/TechText';
import GhostType from '../components/GhostType';
import ColorRevealPhoto from '../components/ColorRevealPhoto';
import FluxLines from '../components/FluxLines';
import { navigate, playClickSound } from '../lib/navigation';
import mePhoto from '../assets/me.png';

function GithubIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

function LinkedinIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cardRef = useRef(null);

  // Prevent background scrolling when mobile menu modal is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Handle external auth errors in URL query params (e.g. ?error=auth_failed) and clean up address bar
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const err = params.get('error');
    if (err) {
      setAuthError(
        err === 'auth_failed'
          ? 'Authentication failed. Please verify your credentials or login provider.'
          : `Authentication error: ${err}`
      );
      // Clean query parameter from URL bar without refreshing
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', cleanUrl);

      // Auto dismiss after 6 seconds
      const timer = setTimeout(() => setAuthError(null), 6000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Scroll to hash target on mount if present, or start at top if no hash
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash;
    if (hash) {
      const scrollToHash = () => {
        const target = document.querySelector(hash);
        if (target) {
          target.scrollIntoView({ behavior: 'auto' });
        }
      };
      const t1 = setTimeout(scrollToHash, 300);
      const t2 = setTimeout(scrollToHash, 900);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  // Responsive viewport width tracker for mobile GPU optimizations (< 640px)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 640;
  });

  // Track Anton font readiness so TechText renders cleanly with the condensed font from frame 1
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (document.fonts) {
      Promise.all([
        document.fonts.load('400 100px Anton'),
        document.fonts.ready
      ])
        .then(() => setFontLoaded(true))
        .catch(() => setFontLoaded(true));
    } else {
      setFontLoaded(true);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const socialLinks = [
    {
      name: 'GitHub',
      href: 'https://github.com/Nikelesh006',
      icon: GithubIcon,
      isExternal: true
    },
    {
      name: 'LinkedIn',
      href: 'https://www.linkedin.com/in/nikel2006',
      icon: LinkedinIcon,
      isExternal: true
    },
    {
      name: 'Email',
      href: 'mailto:nikelesh2006@gmail.com',
      icon: Mail,
      isExternal: false
    },
    {
      name: 'Resume',
      href: '#resume',
      icon: FileText,
      isExternal: false
    }
  ];

  return (
    <main
      className="w-full min-h-screen min-[900px]:h-[100dvh] min-[900px]:overflow-hidden bg-white flex flex-col items-center font-['Manrope',sans-serif] selection:bg-neutral-900 selection:text-white overflow-x-hidden"
      style={{
        backgroundColor: 'var(--frame-bg, #ffffff)'
      }}
    >
      {/* Auth Error Notification Toast */}
      {authError && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] max-w-md w-[calc(100%-32px)] bg-neutral-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-neutral-700/80 flex items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse" />
            <span className="font-medium text-neutral-200">{authError}</span>
          </div>
          <button
            type="button"
            onClick={() => setAuthError(null)}
            className="text-neutral-400 hover:text-white transition-colors p-1"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      {/* Full Viewport Canvas Card (governed by --frame) */}
      <div
        ref={cardRef}
        className="relative bg-white flex flex-col justify-between overflow-x-hidden min-[900px]:overflow-hidden transition-all duration-300 w-full min-h-[100dvh] min-[900px]:h-[100dvh]"
        style={{
          margin: 'var(--frame, 0px)',
          borderRadius: 'var(--frame, 0px)',
          width: 'calc(100% - (var(--frame, 0px) * 2))',
          height: 'calc(100dvh - (var(--frame, 0px) * 2))'
        }}
      >
        {/* FluxLines Background */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }} aria-hidden="true">
          <FluxLines
            lightMode
            transparent
            colors={['#111111', '#7c8cff', '#2dd4bf']}
            glow={2}
            rimWidth={0.2}
            lineWidth={1}
            flowDirection="down"
            mouseInteraction
            clickSwirl
            opacity={0.5}
            dpr={isMobile ? 1 : undefined}
          />
        </div>

        {/* ================= 1. TOP NAVBAR REGION ================= */}
        <header className="relative z-40 w-full max-w-full px-4 sm:px-6 min-[900px]:px-[2vw] pt-[clamp(16px,3vh,36px)] pb-[clamp(12px,2vh,20px)] flex items-center justify-between border-b border-neutral-100 shrink-0 min-h-[clamp(56px,7.5vh,80px)]">
          {/* Left: Brand / Logo */}
          <div className="flex items-center">
            <span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-neutral-900 select-none">
              Nikel
            </span>
          </div>

          {/* Center: Nav Links (Desktop >= 900px) */}
          <nav className="hidden min-[900px]:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-neutral-600">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="text-black font-bold border-b-2 border-black pb-0.5 cursor-pointer"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => navigate('/experience')}
              className="hover:text-black transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>Experience</span>
              <span className="text-[10px] text-neutral-400 font-mono font-normal">[1+]</span>
            </button>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Let's Talk CTA */}
            <a
              href="mailto:nikelesh2006@gmail.com"
              onClick={playClickSound}
              className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-[#0a0a0a] text-white text-[11px] sm:text-sm font-semibold hover:bg-neutral-800 transition-all shadow-xs shrink-0"
            >
              <span>Let's Talk</span>
              <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </a>

            {/* Mobile Menu Button (< 900px) */}
            <button
              type="button"
              onClick={() => {
                playClickSound();
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="min-[900px]:hidden flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* ================= MOBILE NAVIGATION MODAL (< 900px) ================= */}
        {mobileMenuOpen && (
          <div className="min-[900px]:hidden fixed inset-0 z-50 flex flex-col justify-between bg-white/95 backdrop-blur-xl p-6 transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <span className="text-xs font-bold tracking-wider uppercase text-neutral-900">
                Menu
              </span>
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-col gap-5 py-6">
              {[
                { label: 'Home', href: '/', active: true },
                { label: 'Experience', href: '/experience', count: '1+' }
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate(item.href);
                  }}
                  className={`flex items-center justify-between text-2xl font-bold tracking-tight text-left transition-colors ${
                    item.active ? 'text-black' : 'text-neutral-500 hover:text-black'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.count ? (
                    <span className="text-sm font-mono text-neutral-400 font-normal">[{item.count}]</span>
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-neutral-400" />
                  )}
                </button>
              ))}
            </nav>

            {/* Modal Footer / CTAs & Socials */}
            <div className="flex flex-col gap-4 border-t border-neutral-100 pt-5">
              <a
                href="mailto:nikelesh2006@gmail.com"
                onClick={() => {
                  playClickSound();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#0a0a0a] text-white font-semibold text-sm hover:bg-neutral-800 transition-all shadow-xs"
              >
                <span>Let's Talk</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>

              <div className="grid grid-cols-2 gap-2 pt-1">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      target={item.isExternal ? '_blank' : undefined}
                      rel={item.isExternal ? 'noopener noreferrer' : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs font-semibold text-neutral-700 hover:text-black hover:bg-neutral-100 transition-colors"
                    >
                      <Icon className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{item.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= 2. NAME: TECHTEXT ("NIKELESHWARAN") ================= */}
        <div className="hero-name-wrapper overflow-hidden">
          <TechText
            key={fontLoaded ? 'anton-loaded' : 'anton-loading'}
            text="NIKELESHWARAN"
            fontFamily="Anton, sans-serif"
            fontWeight={400}
            fontSize={400}
            color="#0a0a0a"
            accentColor="#0a0a0a"
            reveal="letter"
            dashLength={4}
            dashGap={2}
            specks={15}
            intro="type"
            introDuration={2}
            clickKick
            guides={false}
          />
        </div>

        {/* ================= PORTRAIT PHOTO ================= */}
        {/* Mobile: 55vh height, bottom-centered in stack. Desktop: 82vh anchored to bottom, top of head at ~18vh */}
        <div className="hero-photo-wrapper">
          <ColorRevealPhoto
            src={mePhoto}
            alt="Nikeleshwaran T"
            containerRef={cardRef}
            radius={160}
            mode="spotlight"
          />
        </div>

        {/* ================= 3. BOTTOM REGION: CONTENT & SOCIALS ================= */}
        <div className="hero-bottom-region shrink-0">
          {/* Bottom Left: Title, Description & CTA */}
          <div className="w-full min-[900px]:max-w-[40vw] pointer-events-auto">
            {/* Fixed min-height for two lines so GhostType transitions do not shift layout */}
            <div className="min-h-[clamp(54px,5.8vw,115px)] flex items-start">
              <GhostType
                as="h2"
                className="hero-ghost-title"
                text="Backend Developer"
                completions={[
                  ', DevOps Engineer',
                  ', Cloud Architect',
                  ', AI Architect',
                  ', Full Stack Engineer'
                ]}
                fontWeight={700}
                textColor="#0a0a0a"
                accentColor="#0a0a0a"
                ghostOpacity={0.4}
                align="left"
                typeSpeed={45}
                holdDelay={1800}
                loop
                startOnView
                pauseOnHover
                clickToAccept
                hint
                hintLabel="Tab"
                caret="bar"
                style={{
                  fontSize: 'clamp(24px, 2.6vw, 52px)',
                  fontWeight: 700,
                  letterSpacing: '0.01em',
                  lineHeight: 1.1,
                  textTransform: 'uppercase'
                }}
              />
            </div>

            <p className="text-neutral-500 font-normal leading-relaxed text-[clamp(14px,1.1vw,18px)] mt-[clamp(8px,1.5vh,16px)] max-w-full min-[900px]:max-w-[34vw]">
              I build and ship full-stack products, from backend APIs to deployment pipelines.
            </p>

            <div className="flex items-center gap-3 mt-[clamp(12px,2vh,20px)]">
              <a
                href="mailto:nikelesh2006@gmail.com"
                className="inline-flex items-center gap-2 px-[clamp(20px,1.8vw,32px)] h-[clamp(44px,5vh,60px)] rounded-full bg-[#0a0a0a] text-white text-[clamp(14px,1.1vw,18px)] font-semibold hover:bg-neutral-800 transition-all shadow-xs shrink-0"
              >
                <span>Let's collaborate</span>
                <ArrowUpRight className="w-[clamp(14px,1.1vw,18px)] h-[clamp(14px,1.1vw,18px)]" />
              </a>
              <a
                href="#resume"
                className="inline-flex sm:hidden items-center gap-1.5 px-4 h-[clamp(44px,5vh,60px)] rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[clamp(14px,1.1vw,18px)] font-semibold transition-colors shrink-0"
              >
                <FileText className="w-4 h-4 text-neutral-600" />
                <span>Resume</span>
              </a>
            </div>
          </div>

          {/* Bottom Right: Social Pills (Vertical stack on desktop, 2x2 grid on mobile) */}
          <div className="w-full min-[900px]:w-auto grid grid-cols-2 min-[900px]:flex min-[900px]:flex-col items-stretch min-[900px]:items-end gap-[clamp(8px,1.2vh,14px)] pointer-events-auto">
            {socialLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target={item.isExternal ? '_blank' : undefined}
                  rel={item.isExternal ? 'noopener noreferrer' : undefined}
                  className="group inline-flex items-center justify-between sm:justify-start gap-[clamp(10px,1vw,16px)] px-[clamp(16px,1.4vw,28px)] h-[clamp(44px,5vh,60px)] rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200/90 shadow-[0_2px_6px_rgba(0,0,0,0.03)] text-[clamp(14px,1.1vw,18px)] font-semibold text-neutral-700 hover:text-black hover:border-neutral-400 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-center gap-[clamp(8px,0.8vw,12px)]">
                    <Icon className="w-[clamp(16px,1.1vw,20px)] h-[clamp(16px,1.1vw,20px)] text-neutral-500 group-hover:text-black transition-colors" />
                    <span>{item.name}</span>
                  </div>
                  <ArrowUpRight className="w-[clamp(14px,1vw,18px)] h-[clamp(14px,1vw,18px)] text-neutral-400 group-hover:text-black transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              );
            })}
          </div>
        </div>

      </div>
    </main>
  );
}
