import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, role, ...profileData } = body;

    if (!email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashed = await hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        role,
        ...(role === "company"
          ? {
              companyProfile: {
                create: {
                  companyName: profileData.companyName || "",
                  website: profileData.website || null,
                  industry: profileData.industry || null,
                },
              },
            }
          : {
              creatorProfile: {
                create: {
                  displayName: profileData.displayName || "",
                  bio: profileData.bio || null,
                  socialLinks: profileData.socialLinks ? JSON.stringify(profileData.socialLinks) : null,
                },
              },
            }),
      },
    });

    return NextResponse.json({ id: user.id, email: user.email, role: user.role }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
