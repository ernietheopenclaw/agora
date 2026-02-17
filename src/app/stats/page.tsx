"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "../theme-provider";
import { Navbar } from "../../components/Navbar";
import { CanvasBackdrop } from "../canvas-backdrop";
import {
  Send,
  Clock,
  CheckCircle,
  DollarSign,
  FileText,
  TrendingUp,
  Briefcase,
  Zap,
  Users,
  CreditCard,
} from "lucide-react";

interface StatsData {
  role: string;
  stats: Record<string, number>;
}

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  isDark: boolean;
  accent?: string;
}

function StatCard({ label, value, icon, isDark, accent }: StatCardProps) {
  return (
    <div
      className="p-6 md:p-7 transition-all duration-200 hover:!border-[var(--accent-mid)]"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: isDark ? "2px" : "10px",
        boxShadow: isDark ? "none" : "0 1px 3px rgba(45,41,38,0.04)",
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="flex items-center justify-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: isDark ? "2px" : "8px",
            background: accent
              ? isDark
                ? `${accent}15`
                : `${accent}18`
              : isDark
              ? "rgba(255,255,255,0.05)"
              : "var(--surface-raised, #e8e4df)",
            color: accent || "var(--text-muted)",
          }}
        >
          {icon}
        </div>
      </div>
      <p
        className="text-text font-extralight leading-none mb-1.5"
        style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
      >
        {value}
      </p>
      <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
        {label}
      </span>
    </div>
  );
}

function StatsSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="p-6 md:p-7"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: isDark ? "2px" : "10px",
          }}
        >
          <div className="skeleton-shimmer w-9 h-9 mb-4" style={{ borderRadius: isDark ? "2px" : "8px" }} />
          <div className="skeleton-shimmer w-24 h-8 mb-2" />
          <div className="skeleton-shimmer w-32 h-3" />
        </div>
      ))}
    </div>
  );
}

export default function StatsPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, [status]);

  if (status === "loading" || status === "unauthenticated") {
    return null;
  }

  const creatorCards = stats?.role === "creator" ? [
    { label: "Bounties Applied To", value: String(stats.stats.totalApplications ?? 0), icon: <Send size={18} />, accent: "#5aaca7" },
    { label: "Pending Applications", value: String(stats.stats.pendingApplications ?? 0), icon: <Clock size={18} />, accent: "#d4a843" },
    { label: "Accepted", value: String(stats.stats.acceptedApplications ?? 0), icon: <CheckCircle size={18} />, accent: "#5a8a60" },
    { label: "Total Earnings", value: `$${(stats.stats.totalEarnings ?? 0).toLocaleString()}`, icon: <DollarSign size={18} />, accent: "#5a8a60" },
    { label: "Submissions Made", value: String(stats.stats.submissions ?? 0), icon: <FileText size={18} />, accent: "#a688bf" },
    { label: "Acceptance Rate", value: `${stats.stats.acceptanceRate ?? 0}%`, icon: <TrendingUp size={18} />, accent: "#5aaca7" },
  ] : [];

  const companyCards = stats?.role === "company" ? [
    { label: "Bounties Posted", value: String(stats.stats.totalBounties ?? 0), icon: <Briefcase size={18} />, accent: "#5aaca7" },
    { label: "Active Bounties", value: String(stats.stats.activeBounties ?? 0), icon: <Zap size={18} />, accent: "#d4a843" },
    { label: "Total Applications", value: String(stats.stats.totalApplications ?? 0), icon: <FileText size={18} />, accent: "#a688bf" },
    { label: "Total Spent", value: `$${(stats.stats.totalSpent ?? 0).toLocaleString()}`, icon: <CreditCard size={18} />, accent: "#c67a5c" },
    { label: "Creators Hired", value: String(stats.stats.creatorsHired ?? 0), icon: <Users size={18} />, accent: "#5a8a60" },
  ] : [];

  const cards = stats?.role === "creator" ? creatorCards : companyCards;

  return (
    <>
      <CanvasBackdrop />
      <div className="relative" style={{ zIndex: 1 }}>
        <Navbar />
        <section className="pt-28 pb-20 md:pt-32 px-6 md:px-12 lg:px-24">
          <div className="mb-8">
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
              Your Stats
            </span>
            <h1 className="mt-2 text-text font-extralight text-2xl md:text-3xl">
              {stats?.role === "company" ? "Campaign Overview" : "Creator Performance"}
            </h1>
          </div>

          {loading ? (
            <StatsSkeleton isDark={isDark} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {cards.map((card) => (
                <StatCard
                  key={card.label}
                  label={card.label}
                  value={card.value}
                  icon={card.icon}
                  isDark={isDark}
                  accent={card.accent}
                />
              ))}
            </div>
          )}
        </section>

        <footer
          className="px-6 md:px-12 lg:px-24 py-8 border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted font-light">agora</span>
            <span className="font-mono text-[11px] text-text-muted uppercase tracking-wide">
              © 2026 Agora
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}
