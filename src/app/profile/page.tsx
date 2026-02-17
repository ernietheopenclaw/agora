"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { useTheme } from "../theme-provider";
import { Navbar } from "../../components/Navbar";
import { CanvasBackdrop } from "../canvas-backdrop";

/* ── Custom SVG Icons (no lucide) ─────────────────────────── */

const TikTokIcon = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.75a8.18 8.18 0 004.76 1.52V6.84a4.84 4.84 0 01-1-.15z" />
  </svg>
);

const InstagramIcon = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const YouTubeIcon = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
    <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

const XIcon = ({ size = 18 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" width={16} height={16}>
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="animate-spin">
    <path d="M21 12a9 9 0 11-6.219-8.56" />
  </svg>
);

const CheckIcon = ({ size = 14 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PlusIcon = ({ size = 16 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" width={size} height={size}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" width={18} height={18}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={12} height={12}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

const PencilIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={14} height={14}>
    <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
  </svg>
);

/* ── Platform config ──────────────────────────────────────── */

type PlatformKey = "tiktokHandle" | "instagramHandle" | "youtubeHandle" | "xHandle";

interface PlatformDef {
  key: PlatformKey;
  name: string;
  color: string;
  icon: React.ReactNode;
  selectIcon: React.ReactNode;
}

const platforms: PlatformDef[] = [
  { key: "tiktokHandle", name: "TikTok", color: "#25F4EE", icon: <TikTokIcon size={14} />, selectIcon: <TikTokIcon size={24} /> },
  { key: "instagramHandle", name: "Instagram", color: "#C13584", icon: <InstagramIcon size={14} />, selectIcon: <InstagramIcon size={24} /> },
  { key: "youtubeHandle", name: "YouTube", color: "#FF0000", icon: <YouTubeIcon size={14} />, selectIcon: <YouTubeIcon size={24} /> },
  { key: "xHandle", name: "X", color: "#71767b", icon: <XIcon size={14} />, selectIcon: <XIcon size={24} /> },
];

/* ── Types ────────────────────────────────────────────────── */

interface ProfileData {
  email: string;
  role: string;
  displayName: string;
  bio: string;
  tiktokHandle: string;
  instagramHandle: string;
  youtubeHandle: string;
  xHandle: string;
  avatar: string;
}

type LinkStep = "pick" | "handle" | "verify" | "done";

/* ── Helpers ──────────────────────────────────────────────── */

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB

/* ── Component ────────────────────────────────────────────── */

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ProfileData | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [handles, setHandles] = useState<Record<PlatformKey, string>>({
    tiktokHandle: "",
    instagramHandle: "",
    youtubeHandle: "",
    xHandle: "",
  });

  // Edit mode
  const [editing, setEditing] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editBio, setEditBio] = useState("");

  // Avatar
  const [avatar, setAvatar] = useState<string>("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Link flow state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkStep, setLinkStep] = useState<LinkStep>("pick");
  const [linkPlatform, setLinkPlatform] = useState<PlatformDef | null>(null);
  const [linkHandle, setLinkHandle] = useState("");
  const [verifyCode, setVerifyCode] = useState("");
  const [verifying, setVerifying] = useState(false);

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
          setAvatar(d.avatar || "");
          setHandles({
            tiktokHandle: d.tiktokHandle || "",
            instagramHandle: d.instagramHandle || "",
            youtubeHandle: d.youtubeHandle || "",
            xHandle: d.xHandle || "",
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status]);

  /* ── Edit mode handlers ──────────────────────────────────── */

  const startEditing = () => {
    setEditDisplayName(displayName);
    setEditBio(bio);
    setEditing(true);
  };

  const cancelEditing = () => {
    setEditing(false);
  };

  const saveEditing = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: editDisplayName, bio: editBio, ...handles }),
      });
      if (res.ok) {
        setDisplayName(editDisplayName);
        setBio(editBio);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  /* ── Avatar upload ───────────────────────────────────────── */

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarError("");

    if (file.size > MAX_AVATAR_SIZE) {
      setAvatarError("Image must be under 2MB");
      e.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select an image file");
      e.target.value = "";
      return;
    }

    // Show preview immediately
    const previewUrl = URL.createObjectURL(file);
    setAvatar(previewUrl);

    // Convert to base64
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setAvatarUploading(true);
      try {
        const res = await fetch("/api/profile/avatar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar: base64 }),
        });
        if (res.ok) {
          setAvatar(base64);
        } else {
          const err = await res.json();
          setAvatarError(err.error || "Upload failed");
          setAvatar(data?.avatar || "");
        }
      } catch {
        setAvatarError("Upload failed");
        setAvatar(data?.avatar || "");
      } finally {
        setAvatarUploading(false);
        URL.revokeObjectURL(previewUrl);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  /* ── Link flow handlers ──────────────────────────────────── */

  const openLinkModal = useCallback(() => {
    setShowLinkModal(true);
    setLinkStep("pick");
    setLinkPlatform(null);
    setLinkHandle("");
    setVerifyCode(generateCode());
    setVerifying(false);
  }, []);

  const closeLinkModal = useCallback(() => {
    setShowLinkModal(false);
  }, []);

  const handlePickPlatform = (p: PlatformDef) => {
    setLinkPlatform(p);
    setLinkStep("handle");
  };

  const handleSubmitHandle = () => {
    if (!linkHandle.trim()) return;
    setLinkStep("verify");
  };

  const handleVerify = async () => {
    if (!linkPlatform) return;
    setVerifying(true);

    await fetch("/api/profile/verify-social", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: linkPlatform.name, handle: linkHandle }),
    });

    await new Promise((r) => setTimeout(r, 2000));

    const cleanHandle = linkHandle.startsWith("@") ? linkHandle : `@${linkHandle}`;
    const newHandles = { ...handles, [linkPlatform.key]: cleanHandle };
    setHandles(newHandles);

    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, bio, ...newHandles }),
    });

    setVerifying(false);
    setLinkStep("done");
    setTimeout(() => closeLinkModal(), 1500);
  };

  const handleRemoveAccount = async (key: PlatformKey) => {
    const newHandles = { ...handles, [key]: "" };
    setHandles(newHandles);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, bio, ...newHandles }),
    });
  };

  /* ── Styles ──────────────────────────────────────────────── */

  const cardStyle: React.CSSProperties = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: isDark ? "2px" : "10px",
    boxShadow: isDark ? "none" : "0 4px 16px rgba(45,41,38,0.08)",
  };

  const inputStyle: React.CSSProperties = {
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

  /* ── Loading ─────────────────────────────────────────────── */

  if (status === "loading" || loading) {
    return (
      <>
        <CanvasBackdrop />
        <div className="relative" style={{ zIndex: 1 }}>
          <Navbar />
          <div className="pt-28 pb-24 px-6 md:px-12 lg:px-24">
            <div className="max-w-2xl mx-auto">
              {/* Skeleton profile card */}
              <div className="p-6 md:p-8" style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: isDark ? "2px" : "10px",
              }}>
                <div className="flex items-start gap-5 mb-6">
                  {/* Avatar skeleton */}
                  <div className="skeleton-shimmer flex-shrink-0" style={{ width: 80, height: 80, borderRadius: "50%" }} />
                  <div className="flex-1 min-w-0 pt-1">
                    {/* Name + badge */}
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="skeleton-shimmer" style={{ width: 140, height: 20 }} />
                      <div className="skeleton-shimmer" style={{ width: 60, height: 20, borderRadius: isDark ? "2px" : "6px" }} />
                    </div>
                    {/* Social badges */}
                    <div className="flex gap-2 mt-3">
                      <div className="skeleton-shimmer" style={{ width: 90, height: 24, borderRadius: isDark ? "2px" : "999px" }} />
                      <div className="skeleton-shimmer" style={{ width: 100, height: 24, borderRadius: isDark ? "2px" : "999px" }} />
                    </div>
                  </div>
                </div>
                {/* Bio skeleton */}
                <div className="space-y-3">
                  <div className="skeleton-shimmer" style={{ width: 50, height: 12 }} />
                  <div className="skeleton-shimmer" style={{ width: "100%", height: 14 }} />
                  <div className="skeleton-shimmer" style={{ width: "75%", height: 14 }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!session || !data) return null;

  const initial = (displayName || data.email || "?")[0].toUpperCase();
  const roleBadgeColor =
    data.role.toUpperCase() === "CREATOR"
      ? { bg: "rgba(90,172,167,0.15)", text: "#5aaca7" }
      : { bg: "rgba(210,168,67,0.15)", text: "#d4a843" };

  const connectedAccounts = platforms.filter((p) => handles[p.key]?.trim());
  const unlinkedPlatforms = platforms.filter((p) => !handles[p.key]?.trim());

  /* ── Render ──────────────────────────────────────────────── */

  return (
    <>
      <CanvasBackdrop />
      <div className="relative" style={{ zIndex: 1 }}>
        <Navbar />
        <div className="pt-28 pb-24 px-6 md:px-12 lg:px-24">
          <div className="max-w-2xl mx-auto">
            {/* Hidden file input for avatar */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />

            {/* ── Profile Card ─────────────────────────────── */}
            <div className="p-6 md:p-8" style={cardStyle}>
              {/* Avatar + Name + Email + Badges */}
              <div className="flex items-start gap-5 mb-6 justify-between">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div
                    onClick={handleAvatarClick}
                    className="flex items-center justify-center text-2xl font-light text-white cursor-pointer overflow-hidden"
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: "50%",
                      background: avatar ? "transparent" : "var(--accent, #5aaca7)",
                    }}
                  >
                    {avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={avatar}
                        alt="Avatar"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      initial
                    )}
                  </div>
                  {/* Camera overlay */}
                  <div
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 flex items-center justify-center cursor-pointer transition-colors"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "var(--surface)",
                      border: "2px solid var(--border-strong)",
                      color: "var(--text-muted)",
                    }}
                    title="Upload photo"
                  >
                    {avatarUploading ? <SpinnerIcon /> : <CameraIcon />}
                  </div>
                  {avatarError && (
                    <p className="absolute -bottom-5 left-0 text-xs whitespace-nowrap" style={{ color: "#e29578" }}>
                      {avatarError}
                    </p>
                  )}
                </div>

                {/* Name / Email / Badges */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2.5 mb-0.5">
                    <h2 className="text-text font-light text-xl truncate">{displayName || data.email}</h2>
                    <span
                      className="flex-shrink-0 text-xs font-mono uppercase tracking-wider px-2.5 py-1"
                      style={{
                        background: roleBadgeColor.bg,
                        color: roleBadgeColor.text,
                        borderRadius: isDark ? "2px" : "6px",
                      }}
                    >
                      {data.role.toUpperCase()}
                    </span>
                  </div>
                  {/* Connected account badges + link button */}
                  <div className="flex flex-wrap items-center gap-2">
                    {connectedAccounts.map((p) => (
                      <span
                        key={p.key}
                        className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 group"
                        style={{
                          background: `${p.color}18`,
                          color: p.color,
                          borderRadius: isDark ? "2px" : "999px",
                          border: `1px solid ${p.color}30`,
                        }}
                      >
                        {p.icon}
                        <span>{handles[p.key]}</span>
                        <button
                          onClick={() => handleRemoveAccount(p.key)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5 cursor-pointer"
                          style={{ color: p.color }}
                          title={`Remove ${p.name}`}
                        >
                          <TrashIcon />
                        </button>
                      </span>
                    ))}
                    {unlinkedPlatforms.length > 0 && (
                      connectedAccounts.length > 0 ? (
                        <button
                          onClick={openLinkModal}
                          className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 cursor-pointer transition-colors"
                          style={{
                            color: "var(--text-muted)",
                            background: "transparent",
                            border: "1px dashed var(--border)",
                            borderRadius: isDark ? "2px" : "999px",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "var(--border-strong)";
                            e.currentTarget.style.color = "var(--text)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "var(--border)";
                            e.currentTarget.style.color = "var(--text-muted)";
                          }}
                          title="Link More Accounts"
                        >
                          <PlusIcon size={12} />
                          Link More
                        </button>
                      ) : (
                        <button
                          onClick={openLinkModal}
                          className="inline-flex items-center gap-1.5 text-xs font-medium cursor-pointer transition-colors"
                          style={{ color: "var(--text-muted)", background: "transparent", border: "none" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                        >
                          <PlusIcon size={12} />
                          Link More Accounts
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Edit button */}
                {!editing && (
                  <button
                    onClick={startEditing}
                    className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 cursor-pointer transition-colors flex-shrink-0"
                    style={{
                      color: "var(--text-muted)",
                      background: "transparent",
                      border: "1px solid var(--border)",
                      borderRadius: isDark ? "2px" : "6px",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-strong)";
                      e.currentTarget.style.color = "var(--text)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.color = "var(--text-muted)";
                    }}
                  >
                    <PencilIcon />
                    Edit
                  </button>
                )}
              </div>

              {/* ── View / Edit mode for fields ─────────────── */}
              {editing ? (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-mono uppercase tracking-wider text-text-muted mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={editDisplayName}
                        onChange={(e) => setEditDisplayName(e.target.value)}
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
                        value={editBio}
                        onChange={(e) => setEditBio(e.target.value)}
                        rows={3}
                        placeholder="Tell brands about yourself..."
                        style={{ ...inputStyle, resize: "vertical", minHeight: "80px" }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--border-strong)")}
                        onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-6">
                    <button
                      onClick={saveEditing}
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
                      {saving && <SpinnerIcon />}
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="px-5 py-2.5 text-sm font-medium cursor-pointer transition-colors"
                      style={{
                        background: "transparent",
                        color: "var(--text-muted)",
                        border: "1px solid var(--border)",
                        borderRadius: isDark ? "2px" : "8px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "var(--border-strong)";
                        e.currentTarget.style.color = "var(--text)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.color = "var(--text-muted)";
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-text-muted mb-1">
                      Bio
                    </label>
                    <p className="text-text text-sm font-light" style={{ whiteSpace: "pre-wrap" }}>
                      {bio || <span className="text-text-muted italic">No bio yet</span>}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Link Modal ────────────────────────────────────── */}
        {showLinkModal && (
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 100, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            onClick={(e) => { if (e.target === e.currentTarget) closeLinkModal(); }}
          >
            <div
              className="w-full max-w-md p-6"
              style={{
                ...cardStyle,
                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-text font-light text-lg">
                  {linkStep === "pick" && "Link More Accounts"}
                  {linkStep === "handle" && `Link ${linkPlatform?.name}`}
                  {linkStep === "verify" && "Verify Ownership"}
                  {linkStep === "done" && "Connected!"}
                </h3>
                <button
                  onClick={closeLinkModal}
                  className="cursor-pointer p-1 transition-colors"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                  <CloseIcon />
                </button>
              </div>

              {/* Step 1: Pick platform */}
              {linkStep === "pick" && (
                <div className="grid grid-cols-2 gap-3">
                  {unlinkedPlatforms.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => handlePickPlatform(p)}
                      className="flex flex-col items-center gap-3 p-5 cursor-pointer transition-all"
                      style={{
                        background: isDark ? "rgba(255,255,255,0.03)" : "var(--bg)",
                        border: "1px solid var(--border)",
                        borderRadius: isDark ? "2px" : "10px",
                        color: p.color,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = p.color;
                        e.currentTarget.style.background = `${p.color}10`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "var(--border)";
                        e.currentTarget.style.background = isDark ? "rgba(255,255,255,0.03)" : "var(--bg)";
                      }}
                    >
                      {p.selectIcon}
                      <span className="text-sm font-medium text-text">{p.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Step 2: Enter handle */}
              {linkStep === "handle" && linkPlatform && (
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-muted mb-2">
                    Your {linkPlatform.name} Handle
                  </label>
                  <div className="flex items-center gap-0">
                    <span
                      className="flex items-center justify-center px-3 text-sm text-text-muted"
                      style={{
                        background: isDark ? "rgba(255,255,255,0.05)" : "var(--surface-raised, #e8e4df)",
                        border: "1px solid var(--border)",
                        borderRight: "none",
                        borderRadius: isDark ? "2px 0 0 2px" : "8px 0 0 8px",
                        height: "42px",
                      }}
                    >
                      @
                    </span>
                    <input
                      type="text"
                      placeholder="username"
                      value={linkHandle.replace(/^@/, "")}
                      onChange={(e) => setLinkHandle(e.target.value.replace(/^@/, ""))}
                      autoFocus
                      onKeyDown={(e) => { if (e.key === "Enter") handleSubmitHandle(); }}
                      style={{
                        ...inputStyle,
                        borderRadius: isDark ? "0 2px 2px 0" : "0 8px 8px 0",
                        height: "42px",
                        padding: "10px 14px",
                      }}
                      onFocus={(e) => (e.target.style.borderColor = linkPlatform.color)}
                      onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                    />
                  </div>
                  <button
                    onClick={handleSubmitHandle}
                    disabled={!linkHandle.trim()}
                    className="mt-4 w-full py-2.5 text-sm font-medium cursor-pointer transition-all"
                    style={{
                      background: linkHandle.trim() ? linkPlatform.color : "var(--border)",
                      color: linkHandle.trim() ? "#fff" : "var(--text-muted)",
                      border: "none",
                      borderRadius: isDark ? "2px" : "8px",
                      opacity: linkHandle.trim() ? 1 : 0.6,
                    }}
                  >
                    Continue
                  </button>
                </div>
              )}

              {/* Step 3: Verify */}
              {linkStep === "verify" && linkPlatform && (
                <div>
                  <p className="text-text text-sm font-light mb-4 leading-relaxed">
                    Send this code as a message to <strong style={{ color: linkPlatform.color }}>@useagora</strong>, then click Verify.
                  </p>
                  <div
                    className="flex items-center justify-between px-4 py-3 mb-5"
                    style={{
                      background: isDark ? "rgba(255,255,255,0.05)" : "var(--bg)",
                      border: "1px solid var(--border)",
                      borderRadius: isDark ? "2px" : "8px",
                    }}
                  >
                    <span
                      className="font-mono text-xl tracking-[0.3em] font-medium"
                      style={{ color: linkPlatform.color }}
                    >
                      {verifyCode}
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(verifyCode)}
                      className="cursor-pointer p-1.5 transition-colors"
                      style={{ color: "var(--text-muted)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                      title="Copy code"
                    >
                      <CopyIcon />
                    </button>
                  </div>
                  <p className="text-text-muted text-xs mb-5">
                    Linking <strong>@{linkHandle.replace(/^@/, "")}</strong> on {linkPlatform.name}
                  </p>
                  <button
                    onClick={handleVerify}
                    disabled={verifying}
                    className="w-full py-2.5 text-sm font-medium cursor-pointer transition-all flex items-center justify-center gap-2"
                    style={{
                      background: verifying ? "var(--border)" : linkPlatform.color,
                      color: "#fff",
                      border: "none",
                      borderRadius: isDark ? "2px" : "8px",
                    }}
                  >
                    {verifying ? (
                      <>
                        <SpinnerIcon />
                        Checking...
                      </>
                    ) : (
                      "Verify"
                    )}
                  </button>
                </div>
              )}

              {/* Step 4: Done */}
              {linkStep === "done" && linkPlatform && (
                <div className="flex flex-col items-center py-4">
                  <div
                    className="flex items-center justify-center mb-3"
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: `${linkPlatform.color}20`,
                      color: linkPlatform.color,
                    }}
                  >
                    <CheckIcon size={24} />
                  </div>
                  <p className="text-text font-light text-lg mb-1">Verified!</p>
                  <p className="text-text-muted text-sm">
                    @{linkHandle.replace(/^@/, "")} linked on {linkPlatform.name}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
