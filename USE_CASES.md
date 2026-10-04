# InSync / Cofluence — Use Case Coverage Summary

> **Last updated:** post LC-merge (commit `db55503`)
> **Test runner:** `bash test.sh` — 240 backend (pytest) + 160+ frontend (Vitest)

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Fully implemented — backend + frontend + tests |
| 🟡 | Partially implemented — backend done, frontend incomplete or no tests |
| ❌ | Not implemented |
| 🧪 | Tested |
| ⚠️ | Implemented but with a known gap or caveat |

---

## 1. Authentication & Registration

| # | Use Case | Backend | Frontend | Tests | Status |
|---|----------|---------|----------|-------|--------|
| 1.1 | Register as Sponsor (3-step signup) | ✅ POST /api/auth/register | ✅ SignUpStep1–3 | 🧪 SignUpStep1–3.test.jsx | ✅ |
| 1.2 | Register as Influencer (3-step signup) | ✅ POST /api/auth/register | ✅ SignUpStep1–3 | 🧪 SignUpStep1–3.test.jsx | ✅ |
| 1.3 | Upload profile photo during influencer signup | ✅ save_profile_image() on register | ✅ SignUpStep2 file input | 🧪 SignUpStep2.test.jsx | ✅ |
| 1.4 | Registration creates account with status=pending | ✅ Returns 202, awaits admin approval | ✅ SignUpSuccess shows pending message | 🧪 test_auth.py | ✅ |
| 1.5 | Login with email + password | ✅ POST /api/auth/login | ✅ LoginForm.jsx | 🧪 LoginForm.test.jsx | ✅ |
| 1.6 | Login blocked for pending accounts (403) | ✅ Status check in login() | ⚠️ LoginForm shows API error — no dedicated pending UI | 🧪 test_auth.py | 🟡 |
| 1.7 | Role-based redirect after login | ✅ JWT role claim | ✅ LoginForm navigates by role | 🧪 LoginForm.test.jsx | ✅ |
| 1.8 | JWT stored in localStorage, attached to all requests | ✅ | ✅ axiosInstance interceptor | 🧪 axiosInstance.test.js | ✅ |
| 1.9 | 401 response clears token and redirects to /login | ✅ | ✅ axiosInstance response interceptor | 🧪 axiosInstance.test.js | ✅ |
| 1.10 | Password toggle visibility on login form | — | ✅ | 🧪 LoginForm.test.jsx | ✅ |
| 1.11 | Duplicate email blocked on registration | ✅ 400 response | ✅ Shows API error | 🧪 test_auth.py | ✅ |
| 1.12 | Rate limiting: register (10/min), login (20/min) | ✅ Flask-Limiter | — | 🧪 test_auth.py | ✅ |

---

## 2. Admin Use Cases

| # | Use Case | Backend | Frontend | Tests | Status |
|---|----------|---------|----------|-------|--------|
| 2.1 | Platform overview stats (users, sponsors, influencers, campaigns, ad requests, flagged counts, pending approvals) | ✅ GET /api/admin/stats | ✅ Overview tab | 🧪 AdminDashboard.test.jsx, test_admin.py | ✅ |
| 2.2 | Platform activity bar chart + user breakdown doughnut chart | — | ✅ Chart.js | 🧪 AdminDashboard.test.jsx | ✅ |
| 2.3 | View all pending registrations with profile details | ✅ GET /api/admin/pending | ✅ Pending tab | 🧪 test_admin.py | ✅ |
| 2.4 | Approve a pending user registration | ✅ POST /api/admin/approve/<id> | ✅ Approve button | 🧪 test_admin.py | ✅ |
| 2.5 | Reject a pending user registration (delete) | ✅ DELETE /api/admin/reject/<id> | ✅ Reject + confirm dialog | 🧪 test_admin.py | ✅ |
| 2.6 | View ongoing campaigns with real progress % | ✅ GET /api/admin/ongoing-campaigns | ✅ Campaigns tab | 🧪 AdminDashboard.test.jsx, test_admin.py | ✅ |
| 2.7 | Flag a campaign | ✅ POST /api/admin/flag | ✅ Flag button | 🧪 AdminDashboard.test.jsx, test_admin.py | ✅ |
| 2.8 | Flag a user | ✅ POST /api/admin/flag | ✅ Flag button in users tab | 🧪 test_admin.py | ✅ |
| 2.9 | View all flagged campaigns | ✅ GET /api/admin/flagged | ✅ Flagged tab | 🧪 AdminDashboard.test.jsx, test_admin.py | ✅ |
| 2.10 | Remove (delete) a user | ✅ DELETE /api/admin/remove | ✅ Delete + confirm dialog | 🧪 AdminDashboard.test.jsx, test_admin.py | ✅ |
| 2.11 | Remove (delete) a flagged campaign | ✅ DELETE /api/admin/remove | ✅ Remove + confirm dialog | 🧪 AdminDashboard.test.jsx, test_admin.py | ✅ |
| 2.12 | Search users and campaigns by name | ✅ GET /api/admin/search | ✅ Search tab | 🧪 AdminDashboard.test.jsx, test_admin.py | ✅ |
| 2.13 | Search supports Enter key | — | ✅ keyDown handler | 🧪 AdminDashboard.test.jsx | ✅ |
| 2.14 | View all active users with role filter | ✅ GET /api/admin/users | ✅ Users tab | 🧪 test_admin.py | ✅ |
| 2.15 | Expand user card to see profile details | — | ✅ Collapsible rows | — | 🟡 |
| 2.16 | Export all campaigns as CSV | ✅ GET /api/admin/export/campaigns | ✅ Export button | 🧪 AdminDashboard.test.jsx, test_admin.py | ✅ |
| 2.17 | Export all users as CSV | ✅ GET /api/admin/export/users | ✅ Export button | 🧪 AdminDashboard.test.jsx, test_admin.py | ✅ |
| 2.18 | Admin stats exclude admin accounts and pending users | ✅ Filtered queries | — | 🧪 test_admin.py | ✅ |
| 2.19 | Confirm dialog before destructive actions | — | ✅ ConfirmDialog modal | 🧪 AdminDashboard.test.jsx | ✅ |

---

## 3. Sponsor Use Cases

| # | Use Case | Backend | Frontend | Tests | Status |
|---|----------|---------|----------|-------|--------|
| 3.1 | View sponsor home dashboard | ✅ GET /api/sponsors/details | ✅ SponsorHome.jsx | 🧪 SponsorHome.test.jsx | ✅ |
| 3.2 | Create a campaign | ✅ POST /api/campaign/ | ✅ New campaign form | 🧪 Campaigns.test.jsx | ✅ |
| 3.3 | View own campaigns (paginated) | ✅ GET /api/campaign/my-campaigns | ✅ Campaigns list | 🧪 Campaigns.test.jsx | ✅ |
| 3.4 | Edit a campaign | ✅ PUT /api/campaign/<id> | ✅ Edit form | 🧪 Campaigns.test.jsx | ✅ |
| 3.5 | Delete a campaign (cascades ad requests) | ✅ DELETE /api/campaign/<id> | ✅ Delete + confirm | 🧪 Campaigns.test.jsx | ✅ |
| 3.6 | Set campaign public or private | ✅ is_public field | ✅ Toggle in form | 🧪 Campaigns.test.jsx | ✅ |
| 3.7 | Send ad request to a specific influencer | ✅ POST /api/campaign/<id>/ad-request | ✅ Send Request form | 🧪 Campaigns.test.jsx | ✅ |
| 3.8 | View ad requests per campaign | ✅ GET /api/campaign/<id>/ad-requests | ✅ Expand campaign card | 🧪 Campaigns.test.jsx | ✅ |
| 3.9 | View all influencer-initiated requests across campaigns | ✅ GET /api/sponsors/requests | ✅ SponsorRequests.jsx | — | 🟡 |
| 3.10 | Accept an influencer request | ✅ POST /api/sponsors/requests/<id>/respond | ✅ Accept button | — | 🟡 |
| 3.11 | Reject an influencer request | ✅ POST /api/sponsors/requests/<id>/respond | ✅ Decline button | — | 🟡 |
| 3.12 | Negotiate on an influencer request | ✅ POST /api/sponsors/requests/<id>/respond | ✅ Negotiate form | — | 🟡 |
| 3.13 | Filter requests by status | ✅ ?status= query param | ✅ Status tabs | — | 🟡 |
| 3.14 | Update sponsor profile | ✅ PUT /api/sponsors/profile | ✅ Settings.jsx | 🧪 Settings.test.jsx | ✅ |
| 3.15 | Upload sponsor profile image | ✅ POST /api/sponsors/profile/image | ✅ File input | 🧪 Settings.test.jsx | ✅ |
| 3.16 | Email is read-only | ✅ Backend blocks changes | ✅ Field disabled | 🧪 Settings.test.jsx | ✅ |
| 3.17 | Accepted influencer count on campaign cards | ✅ include_influencers in to_dict() | ✅ Shown on card | 🧪 Campaigns.test.jsx | ✅ |

---

## 4. Influencer Use Cases

| # | Use Case | Backend | Frontend | Tests | Status |
|---|----------|---------|----------|-------|--------|
| 4.1 | View influencer overview (stats, quick actions) | ✅ GET /api/influencer/profile | ✅ InfluencerDashboard/index.jsx | 🧪 InfluencerDashboard.test.jsx | ✅ |
| 4.2 | Browse public campaigns | ✅ GET /api/influencer/open-campaigns | ✅ InfluencerCampaigns.jsx | 🧪 InfluencerDashboard.test.jsx | ✅ |
| 4.3 | Filter campaigns by category | ✅ ?category= | ✅ Filter input | 🧪 InfluencerDashboard.test.jsx | ✅ |
| 4.4 | Filter campaigns by minimum budget | ✅ ?minBudget= | ✅ Filter input | 🧪 InfluencerDashboard.test.jsx | ✅ |
| 4.5 | Clear campaign filters | — | ✅ Clear button | 🧪 InfluencerDashboard.test.jsx | ✅ |
| 4.6 | Join (accept) a public campaign | ✅ POST /api/influencer/campaigns/<id>/accept | ✅ Join Campaign button | 🧪 InfluencerDashboard.test.jsx | ✅ |
| 4.7 | Joined badge for already-accepted campaigns | ✅ isAcceptedByUser flag | ✅ Joined pill | 🧪 InfluencerDashboard.test.jsx | ✅ |
| 4.8 | Express interest (influencer-initiated ad request) | ✅ POST /api/influencer/campaigns/<id>/express-interest | ❌ Not wired in frontend | — | ❌ |
| 4.9 | View sponsor ad requests (My Deals) | ✅ GET /api/influencer/ad-requests | ✅ InfluencerDeals.jsx | 🧪 InfluencerDashboard.test.jsx | ✅ |
| 4.10 | Accept a sponsor ad request | ✅ POST .../accept | ✅ Accept button | 🧪 InfluencerDashboard.test.jsx | ✅ |
| 4.11 | Reject a sponsor ad request | ✅ POST .../reject | ✅ Decline button | 🧪 InfluencerDashboard.test.jsx | ✅ |
| 4.12 | Negotiate on a sponsor ad request | ✅ POST .../negotiate | ✅ Negotiate form | 🧪 InfluencerDashboard.test.jsx | ✅ |
| 4.13 | Filter deals by status | — (client-side) | ✅ Status tabs | 🧪 InfluencerDashboard.test.jsx | ✅ |
| 4.14 | Update influencer profile | ✅ PUT /api/influencer/profile | ✅ InfluencerSettings.jsx | 🧪 InfluencerDashboard.test.jsx | ✅ |
| 4.15 | Upload influencer profile image | ✅ POST /api/influencer/profile/image | ✅ File input | 🧪 InfluencerDashboard.test.jsx | ✅ |
| 4.16 | Email shown as read-only | — | ✅ Read-only badge | 🧪 InfluencerDashboard.test.jsx | ✅ |
| 4.17 | Empty state when no deals | — | ✅ Empty card | 🧪 InfluencerDashboard.test.jsx | ✅ |
| 4.18 | Empty state when no campaigns match filters | — | ✅ No campaigns found message | 🧪 InfluencerDashboard.test.jsx | ✅ |

---

## 5. Public / Shared Use Cases

| # | Use Case | Backend | Frontend | Tests | Status |
|---|----------|---------|----------|-------|--------|
| 5.1 | Landing / home page | — | ✅ DeviceDisplay.jsx | — | 🟡 |
| 5.2 | Public campaigns on landing page | ✅ GET /api/campaign/public | ✅ DeviceDisplay.jsx fetches & renders live campaigns | 🧪 test_campaigns.py | ✅ |
| 5.3 | About page | — | ✅ About.jsx | — | 🟡 |
| 5.4 | Contact page | — | ✅ Contact.jsx | 🧪 Contact.test.jsx | ✅ |
| 5.5 | Navbar with theme toggle + mobile responsive | — | ✅ Navbar.jsx | 🧪 Navbar.test.jsx | ✅ |
| 5.6 | Protected routes — redirect to /login if no token | — | ✅ ProtectedRoute.jsx | 🧪 ProtectedRoute.test.jsx | ✅ |
| 5.7 | Role-based route guarding | ✅ Backend RBAC decorators | ✅ ProtectedRoute role check | 🧪 ProtectedRoute.test.jsx | ✅ |
| 5.8 | Expired/malformed token handled gracefully | — | ✅ ProtectedRoute + axiosInstance | 🧪 ProtectedRoute.test.jsx | ✅ |
| 5.9 | Light/dark theme toggle | — | ✅ ThemeContext.jsx | — | 🟡 |
| 5.10 | 404 page | — | ✅ Catch-all in App.jsx | — | 🟡 |

---

## 6. Security & Infrastructure

| # | Use Case | Backend | Frontend | Status |
|---|----------|---------|----------|--------|
| 6.1 | Passwords hashed with bcrypt (rounds=10) | ✅ | — | ✅ |
| 6.2 | JWT with role + userId claims | ✅ | ✅ ProtectedRoute decodes | ✅ |
| 6.3 | RBAC: admin/sponsor/influencer route guards | ✅ utils/auth.py decorators | ✅ ProtectedRoute | ✅ |
| 6.4 | Rate limiting on auth endpoints | ✅ Flask-Limiter | — | ✅ |
| 6.5 | CORS restricted to CORS_ORIGINS env var | ✅ | — | ✅ |
| 6.6 | Secret key guard on startup (production) | ✅ RuntimeError if placeholder | — | ✅ |
| 6.7 | Input validation with Marshmallow (422 + field errors) | ✅ | ✅ Form error display | ✅ |
| 6.8 | File upload validation (type + size ≤10MB) | ✅ save_profile_image() | ✅ accept="image/*" | ✅ |
| 6.9 | Admin stats cache (60s TTL, cache-busted on mutations) | ✅ Flask-Caching | — | ✅ |
| 6.10 | db.create_all() blocked in production | ✅ Gated by FLASK_ENV | — | ✅ |
| 6.11 | Alembic migrations initialized | ✅ flask_backend/migrations/ | — | ✅ |

---

## 7. Gaps & Outstanding Items

| # | Gap | Severity | Notes |
|---|-----|----------|-------|
| G1 | Login blocked for pending users has no dedicated UI | Low | Backend 403 message shown as generic error. A "Awaiting Approval" screen would improve UX. |
| G2 | express-interest endpoint not wired to frontend | Medium | POST /api/influencer/campaigns/<id>/express-interest exists but InfluencerCampaigns.jsx only calls /accept. The SponsorRequests.jsx is built to receive these — flow is one-sided. |
| G3 | SponsorRequests.jsx has no test file | Low | Fully functional but not covered in src/tests/. |
| G4 | Public campaigns not fetched on landing page | Low | GET /api/campaign/public works but DeviceDisplay.jsx doesn't call it. |
| G5 | AdminDashboard test mock missing pendingApprovals | Low | Mock stats object doesn't include pendingApprovals — Pending Approval stat card renders dash in tests. |
| G6 | No email notifications | Low | Deferred to Phase 6. No emails on ad request status changes or account approval. |
| G7 | No Dockerfile / deployment config | Medium | Deferred to Phase 6. CockroachDB + gunicorn production deploy not configured. |
| G8 | Theme toggle not tested | Low | ThemeContext has no dedicated test. |

---

## Summary

| Category | Total | ✅ Full | 🟡 Partial | ❌ Missing |
|----------|-------|---------|------------|------------|
| Auth & Registration | 12 | 11 | 1 | 0 |
| Admin | 19 | 17 | 2 | 0 |
| Sponsor | 17 | 12 | 5 | 0 |
| Influencer | 18 | 14 | 3 | 1 |
| Public / Shared | 10 | 5 | 5 | 0 |
| Security / Infra | 11 | 11 | 0 | 0 |
| **Total** | **87** | **70 (80%)** | **16 (18%)** | **1 (1%)** |

The single missing use case (G2 — express-interest frontend wiring) and the 5 partial
sponsor use cases (SponsorRequests tests) are the only meaningful gaps before a
full feature-complete release.
