import React, { useState, useEffect, useRef, Suspense } from 'react';
import { SKILL_CATEGORIES, HEADLINE } from '../constants/skillsData';
import { Box, ShieldCheck } from 'lucide-react';

export { SKILL_CATEGORIES, HEADLINE };

// Lazy-load the heavy 3D gallery bundle
const SkillsGallery3D = React.lazy(() => import('./SkillsGallery3D'));

/**
 * Original SVG Icon: Down Arrow in Square Outline
 */
function SquareDownArrowIcon({ className = 'w-7 h-7' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
    >
      <rect x="2.5" y="2.5" width="19" height="19" />
      <path d="M12 6.5v11M7.5 13l4.5 4.5 4.5-4.5" />
    </svg>
  );
}

/**
 * Loading skeleton fallback while the 3D canvas bundle downloads
 */
function SkillsLoadingFallback() {
  return (
    <div className="absolute inset-0 w-full h-full bg-[#f5f5f2] flex flex-col items-center justify-center p-6 text-neutral-800 z-10">
      <div className="w-12 h-12 rounded-full border-2 border-neutral-300 border-t-neutral-800 animate-spin mb-4" />
      <span className="font-mono text-sm tracking-wide text-neutral-800 font-semibold">
        Loading Virtual 3D Gallery...
      </span>
      <span className="font-mono text-xs text-neutral-500 mt-1">
        Preparing architectural room & high-key gallery lighting
      </span>
    </div>
  );
}

/**
 * Accessible 2D Card Grid Fallback for Mobile (< 640px), Reduced Motion, or List Mode
 */
function SkillsCardGrid({ categories }) {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6">
      {categories.map((category) => (
        <div
          key={category.id}
          className="group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl bg-neutral-50 border border-neutral-200/80 hover:border-neutral-400 hover:shadow-md transition-all duration-200"
        >
          <div>
            {/* Header: Tag & Title */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200/60 mb-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="font-mono text-xs uppercase tracking-wider text-neutral-500 font-semibold">
                  {category.id}
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Production</span>
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900">
              {category.title}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 leading-relaxed">
              {category.description}
            </p>

            {/* Skills Level Progress Bars */}
            <div className="mt-5 flex flex-col gap-3 font-mono">
              {category.skills?.map((skill) => (
                <div key={skill.name} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-neutral-800">{skill.name}</span>
                    <span className="text-neutral-500">{skill.level}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-neutral-200/70 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${skill.level}%`,
                        backgroundColor: category.color || '#3b82f6'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tags Footer */}
          <div className="mt-5 pt-3 border-t border-neutral-200/60 flex flex-wrap gap-1.5">
            {category.tags?.map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-white border border-neutral-200 text-neutral-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Main Skills Section:
 * - Desktop (>= 900px): 50/50 split layout with Left Panel (Wordmark, Headline, 2 Buttons) and Right 3D Gallery Canvas
 * - Tablet (< 900px): Vertical stack (Top content, 60vh 3D canvas preview below, expandable on enter)
 * - Mobile (< 640px) / List Mode / Reduced Motion: 2D Accessible Card Grid
 */
export default function SkillsSection({ className = '' }) {
  const sectionRef = useRef(null);
  const [shouldLoad3D, setShouldLoad3D] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.location.hash.toLowerCase() === '#skills' ||
      window.location.pathname.toLowerCase().includes('skills')
    );
  });
  const [isSectionInView, setIsSectionInView] = useState(false);
  const [viewMode, setViewMode] = useState('3d'); // '3d' | 'list'
  const [isExpanded, setIsExpanded] = useState(false);

  // Responsive state
  const [windowWidth, setWindowWidth] = useState(() => {
    if (typeof window === 'undefined') return 1200;
    return window.innerWidth;
  });

  const isSmallScreen = windowWidth < 640;
  const isNarrowDesktop = windowWidth < 900; // Below 900px: tablet vertical stack

  const [isReducedMotion, setIsReducedMotion] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  });

  const [hasWebGL, setHasWebGL] = useState(() => {
    if (typeof window === 'undefined') return true;
    try {
      const canvas = document.createElement('canvas');
      return !!(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      return false;
    }
  });

  // Screen resize listener
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // IntersectionObserver:
  // 1. Starts lazy-loading when 1 viewport away (rootMargin: '100% 0px')
  // 2. Tracks visibility to pause Three.js frameloop when scrolled out of view
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const preloadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad3D(true);
          preloadObserver.disconnect();
        }
      },
      { rootMargin: '100% 0px' }
    );
    preloadObserver.observe(el);

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        setIsSectionInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    visibilityObserver.observe(el);

    return () => {
      preloadObserver.disconnect();
      visibilityObserver.disconnect();
    };
  }, []);

  const show3D =
    viewMode === '3d' &&
    !isSmallScreen &&
    !isReducedMotion &&
    hasWebGL;

  // 1. 3D GALLERY VIEW (50/50 Desktop Split or Tablet Stack)
  if (show3D) {
    return (
      <section
        id="skills"
        ref={sectionRef}
        className={`relative w-full ${
          isNarrowDesktop && !isExpanded
            ? 'min-h-[100dvh] overflow-y-auto'
            : 'h-[100dvh] min-h-[100vh] overflow-hidden'
        } m-0 p-0 bg-[#f5f5f3] select-none ${className}`}
        style={{ scrollMarginTop: 0 }}
      >
        {/* LEFT PANEL: 50% width on Desktop, Stacked on Tablet */}
        <div
          className={`${
            isNarrowDesktop && !isExpanded
              ? 'relative w-full px-[5vw] pt-[calc(clamp(60px,7.5vh,80px)+5vh)] pb-8'
              : 'absolute top-0 left-0 w-full min-[900px]:w-1/2 h-full z-10'
          } bg-[#f5f5f3] flex flex-col justify-between px-[5vw] pb-[5vh] transition-all duration-[800ms] ease-[cubic-bezier(0.65,0,0.35,1)]`}
          style={{
            paddingTop: 'calc(clamp(60px, 7.5vh, 80px) + 5vh)',
            transform: isExpanded ? 'translateX(-40px)' : 'none',
            opacity: isExpanded ? 0 : 1,
            pointerEvents: isExpanded ? 'none' : 'auto'
          }}
        >
          {/* a) TOP: Wordmark "SKILLS" / "GALLERY" in Ultra-Bold Grotesque + Square Down Arrow Icon */}
          <div className="w-full flex flex-col items-start select-none">
            <div
              className="flex flex-col items-start leading-[0.9] tracking-[-0.04em] font-black uppercase text-black"
              style={{ fontSize: 'clamp(40px, 5vw, 96px)' }}
            >
              <div className="flex items-center">
                <span>SKILLS</span>
                <SquareDownArrowIcon className="ml-3 sm:ml-4 w-[0.52em] h-[0.52em] text-black shrink-0" />
              </div>
              <span>GALLERY</span>
            </div>
          </div>

          {/* b) MIDDLE: Large Bold Headline */}
          <div className="w-full my-auto py-6 sm:py-8">
            <h3
              className="font-bold text-black tracking-[-0.03em] leading-[1.08] max-w-[90%]"
              style={{
                fontSize: isNarrowDesktop
                  ? 'clamp(26px, 7vw, 40px)'
                  : 'clamp(32px, 3.9vw, 76px)'
              }}
            >
              {HEADLINE}
            </h3>
          </div>

          {/* c) BOTTOM: Two Rectangular Buttons Side by Side (Right-Aligned) */}
          <div className="w-full flex items-center justify-end gap-3.5 flex-wrap sm:flex-nowrap">
            {/* Button 1: Skills archive (opens list view) */}
            <button
              type="button"
              data-testid="skills-archive-btn"
              onClick={() => setViewMode('list')}
              className="py-[14px] px-[18px] bg-white text-black hover:bg-neutral-100 border border-black rounded-none font-mono uppercase tracking-wider font-semibold transition-colors cursor-pointer shadow-xs focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2"
              style={{ fontSize: 'clamp(13px, 1vw, 17px)' }}
              aria-label="Open skills archive list view"
            >
              Skills archive
            </button>

            {/* Button 2: Download resume (placeholder link) */}
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="py-[14px] px-[18px] bg-black text-white hover:bg-neutral-800 border border-black rounded-none font-mono uppercase tracking-wider font-semibold transition-colors cursor-pointer inline-flex items-center justify-center shadow-xs focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2"
              style={{ fontSize: 'clamp(13px, 1vw, 17px)' }}
              aria-label="Download resume PDF"
            >
              Download resume
            </a>
          </div>
        </div>

        {/* RIGHT HALF: 3D GALLERY CANVAS (Expands to 100% on enter) */}
        <div
          className={`${
            isNarrowDesktop && !isExpanded
              ? 'relative w-full h-[60vh] overflow-hidden'
              : 'absolute top-0 bottom-0 overflow-hidden'
          } transition-all duration-[800ms] ease-[cubic-bezier(0.65,0,0.35,1)]`}
          style={
            isNarrowDesktop && !isExpanded
              ? {}
              : {
                  left: isExpanded ? '0%' : '50%',
                  width: isExpanded ? '100%' : '50%',
                  height: '100%',
                  zIndex: isExpanded ? 30 : 0
                }
          }
        >
          {shouldLoad3D ? (
            <Suspense fallback={<SkillsLoadingFallback />}>
              <SkillsGallery3D
                isVisible={isSectionInView}
                isExpanded={isExpanded}
                isTablet={isNarrowDesktop}
                onEnter={() => setIsExpanded(true)}
                onExit={() => setIsExpanded(false)}
              />
            </Suspense>
          ) : (
            <SkillsLoadingFallback />
          )}
        </div>
      </section>
    );
  }

  // 2. 2D CARD GRID FALLBACK (List mode, Mobile < 640px, or Reduced Motion)
  return (
    <section
      id="skills"
      ref={sectionRef}
      className={`relative w-full min-h-[100dvh] overflow-y-auto bg-[#f5f5f3] flex flex-col items-start justify-start px-[5vw] pb-[clamp(48px,8vh,96px)] ${className}`}
      style={{
        paddingTop: 'calc(clamp(60px, 7.5vh, 80px) + 5vh)',
        scrollMarginTop: 0
      }}
    >
      {/* Top Header Row with Wordmark, Headline & Switch to 3D Button */}
      <div className="w-full flex flex-col gap-6 mb-8">
        {/* Wordmark */}
        <div className="w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div
            className="flex flex-col items-start leading-[0.9] tracking-[-0.04em] font-black uppercase text-black select-none"
            style={{ fontSize: 'clamp(40px, 5vw, 96px)' }}
          >
            <div className="flex items-center">
              <span>SKILLS</span>
              <SquareDownArrowIcon className="ml-3 sm:ml-4 w-[0.52em] h-[0.52em] text-black shrink-0" />
            </div>
            <span>GALLERY</span>
          </div>

          {/* Switch back to 3D gallery button (when supported) */}
          {!isSmallScreen && !isReducedMotion && hasWebGL && (
            <button
              type="button"
              onClick={() => setViewMode('3d')}
              className="py-[12px] px-[16px] bg-black text-white hover:bg-neutral-800 border border-black rounded-none font-mono uppercase tracking-wider text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-2 shadow-xs"
              aria-label="Switch back to 3D gallery view"
            >
              <Box className="w-3.5 h-3.5 text-white" />
              <span>Back to 3D gallery</span>
            </button>
          )}
        </div>

        {/* Headline */}
        <h3
          className="font-bold text-black tracking-[-0.03em] leading-[1.08] max-w-[90%]"
          style={{ fontSize: 'clamp(28px, 4vw, 56px)' }}
        >
          {HEADLINE}
        </h3>
      </div>

      {/* Accessible 2D Card Grid */}
      <SkillsCardGrid categories={SKILL_CATEGORIES} />
    </section>
  );
}