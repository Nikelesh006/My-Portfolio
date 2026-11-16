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

  // Commands and output text definitions
  const cmd1 = 'cd codecraft';
  const cmd2 = 'cat co-founder.txt';

  const out1Prefix = 'Role: Co-founder & Backend Developer @ ';
  const out1Link = 'Code Craft';
  const out1Full = out1Prefix + out1Link;

  const paragraphs = [
    'With 1+ years of active experience, I have architected and shipped 5+ projects currently active in production. I specialize in engineering scalable custom backends, microservices, and high-throughput REST APIs built with Node.js, Express, Fastify, TypeScript, Next.js, and modern MERN architecture.',
    'Deeply focused on security and resilience, I protect production systems from cyber attacks through strict API rate limiting, robust authentication, and defensive input sanitization.',
    'I design and optimize PostgreSQL and MongoDB schemas alongside Supabase, Prisma, and Redis caching (cutting query latency by 45%), deploying containerized environments with Docker, Kubernetes, Jenkins, and automated GitHub Actions CI/CD to target 99.9% uptime.'
  ];

  const totalSteps = 6 + paragraphs.length;

  // Terminal Typing State Machine
  const isReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
  const [hasStarted, setHasStarted] = useState(isReduced);
  const [activeStep, setActiveStep] = useState(isReduced ? totalSteps : 1);
  const [cmd1Chars, setCmd1Chars] = useState(isReduced ? cmd1.length : 0);
  const [cmd2Chars, setCmd2Chars] = useState(isReduced ? cmd2.length : 0);
  const [out1Chars, setOut1Chars] = useState(isReduced ? out1Full.length : 0);
  const [paraChars, setParaChars] = useState(() =>
    isReduced ? paragraphs.map((p) => p.length) : paragraphs.map(() => 0)
  );
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

  // Immediately finish typing helper
  const finishTypingImmediately = useCallback(() => {
    setIsTypingFinished(true);
    setActiveStep(totalSteps);
    setCmd1Chars(cmd1.length);
    setCmd2Chars(cmd2.length);
    setOut1Chars(out1Full.length);
    setParaChars(paragraphs.map((p) => p.length));
  }, [cmd1.length, cmd2.length, out1Full.length, paragraphs, totalSteps]);

  // 2. Typing sequence effect
  useEffect(() => {
    if (!hasStarted || checkReducedMotion() || isTypingFinished) return;

    let timer = null;
    const cmdJitter = () => Math.floor(Math.random() * 15) + 25; // 25-40ms
    const textJitter = () => Math.floor(Math.random() * 6) + 10; // 10-16ms

    if (activeStep === 1) {
      // Type cmd1: cd codecraft
      if (cmd1Chars < cmd1.length) {
        timer = setTimeout(() => setCmd1Chars((c) => c + 1), cmdJitter());
      } else {
        timer = setTimeout(() => setActiveStep(2), 250);
      }
    } else if (activeStep === 2) {
      // Pause then start cmd2
      timer = setTimeout(() => setActiveStep(3), 150);
    } else if (activeStep === 3) {
      // Type cmd2: cat co-founder.txt
      if (cmd2Chars < cmd2.length) {
        timer = setTimeout(() => setCmd2Chars((c) => c + 1), cmdJitter());
      } else {
        timer = setTimeout(() => setActiveStep(4), 250);
      }
    } else if (activeStep === 4) {
      // Pause before output starts
      timer = setTimeout(() => setActiveStep(5), 180);
    } else if (activeStep === 5) {
      // Type out1 (Role & Code Craft link)
      if (out1Chars < out1Full.length) {
        timer = setTimeout(() => setOut1Chars((c) => c + 1), textJitter());
      } else {
        timer = setTimeout(() => setActiveStep(6), 140);
      }
    } else if (activeStep >= 6 && activeStep < totalSteps) {
      // Dynamically type through each paragraph in paragraphs
      const idx = activeStep - 6;
      if (paraChars[idx] < paragraphs[idx].length) {
        timer = setTimeout(() => {
          setParaChars((prev) => {
            const next = [...prev];
            next[idx] = (next[idx] || 0) + 1;
            return next;
          });
        }, textJitter());
      } else {
        const nextStep = activeStep + 1;
        if (nextStep >= totalSteps) {
          timer = setTimeout(() => {
            setActiveStep(nextStep);
            setIsTypingFinished(true);
          }, 250);
        } else {
          timer = setTimeout(() => setActiveStep(nextStep), 160);
        }
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [
    hasStarted,
    checkReducedMotion,
    isTypingFinished,
    activeStep,
    cmd1Chars,
    cmd2Chars,
    out1Chars,
    paraChars,
    cmd1.length,
    cmd2.length,
    out1Full.length,
    paragraphs,
    totalSteps
  ]);

  // Check flip position based on link location relative to viewport
  const checkFlip = useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
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
      finishTypingImmediately();
    }
    checkFlip();
    setIsOpen(true);
  }, [checkFlip, isTypingFinished, finishTypingImmediately]);

  // Close Popup handler with hover-intent delay (200ms)
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

  return (
    <div ref={containerRef} className="terminal-root">
      {/* 1. Window Chrome Titlebar */}
      <div className="terminal-titlebar">
        {/* Decorative Window Controls */}
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
        {/* Line 1: cd codecraft */}
        <div className="flex items-center flex-wrap">
          <span className="terminal-prompt">~/{user}&nbsp;$&nbsp;</span>
          <span className="terminal-text">{cmd1.slice(0, cmd1Chars)}</span>
          {activeStep === 1 && <span className="terminal-caret" aria-hidden="true" />}
        </div>

        {/* Line 2: cat co-founder.txt */}
        {activeStep >= 2 && (
          <div className="flex items-center flex-wrap">
            <span className="terminal-prompt">~/{user}/codecraft&nbsp;$&nbsp;</span>
            <span className="terminal-text">{cmd2.slice(0, cmd2Chars)}</span>
            {activeStep === 3 && <span className="terminal-caret" aria-hidden="true" />}
          </div>
        )}

        {/* Experience Line 1: Role & Code Craft link */}
        {activeStep >= 4 && (
          <div className="flex items-center flex-wrap pt-1">
            <span className="text-[#a5b4fc] font-semibold">
              {out1Prefix.slice(0, Math.min(out1Chars, out1Prefix.length))}
            </span>
            {out1Chars > out1Prefix.length && (
              <div
                ref={wrapperRef}
                className="terminal-link-wrapper inline-block"
                onMouseEnter={openPopup}
                onMouseMove={openPopup}
                onMouseLeave={closePopup}
              >
                <a
                  ref={linkRef}
                  href="https://www.codecraftnet.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="terminal-link font-bold text-white hover:text-[#7c8cff]"
                  aria-describedby={isOpen ? 'terminal-popup-tooltip' : undefined}
                  onTouchStart={() => {
                    isTouchDeviceRef.current = true;
                  }}
                  onFocus={openPopup}
                  onBlur={closePopup}
                  onClick={handleLinkClick}
                >
                  <span>{out1Link.slice(0, out1Chars - out1Prefix.length)}</span>
                </a>

                {/* Hover Popup */}
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

                    {/* Popup Body */}
                    <div className="terminal-popup-body">
                      <div className="terminal-popup-line text-white/80 pb-1.5 border-b border-white/[0.06] mb-2 font-mono">
                        <span className="text-[#7c8cff] mr-1.5">$</span>
                        <span>{popupData.command}</span>
                      </div>

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

                        <div className="terminal-popup-line pt-0.5">
                          <span className="terminal-caret" aria-hidden="true" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {activeStep === 5 && <span className="terminal-caret" aria-hidden="true" />}
          </div>
        )}

        {/* Experience Paragraphs */}
        {paragraphs.map((para, idx) => {
          const stepForThisPara = 6 + idx;
          if (activeStep < stepForThisPara) return null;
          const typedChars = paraChars[idx] || 0;
          const isCurrentlyActive = activeStep === stepForThisPara;

          return (
            <p
              key={idx}
              className="text-neutral-300 leading-relaxed font-mono mt-1"
            >
              <span>{para.slice(0, typedChars)}</span>
              {isCurrentlyActive && <span className="terminal-caret" aria-hidden="true" />}
            </p>
          );
        })}

        {/* Final Line: Waiting prompt inside opened folder */}
        {activeStep >= totalSteps && (
          <div className="flex items-center flex-wrap pt-2">
            <span className="terminal-prompt">~/{user}/codecraft&nbsp;$&nbsp;</span>
            <span className="terminal-caret" aria-hidden="true" />
          </div>
        )}
      </div>
    </div>
  );
}
