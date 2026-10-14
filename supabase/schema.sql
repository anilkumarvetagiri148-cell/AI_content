-- ============================================================================
-- CreatorConnect AI — Complete Supabase PostgreSQL Schema, Indexes & RLS Policies
-- Compliant with Master Specification (11 Tables, Constraints, RLS, & Triggers)
-- Problem Statement No. 2: AI Content Creator Marketplace
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('creator', 'brand', 'admin')),
  avatar_url TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  location TEXT DEFAULT '',
  website_url TEXT DEFAULT '',
  company_name TEXT DEFAULT '',
  languages TEXT[] DEFAULT ARRAY['English'],
  social_links JSONB DEFAULT '{}'::jsonb,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. CREATOR PROFILES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.creator_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_title TEXT NOT NULL DEFAULT 'AI Content Creator',
  industry_category TEXT NOT NULL DEFAULT 'Technology & AI',
  specializations TEXT[] NOT NULL DEFAULT ARRAY['AI Video Generation']::TEXT[],
  skills TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ai_tools TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  experience_level TEXT NOT NULL DEFAULT 'intermediate' CHECK (experience_level IN ('junior', 'intermediate', 'senior', 'expert')),
  years_of_experience INTEGER NOT NULL DEFAULT 2 CHECK (years_of_experience >= 0),
  starting_price_inr NUMERIC(12, 2) NOT NULL DEFAULT 15000.00 CHECK (starting_price_inr >= 0),
  availability TEXT NOT NULL DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'unavailable')),
  languages TEXT[] DEFAULT ARRAY['English'],
  average_rating NUMERIC(3, 2) NOT NULL DEFAULT 0.00 CHECK (average_rating >= 0 AND average_rating <= 5),
  total_reviews INTEGER NOT NULL DEFAULT 0 CHECK (total_reviews >= 0),
  profile_completion INTEGER NOT NULL DEFAULT 85 CHECK (profile_completion >= 0 AND profile_completion <= 100),
  packages JSONB NOT NULL DEFAULT '[]'::jsonb,
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  response_time TEXT DEFAULT '< 2 hours',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 3. PORTFOLIO PROJECTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image', 'video', 'audio', 'interactive')),
  cover_image_url TEXT NOT NULL,
  media_urls TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  project_url TEXT DEFAULT '',
  tools_used TEXT[] DEFAULT ARRAY[]::TEXT[],
  deliverables TEXT[] DEFAULT ARRAY[]::TEXT[],
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  client_name TEXT DEFAULT '',
  views INTEGER NOT NULL DEFAULT 0 CHECK (views >= 0),
  likes INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. CAMPAIGNS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  target_audience TEXT DEFAULT '',
  deliverables TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  required_skills TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  required_ai_tools TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  budget_min_inr NUMERIC(12, 2) NOT NULL CHECK (budget_min_inr >= 0),
  budget_max_inr NUMERIC(12, 2) NOT NULL CHECK (budget_max_inr >= budget_min_inr),
  deadline DATE NOT NULL,
  reference_media TEXT[] DEFAULT ARRAY[]::TEXT[],
  content_type TEXT DEFAULT 'AI Video & Stills',
  goals TEXT DEFAULT '',
  experience_level TEXT DEFAULT 'intermediate' CHECK (experience_level IN ('any', 'junior', 'intermediate', 'senior', 'expert')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'in_progress', 'completed', 'cancelled')),
  hired_creator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 5. CAMPAIGN PROPOSALS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.campaign_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  pitch TEXT NOT NULL,
  proposed_price_inr NUMERIC(12, 2) NOT NULL CHECK (proposed_price_inr > 0),
  estimated_delivery_days INTEGER NOT NULL CHECK (estimated_delivery_days > 0),
  portfolio_ids UUID[] DEFAULT ARRAY[]::UUID[],
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_campaign_creator_proposal UNIQUE (campaign_id, creator_id)
);

-- ============================================================================
-- 6. SAVED CREATORS (FAVORITES) TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.saved_creators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_brand_saved_creator UNIQUE (brand_id, creator_id)
);

-- ============================================================================
-- 7. CONVERSATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  last_message TEXT DEFAULT '',
  last_message_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 8. CONVERSATION PARTICIPANTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

-- ============================================================================
-- 9. MESSAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  attachment_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 10. REVIEWS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_campaign_review UNIQUE (campaign_id, creator_id, reviewer_id)
);

-- ============================================================================
-- 11. NOTIFICATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_entity_id UUID,
  link TEXT DEFAULT '/',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_industry ON public.creator_profiles(industry_category);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_rating ON public.creator_profiles(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_price ON public.creator_profiles(starting_price_inr ASC);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_avail ON public.creator_profiles(availability);
CREATE INDEX IF NOT EXISTS idx_portfolio_creator ON public.portfolio_projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_cat ON public.portfolio_projects(category);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand ON public.campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON public.campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_cat ON public.campaigns(category);
CREATE INDEX IF NOT EXISTS idx_proposals_campaign ON public.campaign_proposals(campaign_id);
CREATE INDEX IF NOT EXISTS idx_proposals_creator ON public.campaign_proposals(creator_id);
CREATE INDEX IF NOT EXISTS idx_conv_participants_user ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON public.messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read_at);
CREATE INDEX IF NOT EXISTS idx_reviews_creator ON public.reviews(creator_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, owner update
CREATE POLICY "Public profiles are readable by all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Creator Profiles: Public read, owner manage
CREATE POLICY "Creator profiles are readable by all" ON public.creator_profiles FOR SELECT USING (true);
CREATE POLICY "Creators manage own profile" ON public.creator_profiles FOR ALL USING (auth.uid() = user_id);

-- Portfolio: Public read, owner manage
CREATE POLICY "Portfolio projects are readable by all" ON public.portfolio_projects FOR SELECT USING (true);
CREATE POLICY "Creators manage own portfolio" ON public.portfolio_projects FOR ALL USING (auth.uid() = creator_id);

-- Campaigns: Published readable by all; drafts only by owner
CREATE POLICY "Campaigns readable by status" ON public.campaigns FOR SELECT
  USING (status <> 'draft' OR auth.uid() = brand_id);
CREATE POLICY "Brands create campaigns" ON public.campaigns FOR INSERT
  WITH CHECK (auth.uid() = brand_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('brand', 'admin')));
CREATE POLICY "Brands update own campaigns" ON public.campaigns FOR UPDATE USING (auth.uid() = brand_id);

-- Proposals: Visible to creator and campaign brand
CREATE POLICY "Proposals viewable by creator and campaign brand" ON public.campaign_proposals FOR SELECT
  USING (auth.uid() = creator_id OR EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND c.brand_id = auth.uid()));
CREATE POLICY "Creators submit proposals" ON public.campaign_proposals FOR INSERT
  WITH CHECK (auth.uid() = creator_id AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'creator'));
CREATE POLICY "Proposals manageable by parties" ON public.campaign_proposals FOR UPDATE
  USING (auth.uid() = creator_id OR EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND c.brand_id = auth.uid()));

-- Saved Creators: Manageable by brand owner
CREATE POLICY "Brands manage saved creators" ON public.saved_creators FOR ALL USING (auth.uid() = brand_id);

-- Conversations & Participants: Participant access only
CREATE POLICY "Participants view conversations" ON public.conversations FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = id AND cp.user_id = auth.uid()));

CREATE POLICY "Participants view participant list" ON public.conversation_participants FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()));

CREATE POLICY "Participants view messages" ON public.messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()));

CREATE POLICY "Participants send messages" ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.conversation_participants cp WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()));

-- Reviews: Public read, insert only by campaign brand for completed campaigns
CREATE POLICY "Reviews readable by all" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Brands review completed campaigns" ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id AND EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND c.brand_id = auth.uid() AND c.status = 'completed'));

-- Notifications: Private to user
CREATE POLICY "Users access own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- ============================================================================
-- AUTO-RECALCULATE CREATOR RATINGS TRIGGER
-- ============================================================================
CREATE OR REPLACE FUNCTION public.recalculate_creator_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_avg NUMERIC(3, 2);
  v_cnt INTEGER;
BEGIN
  SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0.00), COUNT(*)
  INTO v_avg, v_cnt
  FROM public.reviews
  WHERE creator_id = NEW.creator_id;

  UPDATE public.creator_profiles
  SET average_rating = v_avg,
      total_reviews = v_cnt,
      updated_at = NOW()
  WHERE user_id = NEW.creator_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_recalculate_creator_rating ON public.reviews;
CREATE TRIGGER trg_recalculate_creator_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.recalculate_creator_rating();
