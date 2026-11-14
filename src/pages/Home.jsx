import { useRef } from 'react';
import { ArrowUpRight, Mail, FileText } from 'lucide-react';
import TechText from '../components/TechText';
import GhostType from '../components/GhostType';
import ColorRevealPhoto from '../components/ColorRevealPhoto';
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
  const cardRef = useRef(null);

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
      href: 'mailto:nikeleshwaran006@gmail.com',
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
      className="w-full min-h-screen bg-white flex items-center justify-center font-['Manrope',sans-serif] selection:bg-neutral-900 selection:text-white overflow-x-hidden"
      style={{
        backgroundColor: 'var(--frame-bg, #ffffff)'
      }}
    >
      {/* Full Viewport Canvas Card (governed by --frame) */}
      <div
        ref={cardRef}
        className="relative bg-white flex flex-col justify-between overflow-x-hidden overflow-y-auto min-[900px]:overflow-hidden transition-all duration-300"
        style={{
          margin: 'var(--frame, 0px)',
          borderRadius: 'var(--frame, 0px)',
          width: 'calc(100% - (var(--frame, 0px) * 2))',
          height: 'calc(100dvh - (var(--frame, 0px) * 2))',
          minHeight: 'calc(100vh - (var(--frame, 0px) * 2))'
        }}
      >
        {/* ================= 1. TOP NAVBAR REGION ================= */}
        <header className="relative z-30 w-full max-w-full px-4 py-3 sm:px-6 sm:py-4 md:px-10 md:py-5 flex items-center justify-between border-b border-neutral-100 shrink-0">
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
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 sm:px-5 sm:py-2.5 rounded-full bg-[#0a0a0a] text-white text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-all shadow-xs shrink-0"
            >
              <span>Let's Talk</span>
              <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </a>
          </div>
        </header>

        {/* ================= 2. MIDDLE REGION: TECHTEXT NAME ================= */}
        <div className="relative w-full max-w-full overflow-hidden flex-1 min-h-0 z-[1] flex items-center justify-center pointer-events-none pt-[1.5vh] pb-[1vh]">
          <div
            className="w-full max-w-full relative pointer-events-auto"
            style={{
              height: 'clamp(200px, 34vh, 420px)'
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
            height: 'clamp(380px, 62vh, 800px)',
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
          className="relative z-10 w-full max-w-full px-4 sm:px-6 md:px-10 flex flex-col min-[900px]:flex-row justify-between items-start min-[900px]:items-end gap-6 pointer-events-auto shrink-0"
          style={{
            paddingBottom: 'clamp(24px, 3vh, 40px)'
          }}
        >
          {/* Bottom Left: Title, Description & CTA */}
          <div
            className="w-full min-[900px]:max-w-[min(46vw,720px)] bg-white/80 min-[900px]:bg-transparent backdrop-blur-xs min-[900px]:backdrop-blur-none p-3 min-[900px]:p-0 rounded-xl"
          >
            {/* Fixed min-height for one line so GhostType transitions do not shift layout */}
            <div className="min-h-[1.25em] flex items-center">
              <GhostType
                as="h2"
                className="hero-ghost-title"
                text="Co-founder of Code Craft"
                completions={[
                  ', Full Stack Developer',
                  ', DevOps Engineer',
                  ', AI Architect'
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
              className="text-neutral-500 font-normal leading-relaxed"
              style={{
                fontSize: 'clamp(13px, 1vw, 16px)',
                maxWidth: '420px',
                marginTop: 'clamp(8px, 1.2vh, 14px)'
              }}
            >
              I build and ship full-stack products, from backend APIs to deployment pipelines.
            </p>

            <a
              href="#contact"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0a0a0a] text-white font-semibold hover:bg-neutral-800 transition-all shadow-xs"
              style={{
                fontSize: 'clamp(12px, 0.9vw, 14px)',
                padding: 'clamp(8px, 1.2vh, 12px) clamp(16px, 1.5vw, 22px)',
                marginTop: 'clamp(10px, 1.5vh, 18px)'
              }}
            >
              <span>Let's collaborate</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Bottom Right: Social Pills */}
          <div className="w-full min-[900px]:w-auto flex flex-wrap min-[900px]:flex-col items-start min-[900px]:items-end gap-2.5">
            {socialLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  target={item.isExternal ? '_blank' : undefined}
                  rel={item.isExternal ? 'noopener noreferrer' : undefined}
                  className="group inline-flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/90 backdrop-blur-sm border border-neutral-200/90 shadow-[0_2px_6px_rgba(0,0,0,0.03)] text-xs font-semibold text-neutral-700 hover:text-black hover:border-neutral-400 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <Icon className="w-3.5 h-3.5 text-neutral-500 group-hover:text-black transition-colors" />
                  <span>{item.name}</span>
                  <ArrowUpRight className="w-3 h-3 text-neutral-400 group-hover:text-black transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              );
            })}
          </div>
        </div>

      </div>
    </main>
  );
}
