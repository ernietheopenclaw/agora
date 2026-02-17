"use client";

import { useSession, signOut } from "next-auth/react";
import { useTheme } from "../app/theme-provider";
import { SpinningLogo } from "./SpinningLogo";
import { AgoraLogo } from "./AgoraLogo";
import { Sun, Moon, ArrowRight, LogOut, Settings, ChevronDown, BarChart3, Crosshair, UserCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

function UserAvatar({ name, image, size = 30 }: { name: string; image?: string | null; size?: number }) {
  const letter = (name || "?")[0].toUpperCase();
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="rounded-full flex-shrink-0 object-cover"
        style={{ width: size, height: size }}
        referrerPolicy="no-referrer"
      />
    );
  }
  return (
    <div
      className="flex items-center justify-center rounded-full text-xs font-medium text-white flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: "var(--accent, #5aaca7)",
      }}
    >
      {letter}
    </div>
  );
}

export function Navbar() {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const displayName = session?.user?.name || session?.user?.email || "";
  const truncatedName = displayName.length > 20 ? displayName.slice(0, 18) + "…" : displayName;
  const userImage = session?.user?.image;

  return (
    <nav
      className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 md:px-12"
      style={{
        zIndex: 10,
        background: "var(--bg)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {isHome ? (
        <div className="flex items-center gap-2">
          <SpinningLogo size={24} />
          <span className="text-base font-light tracking-tight text-text">agora</span>
        </div>
      ) : (
        <Link href="/" className="flex items-center gap-2">
          <AgoraLogo size={24} />
          <span className="text-base font-light tracking-tight text-text">agora</span>
        </Link>
      )}
      <div className="flex items-center gap-3">
        {status === "loading" ? (
          <div className="w-20 h-4 rounded" style={{ background: "var(--border)" }} />
        ) : session?.user ? (
          <>
            {/* Nav links — visible in top bar */}
            <div className="hidden sm:flex items-center gap-1">
              {[
                { href: "/", label: "Bounties", icon: Crosshair },
                { href: "/stats", label: "Dashboard", icon: BarChart3 },
              ].map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-light transition-colors duration-150 rounded-sm"
                    style={{
                      color: active ? "var(--text)" : "var(--text-muted)",
                      background: active ? (isDark ? "rgba(255,255,255,0.05)" : "var(--surface)") : "transparent",
                    }}
                  >
                    <Icon size={14} />
                    {label}
                  </Link>
                );
              })}
            </div>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 cursor-pointer transition-colors duration-200"
              >
                <UserAvatar name={displayName} image={userImage} />
                <span className="text-sm text-text font-light hidden sm:inline">{truncatedName}</span>
                <ChevronDown
                  size={13}
                  className="text-text-muted transition-transform duration-200"
                  style={{ transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)" }}
                />
              </button>
              <div
                className="absolute right-0 top-[calc(100%+8px)] min-w-[180px] py-1 overflow-hidden"
                style={{
                  background: "var(--surface)",
                  border: dropdownOpen ? "1px solid var(--border-strong)" : "1px solid transparent",
                  borderRadius: isDark ? "2px" : "10px",
                  boxShadow: dropdownOpen
                    ? isDark
                      ? "0 8px 24px rgba(0,0,0,0.5)"
                      : "0 8px 32px rgba(45,41,38,0.12)"
                    : "none",
                  opacity: dropdownOpen ? 1 : 0,
                  transform: dropdownOpen ? "translateY(0) scaleY(1)" : "translateY(-4px) scaleY(0.96)",
                  transformOrigin: "top right",
                  transition: "opacity 0.15s ease, transform 0.15s ease",
                  pointerEvents: dropdownOpen ? "auto" : "none",
                }}
              >
                {/* Mobile-only nav links */}
                <div className="sm:hidden">
                  <Link
                    href="/"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text font-light transition-colors duration-150 hover:bg-[var(--border)]"
                  >
                    <Crosshair size={14} className="text-text-muted" />
                    Bounties
                  </Link>
                  <Link
                    href="/stats"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text font-light transition-colors duration-150 hover:bg-[var(--border)]"
                  >
                    <BarChart3 size={14} className="text-text-muted" />
                    Dashboard
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text font-light transition-colors duration-150 hover:bg-[var(--border)]"
                  >
                    <UserCircle size={14} className="text-text-muted" />
                    Profile
                  </Link>
                  <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
                </div>
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text font-light transition-colors duration-150 hover:bg-[var(--border)]"
                >
                  <UserCircle size={14} className="text-text-muted" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text font-light transition-colors duration-150 hover:bg-[var(--border)]"
                >
                  <Settings size={14} className="text-text-muted" />
                  Settings
                </Link>
                <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
                <button
                  onClick={(e) => { e.preventDefault(); toggle(); }}
                  className="flex items-center justify-between px-4 py-2.5 text-sm text-text font-light transition-colors duration-150 hover:bg-[var(--border)] w-full cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    {isDark ? <Sun size={14} className="text-text-muted" /> : <Moon size={14} className="text-text-muted" />}
                    {isDark ? "Light Mode" : "Dark Mode"}
                  </span>
                </button>
                <div style={{ height: 1, background: "var(--border)", margin: "4px 0" }} />
                <button
                  onClick={() => { signOut({ callbackUrl: "/" }); setDropdownOpen(false); }}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text font-light transition-colors duration-150 hover:bg-[var(--border)] w-full cursor-pointer"
                >
                  <LogOut size={14} className="text-text-muted" />
                  Log out
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <a
              href="/login"
              className="text-sm text-text-muted hover:text-text transition-colors login-underline"
            >
              Log in
            </a>
            <a
              href="/signup"
              className="cta-party hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-sm transition-all"
              style={{ color: "#fff" }}
            >
              Start Earning <ArrowRight size={13} />
            </a>
          </>
        )}
        {!session?.user && (
          <button
            onClick={toggle}
            className="flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <Sun size={16} strokeWidth={1.5} className="text-text-muted" />
            ) : (
              <Moon size={16} strokeWidth={1.5} fill="var(--text-muted)" className="text-text-muted" />
            )}
          </button>
        )}
      </div>
    </nav>
  );
}
