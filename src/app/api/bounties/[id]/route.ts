import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bounty = await prisma.bounty.findUnique({
      where: { id },
      include: {
        company: { select: { companyName: true, description: true } },
      },
    });

    if (!bounty) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(bounty);
  } catch (error) {
    console.error("Failed to fetch bounty:", error);
    return NextResponse.json({ error: "Failed to fetch bounty" }, { status: 500 });
  }
}
