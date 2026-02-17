import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform");
  const niche = searchParams.get("niche");
  const mine = searchParams.get("mine");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50")));
  const sort = searchParams.get("sort") || "newest";
  const search = searchParams.get("search")?.trim() || "";
  const payMin = searchParams.get("payMin");
  const payMax = searchParams.get("payMax");
  const followerMin = searchParams.get("followerMin");
  const followerMax = searchParams.get("followerMax");

  try {
    const { prisma } = await import("@/lib/prisma");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (mine === "true") {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      const profile = await prisma.companyProfile.findUnique({
        where: { userId: session.user.id },
      });
      if (!profile) {
        return NextResponse.json({ bounties: [], total: 0, page, hasMore: false });
      }
      where.companyId = profile.id;
    } else {
      where.status = "open";
    }

    if (platform) where.platform = platform;
    if (niche) where.niche = niche;
    if (payMin) where.budget = { ...where.budget, gte: parseFloat(payMin) };
    if (payMax) where.budget = { ...where.budget, lte: parseFloat(payMax) };
    if (followerMin) where.minFollowers = { ...where.minFollowers, gte: parseInt(followerMin) };
    if (followerMax) where.minFollowers = { ...where.minFollowers, lte: parseInt(followerMax) };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { company: { companyName: { contains: search, mode: "insensitive" } } },
      ];
    }

    // Sort mapping
    let orderBy: any;
    switch (sort) {
      case "oldest":
        orderBy = { createdAt: "asc" };
        break;
      case "deadline-asc":
        orderBy = { deadline: "asc" };
        break;
      case "deadline-desc":
        orderBy = { deadline: "desc" };
        break;
      case "followers-asc":
        orderBy = { minFollowers: "asc" };
        break;
      case "followers-desc":
        orderBy = { minFollowers: "desc" };
        break;
      case "pay-asc":
        orderBy = { budget: "asc" };
        break;
      case "pay-desc":
        orderBy = { budget: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    const [bounties, total] = await Promise.all([
      prisma.bounty.findMany({
        where,
        include: {
          company: { select: { companyName: true, description: true } },
          _count: { select: { applications: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.bounty.count({ where }),
    ]);

    return NextResponse.json({
      bounties,
      total,
      page,
      hasMore: page * limit < total,
    });
  } catch (error) {
    console.error("Failed to fetch bounties:", error);
    return NextResponse.json({ bounties: [], total: 0, page, hasMore: false });
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
