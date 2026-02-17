import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DUMMY_BOUNTIES } from "@/data/bounties";

export const dynamic = "force-dynamic";

function findDummyBounty(id: string) {
  const b = DUMMY_BOUNTIES.find((b) => b.id === id);
  if (!b) return null;
  return {
    id: b.id,
    title: b.title,
    description: b.fullDescription,
    platform: b.platform,
    contentType: b.contentType,
    niche: b.niche,
    requirements: b.requirements.join("\n"),
    budget: b.budget,
    deadline: b.deadline,
    status: "open",
    allowResubmission: false,
    createdAt: new Date().toISOString(),
    company: { companyName: b.brand, description: b.brandDescription },
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const bounty = await prisma.bounty.findUnique({
      where: { id },
      include: {
        company: { select: { companyName: true, description: true } },
      },
    });

    if (bounty) {
      return NextResponse.json(bounty);
    }

    // Not found in DB — try fallback
    const fallback = findDummyBounty(id);
    if (fallback) {
      return NextResponse.json(fallback);
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (error) {
    console.error("Failed to fetch bounty from DB, using fallback:", error);
    const fallback = findDummyBounty(id);
    if (fallback) {
      return NextResponse.json(fallback);
    }
    return NextResponse.json({ error: "Failed to fetch bounty" }, { status: 500 });
  }
}
