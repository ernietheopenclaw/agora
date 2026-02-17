"use client";

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`skeleton-shimmer ${className}`} />;
}

export function BountyCardSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div
      className="p-5 md:p-6"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: isDark ? "2px" : "10px",
        boxShadow: isDark ? "none" : "0 1px 3px rgba(45,41,38,0.04)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <SkeletonBlock className="w-[14px] h-[14px] rounded-full" />
            <SkeletonBlock className="w-16 h-3" />
            <SkeletonBlock className="w-12 h-3" />
          </div>
          <SkeletonBlock className="w-3/4 h-5 mb-2" />
          <SkeletonBlock className="w-1/3 h-3 mt-1.5" />
        </div>
        <div className="text-right flex-shrink-0">
          <SkeletonBlock className="w-20 h-7 ml-auto" />
          <SkeletonBlock className="w-14 h-3 mt-2 ml-auto" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <SkeletonBlock className="w-14 h-4" />
        <SkeletonBlock className="w-20 h-4" />
      </div>
    </div>
  );
}

export function BountyGridSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <BountyCardSkeleton key={i} isDark={isDark} />
      ))}
    </div>
  );
}

export function BountyDetailSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <section className="px-6 md:px-12 lg:px-24 pb-16">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-8 lg:gap-12 items-start">
        {/* Left column */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <SkeletonBlock className="w-2.5 h-2.5 rounded-full" />
            <SkeletonBlock className="w-16 h-3" />
            <SkeletonBlock className="w-20 h-3" />
            <SkeletonBlock className="w-14 h-5" />
          </div>
          <SkeletonBlock className="w-4/5 h-9 mb-2" />
          <SkeletonBlock className="w-2/5 h-8 mb-3" />
          <div className="flex items-center gap-2 mb-8">
            <SkeletonBlock className="w-3.5 h-3.5 rounded-full" />
            <SkeletonBlock className="w-32 h-3" />
          </div>
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-3">
              <SkeletonBlock className="w-3.5 h-3.5" />
              <SkeletonBlock className="w-10 h-3" />
            </div>
            <SkeletonBlock className="w-full h-4 mb-2" />
            <SkeletonBlock className="w-full h-4 mb-2" />
            <SkeletonBlock className="w-3/4 h-4 mb-2" />
            <SkeletonBlock className="w-5/6 h-4" />
          </div>
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <SkeletonBlock className="w-3.5 h-3.5" />
              <SkeletonBlock className="w-24 h-3" />
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 mb-2.5">
                <SkeletonBlock className="w-1.5 h-1.5 rounded-full" />
                <SkeletonBlock className="w-2/3 h-3" />
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div>
          <div
            className="p-6"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: isDark ? "2px" : "12px",
              boxShadow: isDark ? "none" : "0 4px 16px rgba(45,41,38,0.08)",
            }}
          >
            <div className="mb-5">
              <SkeletonBlock className="w-14 h-3 mb-2" />
              <SkeletonBlock className="w-28 h-8" />
              <SkeletonBlock className="w-32 h-5 mt-2" />
            </div>
            <div
              className="py-4 mb-4"
              style={{ borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between">
                <SkeletonBlock className="w-20 h-3" />
                <SkeletonBlock className="w-24 h-4" />
              </div>
            </div>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between">
                <SkeletonBlock className="w-16 h-3" />
                <SkeletonBlock className="w-20 h-3" />
              </div>
              <div className="flex items-center justify-between">
                <SkeletonBlock className="w-16 h-3" />
                <SkeletonBlock className="w-24 h-3" />
              </div>
            </div>
            <SkeletonBlock className="w-full h-11" />
          </div>
        </div>
      </div>
    </section>
  );
}
