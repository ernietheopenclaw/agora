import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";
import { NextResponse } from "next/server";

const MAX_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { avatar } = body as { avatar: string };

  if (!avatar || !avatar.startsWith("data:image/")) {
    return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
  }

  // Rough base64 size check (base64 is ~4/3 of original)
  const base64Part = avatar.split(",")[1] || "";
  const sizeBytes = Math.ceil(base64Part.length * 0.75);
  if (sizeBytes > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 2MB)" }, { status: 413 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { creatorProfile: true },
  });

  if (!user?.creatorProfile) {
    return NextResponse.json({ error: "No creator profile" }, { status: 404 });
  }

  await prisma.creatorProfile.update({
    where: { userId: user.id },
    data: { avatar },
  });

  return NextResponse.json({ success: true });
}
