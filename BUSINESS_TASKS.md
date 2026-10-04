# Cofluence — Business Readiness Task List

> **Constraint:** Free services only. No paid third-party APIs. No security compromises.
> **New packages:** Flask-Mail, itsdangerous (bundled with Flask), sentry-sdk, @sentry/react.
> **Email:** Gmail SMTP via app-password (free, no API key needed).

---

## Legend

| Tag | Meaning |
|-----|---------|
| P0 | Blocker — cannot operate as a business without this |
| P1 | High — core marketplace feature gap |
| P2 | Medium — quality / retention |
| P3 | Post-launch polish |

---

## Phase 7 — Core Platform Completeness (1–2 weeks)

### TASK-701 [P1] Wire express-interest on frontend ✅ DONE

**Gap:** Backend endpoint `POST /api/influencer/campaigns/<id>/express-interest` exists
but `InfluencerCampaigns.jsx` has no UI for it. `SponsorRequests.jsx` is already built
to receive these requests — the flow is one-sided.

**Plan:**
1. Add "Apply" button to each campaign card in `InfluencerCampaigns.jsx`. Only shown
   when `isAcceptedByUser=false` and not already applied.
2. On click: expand inline form — `message` (required) + `proposedTerms` (optional).
3. Submit: `POST /api/influencer/campaigns/<id>/express-interest` with `{message, proposedTerms}`.
4. On 201: replace Apply with "Applied" badge. Store applied IDs in local state Set.
5. On 400 duplicate: show "Already applied". On 404: "Campaign no longer available".
6. Tests in `InfluencerDashboard.test.jsx`:
   - Apply button shown for non-accepted campaigns
   - Form opens on Apply click
   - Calls API with correct payload
   - Applied badge shown after success
   - Already applied on 400

**Files:** `InfluencerCampaigns.jsx`, `InfluencerDashboard.test.jsx`
**New deps:** none | **DB:** none

---

### TASK-702 [P2] SponsorRequests test coverage ✅ DONE (28 tests)

**Gap:** `SponsorRequests.jsx` (full accept/reject/negotiate flow) has zero tests.

**Plan:**
1. Create `src/tests/SponsorRequests.test.jsx`.
2. Mock `axiosInstance` (same pattern as `Settings.test.jsx`).
3. Mock data: 2 requests — one pending (with influencer profile), one accepted.
4. Tests:
   - renders "Influencer Requests" heading
   - shows influencer name, category, reach, campaign title
   - shows Accept, Negotiate, Decline buttons for pending
   - calls `POST /api/sponsors/requests/<id>/respond` with `action=accept`
   - calls respond with `action=reject`
   - shows negotiate textarea on Negotiate click
   - calls respond with `action=negotiate` and `counterTerms`
   - filters to pending only on Pending tab click
   - shows empty state when no requests
   - shows success message after action
   - shows error on API failure

**Files:** `src/tests/SponsorRequests.test.jsx` (new)
**New deps:** none | **DB:** none

---

### TASK-703 [P1] Influencer search/directory for sponsors ✅ DONE

**Gap:** Sponsors type influencer IDs manually. No discovery = no marketplace.

**Backend plan:**
1. Add `GET /api/sponsors/influencers` to `sponsor_routes.py`:
   - Query params: `category`, `niche`, `minReach`, `maxReach`, `search` (name)
   - Only active, non-flagged influencers
   - Response: id, name, category, niche, reach, profileImageUrl per influencer
   - Pagination: `page`, `per_page` (max 50)
   - `@sponsor_required()` guard
2. Add `InfluencerSearchSchema` to `schemas.py`.
3. Tests in `test_sponsor.py`: filters by category, reach range, name search,
   excludes flagged, excludes pending, pagination, requires sponsor token.

**Frontend plan:**
1. Create `src/Components/SponsorDashboard/InfluencerDirectory.jsx`:
   - Search + reach filter inputs, Filter + Clear buttons
   - Grid of influencer cards: avatar/initials, name, category, niche, reach badge
   - "Send Request" button per card: opens inline form with campaign dropdown
     (from GET /api/campaign/my-campaigns) + message + proposedTerms
   - Submit: `POST /api/campaign/<campaign_id>/ad-request` with influencerId
   - Pagination controls (prev / next)
2. Add route `/sponsor-dashboard/influencers` in `App.jsx`.
3. Add "Find Influencers" to `Sidebar.jsx`.
4. Create `src/tests/InfluencerDirectory.test.jsx`.

**Files:** `sponsor_routes.py`, `schemas.py`, `test_sponsor.py`,
`InfluencerDirectory.jsx` (new), `App.jsx`, `Sidebar.jsx`,
`InfluencerDirectory.test.jsx` (new)
**New deps:** none | **DB:** none

---

### TASK-704 [P2] Real public campaigns on landing page ✅ DONE (completed by LC branch)

**Gap:** `GET /api/campaign/public` works but `DeviceDisplay.jsx` never calls it.

**Plan:**
1. In `DeviceDisplay.jsx`, on mount call `GET /api/campaign/public?limit=6`.
2. Show skeleton cards while loading (CSS only, no new lib).
3. On success: render real cards — title, category, budget, sponsor company.
4. On failure: silently fall back to static section. Never break for anonymous visitors.

**Files:** `DeviceDisplay.jsx` | **New deps:** none | **DB:** none

---

### TASK-705 [P2] "Awaiting Approval" UX for pending login ✅ DONE

**Gap:** 403 on login for pending users shows as a generic red error string.

**Plan:**
1. In `LoginForm.jsx`: detect `err.response?.status === 403` separately.
2. Set `isPending` state flag, render a styled "Account Under Review" panel:
   - Heading: "Your account is under review"
   - Copy: "The admin will notify you by email once approved."
   - "Back to Home" link — resets the panel
3. Tests in `LoginForm.test.jsx`:
   - shows pending panel on 403
   - does not navigate on 403
   - Back to Home resets the panel

**Files:** `LoginForm.jsx`, `LoginForm.test.jsx` | **New deps:** none | **DB:** none

---

## Phase 8 — Email System (1–2 weeks)

**Provider:** Gmail SMTP via app-password (free, 500 emails/day, no API key).
**Fallback:** Brevo free SMTP — 300 emails/day, plain SMTP protocol.
**Security:** Tokens signed with `itsdangerous.URLSafeTimedSerializer` using
`SECRET_KEY + per-purpose salt`. Short expiry. Never stored raw in DB.

### TASK-801 [P0] Flask-Mail setup + email utilities ✅ DONE

**This must be done before TASK-802 through TASK-806.**

**Plan:**
1. Add `Flask-Mail==0.10.0` to `requirements.txt`.
2. Add to `config.py` BaseConfig (all from env vars, no defaults in code):
   `MAIL_SERVER`, `MAIL_PORT` (587), `MAIL_USE_TLS` (True),
   `MAIL_USERNAME`, `MAIL_PASSWORD` (Gmail app-password),
   `MAIL_DEFAULT_SENDER`, `FRONTEND_URL`.
   In `TestingConfig`: `MAIL_SUPPRESS_SEND = True` (no real emails in tests).
3. In `app/__init__.py`: create `mail = Mail()`, call `mail.init_app(app)`, export it.
4. Create `app/utils/email.py`:
   - `send_email(to, subject, html_body)`: wraps `flask_mail.Message`, dispatches
     via `current_app.extensions['executor']` (async, non-blocking). try/except
     logs warning on failure — never raises to caller.
   - `make_token(payload: dict, salt: str, expires_sec=900) -> str`:
     uses `itsdangerous.URLSafeTimedSerializer(current_app.config['SECRET_KEY'])`
   - `verify_token(token: str, salt: str, max_age=900) -> dict | None`:
     returns payload or None if expired/tampered
5. Create `app/utils/email_templates.py` — pure Python string functions:
   `verification_email(name, verify_url)`,
   `approved_email(name, login_url)`,
   `rejected_email(name)`,
   `password_reset_email(name, reset_url)`,
   `ad_request_received_email(influencer_name, campaign_title, sponsor_company)`,
   `ad_request_status_email(recipient_name, other_party, campaign_title, status)`,
   `admin_new_registration_email(name, role, admin_url)`.
   All return HTML strings with inline styles. No Jinja2 files.
6. Add `MAIL_SERVER`, `MAIL_PORT`, `MAIL_USE_TLS`, `MAIL_USERNAME`,
   `MAIL_PASSWORD`, `MAIL_DEFAULT_SENDER`, `FRONTEND_URL` to `.env.example`
   and `.env.production`.

**Files:** `requirements.txt`, `config.py`, `app/__init__.py`, `.env.example`,
`.env.production`, `app/utils/email.py` (new), `app/utils/email_templates.py` (new)
**New dep:** `Flask-Mail==0.10.0`

---

### TASK-802 [P0] Email verification on registration

**Depends on:** TASK-801

**Backend plan:**
1. Add `email_verified Boolean default False` to `User` model.
2. `flask db migrate -m "add email_verified to users"`.
3. In `auth_routes.py register()` after commit:
   - `token = make_token({'user_id': user.id}, salt='email-verify', expires_sec=86400)`
   - `verify_url = f"{FRONTEND_URL}/verify-email?token={token}"`
   - dispatch `verification_email(name, verify_url)` async
   - Return 202 `{ message: "Check your email to verify your address." }`
4. Add `POST /api/auth/verify-email`:
   - Body: `{ token }`
   - `verify_token(token, salt='email-verify', max_age=86400)`
   - If valid: `user.email_verified = True`, commit. Return 200.
   - If expired/invalid: 400 `{ message: "Link expired. Please register again." }`
5. In `login()` — add check BEFORE pending check:
   `if not user.email_verified: return 403 { message: "Please verify your email first." }`
6. Tests in `test_auth.py`:
   - register returns 202
   - unverified user cannot login (403)
   - verify-email with valid token sets email_verified=True
   - expired token returns 400, tampered token returns 400

**Frontend plan:**
1. Create `src/Components/VerifyEmail.jsx`:
   - On mount: read `?token=` from URL, POST to `/api/auth/verify-email`
   - Success: "Email verified! Your registration is under admin review." + /login link
   - Failure: "This link has expired. Please register again." + /signup/step1 link
   - Loading: spinner
2. Add route `/verify-email` to `App.jsx` (public).
3. Update `SignUpSuccess.jsx`: copy says "Check your inbox and verify your email."

**Files:** `user.py`, `auth_routes.py`, `config.py`, `.env.example`,
`VerifyEmail.jsx` (new), `App.jsx`, `SignUpSuccess.jsx`
**New migration:** yes

---

### TASK-803 [P1] Admin alert email on new registration ✅ DONE (implemented in TASK-802)

**Depends on:** TASK-801

**Plan:**
1. In `auth_routes.py register()`, after verification email dispatch:
   - Also dispatch `admin_new_registration_email(name, role, admin_url)` async
   - `admin_url = f"{FRONTEND_URL}/admin-dashboard?tab=pending"`
   - Send to `current_app.config['ADMIN_EMAIL']`
2. No new endpoint. No DB change.

**Files:** `auth_routes.py` | **New deps:** none | **DB:** none

---

### TASK-804 [P1] Approval/rejection confirmation emails ✅ DONE

**Depends on:** TASK-801

**Plan:**
1. `admin_routes.py approve_user()` after commit:
   dispatch `approved_email(user.name, f"{FRONTEND_URL}/login")` async
2. `admin_routes.py reject_user()` after commit:
   dispatch `rejected_email(user.name)` async

**Files:** `admin_routes.py` | **New deps:** none | **DB:** none

---

### TASK-805 [P1] Ad request notification emails ✅ DONE

**Depends on:** TASK-801. Four triggers, all async, all non-blocking.

1. **Influencer expresses interest → sponsor email**
   `influencer_routes.py` `express_interest()` — after commit, email sponsor.
2. **Sponsor sends ad request → influencer email**
   `campaign_routes.py` `create_ad_request()` — if influencer_id set, email influencer.
3. **Influencer acts on request → sponsor email**
   `influencer_routes.py` `handle_ad_request()` — email `campaign.sponsor.user.email`.
4. **Sponsor acts on request → influencer email**
   `sponsor_routes.py` `respond_to_request()` — if influencer_id set, email influencer.

**Files:** `influencer_routes.py`, `campaign_routes.py`, `sponsor_routes.py`
**New deps:** none | **DB:** none

---

### TASK-806 [P0] Password reset flow ✅ DONE

**Depends on:** TASK-801
**Security:** Rate limited 5/hour. No user enumeration. 15-min token, no DB storage needed.

**Backend plan:**
1. `POST /api/auth/forgot-password` (rate limited `5 per hour`):
   - Body: `{ email }`. Find user. Whether found or not: **always return 200**.
   - If found: `make_token({'user_id': id}, salt='pw-reset')`, dispatch email async.
   - Response: `{ message: "If that email is registered, a reset link has been sent." }`
2. `POST /api/auth/reset-password`:
   - Body: `{ token, password }`
   - `verify_token(token, salt='pw-reset', max_age=900)` — 400 if invalid/expired
   - Validate password min 6 chars
   - `user.set_password(password)`, commit. Return 200.
   - **Never reveal whether email exists in any error message.**
3. Tests: always 200 on forgot-password, valid token updates password,
   expired/tampered returns 400, rate limit 429 on 6th attempt per hour.

**Frontend plan:**
1. `src/Components/ForgotPassword.jsx`:
   - Email input + "Send Reset Link" button
   - Always show same message on submit (no info leak)
2. `src/Components/ResetPassword.jsx`:
   - Read `?token=` from URL. Password + confirm inputs (client-side match check).
   - 200: "Password updated! Redirecting..." then `navigate('/login')` after 2s
   - 400: "Link expired. Request a new one." + /forgot-password link
3. Add `/forgot-password` and `/reset-password` to `App.jsx` (public).
4. Add "Forgot password?" link to `LoginForm.jsx`.

**Files:** `auth_routes.py`, `ForgotPassword.jsx` (new), `ResetPassword.jsx` (new),
`App.jsx`, `LoginForm.jsx` | **DB:** none

---

## Phase 9 — Deployment Infrastructure (3–5 days)

### TASK-901 [P0] Dockerfile

**Plan:**
1. `flask_backend/Dockerfile` (two-stage for smaller image):
   - Stage 1 `builder`: `python:3.12-slim`, install all deps into `/install`
   - Stage 2 `runtime`: copy deps + app, create non-root user `appuser` (UID 1000),
     EXPOSE 5000, CMD gunicorn -w 4 -b 0.0.0.0:5000 --timeout 120 --access-logfile - run:app
2. `flask_backend/.dockerignore`:
   `venv/`, `__pycache__/`, `*.pyc`, `.env`, `instance/`, `uploads/`, `.pytest_cache/`
3. Compose file at project root (service `api` + optional local `db`):
   - `api` builds from flask_backend/Dockerfile, mounts `./uploads`
   - `db` uses `postgres:16-alpine` (skip if using CockroachDB cloud)
4. Document `docker compose up --build` in README.

**Files:** `flask_backend/Dockerfile` (new), `flask_backend/.dockerignore` (new),
`compose.yml` (new), `README.md`
**Security:** Non-root container user, no secrets in image layers.

---

### TASK-902 [P0] Deploy Flask API — Render free tier (with keepalive)

**Why Render (not Railway/Fly.io):**
- Railway removed free tier entirely — not usable.
- Fly.io requires a credit card and has no free tier.
- Render has a genuine free tier: no credit card, auto-HTTPS, GitHub integration.
- **One caveat:** free services sleep after 15 minutes of inactivity (50s cold start).
  This is solved for free using cron-job.org (see Step 5 below).
- **Upgrade path:** when revenue starts, Render Starter is $7/month — no migration needed.

**Detailed plan:**

**Step 1 — Create Render account:**
1. Sign up at render.com using GitHub (no credit card).
2. Connect the GitHub repo.

**Step 2 — Create Web Service:**
1. New → Web Service → connect repo.
2. Settings:
   - Root Directory: `flask_backend`
   - Runtime: Docker (uses our `flask_backend/Dockerfile`)
   - Branch: `main`
   - Region: closest to CockroachDB cluster region
3. Set Start Command (overrides Dockerfile CMD for Render compatibility):
   `flask db upgrade && gunicorn -w 2 -b 0.0.0.0:$PORT --timeout 120 run:app`
   (2 workers on free tier — 512MB RAM limit)

**Step 3 — Set environment variables in Render dashboard:**
```
SECRET_KEY            = <64-char random hex>
JWT_SECRET_KEY        = <64-char random hex>
DATABASE_URL          = <CockroachDB connection string>
CORS_ORIGINS          = https://your-vercel-app.vercel.app
FLASK_ENV             = production
ADMIN_EMAIL           = admin@cofluence.dev
ADMIN_PASSWORD        = <strong password>
MAIL_SERVER           = smtp.gmail.com
MAIL_PORT             = 587
MAIL_USE_TLS          = true
MAIL_USERNAME         = <gmail address>
MAIL_PASSWORD         = <gmail app password>
MAIL_DEFAULT_SENDER   = noreply@cofluence.dev
FRONTEND_URL          = https://your-vercel-app.vercel.app
RATELIMIT_STORAGE_URL = memory://
SENTRY_DSN            = <from sentry>
```

**Step 4 — First deploy:**
Render auto-deploys on push to `main`. First deploy runs `flask db upgrade`
via the start command, then seeds admin:
1. After first deploy succeeds, open Render Shell (web UI).
2. Run: `flask seed-admin`

**Step 5 — Prevent sleep (CRITICAL for a business):**
1. Create free account at [cron-job.org](https://cron-job.org) (no credit card).
2. Create a cron job:
   - URL: `https://your-render-app.onrender.com/` (the health endpoint)
   - Schedule: every 14 minutes (*/14 * * * *)
   - This keeps the service warm 24/7 at zero cost.
3. UptimeRobot (TASK-904) also pings every 5 minutes — double keepalive.

**Step 6 — Auto-deploy on push to main:**
In `.github/workflows/deploy.yml`, replace Railway action with Render deploy hook:
```yaml
deploy-api:
  runs-on: ubuntu-latest
  steps:
    - name: Trigger Render deploy
      run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK_URL }}
```
Get `RENDER_DEPLOY_HOOK_URL` from Render dashboard → Settings → Deploy Hook.
Add as GitHub repository secret.

**Migration to AWS/other cloud (when ready):**
- The Dockerfile works on any container platform unchanged.
- All secrets are in env vars — just copy them to the new platform.
- No vendor lock-in: Render's Docker deploy is standard.

**Files:** `flask_backend/Dockerfile` (update worker count for free tier),
`.github/workflows/deploy.yml` (update deploy job), `README.md`


### TASK-903 [P0] Deploy React frontend — Vercel free tier

**Plan:**
1. Create `vercel.json` with SPA rewrite: all paths → `/index.html`
   (prevents 404 on React Router page refresh).
2. Connect GitHub repo to Vercel. Build: `npm run build`, output: `dist`.
3. Set `VITE_API_URL=https://your-app.onrender.com` in Vercel env vars.
4. Update `CORS_ORIGINS` in Render dashboard to Vercel domain after first Vercel deploy.

**Files:** `vercel.json` (new), `README.md`

---

### TASK-904 [P2] Uptime monitoring — UptimeRobot free

Free plan, no credit card. 50 monitors, 5-min interval.
1. Add HTTP monitor for `https://your-app.onrender.com/`.
2. Alert contact: admin email.
3. No code changes. Document in README.

---

### TASK-905 [P2] Error tracking — Sentry free (5,000 errors/month)

**Backend:**
1. Add `sentry-sdk[flask]==2.19.0` to `requirements.txt`.
2. In `app/__init__.py`: `sentry_sdk.init(dsn=..., traces_sample_rate=0.1)`
   — guarded by `if dsn:` so fully inert in dev/test.

**Frontend:**
1. Add `@sentry/react` to `package.json`.
2. In `src/main.jsx`: `Sentry.init(...)` guarded by `if (import.meta.env.VITE_SENTRY_DSN)`.

**Files:** `requirements.txt`, `app/__init__.py`, `src/main.jsx`, `package.json`

---

### TASK-906 [P2] GitHub Actions CI/CD pipeline

**What:** Automated test + lint on every push/PR. Auto-deploy to Render (API) and Vercel
(frontend) on merge to `main`. Prevents broken code ever reaching production.

**Detailed plan:**

1. Create `.github/workflows/ci.yml`:
   - Triggers: push + PR on `main` and `SK` branches
   - Job `backend`: python 3.12, pip cache, install deps, flake8 lint, pytest + coverage
   - Job `frontend`: node 20, npm ci, `npm run build` (catches import errors), `npm test -- --run`
   - Upload coverage to Codecov (free for public repos) via `codecov/codecov-action@v4`
   - Both jobs must pass before PR can merge

2. Create `.github/workflows/deploy.yml` (runs only on push to `main`):
   - Job `deploy-api`: uses a curl POST to Render Deploy Hook URL (set as `RENDER_DEPLOY_HOOK_URL` secret)
   - Job `deploy-frontend`: uses `amondnet/vercel-action@v25` with
     `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` secrets
   - Both jobs depend on CI passing (use `needs: [ci]` or separate workflow trigger)

3. Set GitHub repository secrets (Settings → Secrets → Actions):
   `RENDER_DEPLOY_HOOK_URL` — from Render dashboard → Service → Settings → Deploy Hook
   `VERCEL_TOKEN` — from Vercel dashboard → Settings → Tokens
   `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` — from `.vercel/project.json` after `vercel link`

4. Set branch protection on `main` (Settings → Branches → Add rule):
   - Require status checks: `backend` + `frontend` must pass
   - Require PR review before merge (no direct pushes to main)
   - Dismiss stale reviews on new commits

5. Add `flake8` to backend dev dependencies (no prod dep).
   Config in `flask_backend/setup.cfg`:
   ```
   [flake8]
   max-line-length = 120
   ignore = E501,W503
   exclude = venv,migrations,__pycache__
   ```

6. Add Codecov badge to README.

**Files:** `.github/workflows/ci.yml` (new), `.github/workflows/deploy.yml` (new),
`flask_backend/setup.cfg` (new), `README.md`
**Free limit:** 2,000 min/month GitHub Actions — sufficient at this scale


## Phase 10 — In-App Notifications (1 week)

### TASK-1001 [P2] Notifications model + API

**DB:**
1. Create `app/models/notification.py`:
   `notifications` table: `id`, `user_id` (FK CASCADE), `type` (varchar 50),
   `title` (varchar 255), `body` (text), `is_read` (bool default false),
   `link` (varchar nullable), `created_at`
2. Add `User.notifications` relationship (cascade delete).
3. `flask db migrate -m "add notifications table"`

**Backend:**
1. Create `app/routes/notification_routes.py`:
   - `GET /api/notifications` — last 50, unread first, any-role auth
   - `POST /api/notifications/mark-read` — body `{ ids:[1,2,3] }` or `{ all:true }`
   - `GET /api/notifications/count` — returns `{ unread: N }` (polled by bell)
2. Create `app/utils/notify.py`:
   `push_notification(user_id, type, title, body, link=None)` — creates DB record.
   Called alongside email sends in routes.
3. Register blueprint at `/api/notifications`.
4. Tests: `test_notifications.py` — list, mark-read by ids, mark-all-read, count.

**Files:** `notification.py` (new), `notification_routes.py` (new),
`notify.py` (new), `app/__init__.py`, `user.py`, `test_notifications.py` (new)
**New migration:** yes

---

### TASK-1002 [P2] Notification bell UI

**Depends on:** TASK-1001

**Plan:**
1. Create `src/Components/NotificationBell.jsx`:
   - Polls `GET /api/notifications/count` every 30s + on tab focus.
   - Bell icon (Lucide) with red badge when `unread > 0`.
   - Click: fetch + show dropdown of last 20 notifications.
   - Each item: unread dot, title, body (80 char truncate), relative time.
   - Click item: mark as read, navigate to `link` if present.
   - "Mark all read" button.
   - Close on click outside.
2. Add `<NotificationBell />` to `Sidebar.jsx` (sponsor) + `InfluencerLayout.jsx`.
3. Tests: badge count, opens dropdown, mark-read on click, mark-all-read.

**Files:** `NotificationBell.jsx` (new), `Sidebar.jsx`,
`InfluencerLayout.jsx`, `NotificationBell.test.jsx` (new)

---

## Phase 11 — Revenue Model (1–2 weeks)

> No payment gateway. Commission tracked in DB, collected manually (UPI / bank transfer).
> Simplest viable model — zero cost, zero integration risk.

### TASK-1101 [P1] Commission / deal tracking model

**DB:**
1. Create `app/models/deal.py` — `deals` table:
   `id`, `ad_request_id` (FK unique), `campaign_id` (FK), `sponsor_id` (FK),
   `influencer_id` (FK), `gross_amount` (int, from campaign.budget),
   `commission_pct` (int default 10), `commission_amount` (int, computed),
   `net_to_influencer` (int, computed), `status` (enum: pending_payment/paid/disputed),
   `created_at`, `settled_at` (nullable)
2. `flask db migrate -m "add deals table"`

**Backend:**
1. Auto-create Deal when request accepted (both in `influencer_routes.py` and `sponsor_routes.py`).
2. `GET /api/admin/deals` — filter by status, date range.
3. `POST /api/admin/deals/<id>/mark-paid` — sets `status=paid`, `settled_at=now()`.
4. Add `pendingDeals` count to admin stats response.
5. Tests: deal created on accept, admin can list and mark paid.

**Files:** `deal.py` (new), `influencer_routes.py`, `sponsor_routes.py`,
`admin_routes.py` | **New migration:** yes

---

### TASK-1102 [P2] Deals tab in AdminDashboard

**Depends on:** TASK-1101

**Plan:**
Add "Deals" tab to `AdminDashboard.jsx` with a table:
Campaign | Sponsor | Influencer | Gross | Commission | Net | Status | Action
"Mark Paid" per pending row. Filter tabs: all / pending / paid / disputed.
Total pending commission displayed at top.

**Files:** `AdminDashboard.jsx`

---

### TASK-1103 [P2] Sponsor plan tiers (Free: 3 campaigns, Pro: unlimited)

**DB:** Add `plan Enum('free','pro') default='free'` to `sponsors` table.
`flask db migrate -m "add plan to sponsors"`

**Backend:**
1. `create_campaign()`: if `plan=free` and existing campaigns >= 3, return 403.
2. `POST /api/admin/sponsors/<id>/set-plan` — admin only, body `{ plan }`.

**Frontend:**
1. Plan badge on `SponsorHome.jsx`.
2. Upgrade prompt modal when campaign creation blocked.
3. Upgrade/downgrade buttons in AdminDashboard users tab.

**Files:** `sponsor.py`, `campaign_routes.py`, `admin_routes.py`,
`SponsorHome.jsx`, `Campaigns.jsx`, `AdminDashboard.jsx` | **New migration:** yes

---

## Phase 12 — Legal & Trust (3–5 days)

### TASK-1201 [P1] Terms of Service + Privacy Policy + consent tracking

**DB:** Add `tos_accepted_at DateTime nullable` to `users`. Migration required.

**Backend:**
1. `RegisterSchema`: add `tosAccepted = Bool(required=True, validate=Equal(True))`.
2. `register()`: set `user.tos_accepted_at = datetime.now(utc)`.

**Frontend:**
1. `src/Components/TermsOfService.jsx` — static legal page.
   Sections: Eligibility, Platform Rules, Commission Policy, Prohibited Use,
   Termination, Disclaimer, Governing Law.
2. `src/Components/PrivacyPolicy.jsx` — static legal page.
   Sections: Data collected, How used, Storage & security, Retention, Your rights.
3. Routes `/terms` and `/privacy` in `App.jsx` (public).
4. `SignUpStep1.jsx`: T&C checkbox links to `/terms` and `/privacy` (new tab).
5. Footer links in `Navbar.jsx`.

**Files:** `user.py`, `schemas.py`, `auth_routes.py`, `TermsOfService.jsx` (new),
`PrivacyPolicy.jsx` (new), `App.jsx`, `SignUpStep1.jsx`, `Navbar.jsx`
**New migration:** yes

---

### TASK-1202 [P2] Deal delivery + confirmation flow

**Depends on:** TASK-1101

**DB:** Add `delivery_note (text)`, `delivery_url (text)`,
`sponsor_confirmed_at (datetime)` to `deals`. Migration required.

**Backend:**
1. `POST /api/influencer/deals/<deal_id>/deliver` — sets delivery fields, notifies sponsor.
2. `POST /api/sponsors/deals/<deal_id>/confirm` — sets `sponsor_confirmed_at`, notifies influencer.

**Frontend:**
1. `InfluencerDeals.jsx`: "Mark as Delivered" for accepted deals with no delivery_note.
2. `SponsorRequests.jsx`: "Confirm Delivery" for accepted deals where delivery_note is set.

**Files:** `deal.py`, `influencer_routes.py`, `sponsor_routes.py`,
`InfluencerDeals.jsx`, `SponsorRequests.jsx` | **New migration:** yes

---

## Phase 13 — Analytics Dashboards (1 week)

### TASK-1301 [P3] Sponsor analytics page

**Backend:** `GET /api/sponsors/analytics`:
- Total campaigns, total requests sent, acceptance rate (%), total deal value
- Monthly breakdown last 6 months (campaigns + accepted deals)

**Frontend:** `SponsorAnalytics.jsx`:
- 4 stat cards + line chart (Chart.js already installed)
- Top campaigns table by acceptance rate
- Route `/sponsor-dashboard/analytics`, link in `Sidebar.jsx`

**Files:** `sponsor_routes.py`, `SponsorAnalytics.jsx` (new), `App.jsx`, `Sidebar.jsx`

---

### TASK-1302 [P3] Influencer analytics page

**Backend:** `GET /api/influencer/analytics`:
- Campaigns joined, requests received vs accepted, total deal value
- Request status breakdown (for doughnut chart)

**Frontend:** `InfluencerAnalytics.jsx`:
- Stat cards + doughnut chart (Chart.js)
- Route `/influencer/analytics`, link in `InfluencerLayout.jsx`

**Files:** `influencer_routes.py`, `InfluencerAnalytics.jsx` (new),
`App.jsx`, `InfluencerLayout.jsx`

---

## Execution Order & Dependencies

```
Phase 7   TASK-701..705   1-2 weeks   No dependencies — start immediately
Phase 8   TASK-801..806   1-2 weeks   TASK-801 must finish before 802-806
Phase 9   TASK-901..906   3-5 days    TASK-901 before 902+903
Phase 10  TASK-1001..1002 1 week      TASK-1001 before 1002; parallel with Phase 8
Phase 11  TASK-1101..1103 1-2 weeks   TASK-1101 before 1102+1103+1202
Phase 12  TASK-1201..1202 3-5 days    TASK-1101 before TASK-1202
Phase 13  TASK-1301..1302 1 week      Phases 7-11 ideally done
```

**What can run in parallel:**
- Phase 7 + Phase 9 (TASK-901 Dockerfile) — no overlap
- Phase 10 (TASK-1001) + Phase 8 — no overlap
- Phase 11 (TASK-1101) + Phase 9 — no overlap

---

## Free Services Reference

| Service | Purpose | Free Limit | Notes |
|---------|---------|-----------|-------|
| Gmail SMTP (app-password) | Transactional email | 500/day | No API key, plain SMTP |
| Brevo free SMTP (fallback) | Email if Gmail quota hit | 300/day | No credit card |
| Render free tier | Flask API hosting | 750 hrs/month | Sleeps after 15min idle — solved by cron-job.org |
| cron-job.org | Keep Render awake | Unlimited | Free, no credit card |
| Vercel hobby | React frontend | Unlimited bandwidth | Free custom domain |
| CockroachDB Serverless | PostgreSQL | 10 GB storage | No credit card |
| UptimeRobot free | Uptime monitoring | 50 monitors, 5-min | Also acts as keepalive |
| Sentry free | Error tracking | 5,000 errors/month | No credit card |
| GitHub Actions free | CI + CD pipeline | 2,000 min/month | Auto-deploy on merge |

**Railway/Fly.io are NOT free anymore** — Railway removed its free tier,
Fly.io requires a credit card with no guaranteed free allowance.

**Upgrade path when earning:**
Render Starter = $7/month → AWS/GCP/Azure when volume justifies it.
The Dockerfile ensures zero migration effort — same image runs everywhere.

**Zero paid APIs. Zero API keys in frontend bundle.
All secrets in server environment variables only.**

---

## Security Checklist (apply to every task)

- [ ] All tokens signed with `SECRET_KEY + per-purpose salt` (itsdangerous)
- [ ] All tokens have short expiry (15 min reset, 24 h verify, no infinite tokens)
- [ ] No user enumeration in forgot-password or verify-email responses
- [ ] All new endpoints have `@role_required()` decorators
- [ ] All new DB columns have explicit `nullable` + `default` constraints
- [ ] Rate limiting on every auth-adjacent endpoint
- [ ] No secrets in git. No secrets in frontend bundle.
- [ ] `MAIL_SUPPRESS_SEND = True` in `TestingConfig`
- [ ] Non-root user in Dockerfile
- [ ] New Alembic migration for every DB schema change
- [ ] New Alembic migration committed to git before merging

---

## Task Count Summary

| Phase | Tasks | Priority |
|-------|-------|---------|
| 7 — Core completeness | 5 | P1/P2 |
| 8 — Email system | 6 | P0/P1 |
| 9 — Deployment + DB + CI/CD | 8 | P0/P2 |
| 9b — DB deployment & lifecycle | 1 | P0 |
| 9c — API guardrails | 1 | P0 |
| 10 — Notifications | 2 | P2 |
| 11 — Revenue | 3 | P1/P2 |
| 12 — Legal & Trust | 2 | P1/P2 |
| 13 — Analytics | 2 | P3 |
| **Total** | **30** | |

---

## Phase 9b — Database Deployment & Lifecycle

### TASK-907 [P0] CockroachDB provisioning + migration deployment

**What:** The DB deployment is currently a one-liner in TASK-902. This task
covers the full lifecycle: initial provisioning, migration strategy, backups,
and connection pooling — all using free tooling.

**Detailed plan:**

**Step 1 — Provision CockroachDB Serverless (free, 10 GB):**
1. Create account at cockroachlabs.com (no credit card).
2. Create cluster → Serverless → region closest to your Render deployment region.
3. Create database: `cofluence_db`.
4. Create SQL user: `cofluence_app` with a strong password (generated via
   `python -c "import secrets; print(secrets.token_urlsafe(32))"`).
5. Download the CA certificate from the CockroachDB UI.
6. Copy the connection string — format:
   `postgresql://cofluence_app:<pass>@<host>:26257/cofluence_db?sslmode=verify-full`
7. Set as `DATABASE_URL` in Render environment variables.

**Step 2 — Initial schema creation:**
1. From local machine with venv active:
   ```
   cd flask_backend
   FLASK_ENV=production DATABASE_URL=<cockroachdb_url> flask db upgrade
   ```
   This runs all Alembic migrations against CockroachDB.
2. Verify tables created:
   ```
   FLASK_ENV=production DATABASE_URL=<cockroachdb_url> flask shell
   >>> from app.models import *; from app import db; db.engine.table_names()
   ```
3. Seed admin:
   ```
   FLASK_ENV=production DATABASE_URL=<cockroachdb_url> ADMIN_EMAIL=... ADMIN_PASSWORD=... flask seed-admin
   ```

**Step 3 — Migration strategy for future schema changes:**
Every DB change follows this sequence. Never skip steps.
```
# 1. Change the SQLAlchemy model
# 2. Generate migration
flask db migrate -m "describe the change"
# 3. Review the generated file in flask_backend/migrations/versions/
# 4. Test locally on SQLite
flask db upgrade
# 5. Commit the migration file to git
git add flask_backend/migrations/versions/<new_file>.py
git commit -m "db: <describe change>"
# 6. Push to main — Render auto-deploys and runs db upgrade via start command
```

Add to `flask_backend/Dockerfile` CMD:
```
CMD flask db upgrade && gunicorn -w 4 -b 0.0.0.0:$PORT --timeout 120 run:app
```
This ensures migrations always run before gunicorn starts on every deploy.
Safe because Alembic is idempotent — already-applied migrations are skipped.

**Step 4 — Connection pooling:**
CockroachDB Serverless has a connection limit. Add to `config.py`:
```python
SQLALCHEMY_ENGINE_OPTIONS = {
    'pool_pre_ping': True,
    'pool_recycle':  300,
    'pool_size':     5,      # max 5 persistent connections per worker
    'max_overflow':  2,      # 2 extra burst connections
    'pool_timeout':  30,
}
```
With 4 gunicorn workers × 7 connections = 28 max — well within free tier limit.

**Step 5 — Automated backups:**
CockroachDB Serverless automatically backs up data daily (free tier).
No action needed. Verify in CockroachDB UI → Backups tab.
For manual snapshot before a risky migration:
```
cockroach dump cofluence_db --url=<connection_url> > backup_$(date +%Y%m%d).sql
```
Install CockroachDB CLI locally: `brew install cockroachdb/tap/cockroach` (Mac).

**Step 6 — Add db upgrade to CI pipeline:**
In `.github/workflows/deploy.yml` deploy-api job, after Render deploy:
```yaml
- name: Run migrations
  run: |
    pip install flask flask-migrate flask-sqlalchemy python-dotenv
    cd flask_backend
    FLASK_ENV=production DATABASE_URL=${{ secrets.DATABASE_URL }} flask db upgrade
```
This catches migration failures before traffic hits the new code.

**Files:** `flask_backend/Dockerfile` (update CMD), `config.py` (pool settings),
`.github/workflows/deploy.yml` (migration step), `README.md`
**New deps:** none | **DB:** CockroachDB Serverless (free)
**Security:** DB credentials only in Render env vars. CA cert not committed to git.

---

## Phase 9c — API Guardrails (all endpoints)

### TASK-908 [P0] Comprehensive API guardrails

**What:** The current API has auth guards (JWT + RBAC) and Marshmallow validation
on body fields, but is missing several layers of defence needed for a production
business platform. This task adds them systematically across all endpoints.

**The 6 guardrail layers to add:**

---

**Layer 1 — Request size limits (already partially done, needs verification)**

`MAX_CONTENT_LENGTH = 10MB` is set in config for file uploads. Extend this:
1. Add Flask error handler for `413 RequestEntityTooLarge` in `app/__init__.py`:
   ```python
   @app.errorhandler(413)
   def too_large(e):
       return jsonify({'message': 'Request body too large. Max 10 MB.'}), 413
   ```
2. For non-file JSON endpoints, add body size check middleware in `app/__init__.py`:
   ```python
   @app.before_request
   def check_json_size():
       if request.content_type == 'application/json':
           if request.content_length and request.content_length > 64 * 1024:  # 64 KB
               return jsonify({'message': 'JSON body too large.'}), 413
   ```
   64 KB is generous for any JSON API request. File uploads are handled separately.

---

**Layer 2 — Consistent error responses for all unhandled errors**

Currently unhandled exceptions return Flask's default HTML error page.
Add global error handlers in `app/__init__.py`:
```python
@app.errorhandler(400)
def bad_request(e):
    return jsonify({'message': 'Bad request.'}), 400

@app.errorhandler(401)
def unauthorized(e):
    return jsonify({'message': 'Authentication required.'}), 401

@app.errorhandler(403)
def forbidden(e):
    return jsonify({'message': 'Access forbidden.'}), 403

@app.errorhandler(404)
def not_found(e):
    return jsonify({'message': 'Resource not found.'}), 404

@app.errorhandler(405)
def method_not_allowed(e):
    return jsonify({'message': 'Method not allowed.'}), 405

@app.errorhandler(422)
def unprocessable(e):
    return jsonify({'message': 'Unprocessable entity.'}), 422

@app.errorhandler(429)
def rate_limited(e):
    return jsonify({'message': 'Too many requests. Please slow down.'}), 429

@app.errorhandler(500)
def server_error(e):
    return jsonify({'message': 'Internal server error.'}), 500
```
This ensures all API errors return JSON — never HTML — regardless of which
endpoint raised them. Prevents internal stack traces leaking to clients.

---

**Layer 3 — Input sanitisation on all text fields**

Marshmallow validates structure and types but does not strip HTML/script tags.
Add a sanitiser utility in `app/utils/sanitise.py`:
```python
import re

def strip_html(value: str) -> str:
    """Remove all HTML tags from a string."""
    if not isinstance(value, str):
        return value
    return re.sub(r'<[^>]+>', '', value).strip()

def sanitise_text(value: str, max_len: int = None) -> str:
    """Strip HTML and optionally truncate."""
    value = strip_html(value)
    if max_len:
        value = value[:max_len]
    return value
```

Apply `sanitise_text()` to all free-text inputs before writing to DB:
- `campaign.title`, `campaign.description`, `campaign.category`
- `ad_request.message`, `ad_request.proposed_terms`
- `user.name`, `sponsor.company_name`, `sponsor.industry`
- `influencer.category`, `influencer.niche`
- `notification.title`, `notification.body`

Add to each relevant route after Marshmallow validation, before DB write.

Add field-level max-length `validate.Length` to all Marshmallow schemas
that don't already have them:
- `CampaignSchema.description`: max 2000
- `AdRequestSchema.message`: max 1000
- `AdRequestSchema.proposedTerms`: max 1000
- `InfluencerProfileSchema.niche`: max 255 (already has it)

---

**Layer 4 — Ownership checks on every mutating endpoint**

Audit every PUT/DELETE/POST endpoint that touches a specific resource:

`campaign_routes.py`:
- PUT `/<id>`: ✅ `_own_campaign()` check exists
- DELETE `/<id>`: ✅ exists
- POST `/<id>/ad-request`: ✅ exists
- PUT `/ad-request/<id>`: ✅ exists
- DELETE `/ad-request/<id>`: ✅ exists

`influencer_routes.py`:
- PUT `/profile`: ✅ JWT identity used, no ID in URL (safe)
- POST `/campaigns/<id>/accept`: ✅ influencer identity from JWT
- POST `/ad-requests/<id>/<action>`: ⚠️ checks `influencer_id` only if set —
  add explicit check that the ad_request's campaign is one the influencer has accepted:
  ```python
  # Add after fetching ad_request:
  accepted_ids = {c.id for c in influencer.accepted_campaigns.all()}
  if ad_request.campaign_id not in accepted_ids:
      return jsonify({'message': 'Not authorized to act on this request'}), 403
  ```

`sponsor_routes.py`:
- PUT `/profile`: ✅ JWT identity, no URL ID
- POST `/requests/<id>/respond`: ✅ campaign.sponsor_id check exists
- POST `/deals/<id>/confirm` (TASK-1202): must verify `deal.campaign.sponsor_id == sponsor.id`

`admin_routes.py`:
- All endpoints: ✅ `@admin_required()` guards exist. No per-resource ownership needed.

Document the ownership check pattern in `app/utils/auth.py` as a comment block.

---

**Layer 5 — Security response headers**

Add a `@app.after_request` handler in `app/__init__.py` that sets security headers
on every response:
```python
@app.after_request
def set_security_headers(response):
    response.headers['X-Content-Type-Options']  = 'nosniff'
    response.headers['X-Frame-Options']          = 'DENY'
    response.headers['X-XSS-Protection']         = '1; mode=block'
    response.headers['Referrer-Policy']          = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy']       = 'geolocation=(), microphone=()'
    # Only add HSTS in production (breaks local HTTP dev)
    if not current_app.config.get('DEBUG'):
        response.headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
    return response
```

---

**Layer 6 — Rate limiting beyond auth routes**

Currently only `/register` (10/min) and `/login` (20/min) are rate-limited.
Extend limits to protect other sensitive operations:

In `admin_routes.py`:
- `GET /api/admin/export/*`: `@limiter.limit('10 per minute')` (prevent CSV scraping)
- `POST /api/admin/flag`: `@limiter.limit('60 per minute')` (prevent abuse)
- `DELETE /api/admin/remove`: `@limiter.limit('30 per minute')`

In `influencer_routes.py`:
- `POST /campaigns/<id>/express-interest`: `@limiter.limit('20 per minute')` (prevent spam)
- `POST /ad-requests/<id>/<action>`: `@limiter.limit('60 per minute')`

In `campaign_routes.py`:
- `POST /`: `@limiter.limit('10 per minute')` (prevent campaign spam)
- `POST /<id>/ad-request`: `@limiter.limit('30 per minute')`

In `sponsor_routes.py`:
- `POST /requests/<id>/respond`: `@limiter.limit('60 per minute')`

Add to `notification_routes.py` (TASK-1001):
- `GET /api/notifications`: `@limiter.limit('120 per minute')` (polled frequently)
- `GET /api/notifications/count`: `@limiter.limit('120 per minute')`

---

**Tests to add in `test_models_schemas_utils.py`:**
- `TestSanitiseUtil`: strip_html removes tags, keeps clean text, handles None
- `TestErrorHandlers`: 404 returns JSON, 405 returns JSON, 413 returns JSON,
  500 returns JSON (not HTML)
- `TestSecurityHeaders`: all 6 headers present on any API response
- `TestRateLimits`: (integration) 11th register in 1 min returns 429,
  21st login returns 429

**Files:** `app/__init__.py`, `app/utils/sanitise.py` (new),
`app/utils/schemas.py` (field length limits), `influencer_routes.py`,
`campaign_routes.py`, `admin_routes.py`, `sponsor_routes.py`,
`notification_routes.py` (TASK-1001), `test_models_schemas_utils.py`
**New deps:** none (re module is stdlib)
**DB:** none

---
