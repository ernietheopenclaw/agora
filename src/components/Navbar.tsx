"use client";

import { useSession, signOut } from "next-auth/react";
import { useTheme } from "../app/theme-provider";
import { SpinningLogo } from "./SpinningLogo";
import { Sun, Moon, ArrowRight, LogOut, LayoutDashboard, Settings, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

function UserAvatar({ name }: { name: string }) {
  const letter = (name || "?")[0].toUpperCase();
  return (
    <div
      className="flex items-center justify-center rounded-full text-xs font-medium text-white flex-shrink-0"
      style={{
        width: 30,
        height: 30,
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

  return (
    <nav
      className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 md:px-12"
      style={{
        zIndex: 10,
        background: "var(--bg)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <Link href="/" className="flex items-center gap-2">
        <SpinningLogo size={24} />
        <span className="text-base font-light tracking-tight text-text">agora</span>
      </Link>
      <div className="flex items-center gap-3">
        {status === "loading" ? (
          <div className="w-20 h-4 rounded" style={{ background: "var(--border)" }} />
        ) : session?.user ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 cursor-pointer transition-colors duration-200"
            >
              <UserAvatar name={displayName} />
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
              <Link
                href="/dashboard"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text font-light transition-colors duration-150 hover:bg-[var(--border)]"
              >
                <LayoutDashboard size={14} className="text-text-muted" />
                Dashboard
              </Link>
              <Link
                href="#"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-text font-light transition-colors duration-150 hover:bg-[var(--border)]"
              >
                <Settings size={14} className="text-text-muted" />
                Settings
              </Link>
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
      </div>
    </nav>
  );
}
