import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform");
    const niche = searchParams.get("niche");

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

    return NextResponse.json(bounties);
  } catch (error) {
    console.error("Failed to fetch bounties:", error);
    return NextResponse.json({ error: "Failed to fetch bounties" }, { status: 500 });
  }
}
