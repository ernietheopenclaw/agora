"use client";

import { useTheme } from "../../theme-provider";
import { CanvasBackdrop } from "../../canvas-backdrop";
import Link from "next/link";
import { AgoraLogo } from "../../../components/AgoraLogo";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { DUMMY_BOUNTIES } from "../../../data/bounties";
import {
  Sun,
  Moon,
  ArrowLeft,
  ArrowRight,
  Clock,
  Monitor,
  Tag,
  CheckCircle2,
  Calendar,
  Building2,
  FileText,
} from "lucide-react";
import { BountyDetailSkeleton } from "../../../components/Skeletons";

interface BountyData {
  id: string;
  title: string;
  description: string;
  platform: string;
  contentType: string;
  niche: string | null;
  requirements: string | null;
  budget: number;
  payPerImpression: string | null;
  deadline: string;
  allowResubmission: boolean;
  status: string;
  company: { companyName: string; description: string | null };
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
      className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
      style={{ background: colors[platform] || "var(--accent-mid)" }}
    />
  );
}

function daysUntil(dateStr: string): number {
  const now = new Date();
  const target = new Date(dateStr);
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function BountyDetail() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const params = useParams();
  const id = params.id as string;

  const [bounty, setBounty] = useState<BountyData | null>(null);
  const [relatedBounties, setRelatedBounties] = useState<BountyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    function fallbackToDummy() {
      const dummy = DUMMY_BOUNTIES.find((b) => b.id === id);
      if (dummy) {
        setBounty({
          id: dummy.id,
          title: dummy.title,
          description: dummy.fullDescription,
          platform: dummy.platform,
          contentType: dummy.contentType,
          niche: dummy.niche,
          requirements: dummy.requirements.join("\n"),
          budget: dummy.budget,
          payPerImpression: dummy.payPerImpression,
          deadline: dummy.deadline,
          status: "open",
          allowResubmission: false,
          company: { companyName: dummy.brand, description: dummy.brandDescription },
        });
      } else {
        setNotFound(true);
      }
    }

    fetch(`/api/bounties/${id}`)
      .then((r) => {
        if (!r.ok) { fallbackToDummy(); return null; }
        return r.json();
      })
      .then((data) => {
        if (data && !data.error) setBounty(data);
        else fallbackToDummy();
      })
      .catch(() => fallbackToDummy())
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!bounty) return;
    fetch("/api/bounties")
      .then((r) => r.json())
      .then((all: BountyData[]) => {
        if (!Array.isArray(all)) return;
        setRelatedBounties(
          all
            .filter((b) => b.id !== bounty.id && (b.niche === bounty.niche || b.platform === bounty.platform))
            .slice(0, 3)
        );
      })
      .catch(() => {});
  }, [bounty]);

  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    if (!loading && bounty) {
      const timer = setTimeout(() => setContentVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [loading, bounty]);

  const requirementsList = bounty?.requirements?.split("\n").filter(Boolean) || [];
  // Strip [DUMMY] prefix from description for display
  const displayDescription = bounty?.description?.replace("[DUMMY] ", "") || "";

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
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <AgoraLogo size={20} />
              <span className="text-base font-light tracking-tight text-text">agora</span>
            </Link>
          </div>
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
        </nav>

        {loading ? (
          <>
            <div className="pt-28 pb-2 px-6 md:px-12 lg:px-24">
              <div className="skeleton-shimmer w-24 h-4 mb-4" />
            </div>
            <BountyDetailSkeleton isDark={isDark} />
          </>
        ) : notFound || !bounty ? (
          <section className="pt-32 pb-24 px-6 md:px-12 lg:px-24 text-center">
            <h1 className="text-text font-extralight text-4xl md:text-5xl mb-4">Bounty not found</h1>
            <p className="text-text-muted text-lg font-light mb-8">
              This bounty doesn&apos;t exist or may have been removed.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-sm transition-all"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              <ArrowLeft size={14} /> Back to Bounties
            </Link>
          </section>
        ) : (
          <>
            {/* Back link */}
            <div className={`pt-24 pb-2 px-6 md:px-12 lg:px-24 detail-enter ${contentVisible ? "detail-visible" : ""}`}>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-text-muted hover:text-text transition-colors text-sm font-light"
              >
                <ArrowLeft size={14} /> All Bounties
              </Link>
            </div>

            {/* Main content */}
            <section className={`px-6 md:px-12 lg:px-24 pb-16 detail-enter ${contentVisible ? "detail-visible" : ""}`} style={{ transitionDelay: "0.1s" }}>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 lg:gap-12 items-start">
                {/* Left column */}
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={bounty.platform} />
                      <Label>{bounty.platform}</Label>
                    </div>
                    <span className="text-text-muted text-[11px]">·</span>
                    <Label>{bounty.contentType}</Label>
                    {bounty.niche && (
                      <>
                        <span className="text-text-muted text-[11px]">·</span>
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
                      </>
                    )}
                  </div>

                  <h1
                    className="text-text font-extralight leading-[1.1] mb-3"
                    style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)" }}
                  >
                    {bounty.title}
                  </h1>

                  <div className="flex items-center gap-2 mb-8">
                    <Building2 size={14} className="text-text-muted" />
                    <span className="text-text-muted text-sm font-light">by {bounty.company.companyName}</span>
                  </div>

                  <div className="mb-10">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText size={14} className="text-accent-mid" />
                      <Label>Brief</Label>
                    </div>
                    <p className="text-text text-base leading-relaxed font-light">
                      {displayDescription}
                    </p>
                  </div>

                  {requirementsList.length > 0 && (
                    <div className="mb-10">
                      <div className="flex items-center gap-2 mb-4">
                        <CheckCircle2 size={14} className="text-accent-mid" />
                        <Label>Requirements</Label>
                      </div>
                      <ul className="space-y-2.5">
                        {requirementsList.map((req, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <span
                              className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background: "var(--accent-mid)" }}
                            />
                            <span className="text-text text-sm font-light leading-relaxed">{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {bounty.company.description && (
                    <div
                      className="p-5 md:p-6"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: isDark ? "2px" : "10px",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <Building2 size={14} className="text-accent-mid" />
                        <Label>About {bounty.company.companyName}</Label>
                      </div>
                      <p className="text-text-muted text-sm font-light leading-relaxed">
                        {bounty.company.description.replace("[DUMMY] ", "")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Right column — sticky sidebar */}
                <div className="lg:sticky lg:top-24">
                  <div
                    className="p-6"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: isDark ? "2px" : "12px",
                      boxShadow: isDark ? "none" : "0 4px 16px rgba(45,41,38,0.08)",
                    }}
                  >
                    <div className="mb-5">
                      <Label>Budget</Label>
                      <p className="text-text font-extralight text-3xl mt-1">
                        ${bounty.budget.toLocaleString()}
                      </p>
                      {bounty.payPerImpression && (
                        <div className="mt-2 flex items-center gap-2">
                          <span
                            className="font-mono text-[11px] px-2 py-1"
                            style={{
                              background: "var(--accent)",
                              color: "#fff",
                              borderRadius: "2px",
                            }}
                          >
                            + {bounty.payPerImpression} impressions
                          </span>
                        </div>
                      )}
                    </div>

                    <div
                      className="flex items-center justify-between py-4 mb-4"
                      style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-text-muted" />
                        <Label>Deadline</Label>
                      </div>
                      <div className="text-right">
                        <p className="text-text text-sm font-light">
                          {new Date(bounty.deadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <div className="flex items-center gap-1 justify-end mt-0.5">
                          <Clock size={10} className="text-text-muted" />
                          <span className="font-mono text-[10px] text-text-muted">
                            {daysUntil(bounty.deadline)}d left
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Monitor size={13} className="text-text-muted" />
                          <Label>Platform</Label>
                        </div>
                        <span className="text-text text-sm font-light">{bounty.platform}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag size={13} className="text-text-muted" />
                          <Label>Content</Label>
                        </div>
                        <span className="text-text text-sm font-light">{bounty.contentType}</span>
                      </div>
                    </div>

                    <Link
                      href={`/bounty/${bounty.id}/apply`}
                      className="flex items-center justify-center gap-2 w-full px-5 py-3 text-sm font-medium rounded-sm transition-all hover:opacity-90"
                      style={{ background: "var(--accent)", color: "#fff" }}
                    >
                      Apply Now <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Related bounties */}
            {relatedBounties.length > 0 && (
              <section
                className="px-6 md:px-12 lg:px-24 py-16"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <Label>Similar Bounties</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 mt-5">
                  {relatedBounties.map((b) => (
                    <Link
                      key={b.id}
                      href={`/bounty/${b.id}`}
                      className="group block p-5 transition-all duration-200"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: isDark ? "2px" : "10px",
                        boxShadow: isDark ? "none" : "0 1px 3px rgba(45,41,38,0.04)",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <PlatformIcon platform={b.platform} />
                        <Label>{b.platform}</Label>
                        <span className="text-text-muted text-[11px]">·</span>
                        <Label>{b.contentType}</Label>
                      </div>
                      <h3 className="text-text font-light text-sm leading-snug group-hover:text-accent-mid transition-colors duration-200 line-clamp-2">
                        {b.title}
                      </h3>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-text-muted text-xs font-light">{b.company.companyName}</span>
                        <span className="text-text font-light text-lg">${b.budget.toLocaleString()}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Footer */}
            <footer
              className="px-6 md:px-12 lg:px-24 py-8 border-t"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <AgoraLogo size={14} />
                  <span className="text-sm text-text-muted font-light">agora</span>
                </div>
                <span className="font-mono text-[11px] text-text-muted uppercase tracking-wide">
                  © 2026 Agora. All rights reserved.
                </span>
              </div>
            </footer>
          </>
        )}
      </div>
    </>
  );
}
