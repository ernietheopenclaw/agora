import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { creatorProfile: true, companyProfile: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const displayName =
    user.creatorProfile?.displayName ||
    user.companyProfile?.companyName ||
    user.email;

  return NextResponse.json({
    email: user.email,
    role: user.role,
    displayName,
    bio: user.creatorProfile?.bio || "",
    tiktokHandle: user.creatorProfile?.tiktokHandle || "",
    instagramHandle: user.creatorProfile?.instagramHandle || "",
    youtubeHandle: user.creatorProfile?.youtubeHandle || "",
    xHandle: user.creatorProfile?.xHandle || "",
    hasCreatorProfile: !!user.creatorProfile,
  });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { displayName, bio, tiktokHandle, instagramHandle, youtubeHandle, xHandle } = body;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { creatorProfile: true, companyProfile: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Update or create creator profile with social handles
  if (user.creatorProfile) {
    await prisma.creatorProfile.update({
      where: { userId: user.id },
      data: {
        displayName: displayName || user.creatorProfile.displayName,
        bio: bio !== undefined ? bio : user.creatorProfile.bio,
        tiktokHandle: tiktokHandle || null,
        instagramHandle: instagramHandle || null,
        youtubeHandle: youtubeHandle || null,
        xHandle: xHandle || null,
      },
    });
  } else if (user.role.toUpperCase() === "CREATOR") {
    await prisma.creatorProfile.create({
      data: {
        userId: user.id,
        displayName: displayName || user.email,
        bio: bio || null,
        tiktokHandle: tiktokHandle || null,
        instagramHandle: instagramHandle || null,
        youtubeHandle: youtubeHandle || null,
        xHandle: xHandle || null,
      },
    });
  }

  // Update company name if company user
  if (user.companyProfile && displayName) {
    await prisma.companyProfile.update({
      where: { userId: user.id },
      data: { companyName: displayName },
    });
  }

  return NextResponse.json({ success: true });
}
