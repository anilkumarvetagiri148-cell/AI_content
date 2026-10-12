-- ============================================================================
-- CreatorConnect AI — Supabase PostgreSQL Schema, Indexes & RLS Policies
-- Problem Statement No. 2: AI Content Creator Marketplace
-- ============================================================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('creator', 'brand', 'admin')),
  avatar_url TEXT,
  bio TEXT DEFAULT '',
  location TEXT DEFAULT '',
  languages TEXT[] DEFAULT ARRAY['English'],
  company_name TEXT,
  website TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CREATOR PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.creator_profiles (
  creator_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'AI Content Creator',
  specialization TEXT NOT NULL DEFAULT 'AI Image Generation',
  secondary_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
  skills TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ai_tools TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  starting_price NUMERIC(10, 2) NOT NULL DEFAULT 250.00 CHECK (starting_price >= 0),
  packages JSONB NOT NULL DEFAULT '[]'::jsonb,
  availability TEXT NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'unavailable')),
  experience_years INTEGER NOT NULL DEFAULT 2 CHECK (experience_years >= 0),
  experience_level TEXT NOT NULL DEFAULT 'intermediate' CHECK (experience_level IN ('junior', 'intermediate', 'senior', 'expert')),
  rating NUMERIC(3, 2) NOT NULL DEFAULT 0.00 CHECK (rating >= 0 AND rating <= 5),
  review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  completed_campaigns INTEGER NOT NULL DEFAULT 0 CHECK (completed_campaigns >= 0),
  profile_views INTEGER NOT NULL DEFAULT 0 CHECK (profile_views >= 0),
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  response_time TEXT DEFAULT '< 2 hours',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PORTFOLIO PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Lead AI Creator',
  deliverables TEXT[] DEFAULT ARRAY[]::TEXT[],
  media_urls TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  thumbnail_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video', 'audio')),
  ai_tools_used TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  client_name TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  brand_logo TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  content_type TEXT NOT NULL,
  goals TEXT NOT NULL DEFAULT '',
  target_audience TEXT NOT NULL DEFAULT '',
  deliverables TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  budget_min NUMERIC(10, 2) NOT NULL CHECK (budget_min >= 0),
  budget_max NUMERIC(10, 2) NOT NULL CHECK (budget_max >= budget_min),
  deadline DATE NOT NULL,
  required_skills TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  required_ai_tools TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  experience_level TEXT NOT NULL DEFAULT 'intermediate' CHECK (experience_level IN ('any', 'junior', 'intermediate', 'senior', 'expert')),
  reference_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'in_progress', 'completed')),
  hired_creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. CAMPAIGN PROPOSALS TABLE
CREATE TABLE IF NOT EXISTS public.campaign_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pitch TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price > 0),
  timeline TEXT NOT NULL,
  portfolio_ids UUID[] DEFAULT ARRAY[]::UUID[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_campaign_creator_proposal UNIQUE (campaign_id, creator_id)
);

-- 6. CAMPAIGN INVITATIONS TABLE
CREATE TABLE IF NOT EXISTS public.campaign_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_campaign_creator_invite UNIQUE (campaign_id, creator_id)
);

-- 7. SAVED CREATORS (FAVORITES) TABLE
CREATE TABLE IF NOT EXISTS public.saved_creators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_brand_saved_creator UNIQUE (brand_id, creator_id)
);

-- 8. CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  last_message TEXT DEFAULT '',
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_participants_campaign UNIQUE (brand_id, creator_id, campaign_id)
);

-- 9. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read_status BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_campaign_review UNIQUE (campaign_id, creator_id, reviewer_id)
);

-- 11. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT DEFAULT '/',
  read_status BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. MODERATION REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reported_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('portfolio', 'campaign', 'review', 'user')),
  item_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_creator_profiles_specialization ON public.creator_profiles(specialization);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_availability ON public.creator_profiles(availability);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_rating ON public.creator_profiles(rating DESC);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_price ON public.creator_profiles(starting_price ASC);
CREATE INDEX IF NOT EXISTS idx_portfolio_creator_id ON public.portfolio_projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_category ON public.portfolio_projects(category);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON public.campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_category ON public.campaigns(category);
CREATE INDEX IF NOT EXISTS idx_proposals_campaign_id ON public.campaign_proposals(campaign_id);
CREATE INDEX IF NOT EXISTS idx_proposals_creator_id ON public.campaign_proposals(creator_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON public.notifications(recipient_id, read_status);
CREATE INDEX IF NOT EXISTS idx_reviews_creator_id ON public.reviews(creator_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reported_items ENABLE ROW LEVEL SECURITY;

-- Public read access for profiles, creator_profiles, portfolio_projects, reviews
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Creator profiles are viewable by everyone"
  ON public.creator_profiles FOR SELECT USING (true);

CREATE POLICY "Creators can insert and update own creator_profile"
  ON public.creator_profiles FOR ALL USING (auth.uid() = creator_id);

CREATE POLICY "Portfolio projects are viewable by everyone"
  ON public.portfolio_projects FOR SELECT USING (true);

CREATE POLICY "Creators can manage own portfolio projects"
  ON public.portfolio_projects FOR ALL USING (auth.uid() = creator_id);

-- Campaigns: Published campaigns are public; drafts only visible to owning brand
CREATE POLICY "Published campaigns are viewable by everyone, drafts by owner"
  ON public.campaigns FOR SELECT
  USING (status <> 'draft' OR auth.uid() = brand_id);

CREATE POLICY "Brands can create campaigns"
  ON public.campaigns FOR INSERT
  WITH CHECK (
    auth.uid() = brand_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('brand', 'admin'))
  );

CREATE POLICY "Brands can update own campaigns"
  ON public.campaigns FOR UPDATE
  USING (auth.uid() = brand_id);

-- Proposals: Visible only to submitting creator or campaign owning brand
CREATE POLICY "Proposals visible to creator and campaign brand"
  ON public.campaign_proposals FOR SELECT
  USING (
    auth.uid() = creator_id OR
    EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND c.brand_id = auth.uid())
  );

CREATE POLICY "Creators can submit proposals"
  ON public.campaign_proposals FOR INSERT
  WITH CHECK (
    auth.uid() = creator_id AND
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'creator')
  );

CREATE POLICY "Campaign brand or creator can update proposal"
  ON public.campaign_proposals FOR UPDATE
  USING (
    auth.uid() = creator_id OR
    EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND c.brand_id = auth.uid())
  );

-- Saved creators: Visible & manageable only by owning brand
CREATE POLICY "Brands manage own saved creators"
  ON public.saved_creators FOR ALL
  USING (auth.uid() = brand_id);

-- Conversations & Messages: Visible only to conversation participants
CREATE POLICY "Participants can view conversations"
  ON public.conversations FOR SELECT
  USING (auth.uid() = brand_id OR auth.uid() = creator_id);

CREATE POLICY "Participants can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = brand_id OR auth.uid() = creator_id);

CREATE POLICY "Participants can view messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND (c.brand_id = auth.uid() OR c.creator_id = auth.uid())
    )
  );

CREATE POLICY "Participants can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND (c.brand_id = auth.uid() OR c.creator_id = auth.uid())
    )
  );

-- Reviews: Publicly readable, insertable only by campaign brand when campaign is completed
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Brands can review completed campaigns"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_id AND c.brand_id = auth.uid() AND c.status = 'completed'
    )
  );

-- Notifications: Private to recipient
CREATE POLICY "Recipients can view and update own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = recipient_id);
