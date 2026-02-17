import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

// ── Brand data ──────────────────────────────────────────────────────
const BRANDS = [
  { name: "Everlane", email: "hello@everlane.com", website: "https://everlane.com", industry: "Fashion", desc: "Modern essentials brand known for radical transparency in pricing and ethical manufacturing." },
  { name: "Chamberlain Coffee", email: "hello@chamberlaincoffee.com", website: "https://chamberlaincoffee.com", industry: "Food & Drink", desc: "Ethically sourced, high-quality coffee and matcha blends for the modern consumer." },
  { name: "Nothing", email: "hello@nothing.tech", website: "https://nothing.tech", industry: "Tech", desc: "Consumer tech company building products with iconic design and removing barriers between people and technology." },
  { name: "Gymshark", email: "hello@gymshark.com", website: "https://gymshark.com", industry: "Fitness", desc: "Fitness apparel brand built by athletes, for athletes — focused on performance, fit, and community." },
  { name: "Away", email: "hello@awaytravel.com", website: "https://awaytravel.com", industry: "Travel", desc: "Thoughtful luggage and travel essentials that make modern travel more seamless." },
  { name: "The Ordinary", email: "hello@theordinary.com", website: "https://theordinary.com", industry: "Beauty", desc: "Clinical skincare formulations with integrity, providing effective solutions at honest prices." },
  { name: "Daily Harvest", email: "hello@dailyharvest.com", website: "https://dailyharvest.com", industry: "Food & Drink", desc: "Chef-crafted, plant-based foods built on organic fruits and vegetables." },
  { name: "Notion", email: "hello@notion.so", website: "https://notion.so", industry: "Tech", desc: "Connected workspace where teams and individuals organize docs, projects, wikis, and more." },
  { name: "ASOS", email: "hello@asos.com", website: "https://asos.com", industry: "Fashion", desc: "Global fashion destination for 20-somethings, offering the latest trends across thousands of brands." },
  { name: "Wild One", email: "hello@wildone.com", website: "https://wildone.com", industry: "Pets", desc: "Modern, sustainable pet accessories designed for dogs who go everywhere with their humans." },
  { name: "Literal", email: "hello@literal.club", website: "https://literal.club", industry: "Lifestyle", desc: "Social reading platform where book lovers track, share, and discuss what they're reading." },
  { name: "Deel", email: "hello@deel.com", website: "https://deel.com", industry: "Business", desc: "Global payroll and compliance platform helping companies hire anyone, anywhere." },
  { name: "Nike", email: "brands@nike.com", website: "https://nike.com", industry: "Fitness", desc: "World's leading athletic brand, inspiring athletes everywhere with innovative products." },
  { name: "Patagonia", email: "hello@patagonia.com", website: "https://patagonia.com", industry: "Fashion", desc: "Builds the best product, causes no unnecessary harm, and uses business to inspire environmental solutions." },
  { name: "Sonos", email: "hello@sonos.com", website: "https://sonos.com", industry: "Tech", desc: "Premium wireless speakers and home sound systems that fill every room with brilliant sound." },
  { name: "Calm", email: "hello@calm.com", website: "https://calm.com", industry: "Lifestyle", desc: "The #1 app for mental fitness, with guided meditations, sleep stories, and relaxation programs." },
  { name: "GitHub", email: "hello@github.com", website: "https://github.com", industry: "Tech", desc: "World's leading platform for software development collaboration, hosting over 100 million repositories." },
  { name: "Oatly", email: "hello@oatly.com", website: "https://oatly.com", industry: "Food & Drink", desc: "Oat-based drinks designed to be better for the planet and better for people." },
  { name: "Graze", email: "hello@graze.com", website: "https://graze.com", industry: "Food & Drink", desc: "Exciting, nutritious snack boxes delivered to your door — healthy snacking done right." },
  { name: "Strava", email: "hello@strava.com", website: "https://strava.com", industry: "Fitness", desc: "Social network for athletes, connecting millions of runners and cyclists through GPS tracking." },
  { name: "Allbirds", email: "hello@allbirds.com", website: "https://allbirds.com", industry: "Fashion", desc: "Sustainable footwear brand crafting comfortable shoes from natural materials like merino wool and eucalyptus." },
  { name: "Canva", email: "hello@canva.com", website: "https://canva.com", industry: "Tech", desc: "Online design platform empowering anyone to create stunning graphics, presentations, and social media content." },
  { name: "HelloFresh", email: "hello@hellofresh.com", website: "https://hellofresh.com", industry: "Food & Drink", desc: "Meal kit delivery service bringing pre-portioned ingredients and chef-designed recipes to your door." },
  { name: "Peloton", email: "hello@peloton.com", website: "https://onepeloton.com", industry: "Fitness", desc: "Connected fitness platform offering world-class cycling, running, and strength classes from home." },
  { name: "Airbnb", email: "brands@airbnb.com", website: "https://airbnb.com", industry: "Travel", desc: "Global travel community marketplace offering unique stays and experiences around the world." },
  { name: "Glossier", email: "hello@glossier.com", website: "https://glossier.com", industry: "Beauty", desc: "Beauty brand inspired by real life, creating skincare and makeup that celebrates real skin." },
  { name: "BarkBox", email: "hello@barkbox.com", website: "https://barkbox.com", industry: "Pets", desc: "Monthly subscription of toys, treats, and chews for dogs — themed boxes that bring joy to pups everywhere." },
  { name: "Headspace", email: "hello@headspace.com", website: "https://headspace.com", industry: "Lifestyle", desc: "Meditation and mindfulness app helping millions sleep, stress less, and focus more." },
  { name: "Shopify", email: "hello@shopify.com", website: "https://shopify.com", industry: "Business", desc: "Commerce platform powering millions of businesses worldwide, from first sale to full scale." },
  { name: "Lululemon", email: "hello@lululemon.com", website: "https://lululemon.com", industry: "Fitness", desc: "Athletic apparel company creating technical fabrics and functional designs for yoga, running, and training." },
  { name: "Samsung", email: "brands@samsung.com", website: "https://samsung.com", industry: "Tech", desc: "Global technology leader in smartphones, TVs, and home appliances driving innovation across categories." },
  { name: "Booking.com", email: "brands@booking.com", website: "https://booking.com", industry: "Travel", desc: "World's leading digital travel platform connecting travelers with accommodations and experiences worldwide." },
  { name: "Fenty Beauty", email: "hello@fentybeauty.com", website: "https://fentybeauty.com", industry: "Beauty", desc: "Inclusive beauty brand by Rihanna offering makeup and skincare for all skin tones." },
  { name: "Chewy", email: "hello@chewy.com", website: "https://chewy.com", industry: "Pets", desc: "Online retailer of pet food and products, known for exceptional customer service and pet parent community." },
  { name: "Stripe", email: "hello@stripe.com", website: "https://stripe.com", industry: "Business", desc: "Financial infrastructure platform helping businesses of every size accept payments and manage operations online." },
  { name: "Revolut", email: "hello@revolut.com", website: "https://revolut.com", industry: "Business", desc: "Digital banking app offering currency exchange, crypto, stock trading, and budgeting tools for the modern consumer." },
  { name: "Dyson", email: "brands@dyson.com", website: "https://dyson.com", industry: "Tech", desc: "Engineering technology company known for innovative vacuums, air purifiers, and hair care products." },
  { name: "SKIMS", email: "hello@skims.com", website: "https://skims.com", industry: "Fashion", desc: "Solutions-oriented brand creating the next generation of shapewear, underwear, and loungewear." },
  { name: "Huel", email: "hello@huel.com", website: "https://huel.com", industry: "Food & Drink", desc: "Nutritionally complete food brand offering convenient, affordable meals with minimal environmental impact." },
  { name: "Osprey", email: "hello@osprey.com", website: "https://osprey.com", industry: "Travel", desc: "Premium backpack and travel gear company with decades of expertise in carrying comfort and durability." },
];

// ── Bounty templates ────────────────────────────────────────────────
interface BountyTemplate {
  title: string;
  platform: string;
  contentType: string;
  niche: string;
  description: string;
  fullDescription: string;
  requirements: string[];
  budgetRange: [number, number];
  payPerImpression: string | null;
  minFollowers: number;
  creatorSlots: number;
  deadlineDaysRange: [number, number];
}

const TEMPLATES: BountyTemplate[] = [
  // Fashion
  { title: "Summer Collection Launch — Unboxing Reel", platform: "Instagram", contentType: "Reel", niche: "Fashion", description: "Create an authentic unboxing reel showcasing our new summer collection.", fullDescription: "We're launching our Summer '26 collection and want real creators to showcase the unboxing experience. Film yourself receiving and opening the package, trying on 2–3 pieces, and sharing your honest first impressions. Natural lighting preferred.", requirements: ["5,000+ Instagram followers", "Fashion or lifestyle niche", "Must post as a Reel", "Tag the brand and use campaign hashtag", "Content must stay live for 30 days"], budgetRange: [400, 800], payPerImpression: "$2.50/1K", minFollowers: 5000, creatorSlots: 5, deadlineDaysRange: [14, 45] },
  { title: "OOTD Series — New Drop Carousel", platform: "Instagram", contentType: "Post", niche: "Fashion", description: "Style 3 outfits from our latest drop for a carousel post.", fullDescription: "Create a carousel post featuring 3 styled outfits using pieces from our latest collection. Each slide should show a full outfit with a different vibe. Your styling should reflect your personal taste — we want diversity.", requirements: ["3,000+ Instagram followers", "Fashion niche", "Minimum 6 slides", "Tag brand on every image", "Shot in natural environments"], budgetRange: [200, 500], payPerImpression: "$1.50/1K", minFollowers: 3000, creatorSlots: 8, deadlineDaysRange: [10, 30] },
  { title: "Sustainable Fashion Haul — Secondhand Edition", platform: "YouTube", contentType: "Video", niche: "Fashion", description: "Showcase our sustainable line — repair, reuse, and conscious fashion choices.", fullDescription: "Create a YouTube video exploring our sustainable fashion program. Show the quality and condition, style items into outfits, and discuss the environmental impact of secondhand vs new clothing. Genuine passion for sustainability is a must.", requirements: ["50,000+ YouTube subscribers", "Sustainability or fashion niche", "10–15 minute video", "Include environmental impact stats", "Must disclose partnership per FTC guidelines"], budgetRange: [1500, 3000], payPerImpression: "$3.00/1K", minFollowers: 50000, creatorSlots: 2, deadlineDaysRange: [30, 60] },
  { title: "Try-On Haul — Spring Essentials", platform: "TikTok", contentType: "Video", niche: "Fashion", description: "Film a try-on haul featuring 5+ spring pieces from our collection.", fullDescription: "Show off our spring collection in a try-on haul format. Try on at least 5 pieces, give your honest reaction to each, and rate them. Keep it genuine and fun — we want real opinions, not scripted endorsements.", requirements: ["10,000+ TikTok followers", "Fashion content creator", "60–90 second video", "Show each piece clearly", "Use trending audio"], budgetRange: [300, 700], payPerImpression: "$2.00/1K", minFollowers: 10000, creatorSlots: 10, deadlineDaysRange: [14, 35] },
  { title: "Capsule Wardrobe Challenge — 10 Pieces, 20 Outfits", platform: "YouTube", contentType: "Video", niche: "Fashion", description: "Build a capsule wardrobe using our essentials and style 20 unique outfits.", fullDescription: "Select 10 of our essential pieces and create 20 different outfit combinations. Film the process of choosing, mixing, and matching. Show how versatile the pieces are for different occasions — work, casual, date night, weekend.", requirements: ["20,000+ YouTube subscribers", "Fashion or minimalism niche", "12–18 minute video", "Show all 20 outfit combinations", "Include links in description"], budgetRange: [800, 1500], payPerImpression: "$2.50/1K", minFollowers: 20000, creatorSlots: 3, deadlineDaysRange: [21, 50] },
  { title: "Street Style Lookbook — City Edition", platform: "TikTok", contentType: "Video", niche: "Fashion", description: "Create a street style lookbook featuring our pieces in iconic city locations.", fullDescription: "Film a trending street style video showing 3–4 looks in recognizable city locations. Each transition should reveal a new outfit. The vibe should be cinematic and aspirational but still accessible.", requirements: ["25,000+ TikTok followers", "Fashion or streetwear niche", "30–60 second video", "High-quality transitions", "Tag brand"], budgetRange: [500, 1200], payPerImpression: "$3.00/1K", minFollowers: 25000, creatorSlots: 5, deadlineDaysRange: [14, 40] },

  // Food & Drink
  { title: "Morning Routine ft. Our Product", platform: "TikTok", contentType: "Video", niche: "Food & Drink", description: "Film a cozy morning routine naturally featuring our product.", fullDescription: "Film a 60–90 second morning routine TikTok that naturally incorporates our product. The vibe should be calm, aesthetic, and cozy — think soft lighting, morning sounds, slow movements. No hard sell — just let the product be part of your morning.", requirements: ["3,000+ TikTok followers", "Food or lifestyle niche", "60–90 second video", "Show product packaging clearly", "Use calm/lo-fi audio"], budgetRange: [250, 500], payPerImpression: "$2.00/1K", minFollowers: 3000, creatorSlots: 8, deadlineDaysRange: [10, 30] },
  { title: "Recipe Video — Meal Prep Edition", platform: "TikTok", contentType: "Video", niche: "Food & Drink", description: "Show a week of meal prep using our products as a base.", fullDescription: "Create a meal prep TikTok showing how you use our products as the foundation for a week of eating. Feature at least 3 different products and show how you customize them. Practical and relatable tone.", requirements: ["5,000+ TikTok followers", "Food or health niche", "60–120 second video", "Feature at least 3 products", "Show preparation and plating"], budgetRange: [350, 600], payPerImpression: "$2.50/1K", minFollowers: 5000, creatorSlots: 5, deadlineDaysRange: [14, 35] },
  { title: "Unbox & Taste Test — Snack Box Review", platform: "TikTok", contentType: "Video", niche: "Food & Drink", description: "Unbox and taste-test our snack box with genuine reactions.", fullDescription: "Receive our snack box, film yourself unboxing and taste-testing each item with genuine reactions. Rate each snack out of 10 and pick your favorite. Perfect for creators building their portfolio.", requirements: ["500+ TikTok followers", "Any niche", "15–45 second video", "Show genuine taste reactions", "Tag brand"], budgetRange: [75, 200], payPerImpression: "$1.00/1K", minFollowers: 500, creatorSlots: 20, deadlineDaysRange: [7, 21] },
  { title: "Date Night Cooking — Couples Edition", platform: "Instagram", contentType: "Reel", niche: "Food & Drink", description: "Cook a romantic dinner for two using our ingredients and meal kit.", fullDescription: "Film a couples cooking Reel where you and your partner prepare a romantic dinner using our meal kit. Show the process from unboxing to plating, with natural interactions and genuine reactions to the food.", requirements: ["8,000+ Instagram followers", "Food or couples content", "30–60 second Reel", "Show the full cooking process", "Tag brand and partner"], budgetRange: [400, 800], payPerImpression: "$2.00/1K", minFollowers: 8000, creatorSlots: 6, deadlineDaysRange: [14, 40] },
  { title: "Coffee Shop Ambiance — Lo-Fi Study Session", platform: "YouTube", contentType: "Video", niche: "Food & Drink", description: "Film a cozy study/work session at a coffee shop featuring our drink.", fullDescription: "Create a lo-fi study/work session video at your local coffee shop. Order your drink featuring our product, set up your workspace, and film a calming session. Subtle product placement, not a review.", requirements: ["5,000+ YouTube subscribers", "Study or lifestyle niche", "20–45 minute ambient video", "Show product naturally", "Lo-fi background music"], budgetRange: [200, 400], payPerImpression: "$1.00/1K", minFollowers: 5000, creatorSlots: 4, deadlineDaysRange: [14, 30] },
  { title: "Smoothie Bowl Art — Aesthetic Morning", platform: "Instagram", contentType: "Reel", niche: "Food & Drink", description: "Create a stunning smoothie bowl using our superfood blend.", fullDescription: "Film the process of making a beautiful smoothie bowl using our product. Focus on the aesthetic — vibrant colors, artistic toppings, satisfying pouring shots. ASMR-friendly with natural sounds.", requirements: ["2,000+ Instagram followers", "Food or wellness niche", "15–30 second Reel", "Show the product in use", "Aesthetic presentation required"], budgetRange: [150, 350], payPerImpression: "$1.50/1K", minFollowers: 2000, creatorSlots: 10, deadlineDaysRange: [10, 25] },

  // Tech
  { title: "Honest Review — Product Deep Dive", platform: "YouTube", contentType: "Video", niche: "Tech", description: "Produce a detailed, honest review with real-world testing.", fullDescription: "Produce a comprehensive, honest review with real-world testing across multiple scenarios. Cover performance, build quality, features, and value. We genuinely want honest feedback — if something isn't great, say so.", requirements: ["10,000+ YouTube subscribers", "Tech review channel", "8–15 minute video", "B-roll of product required", "Must disclose sponsorship per FTC guidelines"], budgetRange: [800, 2000], payPerImpression: "$3.50/1K", minFollowers: 10000, creatorSlots: 3, deadlineDaysRange: [21, 50] },
  { title: "Productivity Setup Tour — Home Office", platform: "YouTube", contentType: "Video", niche: "Tech", description: "Tour your home office/productivity setup featuring our product as your hub.", fullDescription: "Film a home office/desk setup tour focusing on your digital productivity system. Walk viewers through your physical setup, then transition into how you use our product. Show your actual workflows — not a template demo.", requirements: ["8,000+ YouTube subscribers", "Productivity or tech channel", "8–12 minute video", "Screen recording of actual setup", "Mention free tier/trial"], budgetRange: [600, 1200], payPerImpression: "$3.00/1K", minFollowers: 8000, creatorSlots: 4, deadlineDaysRange: [21, 45] },
  { title: "Smart Home Tour — Voice Control Everything", platform: "TikTok", contentType: "Video", niche: "Tech", description: "Tour your smart home setup featuring our product with voice integration.", fullDescription: "Film a smart home tour TikTok showcasing how our product integrates with your setup. Show multi-room functionality, voice commands, and how it fits your daily routine. Premium quality expected.", requirements: ["100,000+ TikTok followers", "Tech or smart home creator", "60–90 second high-quality video", "Show product in action", "No competitor brands visible"], budgetRange: [1500, 3000], payPerImpression: "$4.50/1K", minFollowers: 100000, creatorSlots: 2, deadlineDaysRange: [30, 60] },
  { title: "Coding Session — Real Project Walkthrough", platform: "YouTube", contentType: "Video", niche: "Tech", description: "Show your dev workflow in a real coding session using our tool.", fullDescription: "Film a real coding session showing how our tool assists your workflow. Start with your desk setup, then screen share an actual coding session. Pay is entirely per-impression — high-performing content earns more.", requirements: ["10,000+ YouTube subscribers", "Programming content", "15–20 minute video", "Real project, not hello-world", "Show tool actively in use"], budgetRange: [0, 500], payPerImpression: "$5.00/1K", minFollowers: 10000, creatorSlots: 5, deadlineDaysRange: [21, 45] },
  { title: "Unboxing & First Impressions — New Launch", platform: "TikTok", contentType: "Video", niche: "Tech", description: "Film your unboxing and first impressions of our latest product.", fullDescription: "Create an unboxing video capturing your genuine first impressions. Show the packaging, build quality, and initial setup. React naturally — excitement, surprises, and honest thoughts all welcome.", requirements: ["5,000+ TikTok followers", "Tech content creator", "30–60 second video", "Show unboxing process", "Genuine reactions required"], budgetRange: [300, 800], payPerImpression: "$2.50/1K", minFollowers: 5000, creatorSlots: 8, deadlineDaysRange: [14, 35] },
  { title: "Day in My Life — Powered By Our Tech", platform: "Instagram", contentType: "Reel", niche: "Tech", description: "Show how our product fits into your daily routine in a day-in-my-life Reel.", fullDescription: "Film a day-in-my-life Reel showing how our product naturally fits into your routine. From morning to night, capture moments where the tech enhances your day. Authentic vibes, not a commercial.", requirements: ["15,000+ Instagram followers", "Tech or lifestyle niche", "30–60 second Reel", "Show product in 3+ scenarios", "Natural integration"], budgetRange: [400, 900], payPerImpression: "$2.00/1K", minFollowers: 15000, creatorSlots: 6, deadlineDaysRange: [14, 40] },

  // Fitness
  { title: "Gym Fit Check — Performance Wear", platform: "TikTok", contentType: "Video", niche: "Fitness", description: "Show off your gym outfit featuring our new collection in a fit check video.", fullDescription: "Film a trending fit check TikTok at the gym wearing our collection. Start with the outfit reveal, then show 2–3 exercises where the clothing is functional. End with a quick opinion on comfort and fit.", requirements: ["5,000+ TikTok followers", "Fitness content creator", "Must film in a gym", "15–45 second video", "No competitor apparel visible"], budgetRange: [300, 600], payPerImpression: "$2.00/1K", minFollowers: 5000, creatorSlots: 10, deadlineDaysRange: [10, 30] },
  { title: "30-Day Fitness Challenge — Weekly Check-Ins", platform: "Instagram", contentType: "Reel", niche: "Fitness", description: "Document your 30-day challenge using our app — weekly check-in reels.", fullDescription: "Commit to a 30-day fitness challenge tracked on our platform. Post 4 weekly check-in Reels showing your progress, stats, and motivation. Raw and real — show the hard days too.", requirements: ["1,000+ Instagram followers", "Fitness or running niche", "4 Reels over 30 days", "Show app stats/screenshots", "Pay is per-impression only"], budgetRange: [0, 300], payPerImpression: "$2.00/1K", minFollowers: 1000, creatorSlots: 15, deadlineDaysRange: [30, 60] },
  { title: "Mega Campaign — Elite Training Series", platform: "TikTok", contentType: "Video", niche: "Fitness", description: "Create a 3-part video series for our new training collection.", fullDescription: "Premium campaign for top-tier creators. Create a 3-part TikTok series showcasing our training collection across different workout scenarios. Each video should be cinematic quality. Full creative freedom within brand guidelines.", requirements: ["1,000,000+ TikTok followers", "Elite fitness creator", "Professional video quality", "3 videos, each 60–90 seconds", "Exclusive feature of our collection"], budgetRange: [10000, 15000], payPerImpression: "$8.00/1K", minFollowers: 1000000, creatorSlots: 1, deadlineDaysRange: [45, 90] },
  { title: "Home Workout — No Equipment Needed", platform: "YouTube", contentType: "Video", niche: "Fitness", description: "Film a follow-along home workout using our app for guidance.", fullDescription: "Create a follow-along home workout video that viewers can do with no equipment. Use our app to track the workout and show the interface. Include warm-up and cool-down. Suitable for beginners.", requirements: ["20,000+ YouTube subscribers", "Fitness channel", "15–25 minute video", "Show app interface", "Include modifications for beginners"], budgetRange: [500, 1000], payPerImpression: "$2.50/1K", minFollowers: 20000, creatorSlots: 4, deadlineDaysRange: [21, 45] },
  { title: "Protein Shake Taste Test — Post-Workout", platform: "TikTok", contentType: "Video", niche: "Fitness", description: "Taste test 3 flavors of our protein shake after a workout.", fullDescription: "Film yourself trying 3 flavors of our protein shake right after a gym session. Rate each flavor, share your honest opinion on taste and texture. Keep it fun and genuine.", requirements: ["3,000+ TikTok followers", "Fitness or food niche", "30–60 second video", "Show all 3 flavors", "Genuine reactions"], budgetRange: [200, 400], payPerImpression: "$1.50/1K", minFollowers: 3000, creatorSlots: 12, deadlineDaysRange: [10, 28] },

  // Travel
  { title: "Travel Vlog — Weekend with Our Gear", platform: "YouTube", contentType: "Video", niche: "Travel", description: "Document a weekend trip using our travel gear as your companion.", fullDescription: "Document an entire weekend trip — from packing to return — using our gear. Show your packing process, airport navigation, and trip highlights where the product naturally appears. You choose the destination.", requirements: ["15,000+ YouTube subscribers", "Travel content creator", "10–20 minute vlog", "Show packing process and transit", "Content must remain live 90 days"], budgetRange: [1000, 2500], payPerImpression: "$4.00/1K", minFollowers: 15000, creatorSlots: 2, deadlineDaysRange: [30, 60] },
  { title: "Hidden Gems — City Guide", platform: "TikTok", contentType: "Video", niche: "Travel", description: "Share your favorite hidden gems in your city, booked through our platform.", fullDescription: "Create a TikTok guide to hidden gems in your city — lesser-known restaurants, viewpoints, shops, or experiences. Naturally integrate how you discovered or booked them through our platform. Local knowledge is key.", requirements: ["8,000+ TikTok followers", "Travel or local guide niche", "60–90 second video", "Feature at least 4 locations", "Show booking/app interface briefly"], budgetRange: [400, 800], payPerImpression: "$2.50/1K", minFollowers: 8000, creatorSlots: 6, deadlineDaysRange: [14, 40] },
  { title: "Packing Guide — Minimalist Travel", platform: "Instagram", contentType: "Reel", niche: "Travel", description: "Show how to pack for a week in just our carry-on bag.", fullDescription: "Create a satisfying packing Reel showing exactly how to fit a week's worth of essentials into our bag. Use packing cubes, rolling techniques, and show the final organized result. Practical and inspiring.", requirements: ["5,000+ Instagram followers", "Travel or minimalism niche", "30–60 second Reel", "Show packing techniques", "Tag brand"], budgetRange: [300, 600], payPerImpression: "$2.00/1K", minFollowers: 5000, creatorSlots: 8, deadlineDaysRange: [14, 35] },
  { title: "Travel Photography — Destination Showcase", platform: "Instagram", contentType: "Post", niche: "Travel", description: "Share stunning travel photos from a trip booked through our platform.", fullDescription: "Post a carousel of your best travel photography from a recent trip. Include a mix of landscapes, details, and lifestyle shots. Naturally mention our platform in the caption as part of your travel planning.", requirements: ["10,000+ Instagram followers", "Travel photography niche", "8–10 photo carousel", "High-quality photography", "Natural brand mention in caption"], budgetRange: [500, 1000], payPerImpression: "$2.50/1K", minFollowers: 10000, creatorSlots: 5, deadlineDaysRange: [21, 50] },
  { title: "Solo Travel Diary — Safety & Adventure", platform: "YouTube", contentType: "Video", niche: "Travel", description: "Document a solo trip highlighting safety tips and our travel insurance.", fullDescription: "Create a solo travel vlog that balances adventure with practical safety tips. Naturally mention how our service gave you peace of mind. Show real moments of navigating a new place alone.", requirements: ["25,000+ YouTube subscribers", "Travel or lifestyle channel", "12–20 minute video", "Include safety tips", "Natural product integration"], budgetRange: [800, 1800], payPerImpression: "$3.00/1K", minFollowers: 25000, creatorSlots: 3, deadlineDaysRange: [30, 60] },

  // Beauty
  { title: "Skincare Night Routine — Before & After", platform: "Instagram", contentType: "Reel", niche: "Beauty", description: "Create a calming PM skincare routine reel featuring our new serum.", fullDescription: "Create a soothing nighttime skincare routine Reel featuring our product as a key step. Show texture, application, and explain briefly why you use it. Calming music, soft lighting, ASMR-friendly.", requirements: ["3,000+ Instagram followers", "Beauty or skincare niche", "Use product for 1 week before filming", "Show product label clearly", "No filter on skin close-ups"], budgetRange: [200, 500], payPerImpression: "$1.50/1K", minFollowers: 3000, creatorSlots: 6, deadlineDaysRange: [14, 35] },
  { title: "Get Ready With Me — Full Glam", platform: "TikTok", contentType: "Video", niche: "Beauty", description: "Film a GRWM using our products as key steps in your makeup routine.", fullDescription: "Create a Get Ready With Me TikTok featuring our products in your makeup routine. Show application techniques, blending, and the final look. Natural and chatty tone — share tips as you go.", requirements: ["10,000+ TikTok followers", "Beauty content creator", "60–90 second video", "Feature products prominently", "Show before and after"], budgetRange: [400, 900], payPerImpression: "$2.50/1K", minFollowers: 10000, creatorSlots: 8, deadlineDaysRange: [14, 40] },
  { title: "Honest Product Comparison — Drugstore vs Premium", platform: "YouTube", contentType: "Video", niche: "Beauty", description: "Compare our product against drugstore alternatives in an honest review.", fullDescription: "Film a side-by-side comparison of our product vs popular drugstore alternatives. Test wear time, coverage, and finish throughout the day. Be genuinely honest — we want authentic reviews.", requirements: ["30,000+ YouTube subscribers", "Beauty review channel", "10–15 minute video", "Full day wear test", "Side-by-side application shots"], budgetRange: [800, 1500], payPerImpression: "$3.00/1K", minFollowers: 30000, creatorSlots: 3, deadlineDaysRange: [21, 50] },
  { title: "5-Minute Everyday Makeup — Quick & Easy", platform: "Instagram", contentType: "Reel", niche: "Beauty", description: "Show a quick 5-minute everyday makeup look using our essentials.", fullDescription: "Create a speed makeup Reel showing a complete everyday look in under 5 minutes using our products. Time-lapse friendly. The goal is to show how easy and quick it is to look polished.", requirements: ["5,000+ Instagram followers", "Beauty or lifestyle niche", "30–45 second Reel", "Show timer/countdown", "Feature at least 3 products"], budgetRange: [250, 500], payPerImpression: "$1.50/1K", minFollowers: 5000, creatorSlots: 10, deadlineDaysRange: [10, 30] },

  // Pets
  { title: "Dog Park Day with Our Gear", platform: "TikTok", contentType: "Video", niche: "Pets", description: "Film a fun dog park day featuring our pet accessories.", fullDescription: "Take your dog to the park and film the adventure using our accessories. Capture genuine fun moments — playing fetch, meeting other dogs, treats. Show the gear in action without making it feel like an ad.", requirements: ["3,000+ TikTok followers", "Pet or lifestyle content", "30–60 second video", "Must feature products in use", "Dog must be comfortable and safe"], budgetRange: [250, 500], payPerImpression: "$2.00/1K", minFollowers: 3000, creatorSlots: 6, deadlineDaysRange: [14, 30] },
  { title: "New Pet Unboxing — Monthly Subscription", platform: "TikTok", contentType: "Video", niche: "Pets", description: "Unbox our monthly subscription box and let your pet react.", fullDescription: "Film your pet's reaction to unboxing our monthly subscription box. Show each item, let your pet interact with the toys and treats, and share your thoughts. Genuine reactions are everything — the funnier, the better.", requirements: ["2,000+ TikTok followers", "Pet content creator", "30–60 second video", "Show pet reacting to each item", "Tag brand"], budgetRange: [150, 350], payPerImpression: "$1.50/1K", minFollowers: 2000, creatorSlots: 10, deadlineDaysRange: [10, 25] },
  { title: "Pet Training Tips — Product Integration", platform: "YouTube", contentType: "Video", niche: "Pets", description: "Share training tips while naturally featuring our training treats and tools.", fullDescription: "Create a helpful pet training video sharing your best tips for common behaviors. Naturally integrate our training treats and tools throughout. Educational content that genuinely helps pet owners.", requirements: ["15,000+ YouTube subscribers", "Pet training or lifestyle channel", "8–12 minute video", "Show products in training context", "Include actionable tips"], budgetRange: [500, 1000], payPerImpression: "$2.50/1K", minFollowers: 15000, creatorSlots: 3, deadlineDaysRange: [21, 45] },
  { title: "Pet & Owner Matching Outfits — Photo Series", platform: "Instagram", contentType: "Post", niche: "Pets", description: "Create adorable matching outfit photos with you and your pet.", fullDescription: "Style a photo series of you and your pet in coordinating outfits featuring our pet accessories. Include lifestyle shots — at home, on a walk, at a cafe. Cute, shareable content that makes people smile.", requirements: ["5,000+ Instagram followers", "Pet or lifestyle niche", "Carousel of 6+ photos", "Professional-quality photos", "Tag brand"], budgetRange: [300, 600], payPerImpression: "$2.00/1K", minFollowers: 5000, creatorSlots: 5, deadlineDaysRange: [14, 35] },

  // Lifestyle
  { title: "Reading Vlog — Monthly Book Picks", platform: "YouTube", contentType: "Video", niche: "Lifestyle", description: "Share your monthly reading picks using our tracking platform.", fullDescription: "Film a monthly reading wrap-up discussing 3–5 books and show how you track and organize your reading with our platform. The video should feel like a conversation with a friend about books.", requirements: ["5,000+ YouTube subscribers", "BookTube or lifestyle channel", "Discuss at least 3 books", "Show platform on screen", "8–15 minute video"], budgetRange: [400, 800], payPerImpression: "$2.50/1K", minFollowers: 5000, creatorSlots: 4, deadlineDaysRange: [21, 45] },
  { title: "Meditation Journey — 7 Day Review", platform: "Instagram", contentType: "Reel", niche: "Lifestyle", description: "Document a 7-day meditation journey using our app.", fullDescription: "Use our app for 7 consecutive days and create one summary Reel about your experience. Show your meditation space, the app interface, and share honest thoughts on how it affected your stress, sleep, or focus.", requirements: ["500+ Instagram followers", "Wellness or lifestyle niche", "Use app for 7 days before filming", "30–60 second Reel", "Show app interface briefly"], budgetRange: [100, 300], payPerImpression: "$1.50/1K", minFollowers: 500, creatorSlots: 15, deadlineDaysRange: [14, 30] },
  { title: "Apartment Tour — Cozy Home Aesthetic", platform: "TikTok", contentType: "Video", niche: "Lifestyle", description: "Give an apartment tour featuring our home products.", fullDescription: "Film a home/apartment tour TikTok showcasing your space with our products naturally integrated. Focus on the aesthetic — cozy lighting, organized spaces, and the overall vibe. Not a product review, just beautiful living.", requirements: ["8,000+ TikTok followers", "Home or lifestyle niche", "60–90 second video", "Show products in context", "Aesthetic quality required"], budgetRange: [350, 700], payPerImpression: "$2.00/1K", minFollowers: 8000, creatorSlots: 6, deadlineDaysRange: [14, 35] },
  { title: "Sunday Reset Routine — Self-Care Edition", platform: "Instagram", contentType: "Reel", niche: "Lifestyle", description: "Film your Sunday reset routine featuring our wellness products.", fullDescription: "Create a satisfying Sunday reset Reel — cleaning, meal prep, self-care, and planning for the week. Naturally incorporate our products into your routine. Calming, organized, and inspirational vibes.", requirements: ["3,000+ Instagram followers", "Lifestyle or wellness niche", "30–60 second Reel", "Show products naturally", "Aesthetic editing"], budgetRange: [200, 450], payPerImpression: "$1.50/1K", minFollowers: 3000, creatorSlots: 8, deadlineDaysRange: [10, 28] },
  { title: "Journal With Me — Productivity Planning", platform: "YouTube", contentType: "Video", niche: "Lifestyle", description: "Film a plan-with-me session using our planner/app.", fullDescription: "Create a calming plan-with-me video showing your weekly or monthly planning process using our product. Include goal-setting, habit tracking, and organization tips. ASMR-friendly with writing sounds.", requirements: ["10,000+ YouTube subscribers", "Productivity or lifestyle channel", "15–25 minute video", "Show product in detail", "Include planning tips"], budgetRange: [500, 900], payPerImpression: "$2.00/1K", minFollowers: 10000, creatorSlots: 4, deadlineDaysRange: [21, 40] },

  // Business
  { title: "Thread on Future of Remote Work", platform: "Twitter/X", contentType: "Post", niche: "Business", description: "Write an insightful thread about remote work trends, tagging our brand naturally.", fullDescription: "Write a thoughtful 8–12 tweet thread about the future of remote and distributed work. Cover trends, challenges, and opportunities. Mention our brand naturally in 1–2 tweets. Data points and hot takes welcome.", requirements: ["2,000+ Twitter/X followers", "Business or tech niche", "8–12 tweets in thread", "Tag brand in 1–2 tweets max", "Include 2+ data points"], budgetRange: [150, 400], payPerImpression: "$1.00/1K", minFollowers: 2000, creatorSlots: 3, deadlineDaysRange: [7, 21] },
  { title: "Small Business Success Story — Case Study", platform: "YouTube", contentType: "Video", niche: "Business", description: "Share your business journey and how our platform helped you scale.", fullDescription: "Create a documentary-style video about your business journey. Share real numbers, challenges, and breakthroughs. Naturally integrate how our platform helped at key moments. Authentic storytelling over promotion.", requirements: ["20,000+ YouTube subscribers", "Business or entrepreneurship channel", "10–18 minute video", "Share real metrics/numbers", "Natural product integration"], budgetRange: [800, 2000], payPerImpression: "$3.50/1K", minFollowers: 20000, creatorSlots: 2, deadlineDaysRange: [30, 60] },
  { title: "LinkedIn Post — Industry Insights", platform: "Twitter/X", contentType: "Post", niche: "Business", description: "Write a thought leadership post about industry trends featuring our tool.", fullDescription: "Write a compelling thought leadership post sharing unique industry insights. Naturally reference our tool as part of the solution landscape. Focus on providing genuine value — data, frameworks, or actionable advice.", requirements: ["5,000+ Twitter/X followers", "Business or industry expert", "Detailed long-form post", "Include original insights", "Tag brand once"], budgetRange: [200, 500], payPerImpression: "$1.50/1K", minFollowers: 5000, creatorSlots: 5, deadlineDaysRange: [10, 25] },
  { title: "Startup Toolkit — What I Actually Use", platform: "TikTok", contentType: "Video", niche: "Business", description: "Share your actual startup toolkit and how our product fits in.", fullDescription: "Create a TikTok showing your real startup toolkit — the apps, tools, and services you actually use daily. Position our product naturally as one of the key tools. Quick-cut format with screen recordings.", requirements: ["10,000+ TikTok followers", "Business or startup niche", "30–60 second video", "Show real tools in use", "Quick-cut editing style"], budgetRange: [300, 700], payPerImpression: "$2.00/1K", minFollowers: 10000, creatorSlots: 6, deadlineDaysRange: [14, 30] },
  { title: "Freelancer Finance Tips — Money Management", platform: "Instagram", contentType: "Reel", niche: "Business", description: "Share freelancer finance tips using our financial tool.", fullDescription: "Create a Reel sharing practical finance tips for freelancers. Cover invoicing, tax savings, budgeting, or payment management. Naturally show how our tool helps with one or more of these areas.", requirements: ["5,000+ Instagram followers", "Business or finance niche", "30–60 second Reel", "Show tool interface briefly", "Actionable tips required"], budgetRange: [250, 550], payPerImpression: "$1.50/1K", minFollowers: 5000, creatorSlots: 8, deadlineDaysRange: [14, 30] },
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function futureDate(minDays: number, maxDays: number): Date {
  const days = randomInt(minDays, maxDays);
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function main() {
  console.log("🧹 Cleaning existing data...");
  await prisma.payment.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.application.deleteMany();
  await prisma.bounty.deleteMany();
  await prisma.creatorProfile.deleteMany();
  await prisma.companyProfile.deleteMany();
  await prisma.user.deleteMany();

  const password = await hash("password123", 1);

  // Create companies
  console.log("🏢 Creating companies...");
  const companyProfiles: { id: string; name: string; industry: string }[] = [];

  for (const brand of BRANDS) {
    const user = await prisma.user.create({
      data: {
        email: brand.email,
        password,
        role: "company",
        companyProfile: {
          create: {
            companyName: brand.name,
            website: brand.website,
            industry: brand.industry,
            description: brand.desc,
          },
        },
      },
      include: { companyProfile: true },
    });
    companyProfiles.push({ id: user.companyProfile!.id, name: brand.name, industry: brand.industry });
  }

  // Create 2 creators
  console.log("👤 Creating creators...");
  await prisma.user.create({
    data: {
      email: "creator1@example.com", password, role: "creator",
      creatorProfile: { create: { displayName: "Sarah Chen", bio: "Lifestyle & fashion content creator based in LA.", socialLinks: JSON.stringify({ instagram: "@sarahcreates", tiktok: "@sarahcreates" }), followerCounts: JSON.stringify({ instagram: 25000, tiktok: 40000 }) } },
    },
  });
  await prisma.user.create({
    data: {
      email: "creator2@example.com", password, role: "creator",
      creatorProfile: { create: { displayName: "Marcus Rivera", bio: "Tech reviewer and productivity nerd.", socialLinks: JSON.stringify({ youtube: "@marcusreviews", twitter: "@marcustech" }), followerCounts: JSON.stringify({ youtube: 85000, twitter: 12000 }) } },
    },
  });

  // Generate 200 bounties
  console.log("🎯 Creating 200 bounties...");
  const nicheToCompanies = new Map<string, typeof companyProfiles>();
  for (const cp of companyProfiles) {
    const existing = nicheToCompanies.get(cp.industry) || [];
    existing.push(cp);
    nicheToCompanies.set(cp.industry, existing);
  }

  // Map template niches to brand industries
  const nicheIndustryMap: Record<string, string> = {
    "Fashion": "Fashion",
    "Food & Drink": "Food & Drink",
    "Tech": "Tech",
    "Fitness": "Fitness",
    "Travel": "Travel",
    "Beauty": "Beauty",
    "Pets": "Pets",
    "Lifestyle": "Lifestyle",
    "Business": "Business",
  };

  let created = 0;
  const usedTitles = new Set<string>();

  while (created < 200) {
    const template = TEMPLATES[created % TEMPLATES.length];
    const industry = nicheIndustryMap[template.niche] || template.niche;
    const companies = nicheToCompanies.get(industry);
    
    // Fall back to any company if niche doesn't match
    const company = companies && companies.length > 0
      ? randomItem(companies)
      : randomItem(companyProfiles);

    const budget = template.budgetRange[0] === template.budgetRange[1]
      ? template.budgetRange[0]
      : randomInt(template.budgetRange[0], template.budgetRange[1]);

    // Make title unique by adding brand name variation
    let title = template.title;
    const round = Math.floor(created / TEMPLATES.length);
    if (round > 0) {
      const suffixes = ["— Spring Edition", "— Q2 Campaign", "— Creator Program", "— Brand Collab", "— Limited Run"];
      title = `${template.title} ${suffixes[round % suffixes.length]}`;
    }

    // Ensure uniqueness
    if (usedTitles.has(title + company.id)) {
      title = `${title} #${created}`;
    }
    usedTitles.add(title + company.id);

    const hasPayPerImpression = template.payPerImpression !== null && Math.random() > 0.3;

    await prisma.bounty.create({
      data: {
        companyId: company.id,
        title,
        description: template.fullDescription,
        platform: template.platform,
        contentType: template.contentType,
        niche: template.niche,
        requirements: template.requirements.join("\n"),
        budget: budget,
        payType: budget === 0 ? "per_impression" : "fixed",
        payPerImpression: hasPayPerImpression ? template.payPerImpression : null,
        minFollowers: template.minFollowers,
        creatorSlots: template.creatorSlots,
        deadline: futureDate(template.deadlineDaysRange[0], template.deadlineDaysRange[1]),
        allowResubmission: Math.random() > 0.7,
        status: "open",
      },
    });

    created++;
    if (created % 50 === 0) console.log(`  → ${created}/200 bounties created`);
  }

  console.log(`✅ Seed complete: ${BRANDS.length} companies, 2 creators, 200 bounties`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
