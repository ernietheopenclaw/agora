"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "../theme-provider";
import { Sun, Moon, Hexagon, ArrowRight, Loader2, Mail, Lock } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <nav className="flex items-center justify-between px-6 py-4 md:px-12" style={{ borderBottom: "1px solid var(--border)" }}>
        <Link href="/" className="flex items-center gap-2 no-underline">
          <Hexagon size={20} className="text-accent-mid" strokeWidth={1.5} fill={isDark ? "none" : "var(--accent-light)"} />
          <span className="text-base font-light tracking-tight text-text">agora</span>
        </Link>
        <button
          onClick={toggle}
          className="flex items-center justify-center w-8 h-8 rounded-sm transition-colors"
          style={{ background: "var(--surface)" }}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={16} strokeWidth={1.5} className="text-text-muted" /> : <Moon size={16} strokeWidth={1.5} fill="var(--text-muted)" className="text-text-muted" />}
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">Welcome back</span>
            <h1 className="mt-2 text-text font-extralight text-3xl">Sign in</h1>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="text-sm px-3 py-2 rounded-sm" style={{ background: "rgba(198,122,92,0.1)", color: "#c67a5c" }}>
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" strokeWidth={1.5} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm text-text rounded-sm outline-none transition-colors"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", fontFamily: "Inter, system-ui, sans-serif" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent-mid)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" strokeWidth={1.5} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm text-text rounded-sm outline-none transition-colors"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", fontFamily: "Inter, system-ui, sans-serif" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent-mid)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-sm transition-all"
              style={{ background: "var(--accent)", color: "#fff", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <>Sign In <ArrowRight size={14} /></>}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/signup/company" className="text-accent-mid hover:underline">Sign up as Company</Link>
            {" or "}
            <Link href="/signup/creator" className="text-accent-mid hover:underline">Creator</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
