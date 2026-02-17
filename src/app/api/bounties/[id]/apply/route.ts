import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "CREATOR") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  try {
    const profile = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) {
      return NextResponse.json({ error: "Creator profile not found" }, { status: 400 });
    }

    const existing = await prisma.application.findUnique({
      where: { bountyId_creatorId: { bountyId: id, creatorId: profile.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Already applied" }, { status: 409 });
    }

    const application = await prisma.application.create({
      data: {
        bountyId: id,
        creatorId: profile.id,
        pitch: body.pitch || null,
        proposedRate: body.proposedRate ? parseFloat(body.proposedRate) : null,
        portfolioLink: body.portfolioLink || null,
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error("Failed to apply:", error);
    return NextResponse.json({ error: "Failed to apply" }, { status: 500 });
  }
}
