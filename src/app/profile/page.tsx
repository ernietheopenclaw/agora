"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "../theme-provider";
import { Navbar } from "../../components/Navbar";
import { CanvasBackdrop } from "../canvas-backdrop";
import { Check, Loader2, User, Link as LinkIcon } from "lucide-react";

interface ProfileData {
  email: string;
  role: string;
  displayName: string;
  bio: string;
  tiktokHandle: string;
  instagramHandle: string;
  youtubeHandle: string;
  xHandle: string;
}

const platforms = [
  {
    key: "tiktokHandle" as const,
    name: "TikTok",
    color: "#25F4EE",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.75a8.18 8.18 0 004.76 1.52V6.84a4.84 4.84 0 01-1-.15z" />
      </svg>
    ),
  },
  {
    key: "instagramHandle" as const,
    name: "Instagram",
    color: "#C13584",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    key: "youtubeHandle" as const,
    name: "YouTube",
    color: "#FF0000",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    key: "xHandle" as const,
    name: "X",
    color: "#808080",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
];

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [data, setData] = useState<ProfileData | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [handles, setHandles] = useState({
    tiktokHandle: "",
    instagramHandle: "",
    youtubeHandle: "",
    xHandle: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/settings")
        .then((r) => r.json())
        .then((d: ProfileData) => {
          setData(d);
          setDisplayName(d.displayName);
          setBio(d.bio || "");
          setHandles({
            tiktokHandle: d.tiktokHandle,
            instagramHandle: d.instagramHandle,
            youtubeHandle: d.youtubeHandle,
            xHandle: d.xHandle,
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, bio, ...handles }),
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <>
        <CanvasBackdrop />
        <div className="relative" style={{ zIndex: 1 }}>
          <Navbar />
          <div className="pt-28 pb-24 px-6 md:px-12 lg:px-24 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-text-muted" />
          </div>
        </div>
      </>
    );
  }

  if (!session || !data) return null;

  const roleBadgeColor =
    data.role.toUpperCase() === "CREATOR"
      ? { bg: "rgba(90,172,167,0.15)", text: "#5aaca7" }
      : { bg: "rgba(210,168,67,0.15)", text: "#d4a843" };

  const inputStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: isDark ? "2px" : "8px",
    color: "var(--text)",
    padding: "10px 14px",
    fontSize: "14px",
    width: "100%",
    outline: "none",
    transition: "border-color 0.15s ease",
  };

  const initial = (displayName || data.email || "?")[0].toUpperCase();

  return (
    <>
      <CanvasBackdrop />
      <div className="relative" style={{ zIndex: 1 }}>
        <Navbar />
        <div className="pt-28 pb-24 px-6 md:px-12 lg:px-24">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-text font-extralight text-3xl mb-8">Profile</h1>

            {/* Avatar + Role */}
            <div
              className="p-6 md:p-8 mb-5"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: isDark ? "2px" : "10px",
                boxShadow: isDark ? "none" : "0 1px 3px rgba(45,41,38,0.04)",
              }}
            >
              <div className="flex items-start gap-5 mb-6">
                <div
                  className="flex items-center justify-center flex-shrink-0 text-2xl font-light text-white"
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    background: "var(--accent, #5aaca7)",
                  }}
                >
                  {initial}
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2.5 mb-1">
                    <User size={16} className="text-text-muted" />
                    <h2 className="text-text font-light text-lg">Profile Info</h2>
                    <span
                      className="ml-auto text-xs font-mono uppercase tracking-wider px-2.5 py-1"
                      style={{
                        background: roleBadgeColor.bg,
                        color: roleBadgeColor.text,
                        borderRadius: isDark ? "2px" : "6px",
                      }}
                    >
                      {data.role.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-text-muted text-sm font-light">{data.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-muted mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--border-strong)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-muted mb-2">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Tell brands about yourself..."
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      minHeight: "80px",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--border-strong)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
              </div>
            </div>

            {/* Social Accounts Section */}
            <div
              className="p-6 md:p-8 mb-5"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: isDark ? "2px" : "10px",
                boxShadow: isDark ? "none" : "0 1px 3px rgba(45,41,38,0.04)",
              }}
            >
              <div className="flex items-center gap-2.5 mb-6">
                <LinkIcon size={16} className="text-text-muted" />
                <h2 className="text-text font-light text-lg">Connected Accounts</h2>
              </div>

              <div className="space-y-3">
                {platforms.map((p) => {
                  const value = handles[p.key];
                  const isConnected = !!value && value.trim().length > 0;

                  return (
                    <div
                      key={p.key}
                      className="flex items-center gap-4 p-4"
                      style={{
                        background: isDark ? "rgba(255,255,255,0.02)" : "var(--surface-raised, #e8e4df)",
                        border: "1px solid var(--border)",
                        borderRadius: isDark ? "2px" : "8px",
                      }}
                    >
                      <div
                        className="flex items-center justify-center w-9 h-9 flex-shrink-0"
                        style={{
                          color: p.color,
                          borderRadius: isDark ? "2px" : "8px",
                          background: `${p.color}15`,
                        }}
                      >
                        {p.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-text text-sm font-light block mb-1">{p.name}</span>
                        <input
                          type="text"
                          placeholder="@username"
                          value={value}
                          onChange={(e) =>
                            setHandles((prev) => ({ ...prev, [p.key]: e.target.value }))
                          }
                          style={{
                            ...inputStyle,
                            padding: "6px 10px",
                            fontSize: "13px",
                            background: isDark ? "rgba(255,255,255,0.03)" : "var(--bg)",
                          }}
                          onFocus={(e) => (e.target.style.borderColor = p.color)}
                          onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                        />
                      </div>
                      <div
                        className="flex-shrink-0 text-xs font-mono uppercase tracking-wider px-3 py-1.5"
                        style={{
                          borderRadius: isDark ? "2px" : "6px",
                          background: isConnected ? `${p.color}20` : "transparent",
                          color: isConnected ? p.color : "var(--text-muted)",
                          border: isConnected ? "none" : "1px solid var(--border)",
                        }}
                      >
                        {isConnected ? (
                          <span className="flex items-center gap-1">
                            <Check size={12} /> Connected
                          </span>
                        ) : (
                          "Not linked"
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 text-sm font-medium transition-all cursor-pointer flex items-center gap-2"
                style={{
                  background: "var(--accent, #5aaca7)",
                  color: "#fff",
                  borderRadius: isDark ? "2px" : "8px",
                  opacity: saving ? 0.7 : 1,
                  border: "none",
                }}
              >
                {saving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : saved ? (
                  <Check size={14} />
                ) : null}
                {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
              </button>
              {saved && (
                <span className="text-sm text-text-muted font-light">
                  All changes saved successfully
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
