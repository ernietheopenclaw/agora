"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTheme } from "../../theme-provider";
import { ArrowRight, ArrowLeft, Loader2, User, Mail, Lock, FileText, AtSign } from "lucide-react";
import Link from "next/link";
import { Navbar } from "../../../components/Navbar";

export default function CreatorSignupPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ displayName: "", email: "", password: "", bio: "", tiktok: "", instagram: "", youtube: "", twitter: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setFieldErrors((fe) => { const n = { ...fe }; delete n[field]; return n; });
  }

  function validateStep(s: number): boolean {
    const errors: Record<string, string> = {};
    if (s === 1) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Please enter a valid email";
      if (form.password.length < 8) errors.password = "Password must be at least 8 characters";
    } else if (s === 2) {
      if (!form.displayName.trim()) errors.displayName = "Display name is required";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function nextStep() {
    if (validateStep(step)) setStep(step + 1);
  }

  async function handleSubmit() {
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

  const hasSocials = !!(form.tiktok || form.instagram || form.youtube || form.twitter);

  function renderInput(key: string, label: string, Icon: React.ElementType, type: string, placeholder: string, required: boolean, iconSize = 16, pl = "pl-10") {
    return (
      <div key={key} className="flex flex-col gap-1.5">
        <label className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
          {label}{!required && <span className="normal-case tracking-normal"> (optional)</span>}
        </label>
        <div className="relative">
          <Icon size={iconSize} className={`absolute left-3 top-1/2 -translate-y-1/2 text-text-muted`} strokeWidth={1.5} />
          <input
            type={type}
            value={form[key as keyof typeof form]}
            onChange={(e) => update(key, e.target.value)}
            className={`w-full ${pl} pr-4 py-2.5 text-sm text-text rounded-sm outline-none transition-colors`}
            style={{ background: "var(--surface)", border: `1px solid ${fieldErrors[key] ? "#c67a5c" : "var(--border)"}`, fontFamily: "Inter, system-ui, sans-serif" }}
            onFocus={(e) => (e.target.style.borderColor = fieldErrors[key] ? "#c67a5c" : "var(--accent-mid)")}
            onBlur={(e) => (e.target.style.borderColor = fieldErrors[key] ? "#c67a5c" : "var(--border)")}
            placeholder={placeholder}
          />
        </div>
        <div className="h-5 flex items-center">
          <span className={`text-xs transition-opacity duration-200 ${fieldErrors[key] ? "opacity-100" : "opacity-0"}`} style={{ color: "#c67a5c" }}>{fieldErrors[key] || "\u00A0"}</span>
        </div>
      </div>
    );
  }

  const stepLabels = ["Account", "Profile", "Social"];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-16 pt-20 md:pt-24">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">For creators</span>
            <h1 className="mt-2 text-text font-extralight text-3xl">Join Agora</h1>
            <p className="mt-2 text-sm text-text-muted">Browse bounties, create content, get paid.</p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className="w-full h-1 rounded-full transition-colors duration-300"
                    style={{ background: i + 1 <= step ? "var(--accent)" : "var(--border)" }}
                  />
                  <span className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.1em]" style={{ color: i + 1 <= step ? "var(--accent)" : "var(--text-muted)" }}>{label}</span>
                </div>
              </div>
            ))}
          </div>

          {error && (
            <div className="text-sm px-3 py-2 mb-4 rounded-sm" style={{ background: "rgba(198,122,92,0.1)", color: "#c67a5c" }}>
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {step === 1 && (
              <>
                {renderInput("email", "Email", Mail, "email", "you@example.com", true)}
                {renderInput("password", "Password", Lock, "password", "••••••••", true)}
              </>
            )}

            {step === 2 && (
              <>
                {renderInput("displayName", "Display Name", User, "text", "Your creator name", true)}
                {renderInput("bio", "Bio", FileText, "text", "Tell brands about yourself...", false)}
              </>
            )}

            {step === 3 && (
              <div className="flex flex-col gap-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">Social Links <span className="normal-case tracking-normal">(all optional)</span></span>
                {[
                  { key: "tiktok", label: "TikTok", placeholder: "@username" },
                  { key: "instagram", label: "Instagram", placeholder: "@username" },
                  { key: "youtube", label: "YouTube", placeholder: "channel name or URL" },
                  { key: "twitter", label: "X / Twitter", placeholder: "@handle" },
                ].map((f) => (
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
            )}

            {/* Navigation buttons */}
            <div className="mt-2 flex gap-3">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => { setStep(step - 1); setFieldErrors({}); setError(""); }}
                  className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium rounded-sm transition-all"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}
                >
                  <ArrowLeft size={14} /> Back
                </button>
              )}
              {step < 3 ? (
                <div className="flex-1 flex flex-col">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-sm transition-all"
                    style={{ background: "var(--accent)", color: "#fff" }}
                  >
                    Continue <ArrowRight size={14} />
                  </button>
                  {step === 1 && (
                    <Link href="/signup/company" className="mt-3 text-center text-xs text-text-muted hover:text-accent-mid transition-colors">
                      Actually, I&apos;m a brand →
                    </Link>
                  )}
                </div>
              ) : hasSocials ? (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-sm transition-all"
                  style={{ background: "var(--accent)", color: "#fff", opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <>Create Account <ArrowRight size={14} /></>}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-sm transition-all"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)", opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <>Skip for now <ArrowRight size={14} /></>}
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 text-center text-sm text-text-muted">
            Already have an account? <Link href="/login" className="text-accent-mid hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
