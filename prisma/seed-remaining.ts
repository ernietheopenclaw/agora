import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();

const platforms = ["Instagram", "TikTok", "YouTube", "Twitter/X"];
const niches = ["Fashion", "Food & Drink", "Tech", "Fitness", "Travel", "Beauty", "Pets", "Lifestyle", "Business"];
const contentTypes = ["Story", "Reel", "Video", "Post", "Review", "Unboxing", "Tutorial"];
const titles = [
  "Brand Story Reel", "Product Deep Dive", "Taste Test Challenge", "Gym Fit Check",
  "Travel Packing Tips", "Skincare GRWM", "Pet Day Out", "Workspace Tour",
  "Cozy Home Vibes", "Street Style Edit", "Morning Routine", "Honest Review",
  "Day in My Life", "Cooking Session", "Book Club Picks", "Meditation Journey",
  "Finance Tips Thread", "Unboxing Haul", "Tutorial Series", "Behind the Scenes",
];

async function go() {
  const companies = await p.companyProfile.findMany({ select: { id: true } });
  const current = await p.bounty.count();
  const needed = 200 - current;
  if (needed <= 0) { console.log(`Already have ${current} bounties.`); process.exit(0); }
  console.log(`Have ${current}, creating ${needed} more...`);

  for (let i = 0; i < needed; i++) {
    const co = companies[Math.floor(Math.random() * companies.length)];
    const days = 7 + Math.floor(Math.random() * 83);
    const d = new Date(); d.setDate(d.getDate() + days);
    const budget = 200 + Math.floor(Math.random() * 14800);
    const title = titles[Math.floor(Math.random() * titles.length)] + ` #${current + i + 1}`;
    await p.bounty.create({ data: {
      companyId: co.id,
      title,
      description: "Campaign bounty for content creators. See requirements for details.",
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      contentType: contentTypes[Math.floor(Math.random() * contentTypes.length)],
      niche: niches[Math.floor(Math.random() * niches.length)],
      requirements: "1000+ followers\nMust tag brand\nContent stays live 30 days",
      budget,
      payType: "fixed",
      payPerImpression: Math.random() > 0.5 ? `$${(1 + Math.random() * 4).toFixed(2)}/1K` : null,
      minFollowers: [500, 1000, 3000, 5000, 10000, 25000, 50000][Math.floor(Math.random() * 7)],
      creatorSlots: 1 + Math.floor(Math.random() * 15),
      deadline: d,
      status: "open",
    }});
    if ((i + 1) % 10 === 0) console.log(`  → ${i + 1}/${needed}`);
  }
  const total = await p.bounty.count();
  console.log(`✅ Done. Total bounties: ${total}`);
  process.exit(0);
}
go();
