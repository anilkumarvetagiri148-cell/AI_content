# CreatorConnect AI — AI Content Creator Marketplace

[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green.svg?logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-lightgrey.svg?logo=express)](https://expressjs.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E.svg?logo=supabase)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/Tests-50%2F50%20Passed-brightgreen.svg)]()
[![Deploy on Vercel](https://img.shields.io/badge/Vercel-Deployed-black.svg?logo=vercel)](https://vercel.com)
[![Deploy on Render](https://img.shields.io/badge/Render-Blueprint%20Ready-46E3B7.svg?logo=render)](https://render.com)

> **Problem Statement No. 2: AI Content Creator Marketplace**  
> *"Build an AI-native marketplace connecting AI creators with brands and creative agencies — from creator discovery and AI portfolios to briefs, matching and engagement."*

---

## 📌 Table of Contents
1. [Core Idea & Problem It Solves](#-core-idea--problem-it-solves)
2. [Key Features & Capabilities](#-key-features--capabilities)
3. [Technology Stack](#-technology-stack)
4. [Project Architecture & Directory Structure](#-project-architecture--directory-structure)
5. [5-Factor AI Creator Matching Engine](#-5-factor-ai-creator-matching-engine)
6. [REST API Reference](#-rest-api-reference)
7. [Database Schema & Migrations](#-database-schema--migrations)
8. [Automated Testing Suite](#-automated-testing-suite)
9. [Getting Started (Local Development)](#-getting-started-local-development)
10. [Deployment Guide (Vercel & Render)](#-deployment-guide-vercel--render)
11. [Demo Accounts](#-demo-accounts)

---

## 💡 Core Idea & Problem It Solves

### The Challenge
Generative AI has sparked a massive wave of specialized creators producing commercial-grade video, imagery, voice synthesis, custom LoRAs, and 3D assets. However:
1. **Discovery Gap**: AI creators struggle to get discovered because traditional freelance platforms (Upwork, Fiverr) fail to index AI-specific competencies (e.g., Runway Gen-3, Flux.1 Pro, Custom LoRA checkpoints, ComfyUI pipelines, style consistency).
2. **Matching Inefficiency**: Brands and agencies waste days sifting through portfolios without knowing if a creator can deliver within their budget, meet technical standards, or adapt to their specific industry aesthetic.
3. **Collaboration Friction**: Existing marketplaces lack AI-native campaign brief tools, intelligent candidate scoring, duplicate proposal prevention, and verified post-delivery review loops.

### The Solution: CreatorConnect AI
**CreatorConnect AI** is a production-style, AI-native marketplace built specifically for the generative AI creative economy:
- **For AI Creators**: Showcases indexed portfolios across **24 industry categories**, specialized AI tech stacks, starting prices in Indian Rupees (**₹**), availability statuses, and commercial deliverables.
- **For Brands & Creative Agencies**: Enables instant creator discovery, single-sentence **AI Campaign Brief Generation**, and a transparent **5-Factor AI Matching Algorithm (0–100 Score)**.
- **For Marketplace Integrity**: Full end-to-end workflow featuring proposal submission guards, automatic conversation initiation upon hiring, direct messaging, milestone updates, and verified review recalculation.

---

## 🌟 Key Features & Capabilities

- 🎨 **24 Distinct Industry Categories**:  
  Finance & Investing, Education, Business & Entrepreneurship, Technology & AI, Gaming & Esports, Health & Fitness, Food & Cooking, Travel & Tourism, Fashion & Beauty, Digital Marketing, Social Media Influencers, Entertainment & Comedy, Science & Research, Real Estate, E-Commerce & Product Advertising, Photography & Videography, Animation & Motion Graphics, Music & Audio, Lifestyle, News & Media, Automotive, Agriculture & Farming, and Environment & Sustainability.
- 👥 **145+ Pre-Seeded Realistic AI Creator Profiles & 414+ Portfolio Projects**:  
  Realistic creators complete with high-res imagery, tool stacks (Midjourney v6, Runway Gen-3, Flux.1, Sora, ElevenLabs, ComfyUI), tiered service packages, and pricing in INR (₹).
- 🧠 **5-Factor Normalized AI Matching Engine**:  
  Scans active campaign parameters against creator profiles to produce a weighted compatibility score (0–100%) with explanatory rationale and factor breakdowns.
- ⚡ **AI Campaign Brief Assistant**:  
  Converts plain-text brand objectives into structured campaign briefs (deliverables, required tools, timelines, budget benchmarks).
- 💼 **Complete Proposal & Hiring Lifecycle**:  
  Creators submit custom pitches; duplicate submissions are blocked (HTTP 409). When a brand accepts a proposal, the campaign moves to `in_progress` and an encrypted private direct message thread is automatically initiated.
- 💬 **Private Direct Messaging & Notifications**:  
  Real-time communication restricted exclusively to participating brands and creators, complete with unread notification badges.
- ⭐ **Verified Reviews & Dynamic Ratings**:  
  Only brands with completed campaigns can review creators, automatically updating creator ratings and review counts via database triggers.
- 📊 **Real Database Dashboards**:  
  Live revenue, active proposals, views, and campaign metrics for both Creator and Brand roles.
- 🛡️ **Admin Moderation Center**:  
  Platform analytics, verified creator badging, and content moderation ticketing.
- ✨ **Futuristic Aurora UI/UX**:  
  Midnight Navy (`#0B081D`), Electric Purple (`#7C4DFF`), Bright Violet (`#9D7BFF`), and Vibrant Orange (`#FF7A1A`) with glassmorphism cards and Framer Motion transitions.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, React Router DOM v6 |
| **Styling & Icons** | Tailwind CSS, Lucide React, Glassmorphic Design System |
| **Animations & Visuals** | Framer Motion, Recharts Analytics |
| **Backend API** | Node.js (v22+), Express.js, TypeScript (`tsx`) |
| **Database & Schema** | Supabase PostgreSQL (11 relational tables + RLS + Triggers) |
| **Validation & Security** | Zod v4, JWT (`crypto.scryptSync`), Sliding-Window Rate Limiter, Security Headers, CORS Origin Protection |
| **Storage** | Supabase Storage (`creatorconnect-media`) with resilient base64 Data URL fallback |
| **Testing** | Native Node Test Runner (`tests/backend.test.ts`), 50 comprehensive automated tests |
| **Deployment** | Vercel (Vite SPA + Serverless Functions) & Render (Full-Stack Web Service Blueprint) |

---

## 📂 Project Architecture & Directory Structure

```text
content_AI/
├── api/                           # Vercel Serverless Function entrypoint
│   └── index.ts                   # Express serverless handler for /api/*
├── dist/                          # Compiled production frontend build
├── public/                        # Static public assets
├── server/                        # Modular Backend Architecture
│   ├── config/                    # Environment & configuration loader
│   │   └── env.ts
│   ├── data/                      # Persistent database state
│   │   └── database.json          # Pre-seeded database (145 creators, 414 projects)
│   ├── middleware/                # Security & routing middlewares
│   │   ├── auth.ts                # JWT authentication & requireRole guards
│   │   ├── errorHandler.ts        # Centralized JSON error handler
│   │   ├── rateLimit.ts           # Sliding-window IP rate limiter
│   │   ├── security.ts            # Helmet-style headers & CORS policy
│   │   └── validation.ts          # Zod schema request validation middleware
│   ├── routes/                    # Modular REST API controllers
│   │   ├── index.ts               # Master API router (mounts /api/v1 & /api)
│   │   └── v1/                    # v1 Route Modules
│   │       ├── adminRoutes.ts     # Platform overview & verification
│   │       ├── authRoutes.ts      # Signup, login, profile, /me
│   │       ├── campaignRoutes.ts  # Brief creation, update, lifecycle
│   │       ├── creatorRoutes.ts   # Creator discovery, filters, detail
│   │       ├── dashboardRoutes.ts # Creator & brand database metrics
│   │       ├── favoriteRoutes.ts  # Creator bookmarking
│   │       ├── invitationRoutes.ts# Brand-to-creator direct invites
│   │       ├── matchingRoutes.ts  # 5-factor AI matching & brief generator
│   │       ├── messageRoutes.ts   # Conversations & private messages
│   │       ├── notificationRoutes.ts # Notifications & read markers
│   │       ├── portfolioRoutes.ts # Creator portfolio asset uploads
│   │       ├── proposalRoutes.ts  # Proposal submission & status updates
│   │       ├── reportRoutes.ts    # Moderation reports
│   │       ├── reviewRoutes.ts    # Verified reviews & rating recalculation
│   │       └── uploadRoutes.ts    # Media upload handler
│   ├── services/                  # Business logic & services
│   │   ├── aiMatchingService.ts   # 5-factor weighted matching engine
│   │   ├── dbService.ts           # Database repository layer
│   │   └── storageService.ts      # Media validation & cloud upload
│   ├── validation/                # Zod validation schemas
│   │   └── schemas.ts             # Auth, brief, proposal, review schemas
│   ├── aiEngine.ts                # AI brief synthesis & provider integration
│   ├── db.ts                      # Persistent DB abstraction with /tmp support
│   ├── index.ts                   # Main Express application entrypoint
│   └── seedData.ts                # Default seed generator
├── src/                           # Frontend React Application
│   ├── components/                # Reusable UI components & modals
│   ├── context/                   # React Context (AuthContext)
│   ├── lib/                       # API client (`apiRequest` with VITE_API_URL)
│   ├── pages/                     # 12 Interactive Application Pages
│   │   ├── AdminDashboardPage.tsx
│   │   ├── AIMatchingStudioPage.tsx
│   │   ├── AuthPage.tsx
│   │   ├── BrandDashboardPage.tsx
│   │   ├── CampaignDetailPage.tsx
│   │   ├── CampaignsPage.tsx
│   │   ├── CreateCampaignPage.tsx
│   │   ├── CreatorDashboardPage.tsx
│   │   ├── CreatorDiscoveryPage.tsx
│   │   ├── CreatorProfilePage.tsx
│   │   ├── HomePage.tsx
│   │   └── MessagesPage.tsx
│   ├── types/                     # Shared TypeScript interfaces & types
│   ├── App.tsx                    # Route definitions
│   └── main.tsx                   # React root entry
├── supabase/
│   └── schema.sql                 # Production PostgreSQL schema with 11 tables & RLS
├── tests/
│   └── backend.test.ts            # 50 automated backend & security tests
├── render.yaml                    # Render Blueprint deployment configuration
├── vercel.json                    # Vercel SPA rewrites & serverless configuration
├── vite.config.ts                 # Vite bundler & dev proxy config
└── package.json                   # Scripts & dependencies
```

---

## 🎯 5-Factor AI Creator Matching Engine

The matching engine computes a deterministic compatibility score between 0 and 100 based on five weighted factors:

$$\text{Match Score} = S_{\text{Skills}} (30\%) + S_{\text{Portfolio}} (30\%) + S_{\text{Budget}} (20\%) + S_{\text{Tools}} (10\%) + S_{\text{Availability}} (10\%)$$

| Factor | Weight | Scoring Mechanism |
| :--- | :---: | :--- |
| **Skills & Specialization** | **30%** | Primary category match (16 pts) + secondary categories (12 pts) + Jaccard similarity of required skills (up to 14 pts). |
| **Portfolio Relevance** | **30%** | Quality rating (up to 10 pts) + keyword relevance in portfolio titles/descriptions (up to 10 pts) + verified completed projects (up to 10 pts). |
| **Budget Compatibility** | **20%** | Optimal pricing within campaign `[budget_min, budget_max]` (20 pts), within 25% margin (12 pts), or penalty for exceeding budget. |
| **AI Tool Stack Match** | **10%** | Exact matches on requested tools (Midjourney, Runway Gen-3, Flux, ComfyUI, ElevenLabs, HeyGen). |
| **Availability & Lead Time** | **10%** | `available` (10 pts), `busy` (4 pts), `unavailable` (0 pts). |

---

## 📡 REST API Reference

The backend provides canonical endpoints under `/api/v1/*` with full backward compatibility aliases under `/api/*`.

### Authentication & Profile
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/signup` | Public | Register a new creator or brand account |
| `POST` | `/api/v1/auth/login` | Public | Authenticate user and receive JWT |
| `POST` | `/api/v1/auth/reset-password` | Public | Reset account password |
| `GET` | `/api/v1/auth/me` | Authenticated | Fetch current profile & role |
| `PUT` | `/api/v1/auth/profile` | Authenticated | Update user profile & creator metadata |

### Creators & Portfolios
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/creators` | Public | List creators (24 categories, search, pricing, pagination) |
| `GET` | `/api/v1/creators/:id` | Public | Full creator profile with portfolios and packages |
| `POST` | `/api/v1/portfolio` | Creator | Upload a new portfolio project |
| `DELETE` | `/api/v1/portfolio/:id` | Creator / Admin | Delete a portfolio project |

### Campaigns & Proposals
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/campaigns` | Public | List open campaigns & briefs |
| `GET` | `/api/v1/campaigns/:id` | Public / Auth | Campaign details & submitted proposals |
| `POST` | `/api/v1/campaigns` | Brand / Admin | Create a new campaign brief |
| `PUT` | `/api/v1/campaigns/:id` | Brand / Admin | Update brief or mark campaign completed |
| `POST` | `/api/v1/campaigns/:id/proposals` | Creator | Submit proposal (rejects duplicates with 409) |
| `GET` | `/api/v1/proposals` | Authenticated | List user's proposals |
| `PATCH` | `/api/v1/proposals/:id/status` | Brand / Admin | Accept or reject proposal (auto-creates chat thread) |

### AI Matching & Assistants
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/matching/recommendations` | Public | Run 5-factor AI creator matching algorithm |
| `POST` | `/api/v1/matching/generate-brief` | Public | Synthesize structured brief from plain text prompt |

### Messaging, Reviews & Dashboards
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/conversations` | Authenticated | List authorized message threads |
| `POST` | `/api/v1/conversations/:id/messages` | Participant | Send message in thread (blocks intruders with 403) |
| `POST` | `/api/v1/reviews` | Brand | Review completed campaign (recalculates rating) |
| `GET` | `/api/v1/dashboard/creator` | Creator | Real creator earnings, views & active proposals |
| `GET` | `/api/v1/dashboard/brand` | Brand / Admin | Real brand spend, proposals & active campaigns |
| `GET` | `/api/v1/admin/overview` | Admin | Platform metrics & user verification controls |
| `GET` | `/api/v1/health` | Public | System status, database counts & AI health |

---

## 🗄️ Database Schema & Migrations

The production PostgreSQL database script is located at [`supabase/schema.sql`](supabase/schema.sql). It provisions **11 tables** with Row-Level Security:

1. `profiles` — Authenticated accounts (creator, brand, admin).
2. `creator_profiles` — Professional titles, industry categories, pricing, tool stacks.
3. `portfolio_projects` — Media showcases, prompts, and deliverables.
4. `campaigns` — Briefs with budget ranges, deadlines, and skill requirements.
5. `campaign_proposals` — Pitches, rates, and timelines (enforces `unique_campaign_creator_proposal`).
6. `campaign_invitations` — Direct brand-to-creator campaign invites.
7. `saved_creators` — Creator bookmarks for brands.
8. `conversations` — Direct message thread metadata.
9. `conversation_participants` — Membership mapping for thread security.
10. `messages` — Chat message bodies and timestamps.
11. `reviews` — Verified feedback linked to completed campaigns with rating recalculation triggers.

---

## 🧪 Automated Testing Suite

The repository includes a comprehensive automated test suite ([`tests/backend.test.ts`](tests/backend.test.ts)) with **50 assertions** verifying every critical workflow:

```bash
npm test
```

### Verified Criteria:
- ✅ **Health & Compatibility**: Confirms `/api/v1/health` and `/api/health` aliases.
- ✅ **JWT Authentication**: Registration, password verification, token issuance.
- ✅ **RBAC Enforcement**: Creator blocked from creating campaigns (403), Brand blocked from submitting proposals (403), unauthenticated access blocked (401).
- ✅ **24 Categories Discovery**: Queries creators across all 24 industry sectors.
- ✅ **Campaign Lifecycle**: Brief creation, proposal submission, and duplicate proposal prevention (409).
- ✅ **Hiring & Auto-Initiation**: Proposal acceptance moves campaign to `in_progress` and auto-creates conversation.
- ✅ **Message Security**: Participant messaging verified; unauthorized third-party blocked (403).
- ✅ **Verified Reviews**: Premature reviews rejected (400), verified review submitted, duplicate rejected (409), average rating recalculated.
- ✅ **5-Factor AI Matching**: Verifies exact 30-30-20-10-10 weight distribution.
- ✅ **Real Dashboards**: Creator earnings and Brand spend reflect actual database transactions.

---

## 💻 Getting Started (Local Development)

### Prerequisites
- Node.js 18+ (Node 22 recommended)
- npm or yarn

### 1. Clone & Install
```bash
git clone https://github.com/anilkumarvetagiri148-cell/AI_content.git
cd AI_content
npm install
```

### 2. Environment Variables (Optional)
The project includes a built-in pre-seeded local database that works out of the box with zero configuration. To connect live Supabase or Gemini AI:
```bash
cp .env.example .env
```

### 3. Run Development Servers
```bash
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001`
- **Health Check**: `http://localhost:3001/api/v1/health`

### 4. Run Production Build Locally
```bash
npm run build
npm start
```
The Express server will serve both the compiled React frontend and the REST API from `http://localhost:3001`.

---

## 🚀 Deployment Guide (Vercel & Render)

### Option 1: Deploy to Vercel (Recommended)
This repository is configured with [`vercel.json`](vercel.json) and [`api/index.ts`](api/index.ts) for full-stack deployment:
1. Log in to [Vercel](https://vercel.com) and click **"Add New..."** $\rightarrow$ **"Project"**.
2. Import repository **`anilkumarvetagiri148-cell/AI_content`**.
3. Framework Preset: **Vite** (auto-detected).
4. Set Environment Variables:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: `your-secure-jwt-secret-key-2026`
   - `CORS_ORIGIN`: `*`
5. Click **Deploy**. Vercel will host the frontend and run the backend as a Serverless Function.

### Option 2: Deploy to Render (1-Click Blueprint)
This repository includes [`render.yaml`](render.yaml) for Render Blueprint deployment:
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **"New +"** $\rightarrow$ **"Blueprint"** (or **"Web Service"**).
3. Connect your GitHub repository `AI_content`.
4. Render detects `render.yaml` automatically:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Click **Apply**. Your full-stack marketplace will be live on a `.onrender.com` URL.

---

## 🔑 Demo Accounts

Use these pre-seeded demo accounts to test role-specific workflows (Password for all: `Demo@123`):

| Role | Email | Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **Brand Studio** | `demo-brand@example.com` | `Demo@123` | Create briefs, review proposals, hire creators, run AI matcher, write reviews |
| **AI Creator** | `demo-creator@example.com` | `Demo@123` | Manage portfolio, submit proposals, chat with brands, track earnings |
| **Platform Admin** | `admin@example.com` | `Demo@123` | Platform KPIs, verify creators, review moderation tickets |

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
