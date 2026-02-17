"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "../../theme-provider";
import { Navbar } from "../../../components/Navbar";
import { CanvasBackdrop } from "../../canvas-backdrop";
import { Loader2 } from "lucide-react";

const PLATFORMS = ["TikTok", "Instagram", "YouTube", "X"];
const CONTENT_TYPES = ["Video", "Photo", "Story", "Reel", "Post", "Thread"];
const NICHES = ["Fashion", "Tech", "Food", "Fitness", "Gaming", "Beauty", "Travel", "Music", "Lifestyle", "Other"];
const PAY_TYPES = [
  { value: "fixed", label: "Fixed" },
  { value: "per_impression", label: "Per impression" },
];

export default function CreateBountyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    platform: "",
    contentType: "",
    niche: "",
    budget: "",
    payType: "fixed",
    minFollowers: "",
    deadline: "",
    requirements: "",
    maxSlots: "1",
    allowResubmission: false,
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && session?.user?.role !== "COMPANY") router.push("/dashboard");
  }, [status, session, router]);

  function update(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/bounties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create bounty");
      }
      const bounty = await res.json();
      router.push(`/bounty/${bounty.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: isDark ? "2px" : "8px",
    color: "var(--text)",
    padding: "10px 14px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelClass = "font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted mb-1.5 block";

  if (status === "loading") return null;
  if (session?.user?.role !== "COMPANY") return null;

  return (
    <>
      <CanvasBackdrop />
      <div className="relative" style={{ zIndex: 1 }}>
        <Navbar />
        <div className="pt-28 pb-24 px-6 md:px-12 lg:px-24">
          <div className="max-w-2xl mx-auto">
            <span className={labelClass} style={{ marginBottom: "8px" }}>New Bounty</span>
            <h1
              className="text-text font-extralight mb-8"
              style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
            >
              Create a Bounty
            </h1>

            <form onSubmit={handleSubmit}>
              <div
                className="p-6 md:p-8 space-y-6"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: isDark ? "2px" : "12px",
                  boxShadow: isDark ? "none" : "0 4px 16px rgba(45,41,38,0.08)",
                }}
              >
                {/* Title */}
                <div>
                  <label className={labelClass}>Title</label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => update("title", e.target.value)}
                    placeholder="e.g. Summer collection unboxing video"
                    style={inputStyle}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea
                    required
                    rows={4}
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Describe what you're looking for..."
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>

                {/* Platform + Content Type row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Platform</label>
                    <select
                      required
                      value={form.platform}
                      onChange={(e) => update("platform", e.target.value)}
                      style={inputStyle}
                    >
                      <option value="">Select platform</option>
                      {PLATFORMS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Content Type</label>
                    <select
                      required
                      value={form.contentType}
                      onChange={(e) => update("contentType", e.target.value)}
                      style={inputStyle}
                    >
                      <option value="">Select type</option>
                      {CONTENT_TYPES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Niche */}
                <div>
                  <label className={labelClass}>Niche / Category</label>
                  <select
                    value={form.niche}
                    onChange={(e) => update("niche", e.target.value)}
                    style={inputStyle}
                  >
                    <option value="">Select niche</option>
                    {NICHES.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>

                {/* Budget + Pay Type row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Budget (USD)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={form.budget}
                      onChange={(e) => update("budget", e.target.value)}
                      placeholder="500"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Pay Type</label>
                    <select
                      value={form.payType}
                      onChange={(e) => update("payType", e.target.value)}
                      style={inputStyle}
                    >
                      {PAY_TYPES.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Min Followers + Deadline row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Min. Followers Required</label>
                    <input
                      type="number"
                      min="0"
                      value={form.minFollowers}
                      onChange={(e) => update("minFollowers", e.target.value)}
                      placeholder="1000"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Deadline</label>
                    <input
                      type="date"
                      required
                      value={form.deadline}
                      onChange={(e) => update("deadline", e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Requirements */}
                <div>
                  <label className={labelClass}>Requirements</label>
                  <textarea
                    rows={3}
                    value={form.requirements}
                    onChange={(e) => update("requirements", e.target.value)}
                    placeholder="Specific guidelines for creators..."
                    style={{ ...inputStyle, resize: "vertical" }}
                  />
                </div>

                {/* Max Slots */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Max Creator Slots</label>
                    <input
                      type="number"
                      min="1"
                      value={form.maxSlots}
                      onChange={(e) => update("maxSlots", e.target.value)}
                      style={inputStyle}
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.allowResubmission}
                        onChange={(e) => update("allowResubmission", e.target.checked)}
                        className="w-4 h-4 accent-[var(--accent)]"
                      />
                      <span className="text-text text-sm font-light">Allow resubmissions</span>
                    </label>
                  </div>
                </div>

                {error && (
                  <p className="text-sm" style={{ color: "#e25c5c" }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="cta-party flex items-center justify-center gap-2 w-full px-5 py-3 text-sm font-medium rounded-sm transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ color: "#fff" }}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Creating...
                    </>
                  ) : (
                    "Create Bounty"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
