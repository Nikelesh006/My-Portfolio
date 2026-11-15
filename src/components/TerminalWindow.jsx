import { useState, useEffect, useRef, useCallback } from 'react';
import { TERMINAL_POPUP_DATA } from '../constants/terminalData';
import './TerminalWindow.css';

export default function TerminalWindow({
  user = 'nikelesh',
  title = 'nikelesh — portfolio',
  popupData = TERMINAL_POPUP_DATA
}) {
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
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
  const fullLine2 = linkPart1 + linkPart2; // 31 chars

  // Terminal Typing State Machine
  const isReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  const [hasStarted, setHasStarted] = useState(isReduced);
  const [activeLine, setActiveLine] = useState(isReduced ? 3 : 1);
  const [line1Chars, setLine1Chars] = useState(isReduced ? fullLine1.length : 0);
  const [showLine2, setShowLine2] = useState(isReduced);
  const [line2Chars, setLine2Chars] = useState(isReduced ? fullLine2.length : 0);
  const [showLine3, setShowLine3] = useState(isReduced);
  const [isTypingFinished, setIsTypingFinished] = useState(isReduced);

  // Popup Tooltip State
  const [isOpen, setIsOpen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

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
      { threshold: 0.1, rootMargin: '60px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasStarted, isReduced]);

  // 2. Typing sequence effect
  useEffect(() => {
    if (!hasStarted || checkReducedMotion() || isTypingFinished) return;

    let timerId = null;
    const getJitter = () => Math.floor(Math.random() * 20) + 25;

    if (activeLine === 1) {
      if (line1Chars < fullLine1.length) {
        timerId = setTimeout(() => {
          setLine1Chars((prev) => prev + 1);
        }, getJitter());
      } else {
        // Line 1 complete: pause 300ms before starting Line 2
        timerId = setTimeout(() => {
          setShowLine2(true);
          setActiveLine(2);
        }, 300);
      }
    } else if (activeLine === 2) {
      if (line2Chars < fullLine2.length) {
        timerId = setTimeout(() => {
          setLine2Chars((prev) => prev + 1);
        }, getJitter());
      } else {
        // Line 2 complete: pause 200ms, then show Line 3
        timerId = setTimeout(() => {
          setShowLine3(true);
          setActiveLine(3);
          setIsTypingFinished(true);
        }, 200);
      }
    }

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [hasStarted, activeLine, line1Chars, line2Chars, fullLine1.length, fullLine2.length, isTypingFinished, checkReducedMotion]);

  // Check flip position based on link location relative to viewport
  const checkFlip = useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    // If less than 240px from top of viewport, flip below the link
    setIsFlipped(rect.top < 240);
  }, []);

  // Open Popup handler
  const openPopup = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    // If user hovers before typing has finished, instantly reveal the full text
    if (!isTypingFinished) {
      setShowLine2(true);
      setLine2Chars(fullLine2.length);
      setShowLine3(true);
      setActiveLine(3);
      setIsTypingFinished(true);
    }
    checkFlip();
    setIsOpen(true);
  }, [checkFlip, isTypingFinished, fullLine2.length]);

  // Close Popup handler with hover-intent delay (200ms) to ensure smooth transition
  const closePopup = useCallback(() => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
    }
    leaveTimerRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200);
  }, []);

  // Update flip state on window scroll or resize
  useEffect(() => {
    if (!isOpen) return;
    const handleScrollOrResize = () => checkFlip();
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    window.addEventListener('scroll', handleScrollOrResize, { passive: true, capture: true });
    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
    };
  }, [isOpen, checkFlip]);

  // Escape key and outside click closes popup
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Link click handler (two-tap on touch devices)
  const handleLinkClick = (e) => {
    if (isTouchDeviceRef.current && !isOpen) {
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
            <div
              ref={wrapperRef}
              className="terminal-link-wrapper"
              onMouseEnter={openPopup}
              onMouseMove={openPopup}
              onMouseLeave={closePopup}
            >
              <a
                ref={linkRef}
                href="https://www.codecraftnet.com"
                target="_blank"
                rel="noopener noreferrer"
                className="terminal-link"
                aria-describedby={isOpen ? 'terminal-popup-tooltip' : undefined}
                onTouchStart={() => {
                  isTouchDeviceRef.current = true;
                }}
                onFocus={openPopup}
                onBlur={closePopup}
                onClick={handleLinkClick}
              >
                <span>{renderedPart1}</span>
                {renderedPart2 && (
                  <span className="terminal-link-url">{renderedPart2}</span>
                )}
              </a>

              {/* Hover Popup (Anchored directly inside wrapper) */}
              {isOpen && (
                <div
                  ref={popupRef}
                  id="terminal-popup-tooltip"
                  role="tooltip"
                  className={`terminal-popup ${isFlipped ? 'flipped' : ''}`}
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

                  {/* Popup Body - All details text rendered and immediately visible */}
                  <div className="terminal-popup-body">
                    {/* Command Line */}
                    <div className="terminal-popup-line text-white/80 pb-1.5 border-b border-white/[0.06] mb-2 font-mono">
                      <span className="text-[#7c8cff] mr-1.5">$</span>
                      <span>{popupData.command}</span>
                    </div>

                    {/* Details Lines */}
                    <div className="flex flex-col gap-1 font-mono">
                      {popupData.details.map((item) => (
                        <div key={item.label} className="terminal-popup-line">
                          <span className="terminal-popup-label">{item.label}</span>
                          <span className="terminal-popup-value">
                            {item.isStatus && <span className="terminal-status-dot" />}
                            {item.value}
                          </span>
                        </div>
                      ))}

                      {/* Final line with blinking caret */}
                      <div className="terminal-popup-line pt-0.5">
                        <span className="terminal-caret" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
    </div>
  );
}
