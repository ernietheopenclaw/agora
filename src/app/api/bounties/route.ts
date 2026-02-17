import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DUMMY_BOUNTIES } from "@/data/bounties";

export const dynamic = "force-dynamic";

function mapDummyBounties(platform?: string | null, niche?: string | null) {
  let filtered = DUMMY_BOUNTIES;
  if (platform) filtered = filtered.filter((b) => b.platform === platform);
  if (niche) filtered = filtered.filter((b) => b.niche === niche);
  return filtered.map((b) => ({
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
  }));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform");
  const niche = searchParams.get("niche");

  try {
    const where: Record<string, unknown> = { status: "open" };
    if (platform) where.platform = platform;
    if (niche) where.niche = niche;

    const bounties = await prisma.bounty.findMany({
      where,
      include: {
        company: { select: { companyName: true, description: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // If DB returned results, use them; otherwise fall back
    if (bounties.length > 0) {
      return NextResponse.json(bounties);
    }

    console.log("No bounties in DB, returning fallback data");
    return NextResponse.json(mapDummyBounties(platform, niche));
  } catch (error) {
    console.error("Failed to fetch bounties from DB, using fallback:", error);
    return NextResponse.json(mapDummyBounties(platform, niche));
  }
}
