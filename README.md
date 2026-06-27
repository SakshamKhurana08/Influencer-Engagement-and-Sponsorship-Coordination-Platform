# Influencer Engagement & Sponsorship Coordination Platform

A full-stack web application that connects **sponsors** with **influencers** for campaign management and ad-request coordination. Built as an individual project with a React frontend and a Node.js/Express backend backed by MySQL.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Environment Setup](#environment-setup)
- [Running the Project](#running-the-project)
- [API Reference](#api-reference)
- [Frontend Pages & Features](#frontend-pages--features)
- [What's Implemented](#whats-implemented)
- [What's Pending / TODO](#whats-pending--todo)
- [Known Issues](#known-issues)
- [Contributing / Collaborating](#contributing--collaborating)

---

## Tech Stack

| Layer      | Technology                                      |
|------------|-------------------------------------------------|
| Frontend   | React 19, Vite, Tailwind CSS v4, Framer Motion  |
| Routing    | React Router v7                                 |
| HTTP       | Axios                                           |
| Animations | Lottie React                                    |
| Icons      | Lucide React, React Icons                       |
| Backend    | Node.js, Express 5                              |
| ORM        | Sequelize v6                                    |
| Database   | MySQL                                           |
| Auth       | JWT (jsonwebtoken), bcryptjs                    |
| File Upload| Multer                                          |

---

## Project Structure

```
root/
├── src/                          # React frontend (Vite)
│   ├── App.jsx                   # Route definitions
│   ├── Components/
│   │   ├── HomePage.jsx
│   │   ├── DeviceDisplay.jsx     # Landing page device mockup section
│   │   ├── About.jsx
│   │   ├── Navbar.jsx
│   │   ├── LoginForm.jsx
│   │   ├── SignUp.jsx
│   │   ├── CloudLayout.jsx       # Shared animated background wrapper
│   │   ├── AdminDashboard.jsx
│   │   ├── InfluencerDashboard.jsx
│   │   ├── InfluencerForm.jsx
│   │   ├── SponsorForm.jsx
│   │   └── SponsorDashboard/
│   │       ├── DashboardLayout.jsx
│   │       ├── SponsorHome.jsx
│   │       ├── Campaigns.jsx     # Full campaign + ad-request CRUD
│   │       ├── Settings.jsx
│   │       ├── Sidebar.jsx
│   │       └── Navbar.jsx
│   └── signup/                   # Multi-step signup flow
│       ├── SignUpLayout.jsx
│       ├── SignUpRouter.jsx
│       ├── SignUpContext.jsx      # Context to share state across steps
│       └── steps/
│           ├── SignUpStep1.jsx   # Role selection
│           ├── SignUpStep2.jsx   # Role-specific details
│           ├── SignUpStep3.jsx   # Review & submit
│           └── SignUpSuccess.jsx
│
├── Server/                       # Express backend
│   ├── server.js                 # App entry point
│   ├── config/
│   │   └── database.js           # Sequelize connection config
│   ├── models/
│   │   ├── index.js              # Model imports + all associations
│   │   ├── User.js
│   │   ├── Sponsor.js
│   │   ├── Influencer.js
│   │   ├── Campaign.js
│   │   └── AdRequest.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── influencerController.js
│   │   ├── sponsorController.js
│   │   └── campaignController.js
│   └── routes/
│       ├── authRoutes.js         # Includes Multer config for image upload
│       ├── adminRoutes.js
│       ├── influencerRoutes.js
│       ├── sponsorRoutes.js
│       └── campaignRoutes.js
│
├── uploads/
│   └── influencer_photos/        # Auto-created; stores profile images
├── public/
│   └── assets/                   # Static images and slider assets
├── index.html
├── package.json                  # Frontend dependencies
└── eslint.config.js
```

---

## Database Schema

The database is named `influencer_db` and is managed by Sequelize with `sync({ force: false })` on startup (no auto-drop on restart).

### Tables

**Users**
| Column     | Type                             | Notes              |
|------------|----------------------------------|--------------------|
| id         | INT (PK, auto-increment)         |                    |
| name       | VARCHAR                          |                    |
| email      | VARCHAR (unique)                 |                    |
| password   | VARCHAR                          | bcrypt hashed      |
| role       | ENUM('admin','sponsor','influencer') |                |
| isFlagged  | BOOLEAN                          | default: false     |

**Sponsors**
| Column      | Type    | Notes                  |
|-------------|---------|------------------------|
| id          | INT PK  |                        |
| userId      | FK → Users |                     |
| companyName | VARCHAR |                        |
| industry    | VARCHAR |                        |
| budget      | INTEGER |                        |

**Influencers**
| Column          | Type    | Notes                        |
|-----------------|---------|------------------------------|
| id              | INT PK  |                              |
| userId          | FK → Users |                          |
| category        | VARCHAR |                              |
| niche           | VARCHAR |                              |
| reach           | INTEGER |                              |
| profileImageUrl | VARCHAR | path to uploaded image       |

**Campaigns**
| Column      | Type     | Notes                      |
|-------------|----------|----------------------------|
| id          | INT PK   |                            |
| userId      | FK → Sponsors (via userId) |          |
| title       | VARCHAR  |                            |
| description | TEXT     |                            |
| category    | VARCHAR  |                            |
| budget      | INTEGER  |                            |
| isPublic    | BOOLEAN  | default: true              |
| isFlagged   | BOOLEAN  | default: false             |

**AdRequests**
| Column        | Type                                          | Notes           |
|---------------|-----------------------------------------------|-----------------|
| id            | INT PK                                        |                 |
| campaignId    | FK → Campaigns                                |                 |
| influencerId  | FK → Influencers                              |                 |
| status        | ENUM('pending','accepted','rejected','negotiation') | default: pending |
| message       | TEXT                                          |                 |
| proposedTerms | TEXT                                          |                 |

**AcceptedCampaigns** (junction table)
| Column       | Type           |
|--------------|----------------|
| influencerId | FK → Influencers |
| campaignId   | FK → Campaigns |

---

## Environment Setup

### Prerequisites

- Node.js >= 18
- MySQL running locally
- A database named `influencer_db` created in MySQL

### 1. Clone & install dependencies

```bash
# Install frontend dependencies (from project root)
npm install

# Install backend dependencies
cd Server
npm install
```

### 2. Configure environment variables

Create `Server/.env` with the following:

```env
PORT=2020
JWT_SECRET=your_super_secret_key_here
```

> The database credentials are currently hardcoded in `Server/config/database.js`. Before collaborating, move these to `.env`:
> ```env
> DB_NAME=influencer_db
> DB_USER=root
> DB_PASSWORD=your_mysql_password
> DB_HOST=localhost
> ```
> Then update `database.js` to read from `process.env`.

### 3. Create the MySQL database

```sql
CREATE DATABASE influencer_db;
```

Sequelize will auto-create the tables on first run via `sequelize.sync()`.

---

## Running the Project

### Backend

```bash
cd Server
node server.js
# Server starts on http://localhost:2020
```

> There is no `nodemon` configured. Add it for development:
> ```bash
> npm install --save-dev nodemon
> # then run: npx nodemon server.js
> ```

### Frontend

```bash
# From project root
npm run dev
# Vite starts on http://localhost:5173 (or next available port)
```

The frontend proxies API calls directly to `http://localhost:2020`. Make sure the backend is running first.

---

## API Reference

All protected routes require a `Bearer <token>` header (`Authorization`).

### Auth — `/api/auth`

| Method | Endpoint    | Auth | Description                                         |
|--------|-------------|------|-----------------------------------------------------|
| POST   | `/register` | No   | Register a new user. Accepts `multipart/form-data` for influencer profile image (`profileImage` field). Fields: `name`, `email`, `password`, `role`, and role-specific fields below. |
| POST   | `/login`    | No   | Login. Returns `token` and `user` object.           |
| GET    | `/profile`  | Yes  | Returns the authenticated user's base User record.  |

**Register body (sponsor):** `name`, `email`, `password`, `role=sponsor`, `company`, `industry`, `budget`

**Register body (influencer):** `name`, `email`, `password`, `role=influencer`, `category`, `niche`, `reach`, `profileImage` (file)

---

### Admin — `/api/admin`

All admin routes are JWT-protected (no role enforcement on the backend yet — see TODO).

| Method | Endpoint              | Description                                         |
|--------|-----------------------|-----------------------------------------------------|
| GET    | `/ongoing-campaigns`  | Campaigns with pending or accepted ad requests      |
| GET    | `/flagged`            | Campaigns where `isFlagged = true`                  |
| POST   | `/flag`               | Flag a user or campaign. Body: `{ type, id }`       |
| DELETE | `/remove`             | Delete a user or campaign. Body: `{ type, id }`     |
| GET    | `/search?query=`      | Search users by name and campaigns by title         |
| GET    | `/stats`              | Counts: users, sponsors, influencers, campaigns, ad requests |

---

### Influencer — `/api/influencer`

| Method | Endpoint                        | Description                                          |
|--------|---------------------------------|------------------------------------------------------|
| GET    | `/profile`                      | Get authenticated influencer's profile + user data   |
| PUT    | `/profile`                      | Update name, category, niche, reach                  |
| GET    | `/open-campaigns`               | Get all public campaigns. Query params: `category`, `minBudget`. Returns `isAcceptedByUser` flag per campaign. |
| POST   | `/campaigns/:id/accept`         | Accept a public campaign (adds to AcceptedCampaigns junction table) |
| GET    | `/ad-requests`                  | Get ad requests for campaigns the influencer has accepted |
| POST   | `/ad-requests/:id/:action`      | Accept or reject an ad request. `:action` = `accept` or `reject` |

---

### Sponsor — `/api/sponsors`

| Method | Endpoint    | Description                              |
|--------|-------------|------------------------------------------|
| GET    | `/details`  | Get authenticated sponsor's Sponsor record |
| GET    | `/profile`  | Get sponsor + associated user data       |
| PUT    | `/profile`  | Update name, companyName, industry, budget (email cannot be changed) |

---

### Campaigns — `/api/campaign`

| Method | Endpoint                                | Description                                        |
|--------|-----------------------------------------|----------------------------------------------------|
| POST   | `/`                                     | Create a new campaign                              |
| GET    | `/my-campaigns`                         | Get all campaigns owned by the authenticated sponsor, including accepted influencers |
| PUT    | `/:id`                                  | Update a campaign (owner only)                     |
| DELETE | `/:id`                                  | Delete a campaign (owner only)                     |
| POST   | `/campaign/:campaignId/ad-request`      | Send an ad request to an influencer for a campaign |
| GET    | `/campaign/:campaignId/ad-requests`     | Get all ad requests for a campaign (owner only)    |
| PUT    | `/ad-request/:adRequestId`             | Update an ad request's status, message, or terms   |
| DELETE | `/ad-request/:adRequestId`             | Delete an ad request (campaign owner only)         |

---

## Frontend Pages & Features

| Route                       | Component             | Description                                      |
|-----------------------------|-----------------------|--------------------------------------------------|
| `/`                         | DeviceDisplay         | Landing page with device mockup and image sliders |
| `/about`                    | About                 | About section with Lottie animation               |
| `/login`                    | LoginForm             | Email/password login, stores JWT in localStorage  |
| `/signup`                   | SignUpLayout          | Multi-step signup flow (3 steps + success screen) |
| `/signup/step1`             | SignUpStep1           | Role selection (sponsor / influencer)             |
| `/signup/step2`             | SignUpStep2           | Role-specific details                             |
| `/signup/step3`             | SignUpStep3           | Review and submit                                 |
| `/signup-success`           | SignUpSuccess         | Post-registration confirmation                    |
| `/admin-dashboard`          | AdminDashboard        | Ongoing campaigns, flagged entities, search       |
| `/influencer/dashboard`     | InfluencerDashboard   | Profile edit, open campaigns, ad request actions  |
| `/sponsor-dashboard/home`   | SponsorHome           | Sponsor profile overview                          |
| `/sponsor-dashboard/campaign` | Campaigns           | Full CRUD for campaigns and ad requests           |
| `/sponsor-dashboard/settings` | Settings            | Sponsor profile update form                       |

All pages are wrapped in `CloudLayout`, which provides a consistent animated cloud background.

---

## What's Implemented

### Backend
- [x] User registration with role-based profile creation (Sponsor / Influencer) in a database transaction
- [x] Profile image upload for influencers (Multer, stored in `/uploads/influencer_photos/`, 10 MB limit, image-only filter)
- [x] JWT authentication middleware (`authenticateJWT`) used across all protected routes
- [x] Password hashing with bcrypt
- [x] Full campaign CRUD for sponsors (create, read, update, delete)
- [x] Ad request CRUD — sponsors can send, edit, and delete ad requests per campaign
- [x] Influencers can browse public campaigns and accept them (many-to-many via `AcceptedCampaigns`)
- [x] Influencers can accept or reject ad requests (status transitions from `pending`)
- [x] Admin endpoints: ongoing campaigns, flagged entities, search, platform-wide stats, flag/remove users and campaigns
- [x] Cascade deletes set up on all foreign keys

### Frontend
- [x] Animated landing page with device mockups and image sliders
- [x] Three-step signup flow with shared context state
- [x] Role-based registration form (sponsor fields vs. influencer fields + image upload)
- [x] Login with JWT stored in `localStorage`, redirects by role
- [x] Influencer dashboard: view/edit profile, browse open campaigns with accept button, view and action ad requests
- [x] Sponsor dashboard layout with sidebar navigation
- [x] Sponsor campaign manager: create, edit, delete campaigns; create, edit, delete ad requests per campaign; view accepted influencers per campaign
- [x] Admin dashboard: view ongoing campaigns, flagged entities, search users and campaigns

---

## What's Pending / TODO

These are features that are partially built or planned but not yet complete. Good starting points for collaboration.

### High Priority

- [ ] **Role-based route protection on the backend** — Admin routes currently only check for a valid JWT, not for `role === 'admin'`. Add role guard middleware.
- [ ] **Role-based route guards on the frontend** — Any user with a token can navigate to `/admin-dashboard`. Implement protected route components that check the role from the decoded token.
- [ ] **Hardcoded DB credentials** — `Server/config/database.js` has the MySQL username and password in plain text. Move to `.env` before any collaboration or deployment.
- [ ] **Admin Stats tab** — The `/api/admin/stats` endpoint is implemented, but the frontend Stats tab just shows a "coming soon" placeholder. Wire it up.
- [ ] **Admin flag/remove actions** — The "Flag" and "Remove" buttons in the admin search results have no `onClick` handlers attached. Connect them to the `/api/admin/flag` and `/api/admin/remove` endpoints.
- [ ] **Negotiation flow** — `AdRequest` has a `negotiation` status and `proposedTerms` field, but there is no UI for counter-offers or negotiation chat between sponsor and influencer.

### Medium Priority

- [ ] **Campaign filter UI for influencers** — `fetchCampaigns` accepts `category` and `minBudget` query params, but the influencer dashboard has no filter input fields rendered yet.
- [ ] **Refresh token / session expiry handling** — JWT expires in 1 hour. There is no silent refresh or "session expired" redirect logic beyond a single catch block in `InfluencerDashboard`.
- [ ] **Sponsor profile image** — Influencers have profile image upload, but sponsors do not. The Sponsor model and forms have no image support yet.
- [ ] **Campaign visibility toggle** — `isPublic` exists on campaigns and the create form has a checkbox, but there is no toggle/edit control in the campaign cards.
- [ ] **Email uniqueness error UX** — The backend returns a 400 with "User already exists" but the signup form has no specific handling for that error.
- [ ] **Pagination** — All list endpoints return the full result set. Add `limit`/`offset` or cursor-based pagination on campaign lists and ad requests.
- [ ] **Vite proxy config** — The frontend makes hardcoded `http://localhost:2020` requests. Add a Vite proxy in `vite.config.js` so relative paths like `/api/...` work across environments.

### Low Priority / Nice to Have

- [ ] **Real campaign progress tracking** — Admin's "ongoing campaigns" currently shows a random `Math.floor(Math.random() * 100)%` as progress. Replace with actual progress logic (e.g., ratio of accepted ad requests to total).
- [ ] **Notification system** — No real-time or async notifications when an ad request status changes.
- [ ] **Admin role creation** — There is no registration flow for admin users. They must be manually inserted into the database with `role = 'admin'`.
- [ ] **Search debounce** — The admin search triggers on button click only. Consider adding debounced live search.
- [ ] **`nodemon` dev setup** — The backend has no `dev` script in `package.json`. Add nodemon for a better development experience.
- [ ] **Test suite** — No tests exist anywhere in the project. Consider adding integration tests for the API with a library like Supertest.

---

## Known Issues

- `bodyParser` is imported but unused in `server.js` (Express 5 has it built in). Safe to remove.
- `InfluencerDashboard` references `setMessage` which is never declared, causing a silent error on 401 responses. Should be `setError`.
- Profile image path parsing (`last35Chars`) in `InfluencerDashboard.jsx` is fragile — it assumes a Windows-style backslash path and slices the last 35 characters. This will break if the file path length changes. Consider storing just the filename in the DB instead of the full path.
- `database.js` uses a hardcoded timezone of `+05:30` (IST). Other contributors in different timezones may see timestamp discrepancies.
- The `Campaign` model and `Influencer` model each define their own associations independently, and `models/index.js` redefines them again. This creates duplicate association calls — harmless in most cases but can cause Sequelize warnings.

---

## Contributing / Collaborating

Since this is now a collaborative project, here's the recommended workflow:

### Getting Started

1. Clone the repo and follow the [Environment Setup](#environment-setup) steps.
2. **Create your own `.env`** — never commit credentials. The `.env` file is already in `.gitignore`.
3. Run `npm install` in both the root and the `Server/` directory.
4. Create the `influencer_db` MySQL database locally — Sequelize will create the tables automatically on first run.

### Branch Strategy

```
main          → stable, working code only
dev           → active development branch
feature/xyz   → branch off dev for new features
bugfix/xyz    → branch off dev for bug fixes
```

Always open a pull request into `dev`, never directly into `main`.

### Before Opening a PR

- Make sure the backend starts without errors (`node server.js`)
- Make sure the frontend builds without errors (`npm run build`)
- Leave a short comment at the top of any new controller function describing what it does and what auth it expects

### Key Files to Know First

| File | Why it matters |
|------|----------------|
| `Server/models/index.js` | All DB associations live here — touch carefully |
| `Server/controllers/authController.js` | `authenticateJWT` is used by every protected route |
| `src/App.jsx` | All client-side routes are defined here |
| `src/signup/SignUpContext.jsx` | Shared state for the multi-step form |
| `Server/config/database.js` | **Move credentials to `.env` before collaborating** |
