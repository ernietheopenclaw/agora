import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const profile = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) {
      return NextResponse.json([]);
    }

    const applications = await prisma.application.findMany({
      where: { creatorId: profile.id },
      include: {
        bounty: {
          select: {
            id: true,
            title: true,
            platform: true,
            budget: true,
            status: true,
            deadline: true,
          },
        },
      },
      orderBy: { appliedAt: "desc" },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error("Failed to fetch applications:", error);
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}
