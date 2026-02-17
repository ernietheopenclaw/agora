import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
    _count: { applications: 0 },
  }));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform");
  const niche = searchParams.get("niche");
  const mine = searchParams.get("mine");

  try {
    const { prisma } = await import("@/lib/prisma");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: Record<string, unknown> = {};

    if (mine === "true") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const profile = await prisma.companyProfile.findUnique({
        where: { userId: session.user.id },
      });
      if (!profile) {
        return NextResponse.json([]);
      }
      where.companyId = profile.id;
    } else {
      where.status = "open";
    }

    if (platform) where.platform = platform;
    if (niche) where.niche = niche;

    const bounties = await prisma.bounty.findMany({
      where,
      include: {
        company: { select: { companyName: true, description: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (bounties.length > 0) {
      return NextResponse.json(bounties);
    }

    if (!mine) {
      console.log("No bounties in DB, returning fallback data");
      return NextResponse.json(mapDummyBounties(platform, niche));
    }
    return NextResponse.json([]);
  } catch (error) {
    console.error("Failed to fetch bounties from DB, using fallback:", error);
    if (mine) return NextResponse.json([]);
    return NextResponse.json(mapDummyBounties(platform, niche));
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || session.user.role !== "COMPANY") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { prisma } = await import("@/lib/prisma");
    const profile = await prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) {
      return NextResponse.json({ error: "Company profile not found" }, { status: 400 });
    }

    const body = await req.json();
    const bounty = await prisma.bounty.create({
      data: {
        companyId: profile.id,
        title: body.title,
        description: body.description,
        platform: body.platform,
        contentType: body.contentType,
        niche: body.niche || null,
        requirements: body.requirements || null,
        budget: parseFloat(body.budget),
        payType: body.payType || "fixed",
        payPerImpression: body.payType === "per_impression" ? body.payPerImpression : null,
        minFollowers: parseInt(body.minFollowers) || 0,
        creatorSlots: parseInt(body.maxSlots) || 1,
        deadline: new Date(body.deadline),
        allowResubmission: body.allowResubmission || false,
      },
    });

    return NextResponse.json(bounty, { status: 201 });
  } catch (error) {
    console.error("Failed to create bounty:", error);
    return NextResponse.json({ error: "Failed to create bounty" }, { status: 500 });
  }
}
