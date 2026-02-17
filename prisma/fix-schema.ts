import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Check existing columns
  const cols: any[] = await prisma.$queryRawUnsafe(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'Bounty'`
  );
  const colNames = cols.map((c: any) => c.column_name);
  console.log("Existing columns:", colNames);

  const needed = [
    { name: "payPerImpression", sql: `ALTER TABLE "Bounty" ADD COLUMN IF NOT EXISTS "payPerImpression" TEXT` },
    { name: "payType", sql: `ALTER TABLE "Bounty" ADD COLUMN IF NOT EXISTS "payType" TEXT DEFAULT 'fixed'` },
    { name: "minFollowers", sql: `ALTER TABLE "Bounty" ADD COLUMN IF NOT EXISTS "minFollowers" INTEGER DEFAULT 0` },
    { name: "creatorSlots", sql: `ALTER TABLE "Bounty" ADD COLUMN IF NOT EXISTS "creatorSlots" INTEGER DEFAULT 1` },
    { name: "allowResubmission", sql: `ALTER TABLE "Bounty" ADD COLUMN IF NOT EXISTS "allowResubmission" BOOLEAN DEFAULT false` },
    { name: "niche", sql: `ALTER TABLE "Bounty" ADD COLUMN IF NOT EXISTS "niche" TEXT` },
  ];

  for (const col of needed) {
    if (!colNames.includes(col.name)) {
      console.log(`Adding column: ${col.name}`);
      await prisma.$executeRawUnsafe(col.sql);
    } else {
      console.log(`Column exists: ${col.name}`);
    }
  }
  console.log("Done!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
