import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowLeft, Mail, FileText, Menu, X, Terminal, Server, Database, Cloud, ShieldCheck, CheckCircle2 } from 'lucide-react';
import TerminalWindow from '../components/TerminalWindow';
import { navigate } from '../lib/navigation';

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
          <span className="text-black font-bold flex items-center gap-1 border-b-2 border-black pb-0.5">
            <span>Experience</span>
            <span className="text-[10px] text-neutral-500 font-mono font-normal">[1+]</span>
          </span>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="mailto:nikelesh2006@gmail.com"
            className="inline-flex items-center gap-1 px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full bg-[#0a0a0a] text-white text-[11px] sm:text-xs font-semibold hover:bg-neutral-800 transition-all shadow-xs shrink-0"
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
        <div className="min-[900px]:hidden fixed inset-0 z-50 flex flex-col justify-between bg-white/98 backdrop-blur-xl p-6 transition-all duration-300">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <span className="text-xs font-bold tracking-wider uppercase text-neutral-900">
              Menu
            </span>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
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

      {/* ================= 2. PAGE HEADER / HERO BANNER ================= */}
      <section className="w-full max-w-5xl px-4 sm:px-6 md:px-10 pt-10 sm:pt-14 pb-10 flex flex-col items-start">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-700 font-mono text-[11px] sm:text-xs font-medium tracking-wide uppercase mb-4">
          <Terminal className="w-3.5 h-3.5 text-neutral-500" />
          <span>Professional Experience &amp; Ventures</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 leading-[1.15]">
          Engineering Backend Systems &amp; Infrastructure
        </h1>

        {/* Description */}
        <p className="mt-4 text-sm sm:text-base text-neutral-600 max-w-2xl leading-relaxed">
          Specializing in designing high-throughput REST APIs, database performance optimization, automated CI/CD pipelines, and cloud architecture. Co-founder &amp; Backend Developer at Code Craft.
        </p>

        {/* Quick Stats Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-6 border-t border-neutral-200/80">
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70">
            <span className="block font-mono text-2xl sm:text-3xl font-extrabold text-neutral-900">1+</span>
            <span className="text-xs text-neutral-500 font-medium">Years Active Experience</span>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70">
            <span className="block font-mono text-2xl sm:text-3xl font-extrabold text-neutral-900">10+</span>
            <span className="text-xs text-neutral-500 font-medium">Production Endpoints &amp; APIs</span>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70">
            <span className="block font-mono text-2xl sm:text-3xl font-extrabold text-neutral-900">99.9%</span>
            <span className="text-xs text-neutral-500 font-medium">Reliability Target</span>
          </div>
          <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/70">
            <span className="block font-mono text-2xl sm:text-3xl font-extrabold text-neutral-900">Code Craft</span>
            <span className="text-xs text-neutral-500 font-medium">Co-founded Agency</span>
          </div>
        </div>
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
        <div className="w-full shadow-2xl rounded-xl overflow-hidden">
          <TerminalWindow />
        </div>

        <p className="text-[11px] sm:text-xs text-neutral-400 font-mono mt-3 text-center">
          💡 Interactive simulation. Hover or tap <span className="text-neutral-700 font-semibold underline underline-offset-2">Code Craft</span> to reveal the live whois metadata card.
        </p>
      </section>

      {/* ================= 4. DETAILED EXPERIENCE TIMELINE ================= */}
      <section className="w-full max-w-4xl px-4 sm:px-6 md:px-10 py-12 flex flex-col gap-8">
        <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-4">
          <Server className="w-4 h-4 text-neutral-700" />
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900">
            Roles &amp; Ventures
          </h2>
        </div>

        {/* Role 1: Code Craft */}
        <div className="relative pl-6 sm:pl-8 border-l-2 border-neutral-900 flex flex-col gap-3">
          {/* Timeline Dot */}
          <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-neutral-900 ring-4 ring-white" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900">
                Backend Developer &amp; Co-founder
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                Present
              </span>
            </div>
            <span className="text-xs font-mono text-neutral-500 font-medium">
              2024 — Present
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-700">
            <span>Code Craft</span>
            <span className="text-neutral-400">•</span>
            <a
              href="https://www.codecraftnet.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-black inline-flex items-center gap-1 transition-colors"
            >
              <span>codecraftnet.com</span>
              <ArrowUpRight className="w-3 h-3" />
            </a>
          </div>

          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed pt-1">
            Spearheaded backend architecture and system reliability across client projects and internal ventures. Responsible for defining database models, building resilient microservices, and setting up automated CI/CD delivery pipelines.
          </p>

          <ul className="flex flex-col gap-2 pt-2 text-xs sm:text-sm text-neutral-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
              <span>Architected scalable REST APIs in Node.js and Python with robust input validation, rate limiting, and structured logging.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
              <span>Designed PostgreSQL schemas and integrated Redis caching layers to reduce database query execution times by up to 45%.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
              <span>Configured Docker containerization and GitHub Actions CI/CD workflows for seamless multi-environment deployments.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
              <span>Implemented secure OAuth 2.0 / JWT authentication patterns and fine-grained role-based access control (RBAC).</span>
            </li>
          </ul>

          <div className="flex flex-wrap gap-1.5 pt-3">
            {['Node.js', 'Express', 'Python', 'PostgreSQL', 'Redis', 'Docker', 'CI/CD', 'AWS', 'REST APIs', 'System Design'].map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 text-[11px] font-mono font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Role 2: Freelance & Full-Stack Projects */}
        <div className="relative pl-6 sm:pl-8 border-l-2 border-neutral-300 flex flex-col gap-3">
          {/* Timeline Dot */}
          <div className="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-neutral-400 ring-4 ring-white" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900">
              Full-Stack &amp; Backend Engineer
            </h3>
            <span className="text-xs font-mono text-neutral-500 font-medium">
              2023 — 2024
            </span>
          </div>

          <div className="text-xs sm:text-sm font-semibold text-neutral-700">
            Independent / Client Solutions
          </div>

          <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed pt-1">
            Delivered end-to-end web applications and bespoke API integrations for founders and businesses. Focused on reliable data persistence, security, and responsive UI integration.
          </p>

          <ul className="flex flex-col gap-2 pt-2 text-xs sm:text-sm text-neutral-700">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
              <span>Built custom backend services with Express.js, MongoDB, and secure third-party webhook integrations.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
              <span>Developed high-performance frontend interfaces using modern React, Tailwind CSS, and optimized bundle configurations.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
              <span>Managed database migrations, schema indexing, and server deployment setups.</span>
            </li>
          </ul>

          <div className="flex flex-wrap gap-1.5 pt-3">
            {['TypeScript', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Git', 'Tailwind CSS'].map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 rounded-lg bg-neutral-100 text-neutral-700 text-[11px] font-mono font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 5. TECHNICAL COMPETENCIES ================= */}
      <section className="w-full max-w-4xl px-4 sm:px-6 md:px-10 py-10 flex flex-col gap-6">
        <div className="flex items-center gap-2 border-b border-neutral-200/80 pb-4">
          <ShieldCheck className="w-4 h-4 text-neutral-700" />
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900">
            Core Competencies
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 flex flex-col gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <Server className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-neutral-900">Backend &amp; APIs</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Node.js, Express, Python, RESTful Architecture, GraphQL, Microservices, Async Queues, Authentication (JWT / OAuth2).
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 flex flex-col gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-neutral-900">Databases &amp; Caching</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              PostgreSQL, Redis in-memory caching, MongoDB, Relational Schema Modeling, Query Profiling &amp; Indexing.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-neutral-50/70 border border-neutral-200/80 flex flex-col gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-sm text-neutral-900">DevOps &amp; Cloud</h4>
            <p className="text-xs text-neutral-600 leading-relaxed">
              Docker containerization, GitHub Actions CI/CD workflows, Linux/Bash automation, AWS / Cloud hosting, reverse proxies.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 6. BOTTOM CTA & FOOTER ================= */}
      <section className="w-full max-w-4xl px-4 sm:px-6 md:px-10 py-12">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#0a0a0a] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-md">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Let's Build Something Resilient
            </h3>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
              Available for full-time backend roles, contracting, or discussing architectural challenges.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="mailto:nikelesh2006@gmail.com"
              className="inline-flex items-center gap-1.5 px-6 py-3 rounded-full bg-white text-black font-bold text-xs sm:text-sm hover:bg-neutral-200 transition-colors shadow-lg"
            >
              <span>Get in touch</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <span>Home</span>
            </button>
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="mt-12 pt-6 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 pb-10">
          <p>© {new Date().getFullYear()} Nikeleshwaran T. All rights reserved.</p>

          <div className="flex items-center gap-4">
            {socialLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                target={item.isExternal ? '_blank' : undefined}
                rel={item.isExternal ? 'noopener noreferrer' : undefined}
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
