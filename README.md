# InSync — Influencer Engagement & Sponsorship Coordination Platform

A full-stack web application that connects **sponsors** with **influencers** for campaign management and ad-request coordination.

> **Architecture Note (June 2026 Migration):** The backend has been fully migrated from Node.js/Express/MySQL to **Flask/SQLAlchemy/PostgreSQL** (with SQLite fallback for local development). The React frontend remains unchanged. All API contracts are preserved so no frontend data-contract changes were needed.

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
- [Known Issues](#known-issues)
- [Contributing / Collaborating](#contributing--collaborating)

---

## How to Run the Project Locally

Two startup scripts handle everything automatically — dependency checks, venv activation, database creation, admin seeding, and launching both servers with your browser opening on the frontend.

### Prerequisites

Make sure the following are installed and available on your `PATH` before running either script:

| Tool | Version | Download |
|------|---------|----------|
| Python | 3.10 + | https://python.org |
| Node.js | 18 + | https://nodejs.org |
| curl | any | pre-installed on macOS, Linux, and Windows 10 1803+ |

> **PostgreSQL is not required for local development.** The `.env` defaults to SQLite — no database server setup needed.

---

### ▶ macOS / Linux

Open a terminal in the project root and run:

```bash
bash start.sh
```

The script will:
1. Check for Python 3 and Node.js
2. Create `flask_backend/venv` if it doesn't exist
3. Activate the venv and install Python packages (only when `requirements.txt` changes)
4. Copy `.env.example` → `.env` if no `.env` exists yet
5. Run `flask init-db` to create database tables
6. Run `flask seed-admin` to create the default admin account
7. Install npm packages if `node_modules` is missing
8. Start the Flask backend in the background on port **5000**
9. Start the Vite frontend in the background on port **5173**
10. Open `http://localhost:5173` in your default browser

Press **Ctrl + C** once in the terminal to stop both servers cleanly.

To stop without Ctrl + C (e.g., if you ran the script with `&`):

```bash
bash stop.sh
```

Logs are written to `flask.log` and `vite.log` in the project root.

---

### ▶ Windows

Double-click `start.bat`, or run it from **Command Prompt** or **PowerShell**:

```bat
start.bat
```

The script performs the same 10 steps as the shell version. Two console windows open:

- **"InSync — Flask API"** — keep open, shows Flask logs
- **"InSync — Vite Frontend"** — keep open, shows Vite output

Your default browser opens automatically to `http://localhost:5173`.

To stop, close both console windows or press **Ctrl + C** in each.

> **Tip (PowerShell users):** If execution policy blocks `.bat` files, run `cmd /c start.bat` instead, or call it directly from a standard Command Prompt.

---

### Default Admin Credentials

| Field | Value |
|-------|-------|
| Email | `admin@insync.dev` |
| Password | `Admin@1234` |

These are set in `flask_backend/.env`. Change them before any shared or production deployment.

---

### What the Scripts Do at Each Step

| Step | Action | Skipped if… |
|------|--------|-------------|
| 1 | Check Python 3 is on PATH | — |
| 2 | Check Node.js is on PATH | — |
| 3 | Create Python venv | `venv/` already exists |
| 4 | `pip install -r requirements.txt` | `.deps_installed` marker file exists and `requirements.txt` hasn't changed |
| 5 | Copy `.env.example` → `.env` | `.env` already exists |
| 6 | `flask init-db` + `flask seed-admin` | Tables and admin already exist (commands are idempotent) |
| 7 | `npm install` | `node_modules/` already exists |
| 8 | Start Flask on port 5000 | — |
| 9 | Start Vite on port 5173 | — |
| 10 | Open browser at `http://localhost:5173` | — |

---

## Tech Stack

| Layer        | Technology                                               |
|--------------|----------------------------------------------------------|
| **Frontend** | React 19, Vite 6, Tailwind CSS v4, Framer Motion         |
| Routing      | React Router v7                                          |
| HTTP client  | Axios (with Vite proxy — no hardcoded localhost URLs needed) |
| Animations   | Lottie React                                             |
| Icons        | Lucide React, React Icons                                |
| **Backend**  | Python 3.12, Flask 3.0                                   |
| ORM          | SQLAlchemy 2.0 via Flask-SQLAlchemy                      |
| Migrations   | Flask-Migrate (Alembic)                                  |
| **Database** | PostgreSQL (production) / SQLite (local dev fallback)    |
| Auth         | Flask-JWT-Extended (PyJWT), bcrypt                       |
| RBAC         | Custom role-guard decorators (`admin_required`, etc.)    |
| File Upload  | Werkzeug FileStorage (replaces Multer)                   |
| Async Tasks  | Flask-Executor (threading — replaces Redis/Celery)       |
| CORS         | Flask-CORS                                               |

> **Legacy backend** (Node.js/Express/MySQL) is preserved in `Server/` for reference. It is **no longer the active backend**.

---

## Project Structure

```
root/
├── flask_backend/                    # ✅ Active Python/Flask backend
│   ├── run.py                        # Application entry point
│   ├── requirements.txt              # All Python dependencies (pinned)
│   ├── .env                          # Local environment variables (git-ignored)
│   ├── .env.example                  # Template — copy to .env and fill in values
│   ├── venv/                         # Python virtual environment
│   └── app/
│       ├── __init__.py               # App factory (create_app)
│       ├── config.py                 # Config classes: Dev / Prod / Test + DB fallback
│       ├── commands.py               # CLI: flask seed-admin, flask init-db
│       ├── models/
│       │   ├── __init__.py           # Imports all models for Flask-Migrate
│       │   ├── user.py               # User (base auth table, all roles)
│       │   ├── sponsor.py            # Sponsor profile
│       │   ├── influencer.py         # Influencer profile + AcceptedCampaigns junction
│       │   ├── campaign.py           # Campaign
│       │   └── ad_request.py         # AdRequest
│       ├── routes/
│       │   ├── auth_routes.py        # /api/auth — register, login, profile
│       │   ├── admin_routes.py       # /api/admin — stats, flag, remove, search
│       │   ├── influencer_routes.py  # /api/influencer — profile, campaigns, ad-requests
│       │   ├── sponsor_routes.py     # /api/sponsors — profile CRUD
│       │   └── campaign_routes.py    # /api/campaign — full campaign + ad-request CRUD
│       └── utils/
│           ├── auth.py               # RBAC decorators (admin_required, etc.)
│           └── files.py              # Profile image upload helper
│
├── src/                              # React frontend (Vite)
│   ├── App.jsx                       # All client-side routes
│   └── Components/
│       ├── AdminDashboard.jsx
│       ├── InfluencerDashboard.jsx
│       ├── LoginForm.jsx
│       └── SponsorDashboard/
│           ├── Campaigns.jsx
│           ├── Settings.jsx
│           └── ...
│
├── Server/                           # ⚠️ Legacy Node.js backend (reference only)
│   └── ...                           # Do NOT run alongside Flask
│
├── uploads/
│   └── influencer_photos/            # Profile image storage (auto-created)
├── public/
│   └── assets/                       # Static images and slider assets
├── vite.config.js                    # Vite config with /api and /uploads proxy
├── index.html
└── package.json
```

---

## 6-Phase Roadmap

### ✅ Phase 1 — Environment Setup, Shared Schema & PostgreSQL Modeling
**Status: COMPLETE**

- [x] Python 3.12 virtual environment created at `flask_backend/venv`
- [x] `requirements.txt` generated with all pinned dependencies
- [x] Flask app factory pattern (`create_app`) with dev/prod/test configs
- [x] PostgreSQL-first database config with automatic SQLite fallback
- [x] `SQLALCHEMY_DATABASE_URI` auto-detects from `DATABASE_URL` env var
- [x] SQLAlchemy 2.0 models: User, Sponsor, Influencer, Campaign, AdRequest
- [x] AcceptedCampaigns many-to-many junction table
- [x] All cascade deletes configured on foreign keys
- [x] Flask-Migrate (Alembic) integrated for schema version control
- [x] `flask init-db` CLI command for first-time table creation
- [x] `flask seed-admin` CLI command seeds admin from `.env` credentials

### ✅ Phase 2 — Authentication & RBAC
**Status: COMPLETE**

- [x] `POST /api/auth/register` — transactional multi-table user creation
- [x] `POST /api/auth/login` — bcrypt verify + JWT with role claim embedded
- [x] `GET /api/auth/profile` — returns authenticated user record
- [x] JWT tokens expire in 1 hour; role claim embedded in token payload
- [x] `admin_required()` decorator — blocks non-admin JWT tokens with 403
- [x] `sponsor_required()` decorator — blocks non-sponsor JWT tokens with 403
- [x] `influencer_required()` decorator — blocks non-influencer JWT tokens with 403
- [x] `roles_required(*roles)` — flexible multi-role guard
- [x] Admin user created via `flask seed-admin` (no public registration endpoint)
- [x] Profile image upload for influencers (Werkzeug, UUID filename, 10MB limit)
- [x] Vite proxy configured so frontend uses `/api/...` relative paths

### ✅ Phase 3 — Core Dashboards & Management Features
**Status: COMPLETE**

- [x] **Sponsor campaigns:** Full CRUD — create, list (with accepted influencers), update, delete
- [x] **Ad requests:** Sponsors can create, list, update (status/message/terms), delete per campaign
- [x] **Influencer campaigns:** Browse public campaigns with `category` + `minBudget` filters; `isAcceptedByUser` flag per result
- [x] **Campaign acceptance:** Influencer accepts public campaign → AcceptedCampaigns junction
- [x] **Ad request actions:** Influencer can accept or reject pending requests; status transitions enforced
- [x] **Admin ongoing campaigns:** Real progress % (accepted/total ad requests, not random)
- [x] **Admin flagged:** View flagged campaigns with sponsor company name
- [x] **Admin flag/remove:** Flag or permanently delete users and campaigns
- [x] **Admin search:** Case-insensitive substring search across users and campaigns
- [x] **Admin stats:** Platform-wide counts including flagged users and campaigns
- [x] **Sponsor profile:** View + update name, company, industry, budget; email immutable
- [x] **Influencer profile:** View + update name, category, niche, reach

### 🔲 Phase 4 — Optimization, Performance Caching & Frontend Integration
**Status: PLANNED**

- [ ] Wire admin Stats tab in `AdminDashboard.jsx` to `/api/admin/stats`
- [ ] Connect admin Flag/Remove buttons in search results
- [ ] Add campaign filter inputs to `InfluencerDashboard.jsx` (API already supports it)
- [ ] Add `ProtectedRoute` component in React for frontend RBAC
- [ ] Switch all `http://localhost:2020` hardcoded URLs to relative `/api/...` paths (Vite proxy active)
- [ ] JWT session expiry handling — detect 401 responses, redirect to `/login`
- [ ] Add result pagination (`page`, `per_page` query params) on list endpoints
- [ ] Response caching layer (Flask-Caching with simple in-memory or Redis)
- [ ] Input validation layer (marshmallow schemas)
- [ ] Fix `InfluencerDashboard.jsx` bug: `setMessage` → `setError`
- [ ] Fix profile image path: store only filename, not full OS path

### 🔲 Phase 5 — Background Tasks, CSV Exports & Scheduled Notification Crons
**Status: PLANNED**

- [ ] Flask-Executor async tasks: email notifications on ad request status change
- [ ] CSV export endpoint for admin: `/api/admin/export/campaigns`
- [ ] CSV export endpoint for admin: `/api/admin/export/users`
- [ ] Webhook-based scheduled cron for daily digest emails (external trigger, free-tier Docker compatible)
- [ ] Negotiation flow UI: counter-offer on ad request (status: `negotiation`, `proposedTerms` field)
- [ ] Sponsor profile image upload (mirroring influencer upload)

### 🔲 Phase 6 — Multi-Stage Dockerization, System Testing & Final Documentation
**Status: PLANNED**

- [ ] Multi-stage `Dockerfile` for Flask backend (builder + slim runtime)
- [ ] `docker-compose.yml` — Flask + PostgreSQL + React (nginx)
- [ ] Integration test suite for all API endpoints (pytest + Flask test client)
- [ ] `.env.production` template for deployment
- [ ] Full API documentation (OpenAPI/Swagger or Redoc)
- [ ] Final README polish + deployment guide

---

## Database Schema

Managed by SQLAlchemy + Flask-Migrate. PostgreSQL in production; SQLite auto-fallback locally.

### Tables

**users**
| Column      | Type                                        | Notes                  |
|-------------|---------------------------------------------|------------------------|
| id          | INTEGER PK autoincrement                    |                        |
| name        | VARCHAR(255) NOT NULL                       |                        |
| email       | VARCHAR(255) UNIQUE NOT NULL                | indexed                |
| password    | VARCHAR(255) NOT NULL                       | bcrypt hashed          |
| role        | ENUM('admin','sponsor','influencer')        |                        |
| is_flagged  | BOOLEAN default false                       |                        |
| created_at  | TIMESTAMP                                   |                        |
| updated_at  | TIMESTAMP                                   |                        |

**sponsors**
| Column       | Type             | Notes                   |
|--------------|------------------|-------------------------|
| id           | INTEGER PK       |                         |
| user_id      | FK → users.id    | CASCADE DELETE, UNIQUE  |
| company_name | VARCHAR(255)     |                         |
| industry     | VARCHAR(255)     |                         |
| budget       | INTEGER          |                         |

**influencers**
| Column            | Type             | Notes                   |
|-------------------|------------------|-------------------------|
| id                | INTEGER PK       |                         |
| user_id           | FK → users.id    | CASCADE DELETE, UNIQUE  |
| category          | VARCHAR(255)     | NOT NULL                |
| niche             | VARCHAR(255)     |                         |
| reach             | INTEGER          |                         |
| profile_image_url | VARCHAR(500)     | stored filename         |

**campaigns**
| Column      | Type             | Notes                          |
|-------------|------------------|--------------------------------|
| id          | INTEGER PK       |                                |
| sponsor_id  | FK → sponsors.id | CASCADE DELETE                 |
| title       | VARCHAR(255)     | NOT NULL                       |
| description | TEXT             |                                |
| category    | VARCHAR(255)     |                                |
| budget      | INTEGER          |                                |
| is_public   | BOOLEAN          | default true                   |
| is_flagged  | BOOLEAN          | default false                  |
| created_at  | TIMESTAMP        |                                |
| updated_at  | TIMESTAMP        |                                |

**ad_requests**
| Column         | Type                                               | Notes           |
|----------------|----------------------------------------------------|-----------------|
| id             | INTEGER PK                                         |                 |
| campaign_id    | FK → campaigns.id                                  | CASCADE DELETE  |
| influencer_id  | FK → influencers.id                                | nullable        |
| status         | ENUM('pending','accepted','rejected','negotiation') | default pending |
| message        | TEXT                                               |                 |
| proposed_terms | TEXT                                               |                 |
| created_at     | TIMESTAMP                                          |                 |
| updated_at     | TIMESTAMP                                          |                 |

**accepted_campaigns** (many-to-many junction)
| Column         | Type               |
|----------------|--------------------|
| influencer_id  | FK → influencers.id |
| campaign_id    | FK → campaigns.id  |
| accepted_at    | TIMESTAMP          |

---

## Manual Environment Setup

> These are the manual steps. If you used `start.sh` or `start.bat` above, everything below has already been done for you.

### Prerequisites

- Python 3.10+
- Node.js 18+ (for the React frontend)
- PostgreSQL (optional for local dev — SQLite is used by default)

### 1. Clone & set up Python venv

```bash
cd flask_backend
python -m venv venv

# Windows
.\venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure environment variables

```bash
# Copy the example file
cp .env.example .env
```

Edit `flask_backend/.env`:

```env
# Use SQLite for local dev (default — no setup needed)
DATABASE_URL=sqlite:///influencer_dev.db

# Switch to PostgreSQL when ready
# DATABASE_URL=postgresql://postgres:your_password@localhost:5432/influencer_db

JWT_SECRET_KEY=your-long-random-secret
SECRET_KEY=another-long-random-secret
ADMIN_EMAIL=admin@insync.dev
ADMIN_PASSWORD=Admin@1234
```

### 3. Initialise the database

```bash
# From flask_backend/ with venv active:

# Option A — quick dev setup (creates all tables directly)
python run.py  # tables auto-created on first run

# Option B — use Flask-Migrate (recommended for production)
flask db init
flask db migrate -m "initial schema"
flask db upgrade
```

### 4. Seed the admin user

```bash
flask seed-admin
# ✅ Admin user created: admin@insync.dev
```

### 5. Install frontend dependencies

```bash
# From project root
npm install
```

---

## Running the Project Manually

> Prefer `start.sh` / `start.bat` instead. These manual steps are here for reference or CI environments.

### Flask Backend

```bash
cd flask_backend
.\venv\Scripts\activate   # Windows
# source venv/bin/activate  # macOS/Linux

python run.py
# 🚀 InSync Flask API starting on http://0.0.0.0:5000
```

### React Frontend

```bash
# From project root
npm run dev
# Vite starts on http://localhost:5173
# All /api/* requests are proxied to http://localhost:5000
```

> The `vite.config.js` proxy is configured. The frontend no longer needs hardcoded `http://localhost:5000` URLs — use relative `/api/...` paths.

---

## API Reference

All protected routes require `Authorization: Bearer <token>` header.

### Auth — `/api/auth`

| Method | Endpoint    | Auth | Description |
|--------|-------------|------|-------------|
| POST   | `/register` | No   | Register sponsor or influencer. `multipart/form-data` for influencer profile image. |
| POST   | `/login`    | No   | Login. Returns `{ token, user }`. |
| GET    | `/profile`  | JWT  | Returns authenticated user record. |

### Admin — `/api/admin` *(role: admin only)*

| Method | Endpoint               | Description |
|--------|------------------------|-------------|
| GET    | `/ongoing-campaigns`   | Campaigns with active ad requests + real progress % |
| GET    | `/flagged`             | Flagged campaigns |
| POST   | `/flag`                | Flag user or campaign. Body: `{ type, id }` |
| DELETE | `/remove`              | Delete user or campaign. Body: `{ type, id }` |
| GET    | `/search?query=`       | Search users by name + campaigns by title |
| GET    | `/stats`               | Counts: users, sponsors, influencers, campaigns, adRequests, flaggedUsers, flaggedCampaigns |

### Influencer — `/api/influencer` *(role: influencer only)*

| Method | Endpoint                           | Description |
|--------|------------------------------------|-------------|
| GET    | `/profile`                         | View profile + user data |
| PUT    | `/profile`                         | Update name, category, niche, reach |
| GET    | `/open-campaigns`                  | Public campaigns. Params: `category`, `minBudget`. Includes `isAcceptedByUser`. |
| POST   | `/campaigns/<id>/accept`           | Accept a public campaign |
| GET    | `/ad-requests`                     | Ad requests for accepted campaigns (with Campaign + Sponsor data) |
| POST   | `/ad-requests/<id>/<action>`       | `accept` or `reject` a pending ad request |

### Sponsor — `/api/sponsors` *(role: sponsor only)*

| Method | Endpoint    | Description |
|--------|-------------|-------------|
| GET    | `/details`  | Raw Sponsor record |
| GET    | `/profile`  | Sponsor + User combined |
| PUT    | `/profile`  | Update name, companyName, industry, budget |

### Campaigns — `/api/campaign` *(role: sponsor only)*

| Method | Endpoint                              | Description |
|--------|---------------------------------------|-------------|
| POST   | `/`                                   | Create campaign |
| GET    | `/my-campaigns`                       | List own campaigns (with accepted influencers) |
| PUT    | `/<id>`                               | Update campaign |
| DELETE | `/<id>`                               | Delete campaign |
| POST   | `/<campaign_id>/ad-request`           | Send ad request to influencer |
| GET    | `/<campaign_id>/ad-requests`          | List ad requests for a campaign |
| PUT    | `/ad-request/<ad_request_id>`         | Update ad request status/message/terms |
| DELETE | `/ad-request/<ad_request_id>`         | Delete ad request |

---

## Frontend Pages & Features

| Route                         | Component           | Description |
|-------------------------------|---------------------|-------------|
| `/`                           | DeviceDisplay       | Landing page with device mockups and sliders |
| `/about`                      | About               | About section with Lottie animation |
| `/login`                      | LoginForm           | Email/password login, JWT in localStorage |
| `/signup/step1–3`             | SignUpLayout        | Multi-step signup flow |
| `/signup-success`             | SignUpSuccess       | Post-registration confirmation |
| `/admin-dashboard`            | AdminDashboard      | Ongoing campaigns, flagged entities, search, stats |
| `/influencer/dashboard`       | InfluencerDashboard | Profile, open campaigns, ad requests |
| `/sponsor-dashboard/home`     | SponsorHome         | Sponsor overview |
| `/sponsor-dashboard/campaign` | Campaigns           | Full CRUD for campaigns and ad requests |
| `/sponsor-dashboard/settings` | Settings            | Sponsor profile update |

---

## What's Implemented

### Flask Backend (Phase 1–3 complete)
- [x] Python venv + all dependencies in `requirements.txt`
- [x] Flask app factory with dev/prod/test config classes
- [x] PostgreSQL database config with automatic SQLite fallback
- [x] SQLAlchemy 2.0 models matching PRD schema exactly
- [x] Flask-Migrate (Alembic) for schema version control
- [x] User registration — transactional multi-table inserts, bcrypt password hashing
- [x] JWT login with role claim embedded in token
- [x] **Full RBAC** — `admin_required`, `sponsor_required`, `influencer_required` decorators on every route
- [x] Admin seeded via `flask seed-admin` CLI command
- [x] Profile image upload via Werkzeug (UUID filename, images only, 10MB limit)
- [x] All sponsor campaign CRUD endpoints
- [x] All ad request CRUD endpoints
- [x] Influencer: browse + filter public campaigns, accept campaign
- [x] Influencer: view + act on ad requests
- [x] Admin: ongoing campaigns with real progress %, flagged entities, search, stats, flag/remove
- [x] CORS configured for React frontend
- [x] Vite proxy configured — no hardcoded API URLs needed
- [x] Flask-Executor integrated for Phase 5 async tasks

### React Frontend (legacy, unchanged)
- [x] Animated landing page
- [x] Multi-step signup flow
- [x] JWT-based login with role redirect
- [x] Influencer dashboard
- [x] Sponsor dashboard with campaign/ad request manager
- [x] Admin dashboard (Stats tab and action buttons pending wire-up — Phase 4)

---

## What's Pending / TODO

### Phase 4 (Next Up)

- [ ] **Wire admin Stats tab** — `AdminDashboard.jsx` shows "coming soon"; connect to `/api/admin/stats`
- [ ] **Admin Flag/Remove buttons** — no `onClick` handlers; connect to `/api/admin/flag` and `/api/admin/remove`
- [ ] **Frontend RBAC** — add `ProtectedRoute` component; anyone with a token can navigate to any dashboard
- [ ] **Switch hardcoded URLs** — replace all `http://localhost:2020` in React components with relative `/api/...` paths
- [ ] **JWT expiry UX** — detect 401 responses and redirect to `/login` with a message
- [ ] **Campaign filter UI** — influencer dashboard has no filter inputs (API supports `category`, `minBudget`)
- [ ] **Fix `InfluencerDashboard.jsx` bug** — `setMessage` called but never declared; should be `setError`
- [ ] **Fix profile image display** — `slice(-35)` on Windows path is fragile; store only filename in DB

### Phase 5

- [ ] **Negotiation flow** — `proposedTerms` field exists; no UI for counter-offers
- [ ] **Email notifications** — async via Flask-Executor on ad request status change
- [ ] **CSV exports** — admin can download campaigns/users as CSV
- [ ] **Scheduled cron** — daily digest via external webhook (free-tier Docker compatible)
- [ ] **Sponsor profile image** — sponsors have no image upload yet

### Phase 6

- [ ] Multi-stage Docker setup
- [ ] Integration test suite (pytest)
- [ ] OpenAPI/Swagger documentation

---

## Known Issues

- `AdminDashboard.jsx` fetches `/api/admin/flagged-campaigns` but the Flask route is `/api/admin/flagged` — update the frontend fetch URL.
- All React components still call `http://localhost:2020` (old Node.js port). The Vite proxy is configured but the components need to be updated to use relative `/api/...` paths.
- `InfluencerDashboard.jsx` calls `setMessage` which is never declared (causes silent 401 handling failure).
- The legacy `Server/` directory (Node.js) is still present for reference. Do not run it alongside the Flask backend on the same machine without changing ports.

---

## Contributing / Collaborating

### Getting Started

1. Clone the repo
2. `cd flask_backend && python -m venv venv && .\venv\Scripts\activate`
3. `pip install -r requirements.txt`
4. Copy `flask_backend/.env.example` → `flask_backend/.env` and fill in values
5. `python run.py` (tables auto-created, SQLite used by default)
6. `flask seed-admin` to create the admin user
7. `cd ..` → `npm install` → `npm run dev` for the frontend

### Branch Strategy

```
main      → stable only
dev       → active development
feature/  → branch from dev
bugfix/   → branch from dev
```

### Key Files

| File | Why it matters |
|------|----------------|
| `flask_backend/app/__init__.py` | App factory — extension init + blueprint registration |
| `flask_backend/app/models/` | All SQLAlchemy models — central schema truth |
| `flask_backend/app/utils/auth.py` | RBAC decorators — applied to every protected route |
| `flask_backend/app/config.py` | DB URL detection logic + all config classes |
| `flask_backend/run.py` | Entry point — do not add business logic here |
| `src/App.jsx` | All React routes |
| `vite.config.js` | Proxy config — `/api/*` → Flask port 5000 |
