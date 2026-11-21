import { useState, useRef } from 'react';
import ActivityHistogram from './ActivityHistogram';

const BC = [
  { text: 'I' },
  { text: 'am' },
  { text: 'a' },
  { text: 'Backend', bold: true },
  { text: 'Developer', bold: true },
  { text: '&' },
  { text: 'Co-Founder', bold: true },
  { text: 'of' },
  { text: 'Code', bold: true },
  { text: 'Craft.', bold: true },
  { text: 'I' },
  { text: 'craft' },
  { text: 'engaging' },
  { text: 'digital' },
  { text: 'experiences,' },
  { text: 'engineer' },
  { text: 'custom', bold: true },
  { text: 'backend', bold: true },
  { text: 'solutions,', bold: true },
  { text: 'and' },
  { text: 'build' },
  { text: 'autonomous', bold: true },
  { text: 'agent', bold: true },
  { text: 'implementations' },
  { text: 'that' },
  { text: 'blend' },
  { text: 'fluid' },
  { text: 'design' },
  { text: 'with' },
  { text: 'intelligent' },
  { text: 'automation.' }
];

const VC = [
  { text: 'At' },
  { text: 'Code Craft,', isLink: true, href: 'https://www.codecraftnet.com/' },
  { text: 'I' },
  { text: 'lead' },
  { text: 'the' },
  { text: 'creation' },
  { text: 'of' },
  { text: 'bespoke' },
  { text: 'web' },
  { text: 'solutions,' },
  { text: 'turning' },
  { text: 'ambitious', dim: true },
  { text: 'concepts', dim: true },
  { text: 'into', dim: true },
  { text: 'modern,', dim: true },
  { text: 'high-performance', dim: true },
  { text: 'digital' },
  { text: 'products', dim: true },
  { text: 'built', dim: true },
  { text: 'to', dim: true },
  { text: 'scale.', dim: true }
];

export default function AboutSection({ className = '' }) {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 });
  };

  return (
    <section
      id="about"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`about-section-container relative w-full bg-white text-neutral-900 select-none ${className}`}
    >
      {/* 1. Centered Ambient Radial Aura Glow (Purple / Indigo) */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] max-w-[650px] h-[340px] rounded-full pointer-events-none opacity-40 blur-[95px] transition-transform duration-300 ease-out will-change-transform"
        style={{
          background:
            'radial-gradient(circle, rgba(147, 51, 234, 0.16) 0%, rgba(59, 130, 246, 0.08) 45%, transparent 70%)',
          transform: `translate(calc(-50% + ${mousePos.x * 20}px), calc(-50% + ${mousePos.y * 15}px))`
        }}
        aria-hidden="true"
      />

      {/* Subtle top-right accent violet aura */}
      <div
        className="absolute -top-12 -right-12 w-[320px] h-[320px] rounded-full pointer-events-none opacity-30 blur-[110px]"
        style={{
          background:
            'radial-gradient(circle, rgba(147, 51, 234, 0.14) 0%, transparent 70%)'
        }}
        aria-hidden="true"
      />

      {/* 2. Top Centered Display Heading "ABOUT ME" (Child 1: flex: 0 0 auto) */}
      <div className="w-full text-center relative z-10 shrink-0 mb-[2vh]">
        <div className="inline-block relative">
          <div
            className="cursor-default select-none py-0.5 px-3 inline-block transition-transform duration-300 ease-out will-change-transform"
            style={{
              transform: `translate3d(${mousePos.x * 8}px, ${mousePos.y * 5}px, 0)`
            }}
          >
            <h2 className="about-display-word">About Me</h2>
          </div>
        </div>
      </div>

      {/* 3. Text Block Wrapper (Child 2: flex: 1 1 auto, min-height: 0, centered vertically) */}
      <div className="w-full max-w-[min(88vw,1280px)] mx-auto relative z-10 flex-1 min-h-0 flex flex-col justify-center text-left">
        <div
          className="transition-transform duration-300 ease-out will-change-transform"
          style={{
            transform: `translate3d(${mousePos.x * 4}px, ${mousePos.y * 3}px, 0)`
          }}
        >
          {/* Greeting */}
          <div className="mb-[clamp(10px,2vh,22px)]">
            <h3 className="text-[clamp(26px,4.4vh,52px)] font-bold text-black tracking-tight leading-snug">
              Hi, I'm Nikelesh.
            </h3>
          </div>

          {/* Copy Paragraphs */}
          <div className="space-y-[clamp(14px,2.6vh,28px)] text-[clamp(18px,3.2vh,34px)] leading-[1.4] font-medium tracking-tight">
            {/* Paragraph 1 */}
            <p className="py-0.5 sm:py-0">
              {BC.map((item, idx) => (
                <span
                  key={idx}
                  className={`inline-block mr-[0.28em] my-0.5 sm:my-0 transition-colors duration-200 ${
                    item.bold ? 'font-bold text-black' : 'font-normal text-neutral-500'
                  }`}
                >
                  {item.text}
                </span>
              ))}
            </p>

            {/* Paragraph 2 */}
            <p className="py-0.5 sm:py-0">
              {VC.map((item, idx) => (
                <span
                  key={idx}
                  className={`inline-block mr-[0.28em] my-0.5 sm:my-0 transition-colors duration-200 ${
                    item.dim
                      ? 'font-normal text-neutral-400 hover:text-neutral-600'
                      : 'font-normal text-neutral-500'
                  }`}
                >
                  {item.isLink ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-black font-bold underline underline-offset-8 decoration-neutral-300 hover:decoration-black hover:text-black transition-colors cursor-pointer"
                    >
                      {item.text}
                    </a>
                  ) : (
                    item.text
                  )}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Histogram Block (Child 3: flex: 0 0 auto, anchored at bottom) */}
      <div className="w-full max-w-[min(88vw,1280px)] mx-auto relative z-10 shrink-0 mt-auto">
        <ActivityHistogram />
      </div>
    </section>
  );
}
