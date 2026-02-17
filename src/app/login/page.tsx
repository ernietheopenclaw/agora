"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "../theme-provider";
import { Sun, Moon, ArrowRight, Loader2, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { AgoraLogo } from "../../components/AgoraLogo";

function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function LoginPage() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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
      router.push("/");
    }
  }

  function handleGoogleSignIn() {
    setGoogleLoading(true);
    signIn("google", { callbackUrl: "/" });
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <nav className="flex items-center justify-between px-6 py-4 md:px-12" style={{ borderBottom: "1px solid var(--border)" }}>
        <Link href="/" className="flex items-center gap-2 no-underline">
          <AgoraLogo size={20} />
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

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 text-sm font-medium transition-all cursor-pointer"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border-strong)",
              borderRadius: isDark ? "2px" : "8px",
              color: "var(--text)",
              opacity: googleLoading ? 0.7 : 1,
            }}
          >
            {googleLoading ? <Loader2 size={18} className="animate-spin" /> : <GoogleIcon />}
            Sign in with Google
          </button>

          {/* OR Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">or</span>
            <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
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
                  className="w-full pl-10 pr-4 py-2.5 text-sm text-text outline-none transition-colors"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: isDark ? "2px" : "8px",
                    fontFamily: "Inter, system-ui, sans-serif",
                  }}
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
                  className="w-full pl-10 pr-4 py-2.5 text-sm text-text outline-none transition-colors"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: isDark ? "2px" : "8px",
                    fontFamily: "Inter, system-ui, sans-serif",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent-mid)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-all cursor-pointer"
              style={{
                background: "var(--accent)",
                color: "#fff",
                borderRadius: isDark ? "2px" : "8px",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <>Sign In <ArrowRight size={14} /></>}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-accent-mid hover:underline">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
