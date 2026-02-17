"use client";

import { useTheme } from "./theme-provider";
import { useSession } from "next-auth/react";
import { CanvasBackdrop } from "./canvas-backdrop";
import DrawBorderButton from "../components/DrawBorderButton";
import {
  Sun,
  Moon,
  ArrowRight,
  Filter,
  Clock,
  DollarSign,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { SpinningLogo } from "../components/SpinningLogo";
import { BountyGridSkeleton } from "../components/Skeletons";
import { Navbar } from "../components/Navbar";
import { DUMMY_BOUNTIES } from "../data/bounties";

function mapDummyToApiBounty(b: (typeof DUMMY_BOUNTIES)[number]) {
  return {
    id: b.id,
    title: b.title,
    description: b.fullDescription,
    platform: b.platform,
    contentType: b.contentType,
    niche: b.niche,
    requirements: b.requirements.join("\n"),
    budget: b.budget,
    payPerImpression: b.payPerImpression,
    deadline: b.deadline,
    company: { companyName: b.brand, description: b.brandDescription },
  };
}

interface Bounty {
  id: string;
  title: string;
  description: string;
  platform: string;
  contentType: string;
  budget: number;
  payPerImpression: string | null;
  deadline: string;
  niche: string | null;
  requirements: string | null;
  company: { companyName: string; description: string | null };
}

function extractFollowerReq(requirements: string | null): string | null {
  if (!requirements) return null;
  const match = requirements.match(/([\d,]+)\+?\s*(?:Instagram|TikTok|YouTube|Twitter|followers|subscribers)/i);
  if (!match) return null;
  const num = parseInt(match[1].replace(/,/g, ""));
  if (num >= 1000) return `${Math.floor(num / 1000)}k+`;
  return `${num}+`;
}

function extractFollowerCount(requirements: string | null): number {
  if (!requirements) return 0;
  const match = requirements.match(/([\d,]+)\+?\s*(?:Instagram|TikTok|YouTube|Twitter|followers|subscribers)/i);
  if (!match) return 0;
  return parseInt(match[1].replace(/,/g, ""));
}

const ALL_PLATFORMS = ["Instagram", "TikTok", "YouTube", "Twitter/X"].sort();
const ALL_NICHES = ["Fashion", "Food & Drink", "Tech", "Fitness", "Travel", "Beauty", "Pets", "Lifestyle", "Business"].sort();
const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Oldest First", value: "oldest" },
  { label: "Deadline: Soonest", value: "deadline-asc" },
  { label: "Deadline: Latest", value: "deadline-desc" },
  { label: "Followers: Low → High", value: "followers-asc" },
  { label: "Followers: High → Low", value: "followers-desc" },
  { label: "Pay: Low → High", value: "pay-asc" },
  { label: "Pay: High → Low", value: "pay-desc" },
];

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
      {children}
    </span>
  );
}

function PlatformIcon({ platform }: { platform: string }) {
  const size = 14;
  const icons: Record<string, React.ReactNode> = {
    TikTok: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#00f2ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
      </svg>
    ),
    Instagram: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#c13584" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" fill="#c13584" stroke="none" />
      </svg>
    ),
    YouTube: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#ff0000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="4" />
        <polygon points="10,8 16,12 10,16" fill="#ff0000" stroke="none" />
      </svg>
    ),
    "Twitter/X": (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4l16 16M20 4L4 20" />
      </svg>
    ),
  };
  return <span className="flex-shrink-0 flex items-center">{icons[platform] || <span className="inline-block w-2 h-2 rounded-full" style={{ background: "var(--accent-mid)" }} />}</span>;
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function BountyCardShell({ isDark, children }: { isDark: boolean; children: React.ReactNode }) {
  return (
    <div
      className="group block p-5 md:p-6 transition-all duration-200 hover:!border-[var(--accent-mid)]"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: isDark ? "2px" : "10px",
        boxShadow: isDark ? "none" : "0 1px 3px rgba(45,41,38,0.04)",
      }}
    >
      {children}
    </div>
  );
}

function BountyCardContent({ bounty, isDark, index = 0, loaded }: { bounty?: Bounty; isDark: boolean; index?: number; loaded: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!loaded || !bounty) return;
    const timer = setTimeout(() => setRevealed(true), 80 * index + 50);
    return () => clearTimeout(timer);
  }, [loaded, bounty, index]);

  const days = bounty ? daysUntil(bounty.deadline) : 0;

  return (
    <div ref={ref} className="relative" style={{ minHeight: "100px" }}>
      {/* Skeleton layer */}
      <div
        className="transition-opacity duration-300"
        style={{ opacity: revealed ? 0 : 1, pointerEvents: revealed ? "none" : "auto", height: revealed ? 0 : "auto", overflow: revealed ? "hidden" : "visible" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="skeleton-shimmer w-[14px] h-[14px] rounded-full" />
              <div className="skeleton-shimmer w-16 h-3" />
              <div className="skeleton-shimmer w-12 h-3" />
            </div>
            <div className="skeleton-shimmer w-3/4 h-5 mb-2" />
            <div className="skeleton-shimmer w-1/3 h-3 mt-1.5" />
          </div>
          <div className="text-right flex-shrink-0">
            <div className="skeleton-shimmer w-20 h-7 ml-auto" />
            <div className="skeleton-shimmer w-14 h-3 mt-2 ml-auto" />
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="skeleton-shimmer w-14 h-4" />
          <div className="skeleton-shimmer w-20 h-4" />
        </div>
      </div>

      {/* Real content layer */}
      {bounty && (
        <div
          className={revealed ? "relative" : "absolute inset-0"}
          style={{
            clipPath: revealed ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)",
            transition: "clip-path 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          <Link href={`/bounty/${bounty.id}`} className="block">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <PlatformIcon platform={bounty.platform} />
                  <Label>{bounty.platform}</Label>
                  <span className="text-text-muted text-[11px]">·</span>
                  <Label>{bounty.contentType}</Label>
                </div>
                <h3 className="text-text font-light text-base md:text-lg leading-snug">
                  {bounty.title}
                </h3>
                <p className="mt-1.5 text-text-muted text-sm font-light truncate">{bounty.company.companyName}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-text font-light text-xl md:text-2xl">${bounty.budget.toLocaleString()}</p>
                {bounty.payPerImpression && (
                  <p className="font-mono text-[11px] text-accent-mid mt-0.5">
                    + {bounty.payPerImpression} impressions
                  </p>
                )}
                <div className="flex items-center gap-1 mt-1 justify-end">
                  <Clock size={11} className="text-text-muted" />
                  <span className="font-mono text-[11px] text-text-muted">
                    {days}d left
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {bounty.niche && (
                <span
                  className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5"
                  style={{
                    background: isDark ? "rgba(255,255,255,0.05)" : "var(--accent-light)",
                    color: isDark ? "var(--text-muted)" : "var(--accent)",
                    borderRadius: isDark ? "1px" : "4px",
                  }}
                >
                  {bounty.niche}
                </span>
              )}
              {(() => {
                const followerReq = extractFollowerReq(bounty.requirements);
                return followerReq ? (
                  <span
                    className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.04)" : "rgba(45,41,38,0.06)",
                      color: "var(--text-muted)",
                      borderRadius: isDark ? "1px" : "4px",
                    }}
                  >
                    {followerReq} followers
                  </span>
                ) : null;
              })()}
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
  onClear,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  onClear?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all duration-200"
      style={{
        background: active ? "var(--accent)" : "var(--surface)",
        color: active ? "#fff" : "var(--text-muted)",
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
        borderRadius: "2px",
      }}
    >
      {label}
      {active && onClear && (
        <X
          size={10}
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
        />
      )}
    </button>
  );
}

function Dropdown({
  label,
  options,
  value,
  onChange,
  isDark,
}: {
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
  isDark?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 cursor-pointer font-mono text-[11px] uppercase tracking-wider px-3 transition-all duration-200 w-full justify-between overflow-hidden"
        style={{
          background: "var(--surface)",
          color: value ? "var(--text)" : "var(--text-muted)",
          border: `1px solid ${open ? "var(--border-strong)" : "var(--border)"}`,
          borderRadius: isDark ? "2px" : "8px",
          height: "36px",
          boxShadow: !isDark ? "0 1px 3px rgba(45,41,38,0.04)" : "none",
        }}
      >
        <span className="truncate">{selectedLabel || label}</span>
        <ChevronDown
          size={12}
          className="text-text-muted transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      <div
        className="absolute left-0 top-[calc(100%+4px)] min-w-full z-50 overflow-hidden"
        style={{
          background: "var(--surface)",
          border: open ? "1px solid var(--border-strong)" : "1px solid transparent",
          borderRadius: isDark ? "2px" : "10px",
          boxShadow: open
            ? isDark
              ? "0 8px 24px rgba(0,0,0,0.5)"
              : "0 8px 32px rgba(45,41,38,0.12)"
            : "none",
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0) scaleY(1)" : "translateY(-4px) scaleY(0.96)",
          transformOrigin: "top",
          transition: "opacity 0.15s ease, transform 0.15s ease",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {options.map((o) => (
          <div
            key={o.value}
            className="font-mono text-[11px] uppercase tracking-wider px-3 cursor-pointer transition-colors duration-150"
            style={{
              height: "36px",
              display: "flex",
              alignItems: "center",
              color: o.value === value ? "var(--accent-mid, var(--accent))" : "var(--text)",
              background: o.value === value ? (isDark ? "rgba(255,255,255,0.05)" : "var(--surface-raised, #e8e4df)") : "transparent",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "var(--surface-raised, #e8e4df)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = o.value === value ? (isDark ? "rgba(255,255,255,0.05)" : "var(--surface-raised, #e8e4df)") : "transparent")}
            onClick={() => { onChange(o.value); setOpen(false); }}
          >
            {o.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function MultiDropdown({
  label,
  options,
  values,
  onChange,
  isDark,
}: {
  label: string;
  options: { label: string; value: string }[];
  values: string[];
  onChange: (v: string[]) => void;
  isDark?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const buttonText = values.length === 0
    ? label
    : values.length === 1
      ? options.find((o) => o.value === values[0])?.label || values[0]
      : `${label} (${values.length})`;

  const toggle = (v: string) => {
    onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 cursor-pointer font-mono text-[11px] uppercase tracking-wider px-3 transition-all duration-200 w-full justify-between overflow-hidden"
        style={{
          background: "var(--surface)",
          color: values.length > 0 ? "var(--text)" : "var(--text-muted)",
          border: `1px solid ${open ? "var(--border-strong)" : "var(--border)"}`,
          borderRadius: isDark ? "2px" : "8px",
          height: "36px",
          boxShadow: !isDark ? "0 1px 3px rgba(45,41,38,0.04)" : "none",
        }}
      >
        <span className="truncate">{buttonText}</span>
        <ChevronDown
          size={12}
          className="text-text-muted transition-transform duration-200 flex-shrink-0"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      <div
        className="absolute left-0 top-[calc(100%+4px)] min-w-full z-50 overflow-hidden"
        style={{
          background: "var(--surface)",
          border: open ? "1px solid var(--border-strong)" : "1px solid transparent",
          borderRadius: isDark ? "2px" : "10px",
          boxShadow: open
            ? isDark
              ? "0 8px 24px rgba(0,0,0,0.5)"
              : "0 8px 32px rgba(45,41,38,0.12)"
            : "none",
          opacity: open ? 1 : 0,
          transform: open ? "translateY(0) scaleY(1)" : "translateY(-4px) scaleY(0.96)",
          transformOrigin: "top",
          transition: "opacity 0.15s ease, transform 0.15s ease",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {options.map((o) => {
          const selected = values.includes(o.value);
          return (
            <div
              key={o.value}
              className="font-mono text-[11px] uppercase tracking-wider px-3 cursor-pointer transition-colors duration-150 select-none"
              style={{
                height: "36px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                color: selected ? "var(--accent-mid, var(--accent))" : "var(--text)",
                background: selected ? (isDark ? "rgba(255,255,255,0.05)" : "var(--surface-raised, #e8e4df)") : "transparent",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "var(--surface-raised, #e8e4df)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = selected ? (isDark ? "rgba(255,255,255,0.05)" : "var(--surface-raised, #e8e4df)") : "transparent")}
              onClick={() => toggle(o.value)}
            >
              <span
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: isDark ? "2px" : "3px",
                  border: selected ? "none" : `1.5px solid ${isDark ? "rgba(255,255,255,0.2)" : "var(--border-strong)"}`,
                  background: selected ? "var(--accent-mid, var(--accent))" : "transparent",
                  transition: "all 0.15s ease",
                }}
              >
                {selected && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4.5 7.5L8 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {o.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NumberStepper({
  value,
  onChange,
  placeholder,
  isDark,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  isDark: boolean;
}) {
  const step = (dir: number) => {
    const current = parseInt(value) || 0;
    const next = Math.max(0, current + dir * 1000);
    onChange(next === 0 ? "" : String(next));
  };

  return (
    <div
      className="relative flex items-center"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: isDark ? "2px" : "8px",
        height: "36px",
        width: "110px",
        boxShadow: !isDark ? "0 1px 3px rgba(45,41,38,0.04)" : "none",
        overflow: "hidden",
      }}
    >
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const v = e.target.value.replace(/[^0-9]/g, "");
          onChange(v);
        }}
        placeholder={placeholder}
        className="flex-1 min-w-0 font-mono text-[11px] uppercase tracking-wider px-2.5 text-text placeholder:text-text-muted outline-none bg-transparent"
        style={{ height: "100%" }}
        onFocus={(e) => {
          const parent = e.currentTarget.parentElement;
          if (parent) parent.style.borderColor = "var(--border-strong)";
        }}
        onBlur={(e) => {
          const parent = e.currentTarget.parentElement;
          if (parent) parent.style.borderColor = "var(--border)";
        }}
      />
      <div className="flex flex-col flex-shrink-0 border-l" style={{ borderColor: "var(--border)", height: "100%" }}>
        <button
          type="button"
          onClick={() => step(1)}
          className="flex items-center justify-center flex-1 px-1 text-text-muted hover:text-text hover:bg-[var(--border)] transition-colors cursor-pointer"
          tabIndex={-1}
        >
          <ChevronUp size={10} strokeWidth={2} />
        </button>
        <div style={{ height: "1px", background: "var(--border)" }} />
        <button
          type="button"
          onClick={() => step(-1)}
          className="flex items-center justify-center flex-1 px-1 text-text-muted hover:text-text hover:bg-[var(--border)] transition-colors cursor-pointer"
          tabIndex={-1}
        >
          <ChevronDown size={10} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

function PayStepper({
  value,
  onChange,
  placeholder,
  isDark,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  isDark: boolean;
}) {
  const step = (dir: number) => {
    const current = parseInt(value) || 0;
    const next = Math.max(0, current + dir * 100);
    onChange(next === 0 ? "" : String(next));
  };

  return (
    <div
      className="relative flex items-center"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: isDark ? "2px" : "8px",
        height: "36px",
        width: "110px",
        boxShadow: !isDark ? "0 1px 3px rgba(45,41,38,0.04)" : "none",
        overflow: "hidden",
      }}
    >
      <input
        type="text"
        inputMode="numeric"
        value={value ? `$${value}` : ""}
        onChange={(e) => {
          const v = e.target.value.replace(/[^0-9]/g, "");
          onChange(v);
        }}
        placeholder={placeholder}
        className="flex-1 min-w-0 font-mono text-[11px] uppercase tracking-wider px-2.5 text-text placeholder:text-text-muted outline-none bg-transparent"
        style={{ height: "100%" }}
        onFocus={(e) => {
          const parent = e.currentTarget.parentElement;
          if (parent) parent.style.borderColor = "var(--border-strong)";
        }}
        onBlur={(e) => {
          const parent = e.currentTarget.parentElement;
          if (parent) parent.style.borderColor = "var(--border)";
        }}
      />
      <div className="flex flex-col flex-shrink-0 border-l" style={{ borderColor: "var(--border)", height: "100%" }}>
        <button
          type="button"
          onClick={() => step(1)}
          className="flex items-center justify-center flex-1 px-1 text-text-muted hover:text-text hover:bg-[var(--border)] transition-colors cursor-pointer"
          tabIndex={-1}
        >
          <ChevronUp size={10} strokeWidth={2} />
        </button>
        <div style={{ height: "1px", background: "var(--border)" }} />
        <button
          type="button"
          onClick={() => step(-1)}
          className="flex items-center justify-center flex-1 px-1 text-text-muted hover:text-text hover:bg-[var(--border)] transition-colors cursor-pointer"
          tabIndex={-1}
        >
          <ChevronDown size={10} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const { data: session, status: authStatus } = useSession();
  const isLoggedIn = !!session?.user;

  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilters, setPlatformFilters] = useState<string[]>([]);
  const [nicheFilters, setNicheFilters] = useState<string[]>([]);
  const [payMin, setPayMin] = useState("");
  const [payMax, setPayMax] = useState("");
  const [followerMin, setFollowerMin] = useState("");
  const [followerMax, setFollowerMax] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetch("/api/bounties")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setBounties(data);
        else setBounties(DUMMY_BOUNTIES.map(mapDummyToApiBounty));
      })
      .catch(() => {
        setBounties(DUMMY_BOUNTIES.map(mapDummyToApiBounty));
      })
      .finally(() => setLoading(false));
  }, []);

  const PLATFORMS = ALL_PLATFORMS;
  const NICHES = ALL_NICHES;

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const results = bounties.filter((b) => {
      if (platformFilters.length > 0 && !platformFilters.includes(b.platform)) return false;
      if (nicheFilters.length > 0 && b.niche && !nicheFilters.includes(b.niche)) return false;
      if (nicheFilters.length > 0 && !b.niche) return false;
      if (payMin && b.budget < parseInt(payMin)) return false;
      if (payMax && b.budget > parseInt(payMax)) return false;
      {
        const required = extractFollowerCount(b.requirements);
        if (followerMin && required < parseInt(followerMin)) return false;
        if (followerMax && required > parseInt(followerMax)) return false;
      }
      if (q) {
        const matchTitle = b.title.toLowerCase().includes(q);
        const matchBrand = b.company.companyName.toLowerCase().includes(q);
        if (!matchTitle && !matchBrand) return false;
      }
      return true;
    });

    // Sort
    results.sort((a, b) => {
      switch (sortBy) {
        case "oldest":
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case "deadline-asc":
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        case "deadline-desc":
          return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
        case "followers-asc":
          return extractFollowerCount(a.requirements) - extractFollowerCount(b.requirements);
        case "followers-desc":
          return extractFollowerCount(b.requirements) - extractFollowerCount(a.requirements);
        case "pay-asc":
          return a.budget - b.budget;
        case "pay-desc":
          return b.budget - a.budget;
        case "newest":
        default:
          return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
      }
    });

    return results;
  }, [bounties, platformFilters, nicheFilters, payMin, payMax, followerMin, followerMax, searchQuery, sortBy]);

  const activeFilterCount = [platformFilters.length > 0, nicheFilters.length > 0, !!payMin || !!payMax, !!followerMin, !!followerMax].filter(Boolean).length;

  return (
    <>
      <CanvasBackdrop />
      <div className="relative" style={{ zIndex: 1 }}>
        {/* Nav */}
        <Navbar />

        {/* Hero — only for logged-out users */}
        {!isLoggedIn ? (
          <section className="pt-28 pb-10 md:pt-32 md:pb-14 px-6 md:px-12 lg:px-24">
            <div className="max-w-3xl">
              <Label>Open bounties</Label>
              <h1
                className="mt-3 text-text font-extralight leading-[1.1]"
                style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
              >
                Your content is worth something.
                <br />
                <span className="text-accent-mid">Here&apos;s the proof.</span>
              </h1>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-text-muted font-normal">
                Real brands. Real budgets. Pick a bounty, create the content, get paid.
                No pitching, no waiting — the work is already here.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <a
                  href="/signup/creator"
                  className="cta-party inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-sm transition-all"
                  style={{ color: "#fff" }}
                >
                  Claim Your First Bounty <ArrowRight size={14} />
                </a>
                <DrawBorderButton href="/signup/company">
                  I&apos;m a Brand
                </DrawBorderButton>
              </div>
            </div>
          </section>
        ) : (
          <div className="pt-24 md:pt-28" />
        )}

        {/* Search & Filters */}
        <section className="px-6 md:px-12 lg:px-24 pb-6">
          {/* Mobile: stacked layout */}
          <div className="flex flex-col gap-3 md:hidden">
            <div className="flex items-center gap-2 text-text-muted">
              <Filter size={14} />
              <span className="font-mono text-[11px] uppercase tracking-wider">
                Filter{activeFilterCount > 0 && ` (${activeFilterCount})`}
              </span>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => { setPlatformFilters([]); setNicheFilters([]); setPayMin(""); setPayMax(""); setFollowerMin(""); setFollowerMax(""); setSortBy("newest"); }}
                  className="font-mono text-[11px] uppercase tracking-wider text-accent-mid hover:text-accent transition-colors ml-auto"
                >
                  Clear all
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <MultiDropdown label="Platform" options={PLATFORMS.map((p) => ({ label: p, value: p }))} values={platformFilters} onChange={setPlatformFilters} isDark={isDark} />
              <MultiDropdown label="Niche" options={NICHES.map((n) => ({ label: n, value: n }))} values={nicheFilters} onChange={setNicheFilters} isDark={isDark} />
              <Dropdown label="Sort" options={SORT_OPTIONS} value={sortBy} onChange={setSortBy} isDark={isDark} />
            </div>
            <div className="flex items-center gap-1.5">
              <Label>Budget</Label>
              <PayStepper value={payMin} onChange={setPayMin} placeholder="Min $" isDark={isDark} />
              <span className="text-text-muted text-[11px] font-mono">–</span>
              <PayStepper value={payMax} onChange={setPayMax} placeholder="Max $" isDark={isDark} />
            </div>
            <div className="flex items-center gap-1.5">
              <Label>Followers</Label>
              <NumberStepper value={followerMin} onChange={setFollowerMin} placeholder="Min" isDark={isDark} />
              <span className="text-text-muted text-[11px] font-mono">–</span>
              <NumberStepper value={followerMax} onChange={setFollowerMax} placeholder="Max" isDark={isDark} />
            </div>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search bounties or brands..." className="w-full pl-9 pr-4 font-light text-sm text-text placeholder:text-text-muted outline-none transition-all duration-200" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: isDark ? "2px" : "8px", height: "36px", boxShadow: isDark ? "none" : "0 1px 3px rgba(45,41,38,0.04)" }} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
              {searchQuery && (<button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors cursor-pointer"><X size={13} /></button>)}
            </div>
            <span className="font-mono text-[11px] text-text-muted">{filtered.length} bounties</span>
          </div>

          {/* Desktop: fixed CSS grid layout */}
          <div className="hidden md:block">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 text-text-muted">
                <Filter size={14} />
                <span className="font-mono text-[11px] uppercase tracking-wider whitespace-nowrap">
                  Filter{activeFilterCount > 0 && ` (${activeFilterCount})`}
                </span>
              </div>
              <div style={{ width: "160px" }}>
                <MultiDropdown label="Platform" options={PLATFORMS.map((p) => ({ label: p, value: p }))} values={platformFilters} onChange={setPlatformFilters} isDark={isDark} />
              </div>
              <div style={{ width: "160px" }}>
                <MultiDropdown label="Niche" options={NICHES.map((n) => ({ label: n, value: n }))} values={nicheFilters} onChange={setNicheFilters} isDark={isDark} />
              </div>
              <div className="flex items-center gap-1.5">
                <Label>Budget</Label>
                <PayStepper value={payMin} onChange={setPayMin} placeholder="Min $" isDark={isDark} />
                <span className="text-text-muted text-[11px] font-mono">–</span>
                <PayStepper value={payMax} onChange={setPayMax} placeholder="Max $" isDark={isDark} />
              </div>
              <div className="flex items-center gap-1.5">
                <Label>Followers</Label>
                <NumberStepper value={followerMin} onChange={setFollowerMin} placeholder="Min" isDark={isDark} />
                <span className="text-text-muted text-[11px] font-mono">–</span>
                <NumberStepper value={followerMax} onChange={setFollowerMax} placeholder="Max" isDark={isDark} />
              </div>
              <div style={{ width: "200px" }}>
                <Dropdown label="Sort" options={SORT_OPTIONS} value={sortBy} onChange={setSortBy} isDark={isDark} />
              </div>
              <div className="flex-1 relative" style={{ minWidth: "180px" }}>
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search bounties or brands..." className="w-full pl-9 pr-4 font-light text-sm text-text placeholder:text-text-muted outline-none transition-all duration-200" style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: isDark ? "2px" : "8px", height: "36px", boxShadow: isDark ? "none" : "0 1px 3px rgba(45,41,38,0.04)" }} onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border-strong)")} onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")} />
                {searchQuery && (<button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text transition-colors cursor-pointer"><X size={13} /></button>)}
              </div>
              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button onClick={() => { setPlatformFilters([]); setNicheFilters([]); setPayMin(""); setPayMax(""); setFollowerMin(""); setFollowerMax(""); setSortBy("newest"); }} className="font-mono text-[11px] uppercase tracking-wider text-accent-mid hover:text-accent transition-colors whitespace-nowrap">
                    Clear all
                  </button>
                )}
                <span className="font-mono text-[11px] text-text-muted whitespace-nowrap">{filtered.length} bounties</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bounty Grid */}
        <section className="px-6 md:px-12 lg:px-24 pb-24">
          {!loading && filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-text-muted text-lg font-light">No bounties match your filters.</p>
              <button
                onClick={() => {
                  setPlatformFilters([]);
                  setNicheFilters([]);
                  setPayMin("");
                  setPayMax("");
                  setFollowerMin("");
                  setFollowerMax("");
                  setSearchQuery("");
                  setSortBy("newest");
                }}
                className="mt-3 text-accent-mid text-sm hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
              {(loading ? Array.from({ length: 6 }) : filtered).map((bounty, i) => (
                <BountyCardShell key={loading ? `skeleton-${i}` : (bounty as Bounty).id} isDark={isDark}>
                  <BountyCardContent
                    bounty={loading ? undefined : (bounty as Bounty)}
                    isDark={isDark}
                    index={i}
                    loaded={!loading}
                  />
                </BountyCardShell>
              ))}
            </div>
          )}
        </section>

      </div>
    </>
  );
}
