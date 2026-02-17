"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTheme } from "../theme-provider";
import { Navbar } from "../../components/Navbar";
import { CanvasBackdrop } from "../canvas-backdrop";
import { Check, Loader2, Mail, Lock, Trash2, AlertTriangle } from "lucide-react";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailSaved, setEmailSaved] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/settings")
        .then((r) => r.json())
        .then((d) => {
          setEmail(d.email);
          setNewEmail(d.email);
        });
    }
  }, [status]);

  const handleEmailSave = async () => {
    setEmailSaving(true);
    setEmailError("");
    setEmailSaved(false);
    try {
      const res = await fetch("/api/settings/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });
      if (res.ok) {
        setEmail(newEmail);
        setEmailSaved(true);
        setTimeout(() => setEmailSaved(false), 3000);
      } else {
        const data = await res.json();
        setEmailError(data.error || "Failed to update email");
      }
    } finally {
      setEmailSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    setPwError("");
    if (newPassword !== confirmPassword) {
      setPwError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPwError("Password must be at least 6 characters");
      return;
    }
    setPwSaving(true);
    setPwSaved(false);
    try {
      const res = await fetch("/api/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        setPwSaved(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPwSaved(false), 3000);
      } else {
        const data = await res.json();
        setPwError(data.error || "Failed to update password");
      }
    } finally {
      setPwSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/settings/account", { method: "DELETE" });
      if (res.ok) {
        await signOut({ callbackUrl: "/" });
      }
    } finally {
      setDeleting(false);
    }
  };

  if (status === "loading") {
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

  if (!session) return null;

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

  const cardStyle = {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: isDark ? "2px" : "10px",
    boxShadow: isDark ? "none" : "0 1px 3px rgba(45,41,38,0.04)",
  };

  return (
    <>
      <CanvasBackdrop />
      <div className="relative" style={{ zIndex: 1 }}>
        <Navbar />
        <div className="pt-28 pb-24 px-6 md:px-12 lg:px-24">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-text font-extralight text-3xl mb-8">Settings</h1>

            {/* Email Section */}
            <div className="p-6 md:p-8 mb-5" style={cardStyle}>
              <div className="flex items-center gap-2.5 mb-6">
                <Mail size={16} className="text-text-muted" />
                <h2 className="text-text font-light text-lg">Email</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-muted mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--border-strong)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
                {emailError && (
                  <p className="text-sm" style={{ color: "#e25555" }}>{emailError}</p>
                )}
                <button
                  onClick={handleEmailSave}
                  disabled={emailSaving || newEmail === email}
                  className="px-5 py-2 text-sm font-medium transition-all cursor-pointer flex items-center gap-2"
                  style={{
                    background: newEmail !== email ? "var(--accent, #5aaca7)" : "var(--border)",
                    color: newEmail !== email ? "#fff" : "var(--text-muted)",
                    borderRadius: isDark ? "2px" : "8px",
                    opacity: emailSaving ? 0.7 : 1,
                    border: "none",
                  }}
                >
                  {emailSaving ? <Loader2 size={14} className="animate-spin" /> : emailSaved ? <Check size={14} /> : null}
                  {emailSaving ? "Saving..." : emailSaved ? "Updated!" : "Update Email"}
                </button>
              </div>
            </div>

            {/* Password Section */}
            <div className="p-6 md:p-8 mb-5" style={cardStyle}>
              <div className="flex items-center gap-2.5 mb-6">
                <Lock size={16} className="text-text-muted" />
                <h2 className="text-text font-light text-lg">Password</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-muted mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--border-strong)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-muted mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--border-strong)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-text-muted mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "var(--border-strong)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                  />
                </div>
                {pwError && (
                  <p className="text-sm" style={{ color: "#e25555" }}>{pwError}</p>
                )}
                <button
                  onClick={handlePasswordSave}
                  disabled={pwSaving || !currentPassword || !newPassword}
                  className="px-5 py-2 text-sm font-medium transition-all cursor-pointer flex items-center gap-2"
                  style={{
                    background: currentPassword && newPassword ? "var(--accent, #5aaca7)" : "var(--border)",
                    color: currentPassword && newPassword ? "#fff" : "var(--text-muted)",
                    borderRadius: isDark ? "2px" : "8px",
                    opacity: pwSaving ? 0.7 : 1,
                    border: "none",
                  }}
                >
                  {pwSaving ? <Loader2 size={14} className="animate-spin" /> : pwSaved ? <Check size={14} /> : null}
                  {pwSaving ? "Saving..." : pwSaved ? "Updated!" : "Change Password"}
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div
              className="p-6 md:p-8"
              style={{
                ...cardStyle,
                border: isDark ? "1px solid rgba(226,85,85,0.3)" : "1px solid rgba(226,85,85,0.25)",
              }}
            >
              <div className="flex items-center gap-2.5 mb-3">
                <Trash2 size={16} style={{ color: "#e25555" }} />
                <h2 className="font-light text-lg" style={{ color: "#e25555" }}>Danger Zone</h2>
              </div>
              <p className="text-text-muted text-sm font-light mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-5 py-2 text-sm font-medium transition-all cursor-pointer"
                style={{
                  background: isDark ? "rgba(226,85,85,0.15)" : "rgba(226,85,85,0.1)",
                  color: "#e25555",
                  borderRadius: isDark ? "2px" : "8px",
                  border: "1px solid rgba(226,85,85,0.3)",
                }}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div
            className="fixed inset-0 flex items-center justify-center px-4"
            style={{ zIndex: 100, background: "rgba(0,0,0,0.6)" }}
            onClick={() => setShowDeleteModal(false)}
          >
            <div
              className="p-6 md:p-8 max-w-md w-full"
              style={{
                ...cardStyle,
                background: "var(--bg)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle size={20} style={{ color: "#e25555" }} />
                <h3 className="text-text font-light text-lg">Delete Account</h3>
              </div>
              <p className="text-text-muted text-sm font-light mb-4">
                This will permanently delete your account, profile, and all data. Type <strong className="text-text">DELETE</strong> to confirm.
              </p>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder='Type "DELETE"'
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "rgba(226,85,85,0.5)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }}
                  className="px-5 py-2 text-sm font-medium cursor-pointer transition-colors"
                  style={{
                    background: "var(--surface)",
                    color: "var(--text)",
                    borderRadius: isDark ? "2px" : "8px",
                    border: "1px solid var(--border)",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirm !== "DELETE" || deleting}
                  className="px-5 py-2 text-sm font-medium cursor-pointer transition-all flex items-center gap-2"
                  style={{
                    background: deleteConfirm === "DELETE" ? "#e25555" : "var(--border)",
                    color: deleteConfirm === "DELETE" ? "#fff" : "var(--text-muted)",
                    borderRadius: isDark ? "2px" : "8px",
                    border: "none",
                    opacity: deleting ? 0.7 : 1,
                  }}
                >
                  {deleting && <Loader2 size={14} className="animate-spin" />}
                  {deleting ? "Deleting..." : "Delete Account"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
