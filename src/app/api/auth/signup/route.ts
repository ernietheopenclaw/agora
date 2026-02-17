import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["creator", "company"], { message: "Role must be creator or company" }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      const messages = parsed.error.issues.map((e) => e.message);
      return NextResponse.json({ error: messages.join(", ") }, { status: 400 });
    }

    const { email, password, role } = parsed.data;
    const { email: _, password: _p, role: _r, ...profileData } = body as Record<string, any>;

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
  } catch (error: unknown) {
    console.error("Signup error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    if (message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error", detail: process.env.NODE_ENV === "development" ? message : undefined }, { status: 500 });
  }
}
