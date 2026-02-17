import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { creatorProfile: true, companyProfile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "creator" && user.creatorProfile) {
      const creatorId = user.creatorProfile.id;

      const [totalApplications, pendingApplications, acceptedApplications, submissions, payments] =
        await Promise.all([
          prisma.application.count({ where: { creatorId } }),
          prisma.application.count({ where: { creatorId, status: "pending" } }),
          prisma.application.count({ where: { creatorId, status: "accepted" } }),
          prisma.submission.count({
            where: { application: { creatorId } },
          }),
          prisma.payment.aggregate({
            where: {
              status: "completed",
              submission: { application: { creatorId } },
            },
            _sum: { amount: true },
          }),
        ]);

      const acceptanceRate =
        totalApplications > 0
          ? Math.round((acceptedApplications / totalApplications) * 100)
          : 0;

      return NextResponse.json({
        role: "creator",
        stats: {
          totalApplications,
          pendingApplications,
          acceptedApplications,
          totalEarnings: payments._sum.amount || 0,
          submissions,
          acceptanceRate,
        },
      });
    }

    if (user.role === "company" && user.companyProfile) {
      const companyId = user.companyProfile.id;

      const [totalBounties, activeBounties, totalApplications, totalSpent, creatorsHired] =
        await Promise.all([
          prisma.bounty.count({ where: { companyId } }),
          prisma.bounty.count({
            where: { companyId, deadline: { gte: new Date() }, status: "open" },
          }),
          prisma.application.count({
            where: { bounty: { companyId } },
          }),
          prisma.payment.aggregate({
            where: {
              status: "completed",
              submission: { application: { bounty: { companyId } } },
            },
            _sum: { amount: true },
          }),
          prisma.application.findMany({
            where: { bounty: { companyId }, status: "accepted" },
            select: { creatorId: true },
            distinct: ["creatorId"],
          }),
        ]);

      return NextResponse.json({
        role: "company",
        stats: {
          totalBounties,
          activeBounties,
          totalApplications,
          totalSpent: totalSpent._sum.amount || 0,
          creatorsHired: creatorsHired.length,
        },
      });
    }

    return NextResponse.json({ role: user.role, stats: {} });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json({
      role: "unknown",
      stats: {
        totalApplications: 0,
        pendingApplications: 0,
        acceptedApplications: 0,
        totalEarnings: 0,
        submissions: 0,
        acceptanceRate: 0,
        totalBounties: 0,
        activeBounties: 0,
        totalSpent: 0,
        creatorsHired: 0,
      },
    });
  }
}
