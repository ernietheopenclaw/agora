# Agora — Product Spec (v1 MVP)

A marketplace connecting companies with content creators through bounties.

## User Roles

### Companies
- Sign up with: company name, email, password, website (optional), industry
- Can post bounties, review applications, approve/reject content, pay creators

### Creators
- Sign up with: name, email, password, linked social accounts (TikTok, IG, YouTube, etc.)
- Can browse bounties, apply, submit content, get paid

## Core Flow

### Phase 1 — Bounty & Application
1. **Company posts a bounty** with:
   - Title & description
   - Target platform (TikTok, IG, YouTube, Twitter/X, etc.)
   - Content type (video, photo, story, reel, post, etc.)
   - Niche/category
   - Requirements (follower minimum, audience demographics, etc.)
   - Budget (fixed price per creator)
   - Number of creators needed (**not publicly visible**)
   - Deadline
   - Whether resubmissions are allowed (yes/no)
2. **Creators browse & filter** bounties by platform, niche, pay range
3. **Creators apply** — their profile + linked socials are shared with the company
4. **Company reviews applicants** — accept or reject

### Phase 2 — Content Delivery
1. **Accepted creators** produce and submit content (link to post + any supporting materials)
2. **Company reviews** the submission:
   - **Approve** → payment is triggered via Stripe
   - **Reject** → if resubmissions enabled, creator can revise and resubmit; otherwise, done
3. **Payment** releases to creator (minus 10% platform fee)

## Payment
- **Provider:** Stripe (Stripe Connect for creator payouts)
- **Flow:** Company funds bounty → held by platform → released to creator on approval
- **Platform cut:** 10%
- **No escrow in v1** — simple pay-on-approval

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL (via Prisma)
- **Auth:** NextAuth.js
- **Payments:** Stripe Connect
- **Deployment:** Vercel
- **Repo:** GitHub (ernietheopenclaw)

## Pages (v1)

### Public
- `/` — Landing page
- `/bounties` — Browse bounties (filterable)
- `/bounty/[id]` — Bounty detail
- `/login` — Login
- `/signup/company` — Company registration
- `/signup/creator` — Creator registration

### Company (authenticated)
- `/dashboard` — Overview of posted bounties & their status
- `/bounties/new` — Create a bounty
- `/bounty/[id]/applicants` — Review applicants
- `/bounty/[id]/submissions` — Review submitted content

### Creator (authenticated)
- `/dashboard` — Overview of applied/active bounties
- `/profile` — Edit profile & linked socials
- `/bounty/[id]/apply` — Apply to a bounty
- `/bounty/[id]/submit` — Submit content

## Data Models

### User
- id, email, password, role (company | creator), createdAt

### CompanyProfile
- userId, companyName, website, industry, description

### CreatorProfile
- userId, displayName, bio, socialLinks (JSON), followerCounts (JSON)

### Bounty
- id, companyId, title, description, platform, contentType, niche, requirements, budget, creatorSlots, deadline, allowResubmission, status (open | closed | completed), createdAt

### Application
- id, bountyId, creatorId, status (pending | accepted | rejected), appliedAt

### Submission
- id, applicationId, contentUrl, notes, status (pending | approved | rejected), submittedAt, reviewedAt

### Payment
- id, submissionId, amount, platformFee, stripePaymentId, status (pending | completed | failed), createdAt

## Not in v1 (Future)
- Pay-per-impression model
- API-verified social analytics
- Reputation & rating system
- Smart matching algorithm
- Escrow & dispute resolution
- Milestone payments
- Creator invitations (company-initiated)
