"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "../../../components/Navbar";
import { CanvasBackdrop } from "../../canvas-backdrop";

export default function CreateBountyPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  return (
    <>
      <CanvasBackdrop />
      <div className="relative" style={{ zIndex: 1 }}>
        <Navbar />
        <div className="pt-28 pb-24 px-6 md:px-12 lg:px-24">
          <div className="max-w-2xl mx-auto text-center py-20">
            <h1 className="text-text font-extralight text-3xl mb-4">Create a Bounty</h1>
            <p className="text-text-muted text-base font-light">Coming soon.</p>
          </div>
        </div>
      </div>
    </>
  );
}
