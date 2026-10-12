# CreatorConnect AI — AI Content Creator Marketplace

**Problem Statement No. 2: AI Content Creator Marketplace**  
*“Build an AI-native marketplace connecting AI creators with brands and creative agencies — from creator discovery and AI portfolios to briefs, matching and engagement.”*

---

## 🌟 Overview & Core Solutions

**CreatorConnect AI** is a full-stack, responsive web platform connecting specialized generative AI creators (Runway Gen-3, OpenAI Sora, Flux.1 Pro, Custom LoRA, ComfyUI, ElevenLabs, HeyGen) with brands and creative agencies.

1. **How AI Creators Get Discovered**: Dedicated public portfolios indexed by generative specialization, AI model/tool stack, commercial deliverables, starting package prices, availability, and verified brand reviews.
2. **How Brands Find the Right Creator**: Multi-filter discovery marketplace + a transparent **6-Factor Weighted AI Creator Matching Engine (0–100 score)** + an **AI Campaign Brief Assistant** that converts a single sentence into a complete structured brief.
3. **End-to-End Collaboration**: Structured campaign briefs, proposal submissions (with duplicate prevention), direct campaign invitations, Brand & Creator dashboards, database-backed messaging, notifications, reviews (restricted to completed campaigns), and an Admin moderation panel.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, React Router v6
- **Styling & UI**: Tailwind CSS (`#0B081D` Midnight Navy, `#17132E` Secondary Surface, `#7C4DFF` Electric Purple, `#9D7BFF` Bright Violet, `#FF7A1A` Vibrant Orange CTA), Lucide React Icons, Framer Motion Animations, Recharts Analytics
- **Backend**: Node.js, Express.js, TypeScript (`tsx`)
- **Database & Auth**:
  - Full Supabase PostgreSQL schema & Row Level Security (RLS) migration script in `supabase/schema.sql`
  - Built-in persistent local database (`server/data/database.json` + `server/db.ts`) pre-seeded with 8 AI creators, 10 portfolio projects, 6 campaigns, proposals, invitations, messages, and reviews so the application works out-of-the-box with zero external setup required.
- **AI Engine (`server/aiEngine.ts`)**:
  - Server-side Gemini / OpenAI API integration via `.env` with automatic fallback to a deterministic 6-factor weighted scoring algorithm and domain-aware NLP brief synthesizer.

---

## 🚀 Quick Start & Local Execution

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (Optional)
Copy `.env.example` to `.env` if you want to connect your own live Supabase project or Gemini/OpenAI API key:
```bash
cp .env.example .env
```
*(If `.env` is omitted, the platform automatically runs using the persistent local database and deterministic AI matching/brief fallback.)*

### 3. Start Full-Stack Development Server (Backend + Frontend)
```bash
npm run dev
```
- **Frontend UI**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001/api/health`

### 4. Production Build
```bash
npm run build
npm start
```

---

## 🔑 Demo Accounts (1-Click Login Available on `/auth`)

Password for all pre-seeded demo accounts: `Demo@123`

| Role | Name / Organization | Email |
| :--- | :--- | :--- |
| **Brand / Agency** | Sophia Chen (Lumina Botanicals) | `brand@lumina-skincare.com` |
| **AI Creator** | Aria Vance (AI Film Director) | `aria.vance@creatorconnect.ai` |
| **Platform Admin** | Alex Rivera (Trust & Safety) | `admin@creatorconnect.ai` |

---

## 🗄️ Supabase Configuration Instructions

To use a hosted Supabase PostgreSQL database:
1. Create a new project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase Dashboard and paste the entire contents of `supabase/schema.sql`.
3. Click **Run** to create all 12 tables, foreign keys, indexes, and Row Level Security (RLS) policies.
4. Copy your Project URL and Anon Key into `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
