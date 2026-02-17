"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTheme } from "../../theme-provider";
import { Sun, Moon, ArrowRight, Loader2, User, Mail, Lock, FileText, AtSign } from "lucide-react";
import Link from "next/link";
import { AgoraLogo } from "../../../components/AgoraLogo";

export default function CreatorSignupPage() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const [form, setForm] = useState({ displayName: "", email: "", password: "", bio: "", tiktok: "", instagram: "", youtube: "", twitter: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const socialLinks = {
      ...(form.tiktok && { tiktok: form.tiktok }),
      ...(form.instagram && { instagram: form.instagram }),
      ...(form.youtube && { youtube: form.youtube }),
      ...(form.twitter && { twitter: form.twitter }),
    };

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: form.displayName,
        email: form.email,
        password: form.password,
        bio: form.bio || null,
        socialLinks: Object.keys(socialLinks).length ? socialLinks : null,
        role: "creator",
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email: form.email,
      password: form.password,
      callbackUrl: "/dashboard",
    });
  }

  const mainFields = [
    { key: "displayName", label: "Display Name", icon: User, type: "text", required: true, placeholder: "Your creator name" },
    { key: "email", label: "Email", icon: Mail, type: "email", required: true, placeholder: "you@example.com" },
    { key: "password", label: "Password", icon: Lock, type: "password", required: true, placeholder: "••••••••" },
    { key: "bio", label: "Bio", icon: FileText, type: "text", required: false, placeholder: "Tell brands about yourself..." },
  ];

  const socialFields = [
    { key: "tiktok", label: "TikTok", placeholder: "@username" },
    { key: "instagram", label: "Instagram", placeholder: "@username" },
    { key: "youtube", label: "YouTube", placeholder: "channel name or URL" },
    { key: "twitter", label: "X / Twitter", placeholder: "@handle" },
  ];

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
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">For creators</span>
            <h1 className="mt-2 text-text font-extralight text-3xl">Join Agora</h1>
            <p className="mt-2 text-sm text-text-muted">Browse bounties, create content, get paid.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="text-sm px-3 py-2 rounded-sm" style={{ background: "rgba(198,122,92,0.1)", color: "#c67a5c" }}>
                {error}
              </div>
            )}

            {mainFields.map((f) => (
              <div key={f.key} className="flex flex-col gap-1.5">
                <label className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                  {f.label}{!f.required && <span className="normal-case tracking-normal"> (optional)</span>}
                </label>
                <div className="relative">
                  <f.icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" strokeWidth={1.5} />
                  <input
                    type={f.type}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => update(f.key, e.target.value)}
                    required={f.required}
                    className="w-full pl-10 pr-4 py-2.5 text-sm text-text rounded-sm outline-none transition-colors"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", fontFamily: "Inter, system-ui, sans-serif" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--accent-mid)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                    placeholder={f.placeholder}
                  />
                </div>
              </div>
            ))}

            <div className="mt-2">
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">Social Links <span className="normal-case tracking-normal">(optional)</span></span>
              <div className="mt-3 flex flex-col gap-3">
                {socialFields.map((f) => (
                  <div key={f.key} className="flex flex-col gap-1">
                    <label className="text-xs text-text-muted">{f.label}</label>
                    <div className="relative">
                      <AtSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" strokeWidth={1.5} />
                      <input
                        type="text"
                        value={form[f.key as keyof typeof form]}
                        onChange={(e) => update(f.key, e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm text-text rounded-sm outline-none transition-colors"
                        style={{ background: "var(--surface)", border: "1px solid var(--border)", fontFamily: "Inter, system-ui, sans-serif" }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--accent-mid)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                        placeholder={f.placeholder}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-sm transition-all"
              style={{ background: "var(--accent)", color: "#fff", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <>Create Creator Account <ArrowRight size={14} /></>}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-text-muted">
            Already have an account? <Link href="/login" className="text-accent-mid hover:underline">Sign in</Link>
            <br />
            <Link href="/signup/company" className="text-accent-mid hover:underline">Sign up as a Company instead</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
