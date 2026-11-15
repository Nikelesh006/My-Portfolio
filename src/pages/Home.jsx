import { useState, useRef, useEffect } from 'react';
import { ArrowUpRight, Mail, FileText, Menu, X } from 'lucide-react';
import TechText from '../components/TechText';
import GhostType from '../components/GhostType';
import ColorRevealPhoto from '../components/ColorRevealPhoto';
import TerminalWindow from '../components/TerminalWindow';
import SplashCursor from '../components/SplashCursor';
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

  // Check if fluid SplashCursor should be active (skip on prefers-reduced-motion or < 640px)
  const [shouldRenderSplash, setShouldRenderSplash] = useState(() => {
    if (typeof window === 'undefined') return false;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isNarrow = window.innerWidth < 640;
    return !prefersReduced && !isNarrow;
  });

  useEffect(() => {
    const checkSplash = () => {
      if (typeof window === 'undefined') return false;
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isNarrow = window.innerWidth < 640;
      return !prefersReduced && !isNarrow;
    };

    const handleResize = () => setShouldRenderSplash(checkSplash());
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = () => setShouldRenderSplash(checkSplash());

    window.addEventListener('resize', handleResize);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
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
      className="w-full min-h-screen bg-white flex flex-col items-center font-['Manrope',sans-serif] selection:bg-neutral-900 selection:text-white overflow-x-hidden"
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
        className="relative bg-white flex flex-col justify-between overflow-x-hidden overflow-y-auto min-[900px]:overflow-hidden transition-all duration-300 shrink-0"
        style={{
          margin: 'var(--frame, 0px)',
          borderRadius: 'var(--frame, 0px)',
          width: 'calc(100% - (var(--frame, 0px) * 2))',
          height: 'calc(100dvh - (var(--frame, 0px) * 2))',
          minHeight: 'calc(100vh - (var(--frame, 0px) * 2))'
        }}
      >
        {/* Fluid Glassy Silver Splash Cursor (contained in hero) */}
        {shouldRenderSplash && (
          <SplashCursor
            theme="light"
            contained
            rainbow={false}
            colors={['#ffffff', '#f8fafc', '#edf2f7', '#e2e8f0', '#cbd5e1']}
            size={1.7}
            force={0.42}
            swirl={0.38}
            trail={2.0}
            clickSplash
            intensity={0.42}
            momentum={1.8}
            quality="medium"
            zIndex={30}
          />
        )}

        {/* ================= 1. TOP NAVBAR REGION ================= */}
        <header className="relative z-40 w-full max-w-full px-4 py-3 sm:px-6 sm:py-4 md:px-10 md:py-5 flex items-center justify-between border-b border-neutral-100 shrink-0">
          {/* Left: Availability Pill */}
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.03)] text-[11px] sm:text-xs font-semibold text-neutral-800 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Available<span className="hidden sm:inline"> for new projects</span></span>
          </div>

          {/* Center: Nav Links (Desktop >= 900px) */}
          <nav className="hidden min-[900px]:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-neutral-600">
            <a href="#work" className="hover:text-black transition-colors flex items-center gap-1">
              <span>Work</span>
              <span className="text-[10px] text-neutral-400 font-mono font-normal">[4]</span>
            </a>
            <a href="#services" className="hover:text-black transition-colors flex items-center gap-1">
              <span>Services</span>
              <span className="text-[10px] text-neutral-400 font-mono font-normal">[3]</span>
            </a>
            <a href="#experience" className="hover:text-black transition-colors flex items-center gap-1">
              <span>Experience</span>
              <span className="text-[10px] text-neutral-400 font-mono font-normal">[1+]</span>
            </a>
            <a href="#contact" className="hover:text-black transition-colors">
              Contact
            </a>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Let's Talk CTA */}
            <a
              href="#contact"
              className="inline-flex items-center gap-1 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-[#0a0a0a] text-white text-[11px] sm:text-sm font-semibold hover:bg-neutral-800 transition-all shadow-xs shrink-0"
            >
              <span>Let's Talk</span>
              <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </a>

            {/* Mobile Menu Button (< 900px) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-neutral-200/90 shadow-xs text-xs font-semibold text-neutral-800">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>Available for new projects</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex flex-col gap-5 py-6">
              {[
                { label: 'Work', href: '#work', count: '4' },
                { label: 'Services', href: '#services', count: '3' },
                { label: 'Experience', href: '#experience', count: '1+' },
                { label: 'Contact', href: '#contact' }
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between text-2xl font-bold tracking-tight text-neutral-900 hover:text-neutral-500 transition-colors"
                >
                  <span>{item.label}</span>
                  {item.count ? (
                    <span className="text-sm font-mono text-neutral-400 font-normal">[{item.count}]</span>
                  ) : (
                    <ArrowUpRight className="w-5 h-5 text-neutral-400" />
                  )}
                </a>
              ))}
            </nav>

            {/* Modal Footer / CTAs & Socials */}
            <div className="flex flex-col gap-4 border-t border-neutral-100 pt-5">
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
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

        {/* ================= 2. MIDDLE REGION: TECHTEXT NAME ================= */}
        <div className="relative w-full max-w-full overflow-hidden flex-1 min-h-0 z-[1] flex items-center justify-center pointer-events-none pt-[1vh] pb-[0.5vh]">
          <div
            className="w-full max-w-full relative pointer-events-auto"
            style={{
              height: 'clamp(150px, 30vh, 420px)'
            }}
          >
            <TechText
              text="NIKELESHWARAN"
              fontFamily="Manrope, sans-serif"
              fontWeight={700}
              fontSize={220}
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
        </div>

        {/* ================= PORTRAIT PHOTO ================= */}
        {/* Flush with bottom edge, centered horizontally, overlaps lower third of the name letters */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 z-[2] pointer-events-none flex items-end justify-center select-none"
          style={{
            height: 'clamp(320px, 58vh, 800px)',
            width: 'auto',
            pointerEvents: 'none'
          }}
        >
          <ColorRevealPhoto
            src={mePhoto}
            alt="Nikeleshwaran T"
            containerRef={cardRef}
            radius={140}
            mode="spotlight"
          />
        </div>

        {/* ================= 3. BOTTOM REGION: CONTENT & SOCIALS ================= */}
        <div
          className="relative z-10 w-full max-w-full px-4 sm:px-6 md:px-10 flex flex-col min-[900px]:flex-row justify-between items-start min-[900px]:items-end gap-4 min-[900px]:gap-6 pointer-events-auto shrink-0 pb-4 sm:pb-6 min-[900px]:pb-8"
        >
          {/* Bottom Left: Title, Description & CTA */}
          <div
            className="w-full min-[900px]:max-w-[min(46vw,720px)] bg-white/85 min-[900px]:bg-transparent backdrop-blur-md min-[900px]:backdrop-blur-none border border-neutral-200/70 min-[900px]:border-none p-4 sm:p-5 min-[900px]:p-0 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] min-[900px]:shadow-none"
          >
            {/* Fixed min-height for one line so GhostType transitions do not shift layout */}
            <div className="min-h-[1.25em] flex items-center">
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
                fontWeight={600}
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
              />
            </div>

            <p
              className="text-neutral-500 font-normal leading-relaxed text-xs sm:text-sm mt-2 sm:mt-2.5 max-w-[420px]"
            >
              I build and ship full-stack products, from backend APIs to deployment pipelines.
            </p>

            <div className="flex items-center gap-3 mt-3 sm:mt-4">
              <a
                href="#contact"
                className="inline-flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-[#0a0a0a] text-white text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-all shadow-xs"
              >
                <span>Let's collaborate</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <a
                href="#resume"
                className="inline-flex sm:hidden items-center gap-1.5 px-3.5 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-neutral-600" />
                <span>Resume</span>
              </a>
            </div>
          </div>

          {/* Bottom Right: Social Pills (Grid 2x2 on mobile, vertical stack on desktop) */}
          <div className="w-full min-[900px]:w-auto grid grid-cols-2 sm:flex sm:flex-wrap min-[900px]:flex-col items-stretch min-[900px]:items-end gap-2 sm:gap-2.5">
            {socialLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target={item.isExternal ? '_blank' : undefined}
                  rel={item.isExternal ? 'noopener noreferrer' : undefined}
                  className="group inline-flex items-center justify-between sm:justify-start gap-2 px-3.5 py-2 sm:px-4 sm:py-2 rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200/90 shadow-[0_2px_6px_rgba(0,0,0,0.03)] text-xs font-semibold text-neutral-700 hover:text-black hover:border-neutral-400 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-neutral-500 group-hover:text-black transition-colors" />
                    <span>{item.name}</span>
                  </div>
                  <ArrowUpRight className="w-3 h-3 text-neutral-400 group-hover:text-black transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              );
            })}
          </div>
        </div>

      </div>

      {/* ================= TERMINAL SECTION ================= */}
      <section
        id="terminal-section"
        className="w-full max-w-[860px] px-4 py-16 sm:py-24 flex items-center justify-center shrink-0"
      >
        <TerminalWindow />
      </section>
    </main>
  );
}
