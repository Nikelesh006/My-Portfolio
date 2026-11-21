import { useState, useRef, useEffect, useMemo, useCallback } from 'react';

// Placeholder data. Replace with my real activity (commits, projects or posts per month).
export const ACTIVITY = [
  { month: '2023-12', count: 6 },
  { month: '2024-01', count: 9 },
  { month: '2024-02', count: 12 },
  { month: '2024-03', count: 15 },
  { month: '2024-04', count: 7 },
  { month: '2024-05', count: 14 },
  { month: '2024-06', count: 18 },
  { month: '2024-07', count: 22 },
  { month: '2024-08', count: 16 },
  { month: '2024-09', count: 25 },
  { month: '2024-10', count: 20 },
  { month: '2024-11', count: 17 },
  { month: '2024-12', count: 23 },
  { month: '2025-01', count: 19 },
  { month: '2025-02', count: 27 },
  { month: '2025-03', count: 31 },
  { month: '2025-04', count: 16 },
  { month: '2025-05', count: 26 },
  { month: '2025-06', count: 32 },
  { month: '2025-07', count: 28 },
  { month: '2025-08', count: 21 },
  { month: '2025-09', count: 35 },
  { month: '2025-10', count: 30 },
  { month: '2025-11', count: 26 },
  { month: '2025-12', count: 29 },
  { month: '2026-01', count: 27 },
  { month: '2026-02', count: 33 },
  { month: '2026-03', count: 38 },
  { month: '2026-04', count: 23 },
  { month: '2026-05', count: 31 },
  { month: '2026-06', count: 36 },
  { month: '2026-07', count: 32 },
  { month: '2026-08', count: 28 },
  { month: '2026-09', count: 37 },
  { month: '2026-10', count: 34 },
  { month: '2026-11', count: 39 }
];

export const HISTOGRAM_COLORS = {
  idle: '#d9dce2',
  nearActive: '#b9bec8',
  selected: '#0a0a0a',
  baseline: '#e6e8ec',
  yearTick: '#9aa0ab'
};

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

function formatMonth(monthStr) {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-');
  const idx = parseInt(month, 10) - 1;
  return `${MONTH_NAMES[idx] || ''} ${year}`;
}

export default function ActivityHistogram({
  unit = 'contributions',
  className = ''
}) {
  const rootRef = useRef(null);
  const barsContainerRef = useRef(null);
  const rafRef = useRef(null);
  const isDraggingRef = useRef(false);

  // Responsive: under 640px show only the last 18 months
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const data = useMemo(() => {
    return isMobile ? ACTIVITY.slice(-18) : ACTIVITY;
  }, [isMobile]);

  // Selected bar is by default the latest month (rightmost)
  const [selectedIndex, setSelectedIndex] = useState(data.length - 1);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Keep selected index within bounds if data length changes
  useEffect(() => {
    setSelectedIndex((prev) => Math.min(prev, data.length - 1));
  }, [data.length]);

  // Height measurement of bars track container to calculate precise +14px scale boost
  const [containerHeight, setContainerHeight] = useState(90);
  useEffect(() => {
    if (!barsContainerRef.current) return;
    const updateH = () => {
      if (barsContainerRef.current) {
        setContainerHeight(barsContainerRef.current.clientHeight || 90);
      }
    };
    updateH();
    window.addEventListener('resize', updateH);
    return () => window.removeEventListener('resize', updateH);
  }, []);

  // IntersectionObserver entrance animation
  const [hasEntered, setHasEntered] = useState(false);
  const [entranceFinished, setEntranceFinished] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(media.matches);

    if (media.matches) {
      setHasEntered(true);
      setEntranceFinished(true);
      return;
    }

    const el = rootRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasEntered(true);
            observer.disconnect();

            // Stagger total duration: (N - 1) * 18ms + 900ms
            const totalDuration = (data.length - 1) * 18 + 900;
            const timer = setTimeout(() => {
              setEntranceFinished(true);
            }, totalDuration);
            return () => clearTimeout(timer);
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [data.length]);

  // Pointer event handlers for wave and touch dragging
  const getIndexFromPointer = useCallback(
    (clientX) => {
      const container = barsContainerRef.current;
      if (!container) return -1;
      const rect = container.getBoundingClientRect();
      const x = clientX - rect.left;
      if (x < 0 || x > rect.width) return -1;
      const colWidth = rect.width / data.length;
      const idx = Math.floor(x / colWidth);
      return Math.max(0, Math.min(data.length - 1, idx));
    },
    [data.length]
  );

  const handlePointerMove = (e) => {
    if (prefersReducedMotion) return;
    if (rafRef.current) return;
    const clientX = e.clientX;

    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      const idx = getIndexFromPointer(clientX);
      if (idx !== -1) {
        setHoveredIndex(idx);
        if (isDraggingRef.current) {
          setSelectedIndex(idx);
        }
      } else {
        setHoveredIndex(null);
      }
    });
  };

  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    const idx = getIndexFromPointer(e.clientX);
    if (idx !== -1) {
      setHoveredIndex(idx);
      setSelectedIndex(idx);
    }
  };

  const handlePointerUp = (e) => {
    isDraggingRef.current = false;
    const idx = getIndexFromPointer(e.clientX);
    if (idx !== -1) {
      setSelectedIndex(idx);
    }
  };

  const handlePointerLeave = () => {
    isDraggingRef.current = false;
    setHoveredIndex(null);
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  // Keyboard navigation: slider semantics
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(data.length - 1, prev + 1));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSelectedIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSelectedIndex(data.length - 1);
    }
  };

  // Active item displayed in label: follows hovered bar while hovering, returns to pinned bar on leave
  const activeIndex = hoveredIndex !== null ? hoveredIndex : selectedIndex;
  const activeItem = data[activeIndex] || data[data.length - 1];

  // Screen reader summary
  const maxItem = useMemo(() => {
    return data.reduce(
      (max, curr) => (curr.count > max.count ? curr : max),
      data[0] || { month: '', count: 0 }
    );
  }, [data]);

  const maxCount = useMemo(() => {
    return Math.max(...data.map((d) => d.count), 1);
  }, [data]);

  // Label 150ms cross-fade state
  const [displayedItem, setDisplayedItem] = useState(activeItem);
  const [isCrossFading, setIsCrossFading] = useState(false);

  useEffect(() => {
    if (activeItem.month === displayedItem?.month) return;
    setIsCrossFading(true);
    const timer = setTimeout(() => {
      setDisplayedItem(activeItem);
      setIsCrossFading(false);
    }, 75);
    return () => clearTimeout(timer);
  }, [activeItem, displayedItem]);

  return (
    <div
      ref={rootRef}
      tabIndex={0}
      role="slider"
      aria-label="Activity by month"
      aria-valuemin={0}
      aria-valuemax={data.length - 1}
      aria-valuenow={selectedIndex}
      aria-valuetext={`${formatMonth(data[selectedIndex]?.month)}, ${data[selectedIndex]?.count} ${unit}`}
      onKeyDown={handleKeyDown}
      className={`w-full relative select-none outline-hidden focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-4 rounded-md transition-shadow ${className}`}
    >
      {/* Screen Reader Summary */}
      <div className="sr-only">
        Activity over the last {data.length} months, highest in{' '}
        {formatMonth(maxItem.month)}, {maxItem.count} {unit}.
      </div>

      {/* Bars Grid Container */}
      <div
        ref={barsContainerRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        style={{ touchAction: 'pan-y' }}
        className="w-full h-[clamp(56px,10vh,120px)] relative cursor-pointer"
      >
        <div
          className="w-full h-full grid items-end"
          style={{
            gridTemplateColumns: `repeat(${data.length}, minmax(${isMobile ? '10px' : '0'}, 1fr))`,
            gap: 'clamp(2px, 0.28vw, 4px)'
          }}
        >
          {data.map((item, idx) => {
            // Height ratio: min 10% of max height
            const countRatio = Math.max(0.1, item.count / maxCount);

            // Wave falloff: hovered bar +14px, falloff 1.0, 0.55, 0.25
            let risePx = 0;
            if (!prefersReducedMotion && hoveredIndex !== null && entranceFinished) {
              const dist = Math.abs(idx - hoveredIndex);
              if (dist === 0) risePx = 14;
              else if (dist === 1) risePx = 14 * 0.55;
              else if (dist === 2) risePx = 14 * 0.25;
            }

            // Target scale (scaled relative to container height)
            const additionalScale = containerHeight > 0 ? risePx / containerHeight : 0;
            const targetScale = hasEntered ? countRatio + additionalScale : 0;

            // Colors:
            // - Selected bar stays #0a0a0a
            // - Hovered bar turns #0a0a0a
            // - Neighbors within 2 cols tint to #b9bec8
            // - Idle bars #d9dce2
            const isSelected = idx === selectedIndex;
            const isHovered = idx === hoveredIndex;
            const isNearHovered =
              hoveredIndex !== null && Math.abs(idx - hoveredIndex) <= 2;
            const isNearSelected = Math.abs(idx - selectedIndex) <= 2;

            let barBg = HISTOGRAM_COLORS.idle;
            if (isSelected || isHovered) {
              barBg = HISTOGRAM_COLORS.selected;
            } else if (isNearHovered || isNearSelected) {
              barBg = HISTOGRAM_COLORS.nearActive;
            }

            // Stagger transition during entrance vs fluid 200ms wave once entered
            let transitionStyle = 'background-color 200ms ease';
            if (!prefersReducedMotion) {
              if (!entranceFinished) {
                transitionStyle =
                  'transform 900ms cubic-bezier(0.16, 1, 0.3, 1), background-color 200ms ease';
              } else {
                transitionStyle =
                  'transform 200ms cubic-bezier(0.2, 0, 0, 1), background-color 200ms ease';
              }
            }

            const delayStyle =
              !prefersReducedMotion && !entranceFinished ? `${idx * 18}ms` : '0ms';

            return (
              <div
                key={item.month}
                className="relative h-full flex items-end justify-center"
              >
                <div
                  className="w-full rounded-t-[2px] will-change-transform"
                  style={{
                    height: '100%',
                    transformOrigin: 'bottom',
                    transform: `scaleY(${targetScale})`,
                    backgroundColor: barBg,
                    transition: transitionStyle,
                    transitionDelay: delayStyle
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 1px Baseline Line under the bars */}
      <div
        className="w-full h-[1px]"
        style={{ backgroundColor: HISTOGRAM_COLORS.baseline }}
      />

      {/* Tiny Year Markers (under Jan bar, hidden under 640px) */}
      <div
        className="hidden sm:grid w-full mt-[0.8vh]"
        style={{
          gridTemplateColumns: `repeat(${data.length}, minmax(0, 1fr))`,
          gap: 'clamp(2px, 0.28vw, 4px)'
        }}
        aria-hidden="true"
      >
        {data.map((item) => {
          const isJan = item.month.endsWith('-01');
          const year = item.month.split('-')[0];
          return (
            <div key={item.month} className="relative flex justify-start">
              {isJan && (
                <span
                  className="text-[clamp(11px,1.4vh,13px)] font-mono select-none whitespace-nowrap pl-0.5 leading-none"
                  style={{ color: HISTOGRAM_COLORS.yearTick }}
                >
                  {year}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Centered Label Line with 150ms Cross-fade */}
      <div
        className="mt-[1.2vh] min-h-[clamp(22px,2.8vh,28px)] flex items-center justify-center font-['Manrope',sans-serif] text-[clamp(14px,2.2vh,20px)] leading-normal select-none"
        style={{
          opacity: hasEntered ? 1 : 0,
          transition: prefersReducedMotion ? 'none' : 'opacity 500ms ease 600ms'
        }}
      >
        <div
          className={`flex items-center gap-1.5 transition-opacity duration-75 ${
            isCrossFading ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <span className="font-semibold text-neutral-900">
            {formatMonth(displayedItem?.month)}
          </span>
          <span className="text-neutral-500">
            · {displayedItem?.count} {unit}
          </span>
        </div>
      </div>
    </div>
  );
}
