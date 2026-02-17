"use client";

import { useRef, useState, useEffect } from "react";

interface DrawBorderButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function DrawBorderButton({ href, children, className = "" }: DrawBorderButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      // account for padding+border via offsetWidth/offsetHeight
      setSize({ w: ref.current!.offsetWidth, h: ref.current!.offsetHeight });
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const r = 2; // border-radius matching rounded-sm
  const sw = 2; // stroke width
  const inset = sw / 2;
  const w = size.w;
  const h = size.h;
  const perimeter = w && h ? 2 * (w - 2 * inset - 2 * r + h - 2 * inset - 2 * r) + 2 * Math.PI * r : 0;

  return (
    <a
      ref={ref}
      href={href}
      className={`relative inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-sm border transition-colors text-text-muted hover:text-text ${className}`}
      style={{ borderColor: "var(--border-strong)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      {perimeter > 0 && (
        <svg
          className="pointer-events-none absolute inset-0"
          width={w}
          height={h}
          style={{ left: 0, top: 0 }}
        >
          <rect
            x={inset}
            y={inset}
            width={w - sw}
            height={h - sw}
            rx={r}
            ry={r}
            fill="none"
            stroke="var(--accent-mid)"
            strokeWidth={sw}
            strokeDasharray={perimeter}
            strokeDashoffset={hovered ? 0 : perimeter}
            style={{
              transition: `stroke-dashoffset 0.55s cubic-bezier(0.4, 0, 0.2, 1)`,
            }}
          />
        </svg>
      )}
    </a>
  );
}
