import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowLeft, Mail, FileText, Menu, X, Terminal } from 'lucide-react';
import TerminalWindow from '../components/TerminalWindow';
import { navigate, playClickSound } from '../lib/navigation';

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

export default function Experience() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
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
      href: '/#resume',
      icon: FileText,
      isExternal: false
    }
  ];

  const handleNavClick = (href) => {
    setMobileMenuOpen(false);
    if (href.startsWith('/')) {
      navigate(href);
    } else if (href.startsWith('#')) {
      navigate('/' + href);
    }
  };

  return (
    <main className="w-full min-h-screen bg-white text-neutral-900 font-['Manrope',sans-serif] selection:bg-neutral-900 selection:text-white flex flex-col items-center">
      {/* ================= 1. TOP NAVBAR REGION ================= */}
      <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-neutral-100 px-4 py-3 sm:px-6 sm:py-4 md:px-10 flex items-center justify-between">
        {/* Left: Back Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors cursor-pointer"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </button>
        </div>

        {/* Center: Nav Links (Desktop >= 900px) */}
        <nav className="hidden min-[900px]:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider text-neutral-600">
          <button
            type="button"
            onClick={() => handleNavClick('/')}
            className="hover:text-black transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => handleNavClick('/experience')}
            className="text-black font-bold flex items-center gap-1 border-b-2 border-black pb-0.5 cursor-pointer"
          >
            <span>Experience</span>
            <span className="text-[10px] text-neutral-500 font-mono font-normal">[1+]</span>
          </button>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="mailto:nikelesh2006@gmail.com"
            onClick={playClickSound}
            className="inline-flex items-center gap-1 px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full bg-[#0a0a0a] text-white text-[11px] sm:text-xs font-semibold hover:bg-neutral-800 transition-all shadow-xs shrink-0"
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
        <div className="min-[900px]:hidden fixed inset-0 z-50 flex flex-col justify-between bg-white/98 backdrop-blur-xl p-6 transition-all duration-300">
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

          <nav className="flex flex-col gap-5 py-6">
            {[
              { label: 'Home', href: '/' },
              { label: 'Experience', href: '/experience', count: '1+', active: true }
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNavClick(item.href)}
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

      {/* ================= 2. OVERVIEW / HERO BANNER ================= */}
      <section className="w-full max-w-5xl px-4 sm:px-6 md:px-10 pt-10 sm:pt-14 pb-8 flex flex-col items-start">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 font-mono text-[11px] sm:text-xs font-medium tracking-wide uppercase mb-3">
          <Terminal className="w-3.5 h-3.5 text-neutral-500" />
          <span>Professional Experience</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 leading-[1.15]">
          Backend Systems &amp; Infrastructure
        </h1>

        <p className="mt-3 text-sm sm:text-base text-neutral-600 max-w-2xl leading-relaxed">
          Specializing in custom backend APIs, security hardening and rate limiting, database performance optimization, automated CI/CD pipelines, and cloud deployment. Co-founder &amp; Backend Developer at Code Craft.
        </p>
      </section>

      {/* ================= 3. INTERACTIVE TERMINAL SECTION ================= */}
      <section className="w-full max-w-4xl px-4 sm:px-6 md:px-10 py-6 sm:py-8 flex flex-col items-center">
        <div className="w-full flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500">
              Interactive Terminal Emulator
            </span>
          </div>
          <span className="text-[11px] font-mono text-neutral-400 hidden sm:inline">
            Hover 'Code Craft' to run whois
          </span>
        </div>

        {/* The Animated Terminal Window Component */}
        <div className="w-full shadow-2xl rounded-xl">
          <TerminalWindow />
        </div>

        <p className="text-[11px] sm:text-xs text-neutral-400 font-mono mt-3 text-center">
          💡 Interactive simulation. Hover or tap <span className="text-neutral-700 font-semibold underline underline-offset-2">Code Craft</span> to reveal the live whois metadata card.
        </p>
      </section>

      {/* ================= 4. BOTTOM CTA & FOOTER ================= */}
      <section className="w-full max-w-4xl px-4 sm:px-6 md:px-10 py-12">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0a0a0a] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-1.5 max-w-md">
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Let's Build Something Resilient
            </h3>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
              Available for full-time backend roles, contracting, or discussing architectural challenges.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="mailto:nikelesh2006@gmail.com"
              onClick={playClickSound}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white text-black font-bold text-xs sm:text-sm hover:bg-neutral-200 transition-colors shadow-lg"
            >
              <span>Get in touch</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <span>Home</span>
            </button>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="mt-10 pt-5 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 pb-10">
          <p>© {new Date().getFullYear()} Nikeleshwaran T. All rights reserved.</p>

          <div className="flex items-center gap-4">
            {socialLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target={item.isExternal ? '_blank' : undefined}
                rel={item.isExternal ? 'noopener noreferrer' : undefined}
                onClick={playClickSound}
                className="hover:text-black transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
