# InSync — Influencer Engagement & Sponsorship Coordination Platform

A full-stack web application that connects **sponsors** with **influencers** for campaign management and ad-request coordination.

> **Architecture Note (June 2026 Migration):** The backend has been fully migrated from Node.js/Express/MySQL to **Flask/SQLAlchemy/PostgreSQL** (with SQLite fallback for local development). The React frontend is fully integrated with the Flask API. All API contracts are preserved.

---

## 📋 Table of Contents

- [How to Run the Project Locally](#how-to-run-the-project-locally)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [6-Phase Roadmap](#6-phase-roadmap)
- [Database Schema](#database-schema)
- [Manual Environment Setup](#manual-environment-setup)
- [API Reference](#api-reference)
- [Frontend Pages & Features](#frontend-pages--features)
- [What's Implemented](#whats-implemented)
- [What's Pending / TODO](#whats-pending--todo)
- [Contributing / Collaborating](#contributing--collaborating)

---

## How to Run the Project Locally

Two startup scripts handle everything automatically — dependency checks, venv activation, database creation, admin seeding, and launching both servers with your browser opening on the frontend.

### Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.10+ | https://python.org |
| Node.js | 18+ | https://nodejs.org |

> **PostgreSQL is not required for local development.** The `.env` defaults to SQLite — no database server setup needed.

> **macOS note:** If port 5000 is blocked by AirPlay Receiver, set `PORT=5001` in `flask_backend/.env` and update `vite.config.js` proxy target to `http://localhost:5001`.

---

### ▶ macOS / Linux

```bash
bash start.sh
```

Starts Flask on port **5000** and Vite on **5173**, opens browser automatically.
Press **Ctrl + C** to stop both. Run `bash stop.sh` if started with `&`.

---

### ▶ Windows

Double-click `start.bat` or run from Command Prompt. Two console windows open — keep both open.

---

### Default Admin Credentials

| Field | Value |
|-------|-------|
| Email | `admin@insync.dev` |
| Password | `Admin@1234` |

Change these in `flask_backend/.env` before any shared or production deployment.

---

## Tech Stack

| Layer        | Technology                                                        |
|--------------|-------------------------------------------------------------------|
| **Frontend** | React 19, Vite 6, Tailwind CSS v4, Framer Motion, Bootstrap 5    |
| Routing      | React Router v7                                                   |
| HTTP client  | Axios — shared `axiosInstance` with auto-token + 401 interceptor  |
| Charts       | Chart.js via react-chartjs-2                                      |
| Animations   | Lottie React                                                      |
| Icons        | Lucide React, React Icons                                         |
| **Backend**  | Python 3.12, Flask 3.0                                            |
| ORM          | SQLAlchemy 2.0 via Flask-SQLAlchemy                               |
| Migrations   | Flask-Migrate (Alembic)                                           |
| **Database** | PostgreSQL (production) / SQLite (local dev fallback)             |
| Auth         | Flask-JWT-Extended (PyJWT), bcrypt                                |
| RBAC         | Custom role-guard decorators (`admin_required`, etc.)             |
| Validation   | Marshmallow schemas (field-level, 422 on failure)                 |
| Caching      | Flask-Caching (SimpleCache, 60s TTL on admin stats)               |
| File Upload  | Werkzeug FileStorage (UUID filename, images only, 10MB limit)     |
| Async Tasks  | Flask-Executor (threading)                                        |
| CORS         | Flask-CORS                                                        |

> **Legacy backend** (Node.js/Express/MySQL) is preserved in `Server/` for reference only. Do not run it alongside Flask.

---

## Project Structure

```
root/
├── flask_backend/                    # ✅ Active Python/Flask backend
│   ├── run.py                        # Application entry point
│   ├── requirements.txt              # All Python dependencies (pinned)
│   ├── .env                          # Local env vars (git-ignored)
│   ├── .env.example                  # Template — copy to .env and fill in values
│   ├── venv/                         # Python virtual environment
│   └── app/
│       ├── __init__.py               # App factory — Flask-Caching added in Phase 4
│       ├── config.py                 # Dev/Prod/Test configs + SQLite fallback + cache config
│       ├── commands.py               # CLI: flask seed-admin, flask init-db
│       ├── models/
│       │   ├── user.py
│       │   ├── sponsor.py
│       │   ├── influencer.py         # AcceptedCampaigns many-to-many junction
│       │   ├── campaign.py
│       │   └── ad_request.py
│       ├── routes/
│       │   ├── auth_routes.py        # /api/auth — marshmallow-validated register/login
│       │   ├── admin_routes.py       # /api/admin — cached stats, flag, remove, search
│       │   ├── influencer_routes.py  # /api/influencer — paginated open-campaigns
│       │   ├── sponsor_routes.py     # /api/sponsors — marshmallow-validated profile update
│       │   └── campaign_routes.py    # /api/campaign — paginated my-campaigns + ad-requests
│       └── utils/
│           ├── auth.py               # RBAC decorators
│           ├── files.py              # Profile image upload helper
│           └── schemas.py            # Marshmallow validation schemas (Phase 4)
│
├── src/                              # React frontend (Vite)
│   ├── App.jsx                       # All routes wrapped in ProtectedRoute
│   ├── api/
│   │   └── axiosInstance.js          # Shared axios — auto Bearer token + 401 redirect
│   ├── Components/
│   │   ├── ProtectedRoute.jsx        # Role-based frontend guard (Phase 4)
│   │   ├── AdminDashboard.jsx        # Stats charts, flagged, search, ongoing campaigns
│   │   ├── InfluencerDashboard.jsx   # Profile, filter campaigns, ad requests
│   │   ├── LoginForm.jsx
│   │   └── SponsorDashboard/
│   │       ├── Campaigns.jsx         # Full campaign + ad-request CRUD
│   │       ├── Settings.jsx          # Sponsor profile update
│   │       ├── SponsorHome.jsx
│   │       └── Sidebar.jsx
│   ├── signup/                       # Multi-step signup flow
│   │   └── steps/
│   │       ├── SignUpStep1.jsx
│   │       ├── SignUpStep2.jsx
│   │       └── SignUpStep3.jsx       # Uses shared api instance
│   └── theme/
│       └── ThemeContext.jsx          # Light/dark mode toggle
│
├── Server/                           # ⚠️ Legacy Node.js backend (reference only)
├── uploads/
│   └── influencer_photos/            # Auto-created; stores influencer profile images
├── public/assets/                    # Static images and slider assets
├── vite.config.js                    # Proxy: /api/* and /uploads/* → Flask
├── index.html
└── package.json
```

---

## 6-Phase Roadmap

### ✅ Phase 1 — Environment Setup, Shared Schema & PostgreSQL Modeling
**Status: COMPLETE**

- [x] Python 3.12 virtual environment at `flask_backend/venv`
- [x] `requirements.txt` with all pinned dependencies
- [x] Flask app factory (`create_app`) with dev/prod/test configs
- [x] PostgreSQL-first DB config with automatic SQLite fallback
- [x] SQLAlchemy 2.0 models: User, Sponsor, Influencer, Campaign, AdRequest
- [x] AcceptedCampaigns many-to-many junction table
- [x] Cascade deletes on all foreign keys
- [x] Flask-Migrate (Alembic) for schema version control
- [x] `flask init-db` and `flask seed-admin` CLI commands

### ✅ Phase 2 — Authentication & RBAC
**Status: COMPLETE**

- [x] `POST /api/auth/register` — transactional multi-table user creation
- [x] `POST /api/auth/login` — bcrypt verify + JWT with role claim
- [x] JWT tokens expire in 1 hour
- [x] `admin_required`, `sponsor_required`, `influencer_required` decorators
- [x] `roles_required(*roles)` flexible multi-role guard
- [x] Profile image upload for influencers (Werkzeug, UUID filename, 10MB limit)
- [x] Vite proxy configured — frontend uses `/api/...` relative paths

### ✅ Phase 3 — Core Dashboards & Management Features
**Status: COMPLETE**

- [x] Sponsor campaign CRUD (create, list with accepted influencers, update, delete)
- [x] Ad request CRUD per campaign
- [x] Influencer: browse + filter public campaigns, `isAcceptedByUser` flag
- [x] Influencer: accept campaigns, accept/reject ad requests with status enforcement
- [x] Admin: ongoing campaigns with real progress %, flagged entities, search, stats, flag/remove

### ✅ Phase 4 — Optimization, Performance Caching & Frontend Integration
**Status: COMPLETE**

- [x] **ProtectedRoute** — `src/Components/ProtectedRoute.jsx` wraps all three dashboards; redirects unauthenticated users to `/login` and wrong-role users to their own dashboard
- [x] **Shared axios instance** — `src/api/axiosInstance.js` auto-attaches Bearer token; 401 interceptor clears localStorage and redirects to `/login`
- [x] **All axios calls migrated** — every frontend component (LoginForm, SignUpStep3, InfluencerDashboard, Campaigns, Settings, SponsorHome, SponsorForm, InfluencerForm, Navbar) now uses the shared `api` instance — zero hardcoded `localhost` URLs remain
- [x] **Marshmallow validation** — `flask_backend/app/utils/schemas.py` defines RegisterSchema, LoginSchema, CampaignSchema, AdRequestSchema, AdRequestUpdateSchema, SponsorProfileSchema, InfluencerProfileSchema; all routes return 422 with field-level errors on invalid input
- [x] **Pagination** — `GET /api/campaign/my-campaigns`, `GET /api/campaign/<id>/ad-requests`, and `GET /api/influencer/open-campaigns` support `page` + `per_page` query params; responses return `{ items, total, page, per_page, pages }`
- [x] **Flask-Caching** — admin `/stats` endpoint cached for 60s (SimpleCache); cache invalidated on flag/remove operations
- [x] **JSX syntax bugs fixed** — stray `{/* comment */}` inside ternaries in `AdminDashboard.jsx` and `Campaigns.jsx` resolved
- [x] **Campaign filter UI** — influencer dashboard has category and min-budget filter inputs wired to the API
- [x] **`setMessage` bug fixed** — `InfluencerDashboard.jsx` now uses `setError` consistently

### 🔲 Phase 5 — Background Tasks, CSV Exports & Negotiation Flow
**Status: PLANNED**

- [ ] Flask-Executor async email notifications on ad request status change
- [ ] CSV export: `GET /api/admin/export/campaigns`
- [ ] CSV export: `GET /api/admin/export/users`
- [ ] Webhook-based daily digest cron (free-tier Docker compatible)
- [ ] Negotiation flow UI — counter-offer on ad requests (`negotiation` status + `proposedTerms`)
- [ ] Sponsor profile image upload (mirroring influencer upload)

### 🔲 Phase 6 — Dockerization, Testing & Final Documentation
**Status: PLANNED**

- [ ] Multi-stage `Dockerfile` for Flask backend
- [ ] `docker-compose.yml` — Flask + PostgreSQL + React (nginx)
- [ ] Integration test suite (pytest + Flask test client)
- [ ] `.env.production` template
- [ ] OpenAPI/Swagger documentation
- [ ] Final deployment guide

---

## Database Schema

Managed by SQLAlchemy + Flask-Migrate. PostgreSQL in production; SQLite auto-fallback locally.

### Tables

**users**
| Column      | Type                                        | Notes             |
|-------------|---------------------------------------------|-------------------|
| id          | INTEGER PK autoincrement                    |                   |
| name        | VARCHAR(255) NOT NULL                       |                   |
| email       | VARCHAR(255) UNIQUE NOT NULL                | indexed           |
| password    | VARCHAR(255) NOT NULL                       | bcrypt hashed     |
| role        | ENUM('admin','sponsor','influencer')        |                   |
| is_flagged  | BOOLEAN default false                       |                   |
| created_at  | TIMESTAMP                                   |                   |
| updated_at  | TIMESTAMP                                   |                   |

**sponsors**
| Column       | Type             | Notes                  |
|--------------|------------------|------------------------|
| id           | INTEGER PK       |                        |
| user_id      | FK → users.id    | CASCADE DELETE, UNIQUE |
| company_name | VARCHAR(255)     |                        |
| industry     | VARCHAR(255)     |                        |
| budget       | INTEGER          |                        |

**influencers**
| Column            | Type          | Notes                  |
|-------------------|---------------|------------------------|
| id                | INTEGER PK    |                        |
| user_id           | FK → users.id | CASCADE DELETE, UNIQUE |
| category          | VARCHAR(255)  | NOT NULL               |
| niche             | VARCHAR(255)  |                        |
| reach             | INTEGER       |                        |
| profile_image_url | VARCHAR(500)  | stored filename only   |

**campaigns**
| Column      | Type             | Notes           |
|-------------|------------------|-----------------|
| id          | INTEGER PK       |                 |
| sponsor_id  | FK → sponsors.id | CASCADE DELETE  |
| title       | VARCHAR(255)     | NOT NULL        |
| description | TEXT             |                 |
| category    | VARCHAR(255)     |                 |
| budget      | INTEGER          |                 |
| is_public   | BOOLEAN          | default true    |
| is_flagged  | BOOLEAN          | default false   |
| created_at  | TIMESTAMP        |                 |
| updated_at  | TIMESTAMP        |                 |

**ad_requests**
| Column         | Type                                                | Notes          |
|----------------|-----------------------------------------------------|----------------|
| id             | INTEGER PK                                          |                |
| campaign_id    | FK → campaigns.id                                   | CASCADE DELETE |
| influencer_id  | FK → influencers.id                                 | nullable       |
| status         | ENUM('pending','accepted','rejected','negotiation') | default pending|
| message        | TEXT                                                |                |
| proposed_terms | TEXT                                                |                |
| created_at     | TIMESTAMP                                           |                |
| updated_at     | TIMESTAMP                                           |                |

**accepted_campaigns** (junction)
| Column        | Type                |
|---------------|---------------------|
| influencer_id | FK → influencers.id |
| campaign_id   | FK → campaigns.id   |
| accepted_at   | TIMESTAMP           |

---

## Manual Environment Setup

### 1. Set up Python venv

```bash
cd flask_backend
python -m venv venv
source venv/bin/activate   # macOS/Linux
# .\venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

### 2. Configure environment variables

```bash
cp flask_backend/.env.example flask_backend/.env
```

Edit `flask_backend/.env`:

```env
# SQLite for local dev (default — no setup needed)
DATABASE_URL=sqlite:///influencer_dev.db

# PostgreSQL when ready:
# DATABASE_URL=postgresql://postgres:your_password@localhost:5432/influencer_db

JWT_SECRET_KEY=your-long-random-secret
SECRET_KEY=another-long-random-secret
ADMIN_EMAIL=admin@insync.dev
ADMIN_PASSWORD=Admin@1234
PORT=5001   # change if 5000 is taken (macOS AirPlay conflict)
```

### 3. Initialise the database

```bash
# From flask_backend/ with venv active:
flask init-db
flask seed-admin
```

### 4. Install frontend dependencies

```bash
# From project root
npm install --legacy-peer-deps
```

### 5. Vite proxy

`vite.config.js` already proxies `/api/*` and `/uploads/*` to Flask. If you changed the Flask port, update the `target` values in `vite.config.js` to match.

---

## Running the Project Manually

```bash
# Terminal 1 — Flask backend
cd flask_backend
source venv/bin/activate
python run.py
# 🚀 InSync Flask API starting on http://0.0.0.0:5001

# Terminal 2 — React frontend
npm run dev
# Vite starts on http://localhost:5173
```

---

## API Reference

All protected routes require `Authorization: Bearer <token>`.

Validation errors return HTTP **422** with a structured `{ errors: { field: [messages] } }` body.

Paginated list endpoints accept `?page=1&per_page=20` and return:
```json
{ "items": [...], "total": 42, "page": 1, "per_page": 20, "pages": 3 }
```

### Auth — `/api/auth`

| Method | Endpoint    | Auth | Description |
|--------|-------------|------|-------------|
| POST   | `/register` | No   | Register sponsor or influencer. `multipart/form-data` for influencer profile image. |
| POST   | `/login`    | No   | Returns `{ token, user }`. |
| GET    | `/profile`  | JWT  | Returns authenticated user record. |

### Admin — `/api/admin` *(admin only)*

| Method | Endpoint             | Description |
|--------|----------------------|-------------|
| GET    | `/ongoing-campaigns` | Campaigns with active ad requests + real progress % |
| GET    | `/flagged`           | Flagged campaigns |
| POST   | `/flag`              | Flag user or campaign. Body: `{ type, id }` |
| DELETE | `/remove`            | Delete user or campaign. Body: `{ type, id }` |
| GET    | `/search?query=`     | Search users by name + campaigns by title |
| GET    | `/stats`             | Platform counts (cached 60s). Returns `users, sponsors, influencers, campaigns, adRequests, flaggedUsers, flaggedCampaigns` |

### Influencer — `/api/influencer` *(influencer only)*

| Method | Endpoint                      | Description |
|--------|-------------------------------|-------------|
| GET    | `/profile`                    | View profile + user data |
| PUT    | `/profile`                    | Update name, category, niche, reach |
| GET    | `/open-campaigns`             | Paginated public campaigns. Params: `category`, `minBudget`, `page`, `per_page`. Includes `isAcceptedByUser`. |
| POST   | `/campaigns/<id>/accept`      | Accept a public campaign |
| GET    | `/ad-requests`                | Ad requests for accepted campaigns |
| POST   | `/ad-requests/<id>/<action>`  | `accept` or `reject` a pending ad request |

### Sponsor — `/api/sponsors` *(sponsor only)*

| Method | Endpoint   | Description |
|--------|------------|-------------|
| GET    | `/details` | Raw Sponsor record |
| GET    | `/profile` | Sponsor + User combined |
| PUT    | `/profile` | Update name, companyName, industry, budget |

### Campaigns — `/api/campaign` *(sponsor only)*

| Method | Endpoint                          | Description |
|--------|-----------------------------------|-------------|
| POST   | `/`                               | Create campaign |
| GET    | `/my-campaigns`                   | Paginated list. Params: `page`, `per_page` |
| PUT    | `/<id>`                           | Update campaign |
| DELETE | `/<id>`                           | Delete campaign |
| POST   | `/<campaign_id>/ad-request`       | Send ad request |
| GET    | `/<campaign_id>/ad-requests`      | Paginated ad requests for a campaign |
| PUT    | `/ad-request/<ad_request_id>`     | Update status/message/terms |
| DELETE | `/ad-request/<ad_request_id>`     | Delete ad request |

---

## Frontend Pages & Features

| Route                         | Component           | Auth guard | Description |
|-------------------------------|---------------------|------------|-------------|
| `/`                           | DeviceDisplay       | None       | Landing page with device mockups |
| `/about`                      | About               | None       | About section with Lottie animation |
| `/login`                      | LoginForm           | None       | Email/password login, JWT stored, role redirect |
| `/signup/step1–3`             | SignUpLayout        | None       | Multi-step signup (role → details → confirm) |
| `/signup-success`             | SignUpSuccess       | None       | Post-registration confirmation |
| `/admin-dashboard`            | AdminDashboard      | admin only | Stats charts, ongoing campaigns, flagged, search |
| `/influencer/dashboard`       | InfluencerDashboard | influencer | Profile edit, filter campaigns, ad requests |
| `/sponsor-dashboard/home`     | SponsorHome         | sponsor    | Company overview + quick actions |
| `/sponsor-dashboard/campaign` | Campaigns           | sponsor    | Full campaign + ad-request CRUD |
| `/sponsor-dashboard/settings` | Settings            | sponsor    | Profile update |

---

## What's Implemented

### Backend (Phases 1–4 complete)
- [x] Flask app factory, SQLAlchemy models, Flask-Migrate
- [x] PostgreSQL + SQLite fallback
- [x] Transactional registration (bcrypt + JWT)
- [x] Full RBAC decorators on every protected route
- [x] All sponsor, influencer, admin, and campaign endpoints
- [x] Marshmallow input validation — 422 with field-level errors
- [x] Pagination on campaign list, ad-request list, open-campaigns
- [x] Flask-Caching on admin stats (60s TTL, invalidated on mutation)
- [x] Flask-Executor integrated for Phase 5 email tasks
- [x] Profile image upload (UUID filename, images only, 10MB limit)

### Frontend (Phases 1–4 complete)
- [x] Animated landing page, About, multi-step signup
- [x] JWT login with role-based redirect
- [x] `ProtectedRoute` — wraps all three dashboards with role enforcement
- [x] Shared `axiosInstance` — auto Bearer token + 401 → `/login` redirect
- [x] Zero hardcoded `localhost` URLs — all API calls use Vite proxy
- [x] Admin dashboard — stats charts (Bar + Doughnut), ongoing campaigns with progress bars, flagged entities, search with flag/remove buttons
- [x] Influencer dashboard — profile edit, campaign filter (category + min budget), ad request accept/reject
- [x] Sponsor dashboard — campaign CRUD, ad-request CRUD per campaign, accepted influencer list, settings

---

## What's Pending / TODO

### Phase 5

- [ ] **Negotiation flow** — `proposedTerms` and `negotiation` status exist on the model; no UI for counter-offers yet
- [ ] **Email notifications** — async via Flask-Executor when ad request status changes
- [ ] **CSV exports** — `GET /api/admin/export/campaigns` and `GET /api/admin/export/users`
- [ ] **Scheduled digest cron** — daily email via external webhook trigger
- [ ] **Sponsor profile image** — sponsors have no image upload (influencers do)

### Phase 6

- [ ] Multi-stage Docker setup (Dockerfile + docker-compose)
- [ ] Integration test suite (pytest + Flask test client)
- [ ] OpenAPI/Swagger documentation
- [ ] `.env.production` template + deployment guide

---

## Contributing / Collaborating

### Getting Started

1. Clone the repo
2. `cd flask_backend && python -m venv venv && source venv/bin/activate`
3. `pip install -r requirements.txt`
4. Copy `flask_backend/.env.example` → `flask_backend/.env` and fill in values
5. `flask init-db && flask seed-admin`
6. `cd .. && npm install --legacy-peer-deps && npm run dev`
7. In a separate terminal: `cd flask_backend && python run.py`

### Key Files

| File | Why it matters |
|------|----------------|
| `flask_backend/app/__init__.py` | App factory — register blueprints + extensions here |
| `flask_backend/app/utils/schemas.py` | All marshmallow schemas — add validation here |
| `flask_backend/app/utils/auth.py` | RBAC decorators — applied to every protected route |
| `flask_backend/app/config.py` | DB URL detection + cache config |
| `src/api/axiosInstance.js` | Shared HTTP client — token injection + 401 handling |
| `src/Components/ProtectedRoute.jsx` | Frontend route guard — role enforcement |
| `src/App.jsx` | All React routes — wrap new dashboards in ProtectedRoute |
| `vite.config.js` | Proxy config — update port here if Flask port changes |
