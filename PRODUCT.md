# Cofluence — Product Overview

> **The Creator Economy Platform** — connecting brands with the right creators through campaigns, deals, and built-in negotiation.

---

## What is Cofluence?

Cofluence is a B2B2C marketplace that bridges the gap between **brands (sponsors)** and **content creators (influencers)**. Instead of back-and-forth emails, spreadsheets, and missed follow-ups, Cofluence provides a single workspace where campaigns are created, influencers are discovered, deals are negotiated, and deliverables are tracked — all under admin oversight.

**Business model:** Cofluence earns a platform commission (default 10%) on each accepted deal. Sponsors on the free plan are limited to 3 active campaigns; Pro plan is unlimited. Both plans transact through the platform — commission is invoiced and settled by the admin team.

---

## The Three Roles

### 1. Admin

The platform operator. Has full visibility and control over all activity.

**Account Management**
- Reviews every new registration (sponsor and influencer) before they can log in
- Approves or rejects accounts from the Pending Approvals dashboard
- Gets an email alert the moment someone registers
- Rejected applicants receive a notification email; approved users receive a welcome email with a login link

**Platform Oversight**
- Views real-time stats: total users, sponsors, influencers, campaigns, ad requests, flagged content, and pending approvals — all on one dashboard
- Monitors ongoing campaigns with real acceptance-rate progress bars
- Searches across all users and campaigns by name
- Flags suspicious users or campaigns; flagged content is isolated from discovery
- Permanently removes users or campaigns (with confirmation step)
- Manages user plan tiers — upgrade a sponsor from Free to Pro or downgrade them

**Revenue Management** *(in progress)*
- Views all accepted deals in the Deals dashboard: sponsor, influencer, campaign, gross amount, platform commission, net to influencer, status
- Marks deals as paid once commission is collected (manual settlement — no payment gateway required initially)

**Data Exports**
- Downloads all campaigns as a CSV file
- Downloads all users as a CSV file

**Analytics** *(planned)*
- Platform-wide trends: registrations, campaign activity, deal volume over time
- Pending approval backlog monitoring

---

### 2. Sponsor (Brand)

A company or individual that creates campaigns and hires influencers to promote them.

**Getting Started**
- Registers in 3 steps: account credentials → company/brand details → confirmation
- Receives a verification email — must click the link before the admin can approve them
- Once approved, gets a welcome email and can log in

**Campaign Management**
- Creates campaigns with title, description, category, budget (₹), and public/private visibility
- Edits or deletes campaigns at any time
- Public campaigns appear in the influencer discovery feed; private campaigns are invite-only
- Free plan: up to 3 active campaigns. Pro plan: unlimited

**Finding Influencers**
- Browses the influencer directory — searchable by name, category, niche, and reach range
- Views each influencer's full profile: avatar, category, niche, follower reach
- Sends a direct ad request to any influencer from their profile card — selects which campaign, writes a personalised message, and optionally proposes deal terms
- Receives an email notification when an influencer expresses interest in one of their campaigns

**Managing Requests**
- Sees all incoming influencer-initiated requests in the Requests dashboard
- Filters requests by status: pending, negotiation, accepted, rejected
- For each request: Accepts, Declines, or Negotiates with a counter-offer
- Receives an email when an influencer acts on a request (accepts, declines, counter-offers)

**Confirming Deliveries** *(in progress)*
- When an influencer marks a deal as delivered (with a link to the published content), the sponsor sees a "Confirm Delivery" button
- Confirming delivery closes the deal and triggers commission processing

**Analytics** *(planned)*
- Total campaigns created, requests sent vs accepted rate, total deal value
- Monthly trend charts (campaigns + accepted deals over the last 6 months)
- Top-performing campaigns by acceptance rate

**Account Settings**
- Updates company name, industry, campaign budget
- Uploads a company profile photo
- Email address is read-only (cannot be changed)
- Forgot password flow — resets via email link (15-minute expiry)

---

### 3. Influencer (Creator)

A content creator who browses campaigns, applies for deals, and fulfils them.

**Getting Started**
- Registers in 3 steps: account credentials → creator profile (category, niche, reach, photo) → confirmation
- Receives a verification email — must click the link before admin approval
- Once approved, gets a welcome email and can log in

**Browsing Campaigns**
- Sees all public campaigns in the Browse Campaigns page
- Filters by category and minimum budget
- Each campaign card shows title, category, budget, and the sponsoring brand
- Clicks to expand full details: description, brand, industry

**Joining and Applying**
- **Join Campaign** — adds the campaign to their accepted list, making them eligible for ad requests from that sponsor
- **Express Interest** — proactively sends a message and proposed terms directly to the sponsor as an ad request; the sponsor is notified by email immediately

**Managing Deals**
- Sees all incoming sponsor ad requests in the My Deals page
- Filters deals by status: pending, negotiation, accepted, rejected
- For each pending or negotiation request: Accepts, Declines, or sends a Counter-Offer
- Receives an email when a sponsor responds to their request

**Delivering Content** *(in progress)*
- Marks an accepted deal as "Delivered" with a note and a link to the published content
- The sponsor is notified by email and can confirm delivery from their dashboard

**Analytics** *(planned)*
- Campaigns joined, deals received vs accepted, total deal value
- Request status breakdown (doughnut chart)

**Account Settings**
- Updates display name, content category, niche, and follower reach
- Uploads a profile photo (shown in the influencer directory to sponsors)
- Email is read-only
- Forgot password flow via email link

---

## How a Deal Works End-to-End

```
1. Sponsor creates a public campaign (e.g. "Summer Fashion Launch, ₹50,000")

2a. Influencer browses campaigns → clicks Express Interest →
    writes message + proposed terms → sends to sponsor
   OR
2b. Sponsor browses influencer directory → finds Alice (Fashion, 120k followers) →
    sends her a direct ad request for the campaign

3. Both parties are notified by email when the other acts

4. Negotiation loop (optional):
   Sponsor counter-offers → influencer counter-offers → repeat until agreed

5. One party Accepts → deal is created in the Deals table with:
   gross = campaign budget, commission = 10%, net = gross - commission

6. Influencer delivers content → marks as Delivered + link to published post

7. Sponsor confirms delivery

8. Admin marks deal as Paid after collecting the platform commission

9. Both parties receive email notifications at each status change
```

---

## Email Notifications (automatic, no manual action needed)

| Trigger | Who gets the email |
|---|---|
| New registration | New user gets a verification link; admin gets an alert |
| Email verified | — (next step is admin review) |
| Account approved | User gets a welcome email with login link |
| Account rejected | User gets a rejection notification |
| Sponsor sends ad request to influencer | Influencer gets notified |
| Influencer expresses interest in campaign | Sponsor gets notified |
| Influencer accepts/rejects/negotiates | Sponsor gets notified |
| Sponsor accepts/rejects/negotiates | Influencer gets notified |
| Password reset requested | User gets a 15-minute reset link |

---

## Security & Trust

- **Verified accounts only** — every registration goes through email verification → admin approval before any login is possible
- **Role-based access control** — admins cannot access influencer/sponsor dashboards and vice versa; enforced at both API and frontend levels
- **JWT authentication** — all authenticated routes require a valid signed token; expired tokens auto-redirect to login
- **Rate limiting** — registration capped at 10/min, login at 20/min, password reset at 5/hr per IP
- **No password leaks** — bcrypt-hashed, never returned in API responses
- **No user enumeration** — forgot-password always returns the same response regardless of whether the email exists
- **Input sanitisation** — all free-text fields strip HTML before storage
- **Secure headers** — X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security in production

---

## Platform Plans

| Feature | Free | Pro |
|---|---|---|
| Active campaigns | 3 | Unlimited |
| Influencer directory access | ✅ | ✅ |
| Ad request sending | ✅ | ✅ |
| Negotiate deals | ✅ | ✅ |
| Analytics dashboard | Basic | Full |
| Plan cost | ₹0 | Contact admin |

Plan upgrades/downgrades are managed by the admin — no self-service payment gateway in the initial phase.

---

## Tech Stack (for developers)

| Layer | Technology |
|---|---|
| Backend API | Python 3.12, Flask 3.0, SQLAlchemy 2.0, Flask-Migrate (Alembic) |
| Database | CockroachDB Serverless (production) / SQLite (local dev) |
| Auth | Flask-JWT-Extended, bcrypt, itsdangerous (token signing) |
| Email | Flask-Mail via Gmail SMTP (500 emails/day free) |
| Frontend | React 19, Vite 6, Tailwind CSS v4, React Router v7 |
| Hosting | Render (API, free tier) + Vercel (frontend, free tier) |
| Containerisation | Docker multi-stage build + Docker Compose |
| Testing | pytest (269 backend tests) + Vitest (304 frontend tests) |

---

## Current Status

| Phase | Description | Status |
|---|---|---|
| 1–6 | Core platform (auth, campaigns, ad requests, negotiation, admin, UI) | ✅ Complete |
| 7 | Core completeness (express-interest, influencer directory, pending UX) | ✅ Complete |
| 8 | Email system (verification, notifications, password reset) | ✅ Complete |
| 9 | Deployment (Dockerfile, Render, Vercel, CI/CD, uptime monitoring) | 🔄 In progress |
| 10 | In-app notifications | ⏳ Planned |
| 11 | Revenue model (commission tracking, plan tiers) | ⏳ Planned |
| 12 | Legal & trust (Terms of Service, Privacy Policy, deal delivery) | ⏳ Planned |
| 13 | Analytics dashboards | ⏳ Planned |
