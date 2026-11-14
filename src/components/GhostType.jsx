import React, { useState, useEffect, useRef, useCallback } from 'react';

export default function GhostType({
  as: Component = 'p',
  text = '',
  completions = [],
  fontSize,
  fontWeight = 500,
  textColor = '#ffffff',
  accentColor = '#8B5CF6',
  ghostOpacity = 0.38,
  align = 'center',
  typeSpeed = 45,
  holdDelay = 1800,
  loop = true,
  startOnView = true,
  pauseOnHover = true,
  clickToAccept = true,
  hint = true,
  hintLabel = 'Tab',
  caret = 'bar',
  className = '',
  style = {}
}) {
  const containerRef = useRef(null);
  const [isInView, setIsInView] = useState(!startOnView);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Typing states
  const [displayedBase, setDisplayedBase] = useState(0);
  const [completionIndex, setCompletionIndex] = useState(0);
  const [completionProgress, setCompletionProgress] = useState(0);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Track mobile viewport (<640px)
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Intersection Observer for startOnView
  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [startOnView]);

  const targetCompletion = completions[completionIndex] || '';

  // Accept completion handler
  const acceptCompletion = useCallback(() => {
    if (displayedBase < text.length || isAccepted) return;
    setCompletionProgress(targetCompletion.length);
    setIsAccepted(true);
  }, [displayedBase, text.length, isAccepted, targetCompletion.length]);

  // Tab key to accept
  useEffect(() => {
    if (!clickToAccept && !hint) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Tab' && !isAccepted && displayedBase >= text.length && completionProgress > 0) {
        e.preventDefault();
        acceptCompletion();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clickToAccept, hint, isAccepted, displayedBase, text.length, completionProgress, acceptCompletion]);

  // Main animation effect loop
  useEffect(() => {
    if (!isInView) return;
    if (pauseOnHover && isHovered) return;

    let timer;

    // Phase 1: Type the persistent base text
    if (displayedBase < text.length) {
      timer = setTimeout(() => {
        setDisplayedBase((prev) => prev + 1);
      }, typeSpeed);
      return () => clearTimeout(timer);
    }

    // Phase 2: Handle completions
    if (!completions.length) return;

    // 2a: Suggesting / Typing the ghost completion
    if (!isAccepted && !isDeleting) {
      if (completionProgress < targetCompletion.length) {
        timer = setTimeout(() => {
          setCompletionProgress((prev) => prev + 1);
        }, typeSpeed);
      } else {
        // Ghost text is fully suggested; hold before auto-accepting
        timer = setTimeout(() => {
          setIsAccepted(true);
        }, holdDelay / 2);
      }
      return () => clearTimeout(timer);
    }

    // 2b: Accepted state (solidified); hold for full holdDelay, then start erasing
    if (isAccepted && !isDeleting) {
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, holdDelay);
      return () => clearTimeout(timer);
    }

    // 2c: Erasing the completion back to base text
    if (isDeleting) {
      if (completionProgress > 0) {
        timer = setTimeout(() => {
          setCompletionProgress((prev) => prev - 1);
        }, Math.max(20, Math.floor(typeSpeed * 0.6)));
      } else {
        // Erase complete; cycle to next completion inside a tick
        timer = setTimeout(() => {
          setIsDeleting(false);
          setIsAccepted(false);
          if (loop || completionIndex < completions.length - 1) {
            setCompletionIndex((prev) => (prev + 1) % completions.length);
          }
        }, typeSpeed);
      }
      return () => clearTimeout(timer);
    }
  }, [
    isInView,
    isHovered,
    pauseOnHover,
    displayedBase,
    text.length,
    completions.length,
    completionIndex,
    completionProgress,
    targetCompletion.length,
    isAccepted,
    isDeleting,
    typeSpeed,
    holdDelay,
    loop
  ]);

  const isDarkText = textColor === '#0a0a0a' || textColor === '#000000' || textColor === '#111827' || textColor.startsWith('rgb(0') || textColor.startsWith('rgba(0');
  const currentFontSize = fontSize !== undefined
    ? (isMobile
        ? (typeof fontSize === 'number' ? `${Math.min(20, fontSize)}px` : 'clamp(18px, 4.5vw, 20px)')
        : (typeof fontSize === 'number' ? `${fontSize}px` : fontSize))
    : undefined;
  const visibleBase = text.slice(0, displayedBase);
  const visibleGhost = targetCompletion.slice(0, completionProgress);

  return (
    <>
      <style>{`
        @keyframes ghostCaretBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
      <Component
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`ghost-type-root ${className}`}
        style={{
          ...(currentFontSize !== undefined ? { fontSize: currentFontSize } : {}),
          fontWeight,
          color: textColor,
          textAlign: align,
          lineHeight: style?.lineHeight || 1.15,
          margin: 0,
          position: 'relative',
          display: 'inline-block',
          cursor: clickToAccept && !isAccepted ? 'pointer' : 'default',
          userSelect: 'none',
          ...style
        }}
        onClick={() => {
          if (clickToAccept && !isAccepted) {
            acceptCompletion();
          }
        }}
      >
        {/* Base text */}
        <span>{visibleBase}</span>

        {/* Completion ghost / accepted text */}
        {visibleGhost && (
          <span
            style={{
              color: isAccepted ? textColor : accentColor,
              opacity: isAccepted ? 1 : ghostOpacity,
              transition: 'opacity 0.25s ease, color 0.25s ease'
            }}
          >
            {visibleGhost}
          </span>
        )}

        {/* Blinking Caret */}
        {caret === 'bar' && (
          <span
            style={{
              display: 'inline-block',
              width: '2px',
              height: '1.15em',
              background: accentColor || textColor,
              marginLeft: '4px',
              verticalAlign: '-0.15em',
              animation: 'ghostCaretBlink 0.9s infinite',
              borderRadius: '1px'
            }}
          />
        )}

        {/* Tab Hint badge */}
        {hint && !isAccepted && completionProgress > 0 && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              acceptCompletion();
            }}
            title="Press Tab or Click to accept"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              marginLeft: '10px',
              padding: '2px 7px',
              fontSize: '11px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontWeight: 500,
              borderRadius: '5px',
              background: isDarkText ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
              border: isDarkText ? '1px solid rgba(0, 0, 0, 0.15)' : '1px solid rgba(255, 255, 255, 0.18)',
              color: isDarkText ? 'rgba(0, 0, 0, 0.65)' : 'rgba(255, 255, 255, 0.7)',
              verticalAlign: 'middle',
              cursor: 'pointer',
              letterSpacing: '0.04em',
              transition: 'background 0.15s ease, border-color 0.15s ease'
            }}
          >
            {hintLabel}
          </span>
        )}
      </Component>
    </>
  );
}
