"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTheme } from "../theme-provider";
import { Navbar } from "../../components/Navbar";
import { CanvasBackdrop } from "../canvas-backdrop";
import { ArrowRight, Search, FileText, Send, Plus, Users, Briefcase } from "lucide-react";
import Link from "next/link";

function DashboardCard({
  title,
  icon,
  children,
  isDark,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isDark: boolean;
}) {
  return (
    <div
      className="p-6 md:p-8"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: isDark ? "2px" : "10px",
        boxShadow: isDark ? "none" : "0 1px 3px rgba(45,41,38,0.04)",
      }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-accent-mid">{icon}</span>
        <h2 className="text-text font-light text-lg">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-text-muted text-sm font-light py-4">{message}</p>
  );
}

function CreatorDashboard({ name, isDark }: { name: string; isDark: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <DashboardCard title="Browse Bounties" icon={<Search size={18} />} isDark={isDark}>
        <p className="text-text-muted text-sm font-light mb-4">
          Find bounties that match your skills and audience.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent-mid hover:text-accent transition-colors"
        >
          Go to Bounty Board <ArrowRight size={14} />
        </Link>
      </DashboardCard>

      <DashboardCard title="My Applications" icon={<FileText size={18} />} isDark={isDark}>
        <EmptyState message="You haven't applied to any bounties yet." />
      </DashboardCard>

      <DashboardCard title="My Submissions" icon={<Send size={18} />} isDark={isDark}>
        <EmptyState message="No submissions yet." />
      </DashboardCard>
    </div>
  );
}

function CompanyDashboard({ name, isDark }: { name: string; isDark: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <DashboardCard title="My Bounties" icon={<Briefcase size={18} />} isDark={isDark}>
        <EmptyState message="Create your first bounty." />
        <Link
          href="/bounty/create"
          className="cta-party inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-sm transition-all mt-2"
          style={{ color: "#fff" }}
        >
          <Plus size={14} /> Create Bounty
        </Link>
      </DashboardCard>

      <DashboardCard title="Applications" icon={<Users size={18} />} isDark={isDark}>
        <EmptyState message="No pending applications." />
      </DashboardCard>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <>
        <CanvasBackdrop />
        <div className="relative" style={{ zIndex: 1 }}>
          <Navbar />
          <div className="pt-28 pb-24 px-6 md:px-12 lg:px-24">
            <div className="max-w-4xl mx-auto">
              <div className="h-8 w-48 rounded mb-8" style={{ background: "var(--border)" }} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-40 rounded"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: isDark ? "2px" : "10px" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!session?.user) return null;

  const role = session.user.role;
  const displayName = session.user.name || session.user.email || "there";

  return (
    <>
      <CanvasBackdrop />
      <div className="relative" style={{ zIndex: 1 }}>
        <Navbar />
        <div className="pt-28 pb-24 px-6 md:px-12 lg:px-24">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-text-muted">
                {role === "COMPANY" ? "Company" : "Creator"} Dashboard
              </span>
              <h1
                className="mt-2 text-text font-extralight"
                style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)" }}
              >
                Welcome back, <span className="text-accent-mid">{displayName.split("@")[0]}</span>
              </h1>
            </div>

            {role === "COMPANY" ? (
              <CompanyDashboard name={displayName} isDark={isDark} />
            ) : (
              <CreatorDashboard name={displayName} isDark={isDark} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
