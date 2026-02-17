"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "../theme-provider";
import {
  ArrowRight, ArrowLeft, Loader2, Mail, Lock, User,
  Building2, Globe, Briefcase, FileText, Check, SkipForward,
} from "lucide-react";
import Link from "next/link";
import { Navbar } from "../../components/Navbar";

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

function TikTokIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="4" />
      <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l16 16M20 4L4 20" />
    </svg>
  );
}

const INDUSTRIES = [
  "Technology", "Fashion & Apparel", "Food & Beverage", "Health & Fitness",
  "Beauty & Cosmetics", "Travel & Hospitality", "Entertainment", "Finance",
  "Education", "E-commerce", "Gaming", "Other",
];

const SOCIAL_PLATFORMS = [
  { key: "tiktok", label: "TikTok", icon: TikTokIcon, placeholder: "@username" },
  { key: "instagram", label: "Instagram", icon: InstagramIcon, placeholder: "@username" },
  { key: "youtube", label: "YouTube", icon: YouTubeIcon, placeholder: "@channel" },
  { key: "twitter", label: "Twitter / X", icon: TwitterIcon, placeholder: "@handle" },
];

function generateVerificationCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "AGORA-";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function SignupPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "var(--bg)" }} />}>
      <SignupPage />
    </Suspense>
  );
}

function SignupPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState(1);
  const [slideDir, setSlideDir] = useState<"left" | "right">("left");
  const [animating, setAnimating] = useState(false);

  // Step 1
  const [role, setRole] = useState<"creator" | "company" | "">("");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [password, setPassword] = useState("");
  const [googleName, setGoogleName] = useState(searchParams.get("name") || "");
  const isGoogleFlow = searchParams.get("provider") === "google";

  // Step 2 — Creator
  const [displayName, setDisplayName] = useState(googleName);
  const [bio, setBio] = useState("");
  // Step 2 — Company
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");

  // Step 3
  const [socials, setSocials] = useState<Record<string, string>>({});
  const [verifyingPlatform, setVerifyingPlatform] = useState<string | null>(null);
  const [verificationCodes] = useState<Record<string, string>>(() => {
    const codes: Record<string, string> = {};
    SOCIAL_PLATFORMS.forEach((p) => (codes[p.key] = generateVerificationCode()));
    return codes;
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isGoogleFlow && !role) {
      // Google flow — they need to pick a role first
    }
  }, [isGoogleFlow, role]);

  const goTo = useCallback((target: number) => {
    if (animating) return;
    setSlideDir(target > step ? "left" : "right");
    setAnimating(true);
    setTimeout(() => {
      setStep(target);
      setTimeout(() => setAnimating(false), 50);
    }, 200);
  }, [step, animating]);

  async function handleStep1Google() {
    if (!role) { setError("Please choose an account type"); return; }
    signIn("google", { callbackUrl: `/signup?provider=google&role=${role}` });
  }

  async function handleStep1Next() {
    if (!role) { setError("Please choose an account type"); return; }
    if (!isGoogleFlow) {
      if (!email) { setError("Email is required"); return; }
      if (!password || password.length < 6) { setError("Password must be at least 6 characters"); return; }
    }
    setError("");
    goTo(2);
  }

  async function handleStep2Next() {
    if (role === "creator" && !displayName) { setError("Display name is required"); return; }
    if (role === "company" && !companyName) { setError("Company name is required"); return; }
    setError("");
    goTo(3);
  }

  async function handleFinish() {
    setLoading(true);
    setError("");

    try {
      // Build profile data
      const profileData: Record<string, unknown> = {};
      if (role === "creator") {
        profileData.displayName = displayName;
        profileData.bio = bio;
        const activeSocials: Record<string, string> = {};
        Object.entries(socials).forEach(([k, v]) => { if (v) activeSocials[k] = v; });
        if (Object.keys(activeSocials).length > 0) {
          profileData.socialLinks = activeSocials;
        }
      } else {
        profileData.companyName = companyName;
        profileData.website = website || null;
        profileData.industry = industry || null;
      }

      // Create user via API
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: isGoogleFlow ? `google_${Date.now()}_${Math.random().toString(36)}` : password,
          role,
          ...profileData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Sign in
      if (isGoogleFlow) {
        signIn("google", { callbackUrl: "/" });
      } else {
        const signInRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (signInRes?.error) {
          // Account created but sign in failed — redirect to login
          router.push("/login");
        } else {
          router.push("/");
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  const stepContent = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return (
          <div className="flex flex-col gap-6">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">Step 1 of 3</span>
              <h1 className="mt-2 text-text font-extralight text-3xl">Join Agora</h1>
              <p className="mt-2 text-text-muted text-sm">Choose your account type to get started.</p>
            </div>

            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setRole("creator"); setError(""); }}
                className="flex flex-col items-center gap-3 p-5 transition-all cursor-pointer"
                style={{
                  background: role === "creator" ? (isDark ? "rgba(90,172,167,0.1)" : "var(--accent-light, #d4f0ee)") : "var(--surface)",
                  border: `2px solid ${role === "creator" ? "var(--accent-mid, #5aaca7)" : "var(--border)"}`,
                  borderRadius: isDark ? "2px" : "10px",
                }}
              >
                <User size={28} strokeWidth={1.2} className={role === "creator" ? "text-accent-mid" : "text-text-muted"} />
                <div className="text-center">
                  <p className="text-text text-sm font-medium">Creator</p>
                  <p className="text-text-muted text-xs mt-1">Find bounties & get paid</p>
                </div>
              </button>
              <button
                onClick={() => { setRole("company"); setError(""); }}
                className="flex flex-col items-center gap-3 p-5 transition-all cursor-pointer"
                style={{
                  background: role === "company" ? (isDark ? "rgba(90,172,167,0.1)" : "var(--accent-light, #d4f0ee)") : "var(--surface)",
                  border: `2px solid ${role === "company" ? "var(--accent-mid, #5aaca7)" : "var(--border)"}`,
                  borderRadius: isDark ? "2px" : "10px",
                }}
              >
                <Building2 size={28} strokeWidth={1.2} className={role === "company" ? "text-accent-mid" : "text-text-muted"} />
                <div className="text-center">
                  <p className="text-text text-sm font-medium">Company</p>
                  <p className="text-text-muted text-xs mt-1">Post bounties & find creators</p>
                </div>
              </button>
            </div>

            {/* Google Sign Up */}
            {!isGoogleFlow && (
              <>
                <button
                  onClick={handleStep1Google}
                  disabled={!role}
                  className="w-full flex items-center justify-center gap-3 px-6 py-3 text-sm font-medium transition-all cursor-pointer"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: isDark ? "2px" : "8px",
                    color: "var(--text)",
                    opacity: !role ? 0.5 : 1,
                  }}
                >
                  <GoogleIcon /> Sign up with Google
                </button>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                  <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">or</span>
                  <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                </div>
              </>
            )}

            {/* Email/Password */}
            {!isGoogleFlow && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">Email</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" strokeWidth={1.5} />
                    <input
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm text-text outline-none transition-colors"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: isDark ? "2px" : "8px" }}
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
                      type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm text-text outline-none transition-colors"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: isDark ? "2px" : "8px" }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent-mid)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                      placeholder="Min 6 characters"
                    />
                  </div>
                </div>
              </div>
            )}

            {isGoogleFlow && (
              <div className="p-3 rounded text-sm text-text-muted" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                Signing up as <strong className="text-text">{email}</strong> via Google
              </div>
            )}

            <button
              onClick={handleStep1Next}
              disabled={!role}
              className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-all cursor-pointer"
              style={{
                background: "var(--accent)",
                color: "#fff",
                borderRadius: isDark ? "2px" : "8px",
                opacity: !role ? 0.5 : 1,
              }}
            >
              Continue <ArrowRight size={14} />
            </button>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col gap-6">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">Step 2 of 3</span>
              <h1 className="mt-2 text-text font-extralight text-3xl">
                {role === "creator" ? "Your profile" : "Company details"}
              </h1>
              <p className="mt-2 text-text-muted text-sm">
                {role === "creator" ? "Tell creators and brands who you are." : "Tell creators about your company."}
              </p>
            </div>

            {role === "creator" ? (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">Display Name *</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" strokeWidth={1.5} />
                    <input
                      type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm text-text outline-none transition-colors"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: isDark ? "2px" : "8px" }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent-mid)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                      placeholder="Your display name"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">Bio</label>
                  <textarea
                    value={bio} onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2.5 text-sm text-text outline-none transition-colors resize-none"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: isDark ? "2px" : "8px" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--accent-mid)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                    placeholder="Tell brands about yourself and your content..."
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">Company Name *</label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" strokeWidth={1.5} />
                    <input
                      type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm text-text outline-none transition-colors"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: isDark ? "2px" : "8px" }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent-mid)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                      placeholder="Acme Inc."
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">Website</label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" strokeWidth={1.5} />
                    <input
                      type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm text-text outline-none transition-colors"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: isDark ? "2px" : "8px" }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent-mid)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">Industry</label>
                  <div className="relative">
                    <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" strokeWidth={1.5} />
                    <select
                      value={industry} onChange={(e) => setIndustry(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 text-sm text-text outline-none transition-colors appearance-none cursor-pointer"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: isDark ? "2px" : "8px" }}
                      onFocus={(e) => (e.target.style.borderColor = "var(--accent-mid)")}
                      onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                    >
                      <option value="">Select industry</option>
                      {INDUSTRIES.map((ind) => (
                        <option key={ind} value={ind}>{ind}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => goTo(1)}
                className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium transition-all cursor-pointer"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                  borderRadius: isDark ? "2px" : "8px",
                }}
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                onClick={handleStep2Next}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-all cursor-pointer"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  borderRadius: isDark ? "2px" : "8px",
                }}
              >
                Continue <ArrowRight size={14} />
              </button>
            </div>

            <button
              onClick={handleFinish}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-all cursor-pointer"
              style={{
                background: "var(--accent)",
                color: "#fff",
                borderRadius: isDark ? "2px" : "8px",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <>Create Account <Check size={14} /></>}
            </button>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col gap-6">
            <div>
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">Step 3 of 3</span>
              <h1 className="mt-2 text-text font-extralight text-3xl">Connect your accounts</h1>
              <p className="mt-2 text-text-muted text-sm">
                Link your social media to help {role === "creator" ? "brands find you" : "verify your presence"}. You can skip this for now.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {SOCIAL_PLATFORMS.map((platform) => {
                const Icon = platform.icon;
                const hasValue = !!socials[platform.key];
                const isVerifying = verifyingPlatform === platform.key;

                return (
                  <div key={platform.key}>
                    <div
                      className="flex items-center gap-3 p-3 transition-all"
                      style={{
                        background: "var(--surface)",
                        border: `1px solid ${hasValue ? "var(--accent-mid, #5aaca7)" : "var(--border)"}`,
                        borderRadius: isDark ? "2px" : "8px",
                      }}
                    >
                      <div className="flex-shrink-0 text-text-muted"><Icon /></div>
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={socials[platform.key] || ""}
                          onChange={(e) => setSocials({ ...socials, [platform.key]: e.target.value })}
                          className="w-full text-sm text-text bg-transparent outline-none"
                          placeholder={platform.placeholder}
                        />
                      </div>
                      {hasValue && (
                        <button
                          onClick={() => setVerifyingPlatform(isVerifying ? null : platform.key)}
                          className="flex-shrink-0 font-mono text-[10px] uppercase tracking-wider px-2 py-1 transition-colors cursor-pointer"
                          style={{
                            background: isDark ? "rgba(255,255,255,0.05)" : "var(--accent-light, #d4f0ee)",
                            color: "var(--accent-mid)",
                            borderRadius: isDark ? "1px" : "4px",
                          }}
                        >
                          {isVerifying ? "Hide" : "Verify"}
                        </button>
                      )}
                      {hasValue && <Check size={14} className="text-accent-mid flex-shrink-0" />}
                    </div>

                    {/* Verification panel */}
                    <div
                      style={{
                        maxHeight: isVerifying ? "120px" : "0",
                        opacity: isVerifying ? 1 : 0,
                        overflow: "hidden",
                        transition: "max-height 0.3s ease, opacity 0.2s ease",
                      }}
                    >
                      <div
                        className="mt-2 p-3 text-xs"
                        style={{
                          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(45,41,38,0.03)",
                          borderRadius: isDark ? "2px" : "8px",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <p className="text-text-muted mb-2">
                          DM this code to <strong className="text-text">@AgoraVerify</strong> on {platform.label}:
                        </p>
                        <div
                          className="inline-block px-3 py-1.5 font-mono text-sm font-medium tracking-wider"
                          style={{
                            background: isDark ? "rgba(90,172,167,0.15)" : "var(--accent-light, #d4f0ee)",
                            color: "var(--accent-mid)",
                            borderRadius: isDark ? "2px" : "6px",
                          }}
                        >
                          {verificationCodes[platform.key]}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => goTo(2)}
                className="flex items-center justify-center gap-2 px-5 py-3 text-sm font-medium transition-all cursor-pointer"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                  borderRadius: isDark ? "2px" : "8px",
                }}
              >
                <ArrowLeft size={14} /> Back
              </button>
              <button
                onClick={handleFinish}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium transition-all cursor-pointer"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  borderRadius: isDark ? "2px" : "8px",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><SkipForward size={13} /> Skip for now</>}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <Navbar />

      {/* Progress bar */}
      <div className="px-6 md:px-12 pt-20 md:pt-24">
        <div className="max-w-sm mx-auto flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="flex-1 h-1 transition-all duration-500"
              style={{
                background: s <= step ? "var(--accent-mid, #5aaca7)" : (isDark ? "rgba(255,255,255,0.08)" : "var(--border)"),
                borderRadius: "2px",
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm relative overflow-hidden">
          {error && (
            <div className="mb-4 text-sm px-3 py-2 rounded-sm" style={{ background: "rgba(198,122,92,0.1)", color: "#c67a5c" }}>
              {error}
            </div>
          )}

          <div
            style={{
              transform: animating
                ? `translateX(${slideDir === "left" ? "-20px" : "20px"})`
                : "translateX(0)",
              opacity: animating ? 0 : 1,
              transition: "transform 0.2s ease, opacity 0.2s ease",
            }}
          >
            {stepContent(step)}
          </div>
        </div>
      </div>

      <div className="px-6 py-4 text-center text-sm text-text-muted" style={{ borderTop: "1px solid var(--border)" }}>
        Already have an account?{" "}
        <Link href="/login" className="text-accent-mid hover:underline">Sign in</Link>
      </div>
    </div>
  );
}
