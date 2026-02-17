"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useTheme } from "../theme-provider";
import { Navbar } from "../../components/Navbar";
import { CanvasBackdrop } from "../canvas-backdrop";
import {
  CREATOR_SUMMARY,
  DAILY_EARNINGS,
  ACTIVE_BOUNTIES,
  CREATOR_APPLICATIONS,
  PAYMENT_HISTORY,
  COMPANY_SUMMARY,
  COMPANY_SPENDING,
  type DailyEarning,
  type ActiveBountyWork,
  type CreatorApplication,
  type PaymentRecord,
} from "../../data/fake-creator-stats";

/* ─── Helpers ──────────────────────────────────────────────────────── */
function fmt(n: number) {
  return "$" + n.toLocaleString("en-US");
}

function shortDate(d: string) {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fullDate(d: string) {
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ─── Status helpers ───────────────────────────────────────────────── */
const STATUS_COLORS: Record<string, string> = {
  pending: "#d4a843",
  accepted: "#5a8a60",
  rejected: "#c67a5c",
  in_progress: "#5aaca7",
  submitted: "#a688bf",
  under_review: "#d4a843",
  completed: "#5a8a60",
  paid: "#5a8a60",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  rejected: "Rejected",
  in_progress: "In Progress",
  submitted: "Submitted",
  under_review: "Under Review",
  completed: "Completed",
  paid: "Paid",
};

function StatusBadge({ status, isDark }: { status: string; isDark: boolean }) {
  const color = STATUS_COLORS[status] || "var(--text-muted)";
  return (
    <span
      className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] px-2 py-0.5"
      style={{
        color,
        background: isDark ? `${color}18` : `${color}15`,
        borderRadius: isDark ? "2px" : "6px",
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, display: "inline-block" }} />
      {STATUS_LABELS[status] || status}
    </span>
  );
}

/* ─── Metric Card ──────────────────────────────────────────────────── */
function MetricCard({
  label,
  value,
  accent,
  isDark,
  large,
}: {
  label: string;
  value: string;
  accent?: string;
  isDark: boolean;
  large?: boolean;
}) {
  return (
    <div
      className="p-5 md:p-6 transition-all duration-200"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: isDark ? "2px" : "10px",
        boxShadow: isDark ? "none" : "0 1px 3px rgba(45,41,38,0.04)",
      }}
    >
      <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted block mb-2">
        {label}
      </span>
      <p
        className="text-text font-extralight leading-none"
        style={{
          fontSize: large ? "clamp(2rem, 4vw, 3rem)" : "clamp(1.5rem, 2.5vw, 2rem)",
          color: accent || "var(--text)",
        }}
      >
        {value}
      </p>
    </div>
  );
}

/* ─── Tooltip ──────────────────────────────────────────────────────── */
function ChartTooltip({
  x,
  y,
  visible,
  lines,
}: {
  x: number;
  y: number;
  visible: boolean;
  lines: string[];
}) {
  if (!visible) return null;
  return (
    <div
      className="fixed pointer-events-none"
      style={{
        left: x + 12,
        top: y - 10,
        background: "#1a1a1a",
        color: "#fff",
        padding: "6px 10px",
        borderRadius: "4px",
        fontSize: "12px",
        lineHeight: "1.5",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        zIndex: 100,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.12s ease",
        whiteSpace: "nowrap",
      }}
    >
      {lines.map((l, i) => (
        <div key={i} style={{ fontFamily: i === 0 ? "'JetBrains Mono', monospace" : "inherit", opacity: i === 0 ? 0.7 : 1 }}>
          {l}
        </div>
      ))}
    </div>
  );
}

/* ─── Line Chart (Cumulative Earnings) ─────────────────────────────── */
function CumulativeLineChart({ data, isDark }: { data: DailyEarning[]; isDark: boolean }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0, visible: false, lines: [] as string[] });
  const [hoverIdx, setHoverIdx] = useState(-1);
  const [dims, setDims] = useState({ w: 700, h: 300 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setDims({ w: Math.max(width, 300), h: Math.min(Math.max(width * 0.38, 200), 350) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const pad = { top: 20, right: 16, bottom: 32, left: 52 };
  const chartW = dims.w - pad.left - pad.right;
  const chartH = dims.h - pad.top - pad.bottom;

  const maxVal = Math.max(...data.map((d) => d.cumulative), 1);
  const yTicks = 5;
  const yStep = Math.ceil(maxVal / yTicks / 100) * 100;

  const points = data.map((d, i) => ({
    x: pad.left + (i / (data.length - 1)) * chartW,
    y: pad.top + chartH - (d.cumulative / (yStep * yTicks)) * chartH,
  }));

  // Build smooth line path
  const linePath = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(" ");
  const areaPath = linePath + ` L${points[points.length - 1].x},${pad.top + chartH} L${points[0].x},${pad.top + chartH} Z`;

  const pathLength = useMemo(() => {
    // Approximate total path length
    let len = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      len += Math.sqrt(dx * dx + dy * dy);
    }
    return len;
  }, [points]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const mx = e.clientX - rect.left;
      const relX = mx - pad.left;
      const idx = Math.round((relX / chartW) * (data.length - 1));
      if (idx < 0 || idx >= data.length) {
        setTooltip((t) => ({ ...t, visible: false }));
        setHoverIdx(-1);
        return;
      }
      setHoverIdx(idx);
      setTooltip({
        x: e.clientX,
        y: e.clientY,
        visible: true,
        lines: [shortDate(data[idx].date), fmt(data[idx].cumulative)],
      });
    },
    [data, chartW, pad.left]
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip((t) => ({ ...t, visible: false }));
    setHoverIdx(-1);
  }, []);

  // X-axis labels — every ~15 days
  const xLabels: { idx: number; label: string }[] = [];
  const step = Math.max(Math.floor(data.length / 6), 1);
  for (let i = 0; i < data.length; i += step) xLabels.push({ idx: i, label: shortDate(data[i].date) });

  return (
    <div ref={containerRef} className="w-full" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        width="100%"
        height={dims.h}
        style={{ overflow: "visible" }}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-mid)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent-mid)" stopOpacity="0" />
          </linearGradient>
          <clipPath id="areaClip">
            <rect x={pad.left} y={pad.top} width={mounted ? chartW : 0} height={chartH} style={{ transition: "width 1.2s cubic-bezier(0.25,0.46,0.45,0.94)" }} />
          </clipPath>
        </defs>

        {/* Grid lines */}
        {Array.from({ length: yTicks + 1 }).map((_, i) => {
          const yy = pad.top + chartH - (i * chartH) / yTicks;
          return (
            <g key={i}>
              <line
                x1={pad.left}
                y1={yy}
                x2={pad.left + chartW}
                y2={yy}
                stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(45,41,38,0.06)"}
                strokeWidth={1}
              />
              <text
                x={pad.left - 8}
                y={yy + 3}
                textAnchor="end"
                fill="var(--text-muted)"
                fontSize="10"
                fontFamily="'JetBrains Mono', monospace"
              >
                ${(i * yStep).toLocaleString()}
              </text>
            </g>
          );
        })}

        {/* X labels */}
        {xLabels.map(({ idx, label }) => (
          <text
            key={idx}
            x={points[idx]?.x ?? 0}
            y={pad.top + chartH + 20}
            textAnchor="middle"
            fill="var(--text-muted)"
            fontSize="10"
            fontFamily="'JetBrains Mono', monospace"
          >
            {label}
          </text>
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" clipPath="url(#areaClip)" />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="var(--accent-mid)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: pathLength,
            strokeDashoffset: mounted ? 0 : pathLength,
            transition: "stroke-dashoffset 1.4s cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        />

        {/* Hover vertical line */}
        {hoverIdx >= 0 && (
          <line
            x1={points[hoverIdx].x}
            y1={pad.top}
            x2={points[hoverIdx].x}
            y2={pad.top + chartH}
            stroke={isDark ? "rgba(255,255,255,0.15)" : "rgba(45,41,38,0.12)"}
            strokeWidth={1}
            strokeDasharray="4 3"
          />
        )}

        {/* Hover dot */}
        {hoverIdx >= 0 && (
          <circle
            cx={points[hoverIdx].x}
            cy={points[hoverIdx].y}
            r={5}
            fill="var(--accent-mid)"
            stroke="var(--bg)"
            strokeWidth={2}
          />
        )}
      </svg>
      <ChartTooltip {...tooltip} />
    </div>
  );
}

/* ─── Bar Chart (Earnings Breakdown) ───────────────────────────────── */
type BarPeriod = "day" | "week" | "month";

function aggregateByWeek(data: DailyEarning[]): { label: string; amount: number }[] {
  const weeks: { label: string; amount: number }[] = [];
  let weekSum = 0;
  let weekStart = data[0]?.date || "";
  data.forEach((d, i) => {
    if (i === 0) weekStart = d.date;
    weekSum += d.amount;
    const dayOfWeek = new Date(d.date + "T00:00:00").getDay();
    if (dayOfWeek === 0 || i === data.length - 1) {
      weeks.push({ label: shortDate(weekStart), amount: weekSum });
      weekSum = 0;
      weekStart = data[i + 1]?.date || "";
    }
  });
  return weeks;
}

function aggregateByMonth(data: DailyEarning[]): { label: string; amount: number }[] {
  const months: Record<string, number> = {};
  data.forEach((d) => {
    const key = d.date.slice(0, 7);
    months[key] = (months[key] || 0) + d.amount;
  });
  return Object.entries(months).map(([k, v]) => {
    const dt = new Date(k + "-01T00:00:00");
    return { label: dt.toLocaleDateString("en-US", { month: "short", year: "2-digit" }), amount: v };
  });
}

function EarningsBarChart({ data, isDark }: { data: DailyEarning[]; isDark: boolean }) {
  const [period, setPeriod] = useState<BarPeriod>("week");
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState({ x: 0, y: 0, visible: false, lines: [] as string[] });
  const [dims, setDims] = useState({ w: 700, h: 280 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setDims({ w: Math.max(width, 300), h: Math.min(Math.max(width * 0.35, 180), 300) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    setMounted(false);
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, [period]);

  const bars = useMemo(() => {
    if (period === "day") {
      // Only show days with earnings
      return data.filter((d) => d.amount > 0).map((d) => ({ label: shortDate(d.date), amount: d.amount }));
    }
    if (period === "week") return aggregateByWeek(data);
    return aggregateByMonth(data);
  }, [data, period]);

  const maxVal = Math.max(...bars.map((b) => b.amount), 1);
  const pad = { top: 16, right: 16, bottom: 36, left: 52 };
  const chartW = dims.w - pad.left - pad.right;
  const chartH = dims.h - pad.top - pad.bottom;
  const barGap = Math.max(2, chartW * 0.02);
  const barW = Math.max(4, (chartW - barGap * bars.length) / bars.length);

  const handleBarHover = useCallback(
    (e: React.MouseEvent, bar: { label: string; amount: number }) => {
      setTooltip({ x: e.clientX, y: e.clientY, visible: true, lines: [bar.label, fmt(bar.amount)] });
    },
    []
  );

  const toggles: { label: string; value: BarPeriod }[] = [
    { label: "Day", value: "day" },
    { label: "Week", value: "week" },
    { label: "Month", value: "month" },
  ];

  return (
    <div ref={containerRef} className="w-full">
      {/* Toggle */}
      <div className="flex gap-1 mb-4">
        {toggles.map((t) => (
          <button
            key={t.value}
            onClick={() => setPeriod(t.value)}
            className="font-mono text-[11px] uppercase tracking-[0.1em] px-3 py-1 transition-all duration-200 cursor-pointer"
            style={{
              background: period === t.value ? (isDark ? "rgba(255,255,255,0.08)" : "var(--surface-raised, #e8e4df)") : "transparent",
              color: period === t.value ? "var(--text)" : "var(--text-muted)",
              borderRadius: isDark ? "2px" : "6px",
              border: "1px solid",
              borderColor: period === t.value ? "var(--border-strong)" : "transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${dims.w} ${dims.h}`}
        width="100%"
        height={dims.h}
        onMouseLeave={() => setTooltip((t) => ({ ...t, visible: false }))}
      >
        {/* Y grid */}
        {Array.from({ length: 5 }).map((_, i) => {
          const yy = pad.top + chartH - (i * chartH) / 4;
          const val = Math.round((i * maxVal) / 4);
          return (
            <g key={i}>
              <line x1={pad.left} y1={yy} x2={pad.left + chartW} y2={yy} stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(45,41,38,0.06)"} strokeWidth={1} />
              <text x={pad.left - 8} y={yy + 3} textAnchor="end" fill="var(--text-muted)" fontSize="10" fontFamily="'JetBrains Mono', monospace">
                ${val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {bars.map((bar, i) => {
          const bx = pad.left + i * (barW + barGap) + barGap / 2;
          const bh = (bar.amount / maxVal) * chartH;
          const by = pad.top + chartH - bh;
          return (
            <g key={i} onMouseMove={(e) => handleBarHover(e, bar)} onMouseLeave={() => setTooltip((t) => ({ ...t, visible: false }))}>
              <rect
                x={bx}
                y={mounted ? by : pad.top + chartH}
                width={barW}
                height={mounted ? bh : 0}
                rx={isDark ? 1 : 3}
                fill="var(--accent-mid)"
                fillOpacity={0.75}
                style={{
                  transition: `y 0.5s cubic-bezier(0.25,0.46,0.45,0.94) ${i * 40}ms, height 0.5s cubic-bezier(0.25,0.46,0.45,0.94) ${i * 40}ms`,
                  cursor: "pointer",
                }}
              />
              <rect x={bx} y={mounted ? by : pad.top + chartH} width={barW} height={mounted ? bh : 0} rx={isDark ? 1 : 3} fill="var(--accent-mid)" fillOpacity={0} style={{ transition: `y 0.5s ${i * 40}ms, height 0.5s ${i * 40}ms`, cursor: "pointer" }}>
                <set attributeName="fill-opacity" to="0.15" begin="mouseover" end="mouseout" />
              </rect>
              {/* X label — show for limited bars */}
              {bars.length <= 14 && (
                <text x={bx + barW / 2} y={pad.top + chartH + 16} textAnchor="middle" fill="var(--text-muted)" fontSize="9" fontFamily="'JetBrains Mono', monospace">
                  {bar.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <ChartTooltip {...tooltip} />
    </div>
  );
}

/* ─── Company Bar Chart (simpler) ──────────────────────────────────── */
function CompanySpendingChart({ isDark }: { isDark: boolean }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 100); return () => clearTimeout(t); }, []);

  const data = COMPANY_SPENDING;
  const maxVal = Math.max(...data.map((d) => d.amount), 1);
  const w = 500, h = 200;
  const pad = { top: 16, right: 16, bottom: 32, left: 52 };
  const chartW = w - pad.left - pad.right;
  const chartH = h - pad.top - pad.bottom;
  const barW = chartW / data.length - 12;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h}>
      {data.map((d, i) => {
        const bx = pad.left + i * (chartW / data.length) + 6;
        const bh = (d.amount / maxVal) * chartH;
        return (
          <g key={i}>
            <rect
              x={bx} y={mounted ? pad.top + chartH - bh : pad.top + chartH}
              width={barW} height={mounted ? bh : 0} rx={isDark ? 1 : 3}
              fill="var(--accent-mid)" fillOpacity={0.7}
              style={{ transition: `y 0.5s ${i * 80}ms, height 0.5s ${i * 80}ms` }}
            />
            <text x={bx + barW / 2} y={pad.top + chartH + 18} textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontFamily="'JetBrains Mono', monospace">
              {d.date}
            </text>
            <text x={bx + barW / 2} y={mounted ? pad.top + chartH - bh - 6 : pad.top + chartH - 6} textAnchor="middle" fill="var(--text)" fontSize="11" fontFamily="'JetBrains Mono', monospace" style={{ transition: `y 0.5s ${i * 80}ms`, opacity: mounted ? 1 : 0 }}>
              {fmt(d.amount)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Section wrapper ──────────────────────────────────────────────── */
function Section({ title, children, isDark }: { title: string; children: React.ReactNode; isDark: boolean }) {
  return (
    <div
      className="p-5 md:p-7 mb-5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: isDark ? "2px" : "10px",
        boxShadow: isDark ? "none" : "0 1px 3px rgba(45,41,38,0.04)",
      }}
    >
      <h2 className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted mb-5">{title}</h2>
      {children}
    </div>
  );
}

/* ─── Creator Dashboard ────────────────────────────────────────────── */
function CreatorDashboard({ isDark }: { isDark: boolean }) {
  const s = CREATOR_SUMMARY;

  return (
    <>
      {/* Earnings Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5">
        <MetricCard label="Total Earnings" value={fmt(s.totalEarnings)} accent="var(--accent-mid)" isDark={isDark} large />
        <MetricCard label="This Month" value={fmt(s.thisMonthEarnings)} isDark={isDark} />
        <MetricCard label="Pending Payouts" value={fmt(s.pendingPayouts)} accent="#d4a843" isDark={isDark} />
        <MetricCard label="Avg per Bounty" value={fmt(s.averagePerBounty)} isDark={isDark} />
      </div>

      {/* Charts */}
      <Section title="Cumulative Earnings" isDark={isDark}>
        <CumulativeLineChart data={DAILY_EARNINGS} isDark={isDark} />
      </Section>

      <Section title="Earnings Breakdown" isDark={isDark}>
        <EarningsBarChart data={DAILY_EARNINGS} isDark={isDark} />
      </Section>

      {/* Active Bounties */}
      <Section title="Active Bounties" isDark={isDark}>
        <div className="space-y-3">
          {ACTIVE_BOUNTIES.map((b) => (
            <ActiveBountyRow key={b.id} bounty={b} isDark={isDark} />
          ))}
        </div>
      </Section>

      {/* Applications */}
      <Section title="Recent Applications" isDark={isDark}>
        <div className="space-y-2">
          {CREATOR_APPLICATIONS.slice().reverse().map((a) => (
            <ApplicationRow key={a.id} app={a} isDark={isDark} />
          ))}
        </div>
      </Section>

      {/* Payment History */}
      <Section title="Payment History" isDark={isDark}>
        <PaymentTable payments={PAYMENT_HISTORY} isDark={isDark} />
      </Section>
    </>
  );
}

/* ─── Active Bounty Row ────────────────────────────────────────────── */
function ActiveBountyRow({ bounty, isDark }: { bounty: ActiveBountyWork; isDark: boolean }) {
  const progress =
    bounty.status === "completed" ? 100
    : bounty.status === "under_review" ? 80
    : bounty.status === "submitted" ? 60
    : 30;

  return (
    <div
      className="p-4 flex flex-col sm:flex-row sm:items-center gap-3"
      style={{
        background: isDark ? "rgba(255,255,255,0.02)" : "var(--surface-raised, #e8e4df)",
        borderRadius: isDark ? "2px" : "8px",
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm text-text font-light truncate">{bounty.bountyTitle}</div>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">{bounty.brand}</span>
          <span className="text-text-muted" style={{ fontSize: 8 }}>●</span>
          <span className="font-mono text-[10px] text-text-muted uppercase tracking-wider">{bounty.platform}</span>
        </div>
        {bounty.payType === "per_impression" && bounty.impressions != null && (
          <div className="mt-1.5 flex items-center gap-3 flex-wrap">
            <span className="font-mono text-[10px] text-text-muted">
              {(bounty.impressions / 1000).toFixed(0)}K impressions
            </span>
            <span className="font-mono text-[10px] text-text-muted">
              ${bounty.impressionRate}/1K
            </span>
            <span className="font-mono text-[10px]" style={{ color: "#5a8a60" }}>
              {fmt(bounty.impressionEarnings || 0)} earned
            </span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 sm:flex-shrink-0">
        {/* Progress bar */}
        <div style={{ width: 80, height: 4, background: isDark ? "rgba(255,255,255,0.06)" : "var(--border)", borderRadius: 2 }}>
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              background: "var(--accent-mid)",
              borderRadius: 2,
              transition: "width 0.5s ease",
            }}
          />
        </div>
        <StatusBadge status={bounty.status} isDark={isDark} />
      </div>
    </div>
  );
}

/* ─── Application Row ──────────────────────────────────────────────── */
function ApplicationRow({ app, isDark }: { app: CreatorApplication; isDark: boolean }) {
  return (
    <div
      className="flex items-center justify-between py-2.5 px-3 gap-3"
      style={{
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm text-text font-light truncate">{app.bountyTitle}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-mono text-[10px] text-text-muted">{app.brand}</span>
          <span className="text-text-muted" style={{ fontSize: 8 }}>●</span>
          <span className="font-mono text-[10px] text-text-muted">{shortDate(app.dateApplied)}</span>
        </div>
      </div>
      <StatusBadge status={app.status} isDark={isDark} />
    </div>
  );
}

/* ─── Payment Table ────────────────────────────────────────────────── */
function PaymentTable({ payments, isDark }: { payments: PaymentRecord[]; isDark: boolean }) {
  let running = 0;
  const rows = payments.map((p) => {
    running += p.status === "paid" ? p.amount : 0;
    return { ...p, running };
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border-strong)" }}>
            {["Date", "Bounty", "Amount", "Type", "Status", "Running Total"].map((h) => (
              <th
                key={h}
                className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted font-normal text-left py-2 px-2"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
              <td className="py-2.5 px-2 font-mono text-[11px] text-text-muted whitespace-nowrap">{shortDate(p.date)}</td>
              <td className="py-2.5 px-2 text-text font-light truncate max-w-[200px]">{p.bountyTitle}</td>
              <td className="py-2.5 px-2 font-mono text-[12px] text-text">{fmt(p.amount)}</td>
              <td className="py-2.5 px-2">
                <span
                  className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5"
                  style={{
                    color: p.type === "fixed" ? "#5aaca7" : "#a688bf",
                    background: isDark
                      ? p.type === "fixed" ? "rgba(90,172,167,0.12)" : "rgba(166,136,191,0.12)"
                      : p.type === "fixed" ? "rgba(90,172,167,0.1)" : "rgba(166,136,191,0.1)",
                    borderRadius: isDark ? "2px" : "4px",
                  }}
                >
                  {p.type === "fixed" ? "Fixed" : "Per-imp"}
                </span>
              </td>
              <td className="py-2.5 px-2"><StatusBadge status={p.status} isDark={isDark} /></td>
              <td className="py-2.5 px-2 font-mono text-[11px] text-text-muted">{fmt(p.running)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Company Dashboard ────────────────────────────────────────────── */
function CompanyDashboard({ isDark }: { isDark: boolean }) {
  const s = COMPANY_SUMMARY;
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-5">
        <MetricCard label="Bounties Posted" value={String(s.bountiesPosted)} isDark={isDark} />
        <MetricCard label="Active Bounties" value={String(s.activeBounties)} accent="#d4a843" isDark={isDark} />
        <MetricCard label="Total Spent" value={fmt(s.totalSpent)} accent="var(--accent-mid)" isDark={isDark} large />
        <MetricCard label="Applications Received" value={String(s.applicationsReceived)} isDark={isDark} />
        <MetricCard label="Creators Hired" value={String(s.creatorsHired)} accent="#5a8a60" isDark={isDark} />
      </div>

      <Section title="Spending Over Time" isDark={isDark}>
        <CompanySpendingChart isDark={isDark} />
      </Section>
    </>
  );
}

/* ─── Main Page ────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { data: session, status } = useSession();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setRole(data.role || "creator"))
      .catch(() => setRole("creator"))
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || status === "unauthenticated") return null;

  // Default to creator view for demo
  const isCreator = role !== "company";

  return (
    <>
      <CanvasBackdrop />
      <div className="relative" style={{ zIndex: 1 }}>
        <Navbar />
        <section className="pt-28 pb-20 md:pt-32 px-6 md:px-12 lg:px-24 max-w-[1200px] mx-auto">
          <div className="mb-8">
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
              {isCreator ? "Creator Dashboard" : "Campaign Overview"}
            </span>
            <h1 className="mt-2 text-text font-extralight" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}>
              {isCreator ? "Earnings & Activity" : "Spending & Performance"}
            </h1>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="p-5 md:p-6"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: isDark ? "2px" : "10px",
                  }}
                >
                  <div className="skeleton-shimmer w-24 h-3 mb-3" />
                  <div className="skeleton-shimmer w-20 h-7" />
                </div>
              ))}
            </div>
          ) : isCreator ? (
            <CreatorDashboard isDark={isDark} />
          ) : (
            <CompanyDashboard isDark={isDark} />
          )}
        </section>

        <footer className="px-6 md:px-12 lg:px-24 py-8 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted font-light">agora</span>
            <span className="font-mono text-[11px] text-text-muted uppercase tracking-wide">© 2026 Agora</span>
          </div>
        </footer>
      </div>
    </>
  );
}
