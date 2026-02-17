"use client";

import { useTheme } from "./theme-provider";
import { CanvasBackdrop } from "./canvas-backdrop";
import {
  Sun,
  Moon,
  Megaphone,
  Users,
  CreditCard,
  Search,
  Send,
  DollarSign,
  ArrowRight,
  Hexagon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
      {children}
    </span>
  );
}

export default function Home() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  const howCompany = useReveal();
  const howCreator = useReveal();
  const cta = useReveal();

  const companySteps = [
    { icon: Megaphone, title: "Post a Bounty", desc: "Define your content needs, set a budget, and specify creator requirements." },
    { icon: Users, title: "Review Creators", desc: "Browse applications from verified creators with real audience data." },
    { icon: CreditCard, title: "Approve & Pay", desc: "Review submissions, approve content, and payment releases automatically." },
  ];

  const creatorSteps = [
    { icon: Search, title: "Find Bounties", desc: "Browse opportunities filtered by platform, niche, and pay range." },
    { icon: Send, title: "Apply & Create", desc: "Submit your profile, get accepted, then produce authentic content." },
    { icon: DollarSign, title: "Get Paid", desc: "Content approved? Funds hit your account — no chasing invoices." },
  ];

  return (
    <>
      <CanvasBackdrop />
      <div className="relative" style={{ zIndex: 1 }}>
        {/* Nav */}
        <nav className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 md:px-12" style={{ zIndex: 10, background: "var(--bg)", borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-2">
            <Hexagon size={20} className="text-accent-mid" strokeWidth={1.5} fill={isDark ? "none" : "var(--accent-light)"} />
            <span className="text-base font-light tracking-tight text-text">agora</span>
          </div>
          <button
            onClick={toggle}
            className="flex items-center justify-center w-8 h-8 rounded-sm transition-colors"
            style={{ background: "var(--surface)" }}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={16} strokeWidth={1.5} className="text-text-muted" /> : <Moon size={16} strokeWidth={1.5} fill="var(--text-muted)" className="text-text-muted" />}
          </button>
        </nav>

        {/* Hero */}
        <section className="min-h-screen flex flex-col justify-center px-6 md:px-12 lg:px-24 pt-20">
          <div className="max-w-3xl">
            <Label>The creator marketplace</Label>
            <h1
              className="mt-4 text-text font-extralight leading-[1.1]"
              style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
            >
              Bounties that connect
              <br />
              <span className="text-accent-mid">brands</span> with{" "}
              <span className="text-accent-mid">creators</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-text-muted font-normal">
              Companies post content bounties. Creators apply, produce, and get paid on approval. No middlemen, no negotiations — just work that ships.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a
                href="/signup/company"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-sm transition-all"
                style={{ background: "var(--accent)", color: "#fff" }}
              >
                Post a Bounty <ArrowRight size={14} />
              </a>
              <a
                href="/signup/creator"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-sm border transition-all text-text"
                style={{ borderColor: "var(--border-strong)" }}
              >
                Join as Creator <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </section>

        {/* How it works — Companies */}
        <section className="px-6 md:px-12 lg:px-24 py-24" ref={howCompany.ref}>
          <div
            className="transition-all duration-700"
            style={{
              opacity: howCompany.visible ? 1 : 0,
              clipPath: howCompany.visible ? "inset(0 0 0 0)" : "inset(0 100% 0 0)",
            }}
          >
            <Label>For companies</Label>
            <h2 className="mt-3 text-text font-extralight" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
              Launch a bounty in minutes
            </h2>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
              {companySteps.map((s, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] text-accent-mid">{String(i + 1).padStart(2, "0")}</span>
                    <s.icon size={18} strokeWidth={1.5} className="text-accent-mid" fill={isDark ? "none" : "var(--accent-light)"} />
                  </div>
                  <h3 className="text-text font-light text-lg">{s.title}</h3>
                  <p className="text-text-muted text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works — Creators */}
        <section className="px-6 md:px-12 lg:px-24 py-24" ref={howCreator.ref}>
          <div
            className="transition-all duration-700"
            style={{
              opacity: howCreator.visible ? 1 : 0,
              clipPath: howCreator.visible ? "inset(0 0 0 0)" : "inset(0 0 0 100%)",
            }}
          >
            <div className="md:ml-auto md:max-w-2xl">
              <Label>For creators</Label>
              <h2 className="mt-3 text-text font-extralight" style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)" }}>
                Find work. Create. Get paid.
              </h2>
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                {creatorSteps.map((s, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-accent-mid">{String(i + 1).padStart(2, "0")}</span>
                      <s.icon size={18} strokeWidth={1.5} className="text-accent-mid" fill={isDark ? "none" : "var(--accent-light)"} />
                    </div>
                    <h3 className="text-text font-light text-lg">{s.title}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 md:px-12 lg:px-24 py-32" ref={cta.ref}>
          <div
            className="transition-all duration-700"
            style={{ opacity: cta.visible ? 1 : 0, transform: cta.visible ? "none" : "translateY(20px)" }}
          >
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-text font-extralight" style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)" }}>
                The marketplace is open
              </h2>
              <p className="mt-4 text-text-muted text-lg">
                Whether you&apos;re a brand looking for authentic content or a creator ready to earn — Agora is where it happens.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/signup/company"
                  className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium rounded-sm transition-all"
                  style={{ background: "var(--accent)", color: "#fff" }}
                >
                  I&apos;m a Company <ArrowRight size={14} />
                </a>
                <a
                  href="/signup/creator"
                  className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-medium rounded-sm border transition-all text-text"
                  style={{ borderColor: "var(--border-strong)" }}
                >
                  I&apos;m a Creator <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 md:px-12 lg:px-24 py-8 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Hexagon size={14} className="text-accent-mid" strokeWidth={1.5} fill={isDark ? "none" : "var(--accent-light)"} />
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
