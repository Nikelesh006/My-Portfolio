import { useEffect, useRef, useState } from 'react';

export default function ColorRevealPhoto({
  src,
  alt = 'Portrait',
  radius = 140,
  className = '',
  containerRef,
  mode = 'spotlight' // 'spotlight' | 'fade'
}) {
  const wrapperRef = useRef(null);
  const imgRef = useRef(null);
  const colorImgRef = useRef(null);

  // Animation values stored in refs to avoid React re-renders in rAF loop
  const curXRef = useRef(0);
  const curYRef = useRef(0);
  const curRRef = useRef(0);
  const targetXRef = useRef(0);
  const targetYRef = useRef(0);
  const targetRRef = useRef(0);
  const rafIdRef = useRef(null);
  const touchActiveRef = useRef(false);

  // State for fade mode
  const [isInsideFade, setIsInsideFade] = useState(false);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;

    const checkReducedMotion = () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    const getPhotoRect = () => {
      // Use the actual image element rect for exact alignment
      return (imgRef.current || wrapperRef.current)?.getBoundingClientRect();
    };

    const animate = () => {
      const lerp = 0.15;
      curXRef.current += (targetXRef.current - curXRef.current) * lerp;
      curYRef.current += (targetYRef.current - curYRef.current) * lerp;
      curRRef.current += (targetRRef.current - curRRef.current) * lerp;

      const targetEl = colorImgRef.current;
      if (targetEl) {
        targetEl.style.setProperty('--x', `${curXRef.current.toFixed(1)}px`);
        targetEl.style.setProperty('--y', `${curYRef.current.toFixed(1)}px`);
        targetEl.style.setProperty('--r', `${curRRef.current.toFixed(1)}px`);
      }

      // Stop condition: target radius is 0 and current radius has shrunk to nearly 0
      if (targetRRef.current === 0 && curRRef.current < 0.5) {
        curRRef.current = 0;
        if (targetEl) {
          targetEl.style.setProperty('--r', '0px');
        }
        rafIdRef.current = null;
        return; // Terminates animation loop (no idle rAF)
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    const startLoop = () => {
      if (!rafIdRef.current) {
        rafIdRef.current = requestAnimationFrame(animate);
      }
    };

    const updatePointer = (clientX, clientY) => {
      const rect = getPhotoRect();
      if (!rect) return;

      const isInside =
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom;

      if (mode === 'fade') {
        setIsInsideFade(isInside);
        return;
      }

      // Accessibility: prefers-reduced-motion check
      if (checkReducedMotion()) {
        const targetEl = colorImgRef.current;
        if (targetEl) {
          targetEl.style.setProperty('--x', '50%');
          targetEl.style.setProperty('--y', '50%');
          targetEl.style.setProperty('--r', isInside ? '9999px' : '0px');
        }
        return;
      }

      if (isInside) {
        const relX = clientX - rect.left;
        const relY = clientY - rect.top;

        // If circle was completely closed, jump current position to cursor entrance
        if (curRRef.current < 1) {
          curXRef.current = relX;
          curYRef.current = relY;
        }

        targetXRef.current = relX;
        targetYRef.current = relY;

        // Reveal radius scaled to roughly 18%-24% of photo's width (max default radius)
        const computedRadius = rect.width ? Math.min(radius, Math.max(90, rect.width * 0.22)) : radius;
        targetRRef.current = computedRadius;
        startLoop();
      } else {
        if (targetRRef.current !== 0) {
          targetRRef.current = 0;
          startLoop();
        }
      }
    };

    const onPointerMove = (e) => {
      if (e.pointerType === 'touch' && !touchActiveRef.current) return;
      updatePointer(e.clientX, e.clientY);
    };

    const onPointerDown = (e) => {
      if (e.pointerType === 'touch') {
        touchActiveRef.current = true;
        updatePointer(e.clientX, e.clientY);
      }
    };

    const onPointerUp = (e) => {
      if (e.pointerType === 'touch') {
        touchActiveRef.current = false;
        if (mode === 'fade') {
          setIsInsideFade(false);
        } else {
          targetRRef.current = 0;
          startLoop();
        }
      }
    };

    const onPointerLeave = () => {
      if (mode === 'fade') {
        setIsInsideFade(false);
      } else {
        targetRRef.current = 0;
        startLoop();
      }
    };

    container.addEventListener('pointermove', onPointerMove, { passive: true });
    container.addEventListener('pointerenter', onPointerMove, { passive: true });
    container.addEventListener('pointerleave', onPointerLeave, { passive: true });
    container.addEventListener('pointerdown', onPointerDown, { passive: true });
    window.addEventListener('pointerup', onPointerUp, { passive: true });
    window.addEventListener('pointercancel', onPointerUp, { passive: true });

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerenter', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [containerRef, radius, mode]);

  return (
    <div
      ref={wrapperRef}
      className={`relative h-full flex items-end justify-center select-none ${className}`}
      style={{
        pointerEvents: 'none'
      }}
    >
      {/* 1. Base Layer: Grayscale */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className="w-auto h-full max-h-full object-contain object-bottom select-none drop-shadow-[0_20px_30px_rgba(0,0,0,0.12)] block"
        style={{
          filter: 'grayscale(1) contrast(1.05)',
          pointerEvents: 'none'
        }}
      />

      {/* 2. Color Layer on top */}
      <img
        ref={colorImgRef}
        src={src}
        alt=""
        aria-hidden="true"
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-auto h-full max-h-full object-contain object-bottom select-none drop-shadow-[0_20px_30px_rgba(0,0,0,0.12)] pointer-events-none block ${
          mode === 'fade' ? 'transition-opacity duration-400 ease-out' : ''
        }`}
        style={
          mode === 'fade'
            ? {
                opacity: isInsideFade ? 1 : 0,
                pointerEvents: 'none'
              }
            : {
                maskImage:
                  'radial-gradient(circle var(--r, 0px) at var(--x, 50%) var(--y, 50%), #000 0%, #000 55%, transparent 100%)',
                WebkitMaskImage:
                  'radial-gradient(circle var(--r, 0px) at var(--x, 50%) var(--y, 50%), #000 0%, #000 55%, transparent 100%)',
                pointerEvents: 'none'
              }
        }
      />
    </div>
  );
}
