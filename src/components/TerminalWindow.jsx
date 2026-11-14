import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { TERMINAL_POPUP_DATA } from '../constants/terminalData';
import './TerminalWindow.css';

export default function TerminalWindow({
  user = 'nikelesh',
  title = 'nikelesh — portfolio',
  popupData = TERMINAL_POPUP_DATA
}) {
  const containerRef = useRef(null);
  const linkRef = useRef(null);
  const popupRef = useRef(null);
  const isTouchDeviceRef = useRef(false);
  const leaveTimerRef = useRef(null);

  // Live Clock (HH:MM:SS)
  const [timeStr, setTimeStr] = useState(() => {
    const d = new Date();
    return d.toTimeString().split(' ')[0];
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const d = new Date();
      setTimeStr(d.toTimeString().split(' ')[0]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Check prefers-reduced-motion
  const checkReducedMotion = useCallback(() => {
    return (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
    );
  }, []);

  const fullLine1 = 'need to know ?';
  const linkPart1 = 'Code Craft';
  const linkPart2 = ' www.codecraftnet.com';
  const fullLine2 = linkPart1 + linkPart2; // 10 + 21 = 31 chars

  // Terminal Typing State Machine (init with full text if reduced motion)
  const isReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  const [hasStarted, setHasStarted] = useState(isReduced);
  const [activeLine, setActiveLine] = useState(isReduced ? 3 : 1);
  const [line1Chars, setLine1Chars] = useState(isReduced ? fullLine1.length : 0);
  const [showLine2, setShowLine2] = useState(isReduced);
  const [line2Chars, setLine2Chars] = useState(isReduced ? fullLine2.length : 0);
  const [showLine3, setShowLine3] = useState(isReduced);
  const [isTypingFinished, setIsTypingFinished] = useState(isReduced);

  // Popup Tooltip State
  const [isPopupMounted, setIsPopupMounted] = useState(false);
  const [isPopupClosing, setIsPopupClosing] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0, isFlipped: false });
  const [revealedPopupLines, setRevealedPopupLines] = useState(0);

  // 1. Intersection Observer to trigger typing when scrolled into view
  useEffect(() => {
    const node = containerRef.current;
    if (!node || hasStarted || isReduced) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasStarted, isReduced]);

  // 2. Typing sequence effect
  useEffect(() => {
    if (!hasStarted || checkReducedMotion()) return;

    let timerId = null;

    // Helper for random typing jitter (35ms - 60ms)
    const getJitter = () => Math.floor(Math.random() * 26) + 35;

    if (activeLine === 1) {
      if (line1Chars < fullLine1.length) {
        timerId = setTimeout(() => {
          setLine1Chars((prev) => prev + 1);
        }, getJitter());
      } else {
        // Line 1 complete: pause 400ms before starting Line 2
        timerId = setTimeout(() => {
          setShowLine2(true);
          setActiveLine(2);
        }, 400);
      }
    } else if (activeLine === 2) {
      if (line2Chars < fullLine2.length) {
        timerId = setTimeout(() => {
          setLine2Chars((prev) => prev + 1);
        }, getJitter());
      } else {
        // Line 2 complete: pause 250ms, then show Line 3
        timerId = setTimeout(() => {
          setShowLine3(true);
          setActiveLine(3);
          setIsTypingFinished(true);
        }, 250);
      }
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [hasStarted, activeLine, line1Chars, line2Chars, fullLine1.length, fullLine2.length, checkReducedMotion]);

  // Measure and position the hover popup
  const updatePopupPosition = useCallback(() => {
    if (!linkRef.current) return;
    const rect = linkRef.current.getBoundingClientRect();
    const popupWidth = Math.min(320, window.innerWidth - 32);
    const estimatedHeight = 220; // approximate popup height

    // Center horizontally over the link, constrained to screen padding
    let left = rect.left + rect.width / 2 - popupWidth / 2;
    left = Math.max(16, Math.min(left, window.innerWidth - popupWidth - 16));

    // Default above; flip below if insufficient room above
    let top = rect.top - estimatedHeight - 12;
    let isFlipped = false;

    if (top < 16) {
      top = rect.bottom + 12;
      isFlipped = true;
    }

    setPopupPos({ top, left, isFlipped });
  }, []);

  // Open Popup handler
  const openPopup = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    updatePopupPosition();
    const isReduced = checkReducedMotion();
    setRevealedPopupLines(isReduced ? popupData.details.length + 2 : 0);
    setIsPopupClosing(false);
    setIsPopupMounted(true);
  }, [updatePopupPosition, checkReducedMotion, popupData.details.length]);

  // Close Popup handler with hover-intent delay
  const closePopup = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
    }
    leaveTimerRef.current = setTimeout(() => {
      setIsPopupClosing(true);
      setTimeout(() => {
        setIsPopupMounted(false);
        setIsPopupClosing(false);
        setRevealedPopupLines(0);
      }, 120);
    }, 100);
  }, []);

  // Popup line-by-line staggered reveal
  useEffect(() => {
    if (!isPopupMounted || isPopupClosing || checkReducedMotion()) return;

    const totalLines = popupData.details.length + 1; // command line + details
    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      setRevealedPopupLines(current);
      if (current >= totalLines) {
        clearInterval(interval);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [isPopupMounted, isPopupClosing, popupData.details.length, checkReducedMotion]);

  // Window resize / scroll position updates
  useEffect(() => {
    if (!isPopupMounted) return;
    const handleScrollOrResize = () => updatePopupPosition();
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize);
    };
  }, [isPopupMounted, updatePopupPosition]);

  // Escape key closes popup
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isPopupMounted) {
        setIsPopupMounted(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPopupMounted]);

  // Link click handler (two-tap for touch devices)
  const handleLinkClick = (e) => {
    if (!isTypingFinished) {
      e.preventDefault();
      return;
    }

    if (isTouchDeviceRef.current && !isPopupMounted) {
      e.preventDefault();
      openPopup();
    }
  };

  // Render Line 2 output text
  const renderedPart1 = fullLine2.slice(0, Math.min(line2Chars, linkPart1.length));
  const renderedPart2 =
    line2Chars > linkPart1.length
      ? fullLine2.slice(linkPart1.length, line2Chars)
      : '';

  return (
    <div ref={containerRef} className="terminal-root">
      {/* 1. Window Chrome Titlebar */}
      <div className="terminal-titlebar">
        {/* Decorative Window Controls (12px dots with 8px gap) */}
        <div className="terminal-dots" aria-hidden="true">
          <span className="terminal-dot bg-[#ff5f57]" />
          <span className="terminal-dot bg-[#febc2e]" />
          <span className="terminal-dot bg-[#28c840]" />
        </div>

        {/* Center Title */}
        <div className="text-xs font-mono text-white/45 tracking-wide select-none">
          {title}
        </div>

        {/* Far Right: Live Clock */}
        <div className="text-xs font-mono text-white/35 tracking-wider select-none hidden sm:inline-block">
          {timeStr}
        </div>
      </div>

      {/* 2. Terminal Body */}
      <div className="terminal-body">
        {/* Line 1 */}
        <div className="flex items-center flex-wrap">
          <span className="terminal-prompt">~/{user}&nbsp;$&nbsp;</span>
          <span className="terminal-text">{fullLine1.slice(0, line1Chars)}</span>
          {activeLine === 1 && <span className="terminal-caret" aria-hidden="true" />}
        </div>

        {/* Line 2 (Output with interactive link) */}
        {showLine2 && (
          <div className="flex items-center flex-wrap">
            <span className="terminal-output-arrow">→&nbsp;</span>
            <div className="terminal-link-wrapper">
              <a
                ref={linkRef}
                href="https://www.codecraftnet.com"
                target="_blank"
                rel="noopener noreferrer"
                className="terminal-link"
                style={{
                  pointerEvents: isTypingFinished ? 'auto' : 'none',
                  cursor: isTypingFinished ? 'pointer' : 'default'
                }}
                aria-describedby={isPopupMounted ? 'terminal-popup-tooltip' : undefined}
                onTouchStart={() => {
                  isTouchDeviceRef.current = true;
                }}
                onMouseEnter={() => {
                  if (isTypingFinished) openPopup();
                }}
                onMouseLeave={() => {
                  if (isTypingFinished) closePopup();
                }}
                onFocus={() => {
                  if (isTypingFinished) openPopup();
                }}
                onBlur={() => {
                  if (isTypingFinished) closePopup();
                }}
                onClick={handleLinkClick}
              >
                <span>{renderedPart1}</span>
                {renderedPart2 && (
                  <span className="terminal-link-url">{renderedPart2}</span>
                )}
              </a>
            </div>
            {activeLine === 2 && <span className="terminal-caret" aria-hidden="true" />}
          </div>
        )}

        {/* Line 3 (Waiting prompt) */}
        {showLine3 && (
          <div className="flex items-center flex-wrap">
            <span className="terminal-prompt">~/{user}&nbsp;$&nbsp;</span>
            {activeLine === 3 && <span className="terminal-caret" aria-hidden="true" />}
          </div>
        )}
      </div>

      {/* 3. Hover Popup Portal (Mounted to document.body) */}
      {isPopupMounted &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={popupRef}
            id="terminal-popup-tooltip"
            role="tooltip"
            className={`terminal-popup-portal ${popupPos.isFlipped ? 'flipped' : ''} ${
              isPopupClosing ? 'closing' : ''
            }`}
            style={{
              top: `${popupPos.top}px`,
              left: `${popupPos.left}px`
            }}
            onMouseEnter={openPopup}
            onMouseLeave={closePopup}
          >
            {/* Popup Mini Titlebar */}
            <div className="terminal-popup-titlebar">
              <div className="terminal-popup-dots" aria-hidden="true">
                <span className="terminal-popup-dot bg-[#ff5f57]" />
                <span className="terminal-popup-dot bg-[#febc2e]" />
                <span className="terminal-popup-dot bg-[#28c840]" />
              </div>
              <span className="font-mono text-white/50">{popupData.title}</span>
            </div>

            {/* Popup Body */}
            <div className="terminal-popup-body">
              {/* Command Line */}
              {revealedPopupLines >= 1 && (
                <div className="terminal-popup-line text-white/80 pb-1.5 border-b border-white/[0.06] mb-2 font-mono">
                  <span className="text-[#7c8cff] mr-1.5">$</span>
                  <span>{popupData.command}</span>
                </div>
              )}

              {/* Details Lines */}
              <div className="flex flex-col gap-1 font-mono">
                {popupData.details.map((item, idx) => {
                  const lineNum = idx + 2;
                  if (revealedPopupLines < lineNum) return null;

                  return (
                    <div key={item.label} className="terminal-popup-line">
                      <span className="terminal-popup-label">{item.label}</span>
                      <span className="terminal-popup-value">
                        {item.isStatus && <span className="terminal-status-dot" />}
                        {item.value}
                      </span>
                    </div>
                  );
                })}

                {/* Final line with blinking caret */}
                {revealedPopupLines >= popupData.details.length + 1 && (
                  <div className="terminal-popup-line pt-0.5">
                    <span className="terminal-caret" aria-hidden="true" />
                  </div>
                )}
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
