import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean existing dummy data
  await prisma.payment.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.application.deleteMany();
  await prisma.bounty.deleteMany();
  await prisma.creatorProfile.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.user.deleteMany();

  const password = await hash("password123", 12);

  // --- Companies ---
  const everlane = await prisma.user.create({
    data: {
      email: "hello@everlane.com",
      password,
      role: "company",
      companyProfile: {
        create: {
          companyName: "Everlane",
          website: "https://everlane.com",
          industry: "Fashion",
          description: "[DUMMY] Everlane is a modern essentials brand known for radical transparency in pricing and ethical manufacturing.",
        },
      },
    },
    include: { companyProfile: true },
  });

  const chamberlain = await prisma.user.create({
    data: {
      email: "hello@chamberlaincoffee.com",
      password,
      role: "company",
      companyProfile: {
        create: {
          companyName: "Chamberlain Coffee",
          website: "https://chamberlaincoffee.com",
          industry: "Food & Drink",
          description: "[DUMMY] Chamberlain Coffee offers ethically sourced, high-quality coffee and matcha blends for the modern consumer.",
        },
      },
    },
    include: { companyProfile: true },
  });

  const nothing = await prisma.user.create({
    data: {
      email: "hello@nothing.tech",
      password,
      role: "company",
      companyProfile: {
        create: {
          companyName: "Nothing",
          website: "https://nothing.tech",
          industry: "Tech",
          description: "[DUMMY] Nothing is a consumer tech company building products with iconic design.",
        },
      },
    },
    include: { companyProfile: true },
  });

  const gymshark = await prisma.user.create({
    data: {
      email: "hello@gymshark.com",
      password,
      role: "company",
      companyProfile: {
        create: {
          companyName: "Gymshark",
          website: "https://gymshark.com",
          industry: "Fitness",
          description: "[DUMMY] Gymshark is a fitness apparel brand built by athletes, for athletes.",
        },
      },
    },
    include: { companyProfile: true },
  });

  const away = await prisma.user.create({
    data: {
      email: "hello@awaytravel.com",
      password,
      role: "company",
      companyProfile: {
        create: {
          companyName: "Away",
          website: "https://awaytravel.com",
          industry: "Travel",
          description: "[DUMMY] Away designs thoughtful luggage and travel essentials that make modern travel more seamless.",
        },
      },
    },
    include: { companyProfile: true },
  });

  const ordinary = await prisma.user.create({
    data: {
      email: "hello@theordinary.com",
      password,
      role: "company",
      companyProfile: {
        create: {
          companyName: "The Ordinary",
          website: "https://theordinary.com",
          industry: "Beauty",
          description: "[DUMMY] The Ordinary offers clinical skincare formulations with integrity.",
        },
      },
    },
    include: { companyProfile: true },
  });

  const dailyHarvest = await prisma.user.create({
    data: {
      email: "hello@dailyharvest.com",
      password,
      role: "company",
      companyProfile: {
        create: {
          companyName: "Daily Harvest",
          website: "https://dailyharvest.com",
          industry: "Food & Drink",
          description: "[DUMMY] Daily Harvest delivers chef-crafted, plant-based foods.",
        },
      },
    },
    include: { companyProfile: true },
  });

  const notion = await prisma.user.create({
    data: {
      email: "hello@notion.so",
      password,
      role: "company",
      companyProfile: {
        create: {
          companyName: "Notion",
          website: "https://notion.so",
          industry: "Tech",
          description: "[DUMMY] Notion is the connected workspace where teams organize everything.",
        },
      },
    },
    include: { companyProfile: true },
  });

  const asos = await prisma.user.create({
    data: {
      email: "hello@asos.com",
      password,
      role: "company",
      companyProfile: {
        create: {
          companyName: "ASOS",
          website: "https://asos.com",
          industry: "Fashion",
          description: "[DUMMY] ASOS is a global fashion destination for 20-somethings.",
        },
      },
    },
    include: { companyProfile: true },
  });

  const wildOne = await prisma.user.create({
    data: {
      email: "hello@wildone.com",
      password,
      role: "company",
      companyProfile: {
        create: {
          companyName: "Wild One",
          website: "https://wildone.com",
          industry: "Pets",
          description: "[DUMMY] Wild One creates modern, sustainable pet accessories.",
        },
      },
    },
    include: { companyProfile: true },
  });

  const literal = await prisma.user.create({
    data: {
      email: "hello@literal.club",
      password,
      role: "company",
      companyProfile: {
        create: {
          companyName: "Literal",
          website: "https://literal.club",
          industry: "Lifestyle",
          description: "[DUMMY] Literal is a social reading platform where book lovers track and share.",
        },
      },
    },
    include: { companyProfile: true },
  });

  const deel = await prisma.user.create({
    data: {
      email: "hello@deel.com",
      password,
      role: "company",
      companyProfile: {
        create: {
          companyName: "Deel",
          website: "https://deel.com",
          industry: "Business",
          description: "[DUMMY] Deel is a global payroll and compliance platform.",
        },
      },
    },
    include: { companyProfile: true },
  });

  // --- Creators ---
  await prisma.user.create({
    data: {
      email: "creator1@example.com",
      password,
      role: "creator",
      creatorProfile: {
        create: {
          displayName: "Sarah Chen",
          bio: "[DUMMY] Lifestyle & fashion content creator based in LA.",
          socialLinks: JSON.stringify({ instagram: "@sarahcreates", tiktok: "@sarahcreates" }),
          followerCounts: JSON.stringify({ instagram: 25000, tiktok: 40000 }),
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      email: "creator2@example.com",
      password,
      role: "creator",
      creatorProfile: {
        create: {
          displayName: "Marcus Rivera",
          bio: "[DUMMY] Tech reviewer and productivity nerd.",
          socialLinks: JSON.stringify({ youtube: "@marcusreviews", twitter: "@marcustech" }),
          followerCounts: JSON.stringify({ youtube: 85000, twitter: 12000 }),
        },
      },
    },
  });

  // --- Bounties (matching the 12 hardcoded ones) ---
  const bounties = [
    {
      companyId: everlane.companyProfile!.id,
      title: "Summer Collection Launch — Unboxing Reel",
      description: "[DUMMY] Create an authentic unboxing reel showcasing our new summer linen collection. We're launching our Summer '26 linen collection and want real creators to showcase the unboxing experience. Film yourself receiving and opening the package, trying on 2–3 pieces, and sharing your honest first impressions. The content should feel genuine and unscripted — no polished studio vibes. Natural lighting preferred. We'll ship the collection to you 1 week before the deadline.",
      platform: "Instagram",
      contentType: "Reel",
      niche: "Fashion",
      requirements: "5,000+ Instagram followers\nFashion or lifestyle niche\nMust post as a Reel (not Stories)\nTag @everlane and use #EverlaneLinens\nContent must stay live for 30 days minimum\nNo competing brand mentions within 48 hours",
      budget: 500,
      creatorSlots: 5,
      deadline: new Date("2026-03-15"),
      allowResubmission: false,
      status: "open",
    },
    {
      companyId: chamberlain.companyProfile!.id,
      title: "Morning Routine ft. Our Matcha Blend",
      description: "[DUMMY] Film a cozy morning routine naturally featuring our new ceremonial matcha. We want creators to film a 60–90 second morning routine TikTok that naturally incorporates our new Ceremonial Grade Matcha. The vibe should be calm, aesthetic, and cozy — think soft lighting, morning sounds, slow movements.",
      platform: "TikTok",
      contentType: "Video",
      niche: "Food & Drink",
      requirements: "3,000+ TikTok followers\nFood, lifestyle, or wellness niche\n60–90 second video length\nMust show the product packaging clearly at least once\nUse original audio or trending calm/lo-fi sound\nPost within 48 hours of approval",
      budget: 350,
      creatorSlots: 8,
      deadline: new Date("2026-03-10"),
      allowResubmission: false,
      status: "open",
    },
    {
      companyId: nothing.companyProfile!.id,
      title: "Honest Review — Wireless Earbuds Pro",
      description: "[DUMMY] Produce a detailed, honest review of the Nothing Ear (3) with real-world testing. We're looking for tech creators to produce a comprehensive, honest review covering sound quality, ANC performance, comfort, battery life, and the companion app. Comparisons with competitors are welcome.",
      platform: "YouTube",
      contentType: "Video",
      niche: "Tech",
      requirements: "10,000+ YouTube subscribers\nTech review channel with consistent uploads\n8–15 minute video length\nB-roll of the product required\nMust disclose sponsorship per FTC guidelines\nInclude chapters/timestamps in the description",
      budget: 1200,
      creatorSlots: 3,
      deadline: new Date("2026-04-01"),
      allowResubmission: true,
      status: "open",
    },
    {
      companyId: gymshark.companyProfile!.id,
      title: "Gym Fit Check with Performance Wear",
      description: "[DUMMY] Show off your gym outfit featuring our new Vital collection in a fit check video. Film a trending fit check TikTok at the gym wearing our new Vital Seamless collection. Start with the outfit reveal, then show 2–3 exercises.",
      platform: "TikTok",
      contentType: "Video",
      niche: "Fitness",
      requirements: "5,000+ TikTok followers\nFitness or gym content creator\nMust film in a gym setting\nTag @gymshark and use #GymsharkVital\n15–45 second video\nNo competitor apparel visible",
      budget: 400,
      creatorSlots: 10,
      deadline: new Date("2026-03-08"),
      allowResubmission: false,
      status: "open",
    },
    {
      companyId: away.companyProfile!.id,
      title: "Travel Vlog — Weekend with Our Carry-On",
      description: "[DUMMY] Document a weekend trip using our Bigger Carry-On as your only luggage. Show your packing process, navigate the airport, and film moments from your trip where the luggage naturally appears. We'll provide the luggage in your choice of color. You choose the destination.",
      platform: "YouTube",
      contentType: "Video",
      niche: "Travel",
      requirements: "15,000+ YouTube subscribers\nTravel or lifestyle content creator\n10–20 minute vlog format\nMust show packing process and airport scenes\nMention the built-in charger and compression system\nContent must remain live for 90 days",
      budget: 1500,
      creatorSlots: 2,
      deadline: new Date("2026-04-15"),
      allowResubmission: true,
      status: "open",
    },
    {
      companyId: ordinary.companyProfile!.id,
      title: "Skincare Night Routine — Before & After",
      description: "[DUMMY] Create a calming PM skincare routine reel featuring our new retinol serum. Walk viewers through your full PM routine, with our serum as a key step. Show the product texture, application method, and explain briefly why you use retinol.",
      platform: "Instagram",
      contentType: "Reel",
      niche: "Beauty",
      requirements: "3,000+ Instagram followers\nBeauty or skincare focused account\nMust use the product for at least 1 week before filming\nShow the product label clearly\nInclude basic retinol usage tips in caption\nNo filter on skin close-ups",
      budget: 300,
      creatorSlots: 6,
      deadline: new Date("2026-03-12"),
      allowResubmission: false,
      status: "open",
    },
    {
      companyId: dailyHarvest.companyProfile!.id,
      title: "Recipe Video — Plant-Based Meal Prep",
      description: "[DUMMY] Show a week of plant-based meal prep using Daily Harvest as a base. Feature at least 3 different products and show how you customize or build on them. The tone should be practical and relatable.",
      platform: "TikTok",
      contentType: "Video",
      niche: "Food & Drink",
      requirements: "5,000+ TikTok followers\nFood, health, or lifestyle niche\nFeature at least 3 Daily Harvest products\n60–120 second video\nShow preparation and final plating\nUse #DailyHarvestPrep",
      budget: 450,
      creatorSlots: 5,
      deadline: new Date("2026-03-20"),
      allowResubmission: false,
      status: "open",
    },
    {
      companyId: notion.companyProfile!.id,
      title: "Productivity Setup Tour — Home Office",
      description: "[DUMMY] Give a tour of your home office/productivity setup with Notion as your hub. Walk viewers through your physical setup, then transition into how you organize your work digitally with Notion as your central hub.",
      platform: "YouTube",
      contentType: "Video",
      niche: "Tech",
      requirements: "8,000+ YouTube subscribers\nProductivity, tech, or creator-focused channel\n8–12 minute video\nScreen recording of your actual Notion setup\nInclude a link to your Notion template\nMention Notion's free tier",
      budget: 800,
      creatorSlots: 4,
      deadline: new Date("2026-04-05"),
      allowResubmission: true,
      status: "open",
    },
    {
      companyId: asos.companyProfile!.id,
      title: "OOTD Series — Streetwear Drops",
      description: "[DUMMY] Style 3 outfits using pieces from our new streetwear drop for a carousel post. Each slide should show a full outfit with a different vibe. Your styling should reflect your personal taste.",
      platform: "Instagram",
      contentType: "Carousel",
      niche: "Fashion",
      requirements: "3,000+ Instagram followers\nFashion or streetwear niche\nMinimum 6 slides in carousel\nTag @asos on every image\nInclude product links in caption or Stories\nShot in natural environments (not studio)",
      budget: 250,
      creatorSlots: 8,
      deadline: new Date("2026-03-18"),
      allowResubmission: false,
      status: "open",
    },
    {
      companyId: wildOne.companyProfile!.id,
      title: "Dog Park Day with Sustainable Gear",
      description: "[DUMMY] Film a fun dog park day featuring our harness, leash, and treat pouch. The video should capture genuine fun moments — playing fetch, meeting other dogs, treats, and the walk there and back.",
      platform: "TikTok",
      contentType: "Video",
      niche: "Pets",
      requirements: "3,000+ TikTok followers\nPet, lifestyle, or outdoor content\nMust feature all three products\n30–60 second video\nDog must be comfortable and safe at all times\nTag @wildone and use #WildOneAdventures",
      budget: 350,
      creatorSlots: 6,
      deadline: new Date("2026-03-25"),
      allowResubmission: false,
      status: "open",
    },
    {
      companyId: literal.companyProfile!.id,
      title: "Reading Vlog — Monthly Book Picks",
      description: "[DUMMY] Share your monthly reading picks and how you track them on Literal. Film a monthly reading wrap-up video where you discuss 3–5 books and show how you use Literal to track and organize your reading.",
      platform: "YouTube",
      contentType: "Video",
      niche: "Lifestyle",
      requirements: "5,000+ YouTube subscribers\nBookTube, lifestyle, or education channel\nDiscuss at least 3 books\nShow Literal app/website on screen\nInclude your Literal profile link in description\n8–15 minute video",
      budget: 600,
      creatorSlots: 4,
      deadline: new Date("2026-04-10"),
      allowResubmission: false,
      status: "open",
    },
    {
      companyId: deel.companyProfile!.id,
      title: "Thread on Future of Remote Work",
      description: "[DUMMY] Write an insightful thread about the future of remote work, tagging Deel naturally. Cover trends, challenges, and opportunities. The thread should be genuinely insightful, not promotional.",
      platform: "Twitter/X",
      contentType: "Thread",
      niche: "Business",
      requirements: "2,000+ Twitter/X followers\nBusiness, tech, or future-of-work niche\n8–12 tweets in thread\nTag @deel in 1–2 tweets maximum\nInclude at least 2 data points or statistics\nNo direct competitor mentions",
      budget: 200,
      creatorSlots: 3,
      deadline: new Date("2026-03-05"),
      allowResubmission: false,
      status: "open",
    },
  ];

  for (const b of bounties) {
    await prisma.bounty.create({ data: b });
  }

  console.log("✅ Seed complete: 12 companies, 2 creators, 12 bounties");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
