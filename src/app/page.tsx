"use client";

import { useTheme } from "./theme-provider";
import { CanvasBackdrop } from "./canvas-backdrop";
import {
  Sun,
  Moon,
  ArrowRight,
  Filter,
  Clock,
  DollarSign,
  X,
  ChevronDown,
} from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";

interface Bounty {
  id: string;
  title: string;
  description: string;
  platform: string;
  contentType: string;
  budget: number;
  deadline: string;
  niche: string | null;
  requirements: string | null;
  company: { companyName: string; description: string | null };
}

const ALL_PLATFORMS = ["Instagram", "TikTok", "YouTube", "Twitter/X"].sort();
const ALL_NICHES = ["Fashion", "Food & Drink", "Tech", "Fitness", "Travel", "Beauty", "Pets", "Lifestyle", "Business"].sort();
const PAY_RANGES = [
  { label: "Any", min: 0, max: Infinity },
  { label: "$100–$300", min: 100, max: 300 },
  { label: "$300–$600", min: 300, max: 600 },
  { label: "$600–$1000", min: 600, max: 1000 },
  { label: "$1000+", min: 1000, max: Infinity },
];

function AgoraLogo({ size = 24 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <polygon
        points="16,2 28,10 28,22 16,30 4,22 4,10"
        stroke="#5aaca7"
        strokeWidth="2"
        fill="none"
      />
      <polygon
        points="16,8 22,12 22,20 16,24 10,20 10,12"
        fill="#5aaca7"
        opacity="0.6"
      />
      <circle cx="16" cy="16" r="3" fill="#218380" />
    </svg>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
      {children}
    </span>
  );
}

function PlatformIcon({ platform }: { platform: string }) {
  const colors: Record<string, string> = {
    TikTok: "#ff2d55",
    Instagram: "#c13584",
    YouTube: "#ff0000",
    "Twitter/X": "var(--text)",
  };
  return (
    <span
      className="inline-block w-2 h-2 rounded-full flex-shrink-0"
      style={{ background: colors[platform] || "var(--accent-mid)" }}
    />
  );
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function BountyCard({ bounty, isDark }: { bounty: Bounty; isDark: boolean }) {
  const days = daysUntil(bounty.deadline);

  return (
    <Link
      href={`/bounty/${bounty.id}`}
      className="group block p-5 md:p-6 transition-all duration-200"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: isDark ? "2px" : "10px",
        boxShadow: isDark ? "none" : "0 1px 3px rgba(45,41,38,0.04)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <PlatformIcon platform={bounty.platform} />
            <Label>{bounty.platform}</Label>
            <span className="text-text-muted text-[11px]">·</span>
            <Label>{bounty.contentType}</Label>
          </div>
          <h3 className="text-text font-light text-base md:text-lg leading-snug group-hover:text-accent-mid transition-colors duration-200">
            {bounty.title}
          </h3>
          <p className="mt-1.5 text-text-muted text-sm font-light truncate">{bounty.company.companyName}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-text font-light text-xl md:text-2xl">${bounty.budget.toLocaleString()}</p>
          <div className="flex items-center gap-1 mt-1 justify-end">
            <Clock size={11} className="text-text-muted" />
            <span className="font-mono text-[11px] text-text-muted">
              {days}d left
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
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
      </div>
    </Link>
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
        className="flex items-center gap-1.5 cursor-pointer font-mono text-[11px] uppercase tracking-wider px-3 transition-all duration-200"
        style={{
          background: "var(--surface)",
          color: value ? "var(--text)" : "var(--text-muted)",
          border: `1px solid ${open ? "var(--border-strong)" : "var(--border)"}`,
          borderRadius: isDark ? "2px" : "8px",
          height: "36px",
          boxShadow: !isDark ? "0 1px 3px rgba(45,41,38,0.04)" : "none",
        }}
      >
        <span>{selectedLabel || label}</span>
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
        <div
          className="font-mono text-[11px] uppercase tracking-wider px-3 cursor-pointer transition-colors duration-150"
          style={{
            height: "36px",
            display: "flex",
            alignItems: "center",
            color: !value ? "var(--text)" : "var(--text-muted)",
            background: !value ? (isDark ? "rgba(255,255,255,0.05)" : "var(--surface-raised, #e8e4df)") : "transparent",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.05)" : "var(--surface-raised, #e8e4df)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = !value ? (isDark ? "rgba(255,255,255,0.05)" : "var(--surface-raised, #e8e4df)") : "transparent")}
          onClick={() => { onChange(""); setOpen(false); }}
        >
          {label}
        </div>
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

export default function Home() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState("");
  const [nicheFilter, setNicheFilter] = useState("");
  const [payRange, setPayRange] = useState(0); // index into PAY_RANGES

  useEffect(() => {
    fetch("/api/bounties")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setBounties(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const PLATFORMS = ALL_PLATFORMS;
  const NICHES = ALL_NICHES;

  const filtered = useMemo(() => {
    return bounties.filter((b) => {
      if (platformFilter && b.platform !== platformFilter) return false;
      if (nicheFilter && b.niche !== nicheFilter) return false;
      const range = PAY_RANGES[payRange];
      if (b.budget < range.min || b.budget > range.max) return false;
      return true;
    });
  }, [bounties, platformFilter, nicheFilter, payRange]);

  const activeFilterCount = [platformFilter, nicheFilter, payRange > 0].filter(Boolean).length;

  return (
    <>
      <CanvasBackdrop />
      <div className="relative" style={{ zIndex: 1 }}>
        {/* Nav */}
        <nav
          className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 md:px-12"
          style={{
            zIndex: 10,
            background: "var(--bg)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-2">
            <AgoraLogo size={24} />
            <span className="text-base font-light tracking-tight text-text">agora</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="text-sm text-text-muted hover:text-text transition-colors"
            >
              Log in
            </a>
            <a
              href="/signup/creator"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-sm transition-all"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Start Earning <ArrowRight size={13} />
            </a>
            <button
              onClick={toggle}
              className="flex items-center justify-center w-8 h-8 rounded-sm transition-colors"
              style={{ background: "var(--surface)" }}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun size={16} strokeWidth={1.5} className="text-text-muted" />
              ) : (
                <Moon size={16} strokeWidth={1.5} fill="var(--text-muted)" className="text-text-muted" />
              )}
            </button>
          </div>
        </nav>

        {/* Hero — compact */}
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
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-sm transition-all"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                Claim Your First Bounty <ArrowRight size={14} />
              </a>
              <a
                href="/signup/company"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-sm border transition-all text-text-muted hover:text-text"
                style={{ borderColor: "var(--border-strong)" }}
              >
                I&apos;m a Brand
              </a>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="px-6 md:px-12 lg:px-24 pb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-text-muted">
              <Filter size={14} />
              <span className="font-mono text-[11px] uppercase tracking-wider">
                Filter{activeFilterCount > 0 && ` (${activeFilterCount})`}
              </span>
            </div>
            <Dropdown
              label="Platform"
              options={PLATFORMS.map((p) => ({ label: p, value: p }))}
              value={platformFilter}
              onChange={setPlatformFilter}
              isDark={isDark}
            />
            <Dropdown
              label="Niche"
              options={NICHES.map((n) => ({ label: n, value: n }))}
              value={nicheFilter}
              onChange={setNicheFilter}
              isDark={isDark}
            />
            <Dropdown
              label="Pay Range"
              options={PAY_RANGES.slice(1).map((r, i) => ({ label: r.label, value: String(i + 1) }))}
              value={payRange > 0 ? String(payRange) : ""}
              onChange={(v) => setPayRange(v ? parseInt(v) : 0)}
              isDark={isDark}
            />
            {activeFilterCount > 0 && (
              <button
                onClick={() => {
                  setPlatformFilter("");
                  setNicheFilter("");
                  setPayRange(0);
                }}
                className="font-mono text-[11px] uppercase tracking-wider text-accent-mid hover:text-accent transition-colors"
              >
                Clear all
              </button>
            )}
            <span className="ml-auto font-mono text-[11px] text-text-muted">
              {filtered.length} bounties
            </span>
          </div>
        </section>

        {/* Bounty Grid */}
        <section className="px-6 md:px-12 lg:px-24 pb-24">
          {filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-text-muted text-lg font-light">No bounties match your filters.</p>
              <button
                onClick={() => {
                  setPlatformFilter("");
                  setNicheFilter("");
                  setPayRange(0);
                }}
                className="mt-3 text-accent-mid text-sm hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
              {filtered.map((bounty) => (
                <BountyCard key={bounty.id} bounty={bounty} isDark={isDark} />
              ))}
            </div>
          )}
        </section>

        {/* Bottom CTA */}
        <section
          className="px-6 md:px-12 lg:px-24 py-16"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-text font-extralight text-2xl md:text-3xl">
                More bounties drop daily.
              </h2>
              <p className="mt-2 text-text-muted text-base">
                Sign up to get notified and apply before slots fill up.
              </p>
            </div>
            <a
              href="/signup/creator"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-sm transition-all flex-shrink-0"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              Create Your Profile <ArrowRight size={14} />
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer
          className="px-6 md:px-12 lg:px-24 py-8 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <AgoraLogo size={18} />
              <span className="text-sm text-text-muted font-light">agora</span>
            </div>
            <span className="font-mono text-[11px] text-text-muted uppercase tracking-wide">
              © 2026 Agora. All rights reserved.
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}
