// ─── FAKE CREATOR DATA (for dashboard demo) ─────────────────────────

export type ApplicationStatus = "pending" | "accepted" | "rejected";
export type BountyWorkStatus = "in_progress" | "submitted" | "under_review" | "completed";
export type PaymentType = "fixed" | "per_impression";
export type PaymentStatus = "paid" | "pending";

export interface CreatorApplication {
  id: string;
  bountyId: string;
  bountyTitle: string;
  brand: string;
  platform: string;
  dateApplied: string;
  status: ApplicationStatus;
}

export interface ActiveBountyWork {
  id: string;
  bountyId: string;
  bountyTitle: string;
  brand: string;
  platform: string;
  status: BountyWorkStatus;
  payType: PaymentType;
  fixedAmount?: number;
  impressionRate?: number; // $ per 1K impressions
  impressions?: number;
  impressionEarnings?: number;
  submittedDate?: string;
  deadline: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  bountyTitle: string;
  brand: string;
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
}

export interface DailyEarning {
  date: string;
  amount: number;
  cumulative: number;
}

// ─── Applications ─────────────────────────────────────────────────────
export const CREATOR_APPLICATIONS: CreatorApplication[] = [
  { id: "a1", bountyId: "1", bountyTitle: "Summer Collection Launch — Unboxing Reel", brand: "Everlane", platform: "Instagram", dateApplied: "2025-11-18", status: "accepted" },
  { id: "a2", bountyId: "3", bountyTitle: "Honest Review — Wireless Earbuds Pro", brand: "Nothing", platform: "YouTube", dateApplied: "2025-11-25", status: "accepted" },
  { id: "a3", bountyId: "7", bountyTitle: "Recipe Video — Plant-Based Meal Prep", brand: "Daily Harvest", platform: "TikTok", dateApplied: "2025-12-02", status: "rejected" },
  { id: "a4", bountyId: "8", bountyTitle: "Productivity Setup Tour — Home Office", brand: "Notion", platform: "YouTube", dateApplied: "2025-12-10", status: "accepted" },
  { id: "a5", bountyId: "5", bountyTitle: "Travel Vlog — Weekend with Our Carry-On", brand: "Away", platform: "YouTube", dateApplied: "2025-12-20", status: "accepted" },
  { id: "a6", bountyId: "13", bountyTitle: "Fitness App 30-Day Challenge", brand: "Strava", platform: "Instagram", dateApplied: "2026-01-05", status: "accepted" },
  { id: "a7", bountyId: "15", bountyTitle: "Sustainable Fashion Haul", brand: "Patagonia", platform: "YouTube", dateApplied: "2026-01-15", status: "pending" },
  { id: "a8", bountyId: "16", bountyTitle: "Coding Setup Tour — Dev Life", brand: "GitHub", platform: "YouTube", dateApplied: "2026-01-22", status: "pending" },
  { id: "a9", bountyId: "14", bountyTitle: "Smart Home Tour — Voice Control", brand: "Sonos", platform: "TikTok", dateApplied: "2026-02-01", status: "rejected" },
  { id: "a10", bountyId: "17", bountyTitle: "Meditation App Review", brand: "Calm", platform: "Instagram", dateApplied: "2026-02-10", status: "pending" },
];

// ─── Active Bounty Work ───────────────────────────────────────────────
export const ACTIVE_BOUNTIES: ActiveBountyWork[] = [
  {
    id: "w1", bountyId: "1", bountyTitle: "Summer Collection Launch — Unboxing Reel",
    brand: "Everlane", platform: "Instagram", status: "completed",
    payType: "fixed", fixedAmount: 500, deadline: "2026-03-15",
    submittedDate: "2025-12-20",
  },
  {
    id: "w2", bountyId: "3", bountyTitle: "Honest Review — Wireless Earbuds Pro",
    brand: "Nothing", platform: "YouTube", status: "completed",
    payType: "per_impression", impressionRate: 3.50, impressions: 342000, impressionEarnings: 1197,
    deadline: "2026-04-01", submittedDate: "2026-01-10",
  },
  {
    id: "w3", bountyId: "8", bountyTitle: "Productivity Setup Tour — Home Office",
    brand: "Notion", platform: "YouTube", status: "under_review",
    payType: "per_impression", impressionRate: 3.00, impressions: 128000, impressionEarnings: 384,
    deadline: "2026-04-05", submittedDate: "2026-02-05",
  },
  {
    id: "w4", bountyId: "5", bountyTitle: "Travel Vlog — Weekend with Our Carry-On",
    brand: "Away", platform: "YouTube", status: "in_progress",
    payType: "fixed", fixedAmount: 1500, deadline: "2026-04-15",
  },
  {
    id: "w5", bountyId: "13", bountyTitle: "Fitness App 30-Day Challenge",
    brand: "Strava", platform: "Instagram", status: "submitted",
    payType: "per_impression", impressionRate: 2.00, impressions: 87000, impressionEarnings: 174,
    deadline: "2026-03-30", submittedDate: "2026-02-12",
  },
  {
    id: "w6", bountyId: "6", bountyTitle: "Skincare Night Routine — Before & After",
    brand: "The Ordinary", platform: "Instagram", status: "completed",
    payType: "fixed", fixedAmount: 300, deadline: "2026-03-12",
    submittedDate: "2025-12-01",
  },
];

// ─── Payment History ──────────────────────────────────────────────────
export const PAYMENT_HISTORY: PaymentRecord[] = [
  { id: "p1", date: "2025-12-28", bountyTitle: "Skincare Night Routine — Before & After", brand: "The Ordinary", amount: 300, type: "fixed", status: "paid" },
  { id: "p2", date: "2026-01-05", bountyTitle: "Summer Collection Launch — Unboxing Reel", brand: "Everlane", amount: 500, type: "fixed", status: "paid" },
  { id: "p3", date: "2026-01-18", bountyTitle: "Honest Review — Wireless Earbuds Pro", brand: "Nothing", amount: 350, type: "per_impression", status: "paid" },
  { id: "p4", date: "2026-01-25", bountyTitle: "Honest Review — Wireless Earbuds Pro", brand: "Nothing", amount: 420, type: "per_impression", status: "paid" },
  { id: "p5", date: "2026-02-01", bountyTitle: "Honest Review — Wireless Earbuds Pro", brand: "Nothing", amount: 427, type: "per_impression", status: "paid" },
  { id: "p6", date: "2026-02-08", bountyTitle: "Productivity Setup Tour — Home Office", brand: "Notion", amount: 384, type: "per_impression", status: "pending" },
  { id: "p7", date: "2026-02-12", bountyTitle: "Fitness App 30-Day Challenge", brand: "Strava", amount: 174, type: "per_impression", status: "pending" },
];

// ─── Daily Earnings (last ~3 months, Nov 15 2025 → Feb 15 2026) ──────
function generateDailyEarnings(): DailyEarning[] {
  const payments: Record<string, number> = {
    "2025-12-01": 0,
    "2025-12-28": 300,
    "2026-01-05": 500,
    "2026-01-18": 350,
    "2026-01-25": 420,
    "2026-02-01": 427,
    "2026-02-08": 384,
    "2026-02-12": 174,
  };

  const start = new Date("2025-11-15");
  const end = new Date("2026-02-15");
  const result: DailyEarning[] = [];
  let cumulative = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().split("T")[0];
    const amount = payments[key] || 0;
    cumulative += amount;
    result.push({ date: key, amount, cumulative });
  }

  return result;
}

export const DAILY_EARNINGS: DailyEarning[] = generateDailyEarnings();

// ─── Summary stats ────────────────────────────────────────────────────
export const CREATOR_SUMMARY = {
  totalEarnings: 2555,
  thisMonthEarnings: 985, // Feb payments
  pendingPayouts: 558, // p6 + p7
  averagePerBounty: 426,
  totalApplications: 10,
  acceptedApplications: 5,
  rejectedApplications: 2,
  pendingApplications: 3,
};

// ─── Company fake data ────────────────────────────────────────────────
export interface CompanySpending {
  date: string;
  amount: number;
}

export const COMPANY_SUMMARY = {
  bountiesPosted: 8,
  activeBounties: 5,
  totalSpent: 12450,
  applicationsReceived: 67,
  creatorsHired: 14,
};

export const COMPANY_SPENDING: CompanySpending[] = [
  { date: "2025-11", amount: 1200 },
  { date: "2025-12", amount: 2800 },
  { date: "2026-01", amount: 4350 },
  { date: "2026-02", amount: 4100 },
];
