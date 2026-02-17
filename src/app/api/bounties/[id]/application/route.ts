import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ applied: false });
  }

  const { id } = await params;

  try {
    const profile = await prisma.creatorProfile.findUnique({
      where: { userId: session.user.id },
    });
    if (!profile) {
      return NextResponse.json({ applied: false });
    }

    const application = await prisma.application.findUnique({
      where: { bountyId_creatorId: { bountyId: id, creatorId: profile.id } },
    });

    return NextResponse.json({ applied: !!application, application });
  } catch {
    return NextResponse.json({ applied: false });
  }
}
