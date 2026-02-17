"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useTheme } from "../../theme-provider";
import { ArrowRight, Loader2, Building2, Mail, Lock, Globe, Briefcase } from "lucide-react";
import Link from "next/link";
import { Navbar } from "../../../components/Navbar";

export default function CompanySignupPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [form, setForm] = useState({ companyName: "", email: "", password: "", website: "", industry: "" });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setFieldErrors({});

    const errors: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Please enter a valid email";
    }
    if (form.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }
    if (!form.companyName.trim()) {
      errors.companyName = "Company name is required";
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, role: "company" }),
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

  const fields = [
    { key: "companyName", label: "Company Name", icon: Building2, type: "text", required: true, placeholder: "Acme Inc." },
    { key: "email", label: "Email", icon: Mail, type: "email", required: true, placeholder: "team@acme.com" },
    { key: "password", label: "Password", icon: Lock, type: "password", required: true, placeholder: "••••••••" },
    { key: "website", label: "Website", icon: Globe, type: "url", required: false, placeholder: "https://acme.com" },
    { key: "industry", label: "Industry", icon: Briefcase, type: "text", required: false, placeholder: "Fashion, Tech, Food..." },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg)" }}>
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-16 pt-20 md:pt-24">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">For companies</span>
            <h1 className="mt-2 text-text font-extralight text-3xl">Create account</h1>
            <p className="mt-2 text-sm text-text-muted">Post bounties and connect with creators.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="text-sm px-3 py-2 rounded-sm" style={{ background: "rgba(198,122,92,0.1)", color: "#c67a5c" }}>
                {error}
              </div>
            )}

            {fields.map((f) => (
              <div key={f.key} className="flex flex-col gap-1.5">
                <label className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                  {f.label}{!f.required && <span className="normal-case tracking-normal"> (optional)</span>}
                </label>
                <div className="relative">
                  <f.icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" strokeWidth={1.5} />
                  <input
                    type={f.type}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => { update(f.key, e.target.value); setFieldErrors((fe) => { const n = { ...fe }; delete n[f.key]; return n; }); }}
                    className="w-full pl-10 pr-4 py-2.5 text-sm text-text rounded-sm outline-none transition-colors"
                    style={{ background: "var(--surface)", border: `1px solid ${fieldErrors[f.key] ? "#c67a5c" : "var(--border)"}`, fontFamily: "Inter, system-ui, sans-serif" }}
                    onFocus={(e) => (e.target.style.borderColor = fieldErrors[f.key] ? "#c67a5c" : "var(--accent-mid)")}
                    onBlur={(e) => (e.target.style.borderColor = fieldErrors[f.key] ? "#c67a5c" : "var(--border)")}
                    placeholder={f.placeholder}
                  />
                </div>
                <div className="h-5 flex items-center">
                  <span className={`text-xs transition-opacity duration-200 ${fieldErrors[f.key] ? "opacity-100" : "opacity-0"}`} style={{ color: "#c67a5c" }}>{fieldErrors[f.key] || "\u00A0"}</span>
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium rounded-sm transition-all"
              style={{ background: "var(--accent)", color: "#fff", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <>Create Company Account <ArrowRight size={14} /></>}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-text-muted">
            Already have an account? <Link href="/login" className="text-accent-mid hover:underline">Sign in</Link>
            <br />
            <Link href="/signup/creator" className="text-accent-mid hover:underline">Sign up as a Creator instead</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
