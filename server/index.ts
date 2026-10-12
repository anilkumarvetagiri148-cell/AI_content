import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs';
import { db, hashPassword, verifyPassword, signToken, verifyToken } from './db.js';
import { matchCreatorsToCampaign, generateStructuredBrief } from './aiEngine.js';
import {
  AvailabilityStatus,
  Campaign,
  CampaignInvitation,
  CampaignProposal,
  CampaignStatus,
  Conversation,
  ExperienceLevel,
  Message,
  NotificationItem,
  PortfolioProject,
  Profile,
  Review,
  UserRole,
} from '../src/types/index.js';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
    email: string;
  };
}

function sanitizeText(val: unknown, maxLen = 2000): string {
  if (typeof val !== 'string') return '';
  return val.trim().slice(0, maxLen);
}

// Middleware: Optional Auth
function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const verified = verifyToken(token);
    if (verified) {
      const profile = db.getProfileById(verified.userId);
      if (profile) {
        req.user = { userId: profile.id, role: profile.role, email: profile.email };
      }
    }
  }
  next();
}

// Middleware: Require Auth
function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  optionalAuth(req, res, () => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required. Please sign in.' });
      return;
    }
    next();
  });
}

// Middleware: Require Specific Roles (Enforced on Backend — never trusts frontend role param)
function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    requireAuth(req, res, () => {
      if (!req.user || !roles.includes(req.user.role)) {
        res.status(403).json({
          error: `Access denied. Required role: ${roles.join(' or ')}. Your account role is ${req.user?.role || 'guest'}.`,
        });
        return;
      }
      next();
    });
  };
}

// Helper to create notification
function createNotification(
  recipientId: string,
  type: NotificationItem['type'],
  title: string,
  message: string,
  link = '/'
) {
  const state = db.getState();
  state.notifications.unshift({
    id: `notif-${crypto.randomUUID().slice(0, 8)}`,
    recipient_id: recipientId,
    type,
    title,
    message,
    link,
    read_status: false,
    created_at: new Date().toISOString(),
  });
}

// ============================================================================
// 1. HEALTH & PLATFORM STATS
// ============================================================================
app.get('/api/health', (_req, res) => {
  const state = db.getState();
  res.json({
    status: 'ok',
    platform: 'CreatorConnect AI',
    counts: {
      creators: state.creator_profiles.length,
      campaigns: state.campaigns.length,
      portfolios: state.portfolio_projects.length,
      proposals: state.campaign_proposals.length,
    },
    aiConfigured: Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY),
    supabaseConfigured: Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY),
  });
});

// ============================================================================
// 2. AUTHENTICATION & PROFILE ROUTES
// ============================================================================
app.post('/api/auth/signup', (req: Request, res: Response) => {
  const email = sanitizeText(req.body.email, 120).toLowerCase();
  const password = String(req.body.password || '');
  const name = sanitizeText(req.body.name, 100);
  const requestedRole = req.body.role === 'brand' ? 'brand' : 'creator';
  const companyName = sanitizeText(req.body.company_name, 120);
  const specialization = sanitizeText(req.body.specialization, 100) || 'AI Video Generation';

  if (!email || !email.includes('@')) {
    res.status(400).json({ error: 'Please provide a valid email address.' });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    return;
  }
  if (!name) {
    res.status(400).json({ error: 'Please provide your full name or studio name.' });
    return;
  }

  const state = db.getState();
  if (state.users.some((u) => u.email === email)) {
    res.status(409).json({ error: 'An account with this email already exists. Please log in.' });
    return;
  }

  const userId = `${requestedRole}-${crypto.randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();

  const newProfile: Profile = {
    id: userId,
    email,
    name,
    role: requestedRole,
    avatar_url:
      requestedRole === 'creator'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
        : 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    bio:
      requestedRole === 'creator'
        ? `AI Content Creator specializing in ${specialization}. Passionate about crafting next-gen brand visuals.`
        : `${companyName || name} — commissioning AI-native creative campaigns.`,
    location: sanitizeText(req.body.location, 100) || 'Remote / Global',
    languages: ['English'],
    company_name: companyName || (requestedRole === 'brand' ? `${name} Brand Studio` : `${name} AI Studio`),
    website: '',
    social_links: {},
    verified: false,
    created_at: now,
  };

  state.users.push({
    userId,
    email,
    passwordHash: hashPassword(password),
  });
  state.profiles.push(newProfile);

  if (requestedRole === 'creator') {
    state.creator_profiles.push({
      creator_id: userId,
      title: `${specialization} Specialist`,
      industry_category: specialization,
      specialization,
      secondary_categories: ['Technology & AI'],
      skills: ['Cinematic AI Video', 'Custom LoRA Training', 'Photorealistic Product Renders'],
      ai_tools: ['Midjourney v6', 'Runway Gen-3 Alpha', 'Flux.1 Pro'],
      content_formats: ['video', 'image'],
      starting_price: 18500,
      packages: [
        {
          name: 'Starter',
          price: 18500,
          deliveryDays: 4,
          revisions: 2,
          description: 'Starter AI creative package tailored to your brand brief.',
          deliverables: ['5x High-Res AI Visuals or 1x 15s Video', '2 Revisions', 'Commercial Rights'],
        },
        {
          name: 'Pro',
          price: 38000,
          deliveryDays: 7,
          revisions: 4,
          description: 'Full campaign asset bundle with custom style consistency.',
          deliverables: ['15x Campaign Visuals + 2x Social Videos', 'Custom LoRA / Style Lock', 'Source Prompts'],
        },
      ],
      availability: 'available',
      experience_years: 2,
      experience_level: 'intermediate',
      rating: 5.0,
      review_count: 0,
      completed_campaigns: 0,
      profile_views: 1,
      featured: false,
      response_time: '< 2 hours',
    });
  }

  createNotification(
    userId,
    'system',
    'Welcome to CreatorConnect AI!',
    requestedRole === 'creator'
      ? 'Your creator studio is live! Complete your profile and upload your AI portfolio projects to rank higher in Brand AI Matching.'
      : 'Welcome aboard! Launch your first Campaign Brief or use our AI Brief Assistant to match with verified AI creators.',
    requestedRole === 'creator' ? '/dashboard/creator' : '/dashboard/brand'
  );

  db.save();

  const token = signToken({ userId, role: requestedRole, email });
  res.status(201).json({
    token,
    user: newProfile,
    creatorProfile: requestedRole === 'creator' ? db.getFullCreator(userId)?.creator_profile : null,
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const email = sanitizeText(req.body.email, 120).toLowerCase();
  const password = String(req.body.password || '');

  const state = db.getState();
  const userCred = state.users.find((u) => u.email === email);
  if (!userCred || !verifyPassword(password, userCred.passwordHash)) {
    res.status(401).json({ error: 'Invalid email or password. Try a demo account or check your credentials.' });
    return;
  }

  const profile = db.getProfileById(userCred.userId);
  if (!profile) {
    res.status(404).json({ error: 'User profile not found.' });
    return;
  }

  const token = signToken({ userId: profile.id, role: profile.role, email: profile.email });
  res.json({
    token,
    user: profile,
    creatorProfile: profile.role === 'creator' ? db.getFullCreator(profile.id)?.creator_profile : null,
  });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const email = sanitizeText(req.body.email, 120).toLowerCase();
  const newPassword = String(req.body.newPassword || '');

  if (!email || !email.includes('@')) {
    res.status(400).json({ error: 'Please enter a valid email address.' });
    return;
  }

  const state = db.getState();
  const userCred = state.users.find((u) => u.email === email);
  if (!userCred) {
    res.json({
      message: 'If an account matches that email, password reset instructions have been processed.',
    });
    return;
  }

  if (newPassword && newPassword.length >= 6) {
    userCred.passwordHash = hashPassword(newPassword);
    db.save();
    res.json({ message: 'Your password has been updated. You can now sign in with your new password.' });
    return;
  }

  res.json({
    message: 'Password reset verified. Provide a new password (min 6 chars) to complete reset immediately.',
  });
});

app.get('/api/auth/me', requireAuth, (req: AuthRequest, res: Response) => {
  const profile = db.getProfileById(req.user!.userId);
  if (!profile) {
    res.status(404).json({ error: 'Profile not found.' });
    return;
  }
  const fullCreator = profile.role === 'creator' ? db.getFullCreator(profile.id) : null;
  res.json({
    user: profile,
    creatorProfile: fullCreator?.creator_profile || null,
    portfolio: fullCreator?.portfolio || [],
  });
});

app.put('/api/auth/profile', requireAuth, (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const profile = state.profiles.find((p) => p.id === req.user!.userId);
  if (!profile) {
    res.status(404).json({ error: 'Profile not found.' });
    return;
  }

  if (req.body.name) profile.name = sanitizeText(req.body.name, 100);
  if (req.body.bio !== undefined) profile.bio = sanitizeText(req.body.bio, 1000);
  if (req.body.location !== undefined) profile.location = sanitizeText(req.body.location, 100);
  if (req.body.company_name !== undefined) profile.company_name = sanitizeText(req.body.company_name, 120);
  if (req.body.website !== undefined) profile.website = sanitizeText(req.body.website, 200);
  if (req.body.avatar_url) profile.avatar_url = sanitizeText(req.body.avatar_url, 500);
  if (Array.isArray(req.body.languages)) {
    profile.languages = req.body.languages.map((l: unknown) => sanitizeText(l, 40)).filter(Boolean);
  }
  if (req.body.social_links && typeof req.body.social_links === 'object') {
    profile.social_links = {
      ...profile.social_links,
      ...req.body.social_links,
    };
  }

  if (profile.role === 'creator') {
    const cp = state.creator_profiles.find((c) => c.creator_id === profile.id);
    if (cp) {
      if (req.body.title) cp.title = sanitizeText(req.body.title, 120);
      if (req.body.specialization) {
        cp.specialization = sanitizeText(req.body.specialization, 100);
        cp.industry_category = cp.specialization;
      }
      if (Array.isArray(req.body.secondary_categories)) {
        cp.secondary_categories = req.body.secondary_categories.map((c: unknown) => sanitizeText(c, 80)).filter(Boolean);
      }
      if (Array.isArray(req.body.skills)) {
        cp.skills = req.body.skills.map((s: unknown) => sanitizeText(s, 60)).filter(Boolean);
      }
      if (Array.isArray(req.body.ai_tools)) {
        cp.ai_tools = req.body.ai_tools.map((t: unknown) => sanitizeText(t, 60)).filter(Boolean);
      }
      if (req.body.starting_price !== undefined) {
        cp.starting_price = Math.max(500, Number(req.body.starting_price) || 15000);
      }
      if (req.body.availability && ['available', 'busy', 'unavailable'].includes(req.body.availability)) {
        cp.availability = req.body.availability as AvailabilityStatus;
      }
      if (req.body.experience_years !== undefined) {
        cp.experience_years = Math.max(0, Number(req.body.experience_years) || 1);
      }
      if (
        req.body.experience_level &&
        ['junior', 'intermediate', 'senior', 'expert'].includes(req.body.experience_level)
      ) {
        cp.experience_level = req.body.experience_level as ExperienceLevel;
      }
      if (Array.isArray(req.body.packages)) {
        cp.packages = req.body.packages;
      }
    }
  }

  db.save();
  res.json({
    user: profile,
    creatorProfile: profile.role === 'creator' ? db.getFullCreator(profile.id)?.creator_profile : null,
  });
});

// ============================================================================
// 3. CREATORS & PORTFOLIO MARKETPLACE ROUTES
// ============================================================================
app.get('/api/creators', (req: Request, res: Response) => {
  const allCreators = db.getAllFullCreators();

  // Compute category counts across the entire database
  const categoryCounts: Record<string, number> = { 'All Creators': allCreators.length };
  for (const c of allCreators) {
    const cat = c.creator_profile.industry_category || c.creator_profile.specialization;
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  let creators = [...allCreators];

  const search = sanitizeText(req.query.search, 120).toLowerCase();
  const category = sanitizeText(req.query.category, 100);
  const tool = sanitizeText(req.query.tool, 100).toLowerCase();
  const skill = sanitizeText(req.query.skill, 100).toLowerCase();
  const minBudget = req.query.minBudget ? Number(req.query.minBudget) : undefined;
  const maxBudget = req.query.maxBudget ? Number(req.query.maxBudget) : undefined;
  const minRating = req.query.minRating ? Number(req.query.minRating) : undefined;
  const availability = sanitizeText(req.query.availability, 40);
  const experience = sanitizeText(req.query.experience, 40);
  const format = sanitizeText(req.query.format, 40).toLowerCase();
  const sort = sanitizeText(req.query.sort, 40) || 'recommended';

  if (search) {
    creators = creators.filter((c) => {
      const haystack = [
        c.name,
        c.bio,
        c.location,
        c.creator_profile.title,
        c.creator_profile.industry_category || '',
        c.creator_profile.specialization,
        ...c.creator_profile.secondary_categories,
        ...c.creator_profile.skills,
        ...c.creator_profile.ai_tools,
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(search);
    });
  }

  if (category && category !== 'All' && category !== 'All Creators') {
    creators = creators.filter(
      (c) =>
        c.creator_profile.industry_category === category ||
        c.creator_profile.specialization === category ||
        c.creator_profile.secondary_categories.includes(category)
    );
  }

  if (tool && tool !== 'all') {
    creators = creators.filter((c) =>
      c.creator_profile.ai_tools.some((t) => t.toLowerCase().includes(tool))
    );
  }

  if (skill && skill !== 'all') {
    creators = creators.filter((c) =>
      c.creator_profile.skills.some((s) => s.toLowerCase().includes(skill)) ||
      c.creator_profile.specialization.toLowerCase().includes(skill)
    );
  }

  if (minBudget !== undefined && !isNaN(minBudget) && minBudget > 0) {
    creators = creators.filter((c) => c.creator_profile.starting_price >= minBudget);
  }

  if (maxBudget !== undefined && !isNaN(maxBudget) && maxBudget > 0) {
    creators = creators.filter((c) => c.creator_profile.starting_price <= maxBudget);
  }

  if (minRating !== undefined && !isNaN(minRating) && minRating > 0) {
    creators = creators.filter((c) => c.creator_profile.rating >= minRating);
  }

  if (availability && availability !== 'all') {
    creators = creators.filter((c) => c.creator_profile.availability === availability);
  }

  if (experience && experience !== 'all') {
    creators = creators.filter((c) => c.creator_profile.experience_level === experience);
  }

  if (format && format !== 'all') {
    creators = creators.filter(
      (c) =>
        (c.creator_profile.content_formats &&
          c.creator_profile.content_formats.includes(format as any)) ||
        c.portfolio.some((p) => p.media_type === format)
    );
  }

  // Sorting
  if (sort === 'rating') {
    creators.sort((a, b) => b.creator_profile.rating - a.creator_profile.rating);
  } else if (sort === 'price_asc') {
    creators.sort((a, b) => a.creator_profile.starting_price - b.creator_profile.starting_price);
  } else if (sort === 'price_desc') {
    creators.sort((a, b) => b.creator_profile.starting_price - a.creator_profile.starting_price);
  } else if (sort === 'newest') {
    creators.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else if (sort === 'relevance') {
    creators.sort(
      (a, b) =>
        b.creator_profile.review_count * b.creator_profile.rating -
        a.creator_profile.review_count * a.creator_profile.rating
    );
  } else {
    // recommended: featured first, then rating
    creators.sort((a, b) => {
      if (a.creator_profile.featured !== b.creator_profile.featured) {
        return a.creator_profile.featured ? -1 : 1;
      }
      return b.creator_profile.rating - a.creator_profile.rating;
    });
  }

  res.json({ creators, total: creators.length, categoryCounts });
});

app.get('/api/creators/:id', (req: Request, res: Response) => {
  const creatorId = String(req.params.id);
  const creator = db.getFullCreator(creatorId);
  if (!creator) {
    res.status(404).json({ error: 'Creator profile not found.' });
    return;
  }

  // Increment profile view counter
  const state = db.getState();
  const cp = state.creator_profiles.find((c) => c.creator_id === creatorId);
  if (cp) {
    cp.profile_views += 1;
    db.save();
  }

  res.json({ creator: db.getFullCreator(creatorId) });
});

// Add Portfolio Project (Creator only)
app.post('/api/portfolio', requireRole('creator'), (req: AuthRequest, res: Response) => {
  const title = sanitizeText(req.body.title, 150);
  const description = sanitizeText(req.body.description, 1500);
  const category = sanitizeText(req.body.category, 100) || 'AI Image Generation';
  const role = sanitizeText(req.body.role, 100) || 'Lead AI Creator';
  const thumbnailUrl = sanitizeText(req.body.thumbnail_url, 600);
  const mediaType = ['image', 'video', 'audio'].includes(req.body.media_type) ? req.body.media_type : 'image';

  if (!title || !description || !thumbnailUrl) {
    res.status(400).json({ error: 'Title, description, and media preview URL are required.' });
    return;
  }

  const state = db.getState();
  const newProject: PortfolioProject = {
    id: `port-${crypto.randomUUID().slice(0, 8)}`,
    creator_id: req.user!.userId,
    title,
    description,
    category,
    role,
    deliverables: Array.isArray(req.body.deliverables)
      ? req.body.deliverables.map((d: unknown) => sanitizeText(d, 100)).filter(Boolean)
      : ['4K Final Master Assets'],
    media_urls: Array.isArray(req.body.media_urls) && req.body.media_urls.length > 0
      ? req.body.media_urls.map((u: unknown) => sanitizeText(u, 600))
      : [thumbnailUrl],
    thumbnail_url: thumbnailUrl,
    media_type: mediaType,
    ai_tools_used: Array.isArray(req.body.ai_tools_used)
      ? req.body.ai_tools_used.map((t: unknown) => sanitizeText(t, 60)).filter(Boolean)
      : ['Midjourney v6', 'Flux.1 Pro'],
    tags: Array.isArray(req.body.tags)
      ? req.body.tags.map((t: unknown) => sanitizeText(t, 40)).filter(Boolean)
      : ['AI Creative'],
    client_name: sanitizeText(req.body.client_name, 100) || undefined,
    views: 1,
    likes: 1,
    created_at: new Date().toISOString(),
  };

  state.portfolio_projects.unshift(newProject);
  db.save();

  res.status(201).json({ project: newProject });
});

app.delete('/api/portfolio/:id', requireRole('creator', 'admin'), (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const idx = state.portfolio_projects.findIndex((p) => p.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ error: 'Portfolio project not found.' });
    return;
  }
  const project = state.portfolio_projects[idx];
  if (req.user!.role !== 'admin' && project.creator_id !== req.user!.userId) {
    res.status(403).json({ error: 'You can only delete your own portfolio projects.' });
    return;
  }
  state.portfolio_projects.splice(idx, 1);
  db.save();
  res.json({ success: true });
});

// ============================================================================
// 4. CAMPAIGNS, PROPOSALS & INVITATIONS ROUTES
// ============================================================================
app.get('/api/campaigns', optionalAuth, (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const search = sanitizeText(req.query.search, 120).toLowerCase();
  const category = sanitizeText(req.query.category, 100);
  const status = sanitizeText(req.query.status, 40);
  const minBudget = req.query.minBudget ? Number(req.query.minBudget) : undefined;
  const brandId = sanitizeText(req.query.brandId, 60);

  let campaigns = state.campaigns.filter((c) => {
    // Drafts are only visible to the owning brand or admin
    if (c.status === 'draft') {
      return req.user && (req.user.userId === c.brand_id || req.user.role === 'admin');
    }
    return true;
  });

  if (brandId) {
    campaigns = campaigns.filter((c) => c.brand_id === brandId);
  }
  if (search) {
    campaigns = campaigns.filter((c) => {
      const text = `${c.title} ${c.description} ${c.brand_name} ${c.category} ${c.required_skills.join(' ')} ${c.required_ai_tools.join(' ')}`.toLowerCase();
      return text.includes(search);
    });
  }
  if (category && category !== 'All') {
    campaigns = campaigns.filter((c) => c.category === category);
  }
  if (status && status !== 'all') {
    campaigns = campaigns.filter((c) => c.status === status);
  }
  if (minBudget !== undefined && !isNaN(minBudget)) {
    campaigns = campaigns.filter((c) => c.budget_max >= minBudget);
  }

  const enriched = campaigns
    .map((c) => ({
      ...c,
      proposal_count: state.campaign_proposals.filter((p) => p.campaign_id === c.id).length,
    }))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json({ campaigns: enriched });
});

app.get('/api/campaigns/:id', optionalAuth, (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const campaign = state.campaigns.find((c) => c.id === req.params.id);
  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found.' });
    return;
  }
  if (
    campaign.status === 'draft' &&
    (!req.user || (req.user.userId !== campaign.brand_id && req.user.role !== 'admin'))
  ) {
    res.status(403).json({ error: 'This draft campaign is private.' });
    return;
  }

  // Include proposals if user is owning brand, admin, or the creator who submitted one
  let proposals: CampaignProposal[] = [];
  if (req.user) {
    const rawProposals = state.campaign_proposals.filter((p) => p.campaign_id === campaign.id);
    const filtered =
      req.user.userId === campaign.brand_id || req.user.role === 'admin'
        ? rawProposals
        : rawProposals.filter((p) => p.creator_id === req.user!.userId);

    proposals = filtered.map((p) => {
      const creator = db.getFullCreator(p.creator_id);
      return {
        ...p,
        campaign_title: campaign.title,
        brand_name: campaign.brand_name,
        creator_name: creator?.name || 'AI Creator',
        creator_avatar: creator?.avatar_url || '',
        creator_title: creator?.creator_profile.title || '',
        creator_rating: creator?.creator_profile.rating || 5.0,
      };
    });
  }

  res.json({
    campaign: {
      ...campaign,
      proposal_count: state.campaign_proposals.filter((p) => p.campaign_id === campaign.id).length,
    },
    proposals,
  });
});

// Create Campaign Brief (Brand or Admin only)
app.post('/api/campaigns', requireRole('brand', 'admin'), (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const brandProfile = db.getProfileById(req.user!.userId);
  if (!brandProfile) {
    res.status(404).json({ error: 'Brand profile not found.' });
    return;
  }

  const title = sanitizeText(req.body.title, 180);
  const description = sanitizeText(req.body.description, 3000);
  const category = sanitizeText(req.body.category, 100) || 'AI Video Generation';
  const contentType = sanitizeText(req.body.content_type, 100) || 'Video Commercial + Stills';
  const budgetMin = Math.max(50, Number(req.body.budget_min) || 500);
  const budgetMax = Math.max(budgetMin, Number(req.body.budget_max) || 1500);
  const deadline = sanitizeText(req.body.deadline, 30) || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
  const status: CampaignStatus = req.body.status === 'draft' ? 'draft' : 'open';

  if (!title || !description) {
    res.status(400).json({ error: 'Campaign title and description are required.' });
    return;
  }

  const now = new Date().toISOString();
  const newCampaign: Campaign = {
    id: `camp-${crypto.randomUUID().slice(0, 8)}`,
    brand_id: brandProfile.id,
    brand_name: brandProfile.company_name || brandProfile.name,
    brand_logo: brandProfile.avatar_url,
    title,
    description,
    category,
    content_type: contentType,
    goals: sanitizeText(req.body.goals, 1000) || 'Increase brand engagement and campaign conversion.',
    target_audience: sanitizeText(req.body.target_audience, 500) || 'Digital-native consumers.',
    deliverables: Array.isArray(req.body.deliverables) && req.body.deliverables.length > 0
      ? req.body.deliverables.map((d: unknown) => sanitizeText(d, 150)).filter(Boolean)
      : ['Master 4K AI Creative Deliverables'],
    budget_min: budgetMin,
    budget_max: budgetMax,
    deadline,
    required_skills: Array.isArray(req.body.required_skills)
      ? req.body.required_skills.map((s: unknown) => sanitizeText(s, 60)).filter(Boolean)
      : [],
    required_ai_tools: Array.isArray(req.body.required_ai_tools)
      ? req.body.required_ai_tools.map((t: unknown) => sanitizeText(t, 60)).filter(Boolean)
      : [],
    experience_level: ['any', 'junior', 'intermediate', 'senior', 'expert'].includes(req.body.experience_level)
      ? req.body.experience_level
      : 'intermediate',
    reference_urls: Array.isArray(req.body.reference_urls)
      ? req.body.reference_urls.map((u: unknown) => sanitizeText(u, 500)).filter(Boolean)
      : [],
    status,
    created_at: now,
    updated_at: now,
  };

  state.campaigns.unshift(newCampaign);
  db.save();

  res.status(201).json({ campaign: newCampaign });
});

// Update Campaign / Status (Owning Brand or Admin only)
app.put('/api/campaigns/:id', requireRole('brand', 'admin'), (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const campaign = state.campaigns.find((c) => c.id === req.params.id);
  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found.' });
    return;
  }
  if (req.user!.role !== 'admin' && campaign.brand_id !== req.user!.userId) {
    res.status(403).json({ error: 'You do not have permission to modify another brand’s campaign.' });
    return;
  }

  if (req.body.title) campaign.title = sanitizeText(req.body.title, 180);
  if (req.body.description) campaign.description = sanitizeText(req.body.description, 3000);
  if (req.body.category) campaign.category = sanitizeText(req.body.category, 100);
  if (req.body.content_type) campaign.content_type = sanitizeText(req.body.content_type, 100);
  if (req.body.goals !== undefined) campaign.goals = sanitizeText(req.body.goals, 1000);
  if (req.body.target_audience !== undefined) campaign.target_audience = sanitizeText(req.body.target_audience, 500);
  if (req.body.budget_min !== undefined) campaign.budget_min = Number(req.body.budget_min);
  if (req.body.budget_max !== undefined) campaign.budget_max = Number(req.body.budget_max);
  if (req.body.deadline) campaign.deadline = sanitizeText(req.body.deadline, 30);
  if (Array.isArray(req.body.deliverables)) campaign.deliverables = req.body.deliverables;
  if (Array.isArray(req.body.required_skills)) campaign.required_skills = req.body.required_skills;
  if (Array.isArray(req.body.required_ai_tools)) campaign.required_ai_tools = req.body.required_ai_tools;
  if (req.body.status && ['draft', 'open', 'in_progress', 'completed'].includes(req.body.status)) {
    const prevStatus = campaign.status;
    campaign.status = req.body.status as CampaignStatus;
    if (prevStatus !== 'completed' && campaign.status === 'completed' && campaign.hired_creator_id) {
      const cp = state.creator_profiles.find((c) => c.creator_id === campaign.hired_creator_id);
      if (cp) cp.completed_campaigns += 1;
      createNotification(
        campaign.hired_creator_id,
        'campaign',
        'Campaign Marked Completed!',
        `"${campaign.title}" has been marked Completed by ${campaign.brand_name}.`,
        '/dashboard/creator'
      );
    }
  }
  campaign.updated_at = new Date().toISOString();

  db.save();
  res.json({ campaign });
});

// Submit Proposal (Creator only — prevents duplicate proposals for same campaign + creator)
app.post('/api/campaigns/:id/proposals', requireRole('creator'), (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const campaign = state.campaigns.find((c) => c.id === req.params.id);
  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found.' });
    return;
  }
  if (campaign.status !== 'open') {
    res.status(400).json({ error: 'Proposals can only be submitted to Open campaigns.' });
    return;
  }

  // Prevent duplicate proposal
  const existing = state.campaign_proposals.find(
    (p) => p.campaign_id === campaign.id && p.creator_id === req.user!.userId
  );
  if (existing) {
    res.status(409).json({
      error: 'You have already submitted a proposal for this campaign.',
    });
    return;
  }

  const pitch = sanitizeText(req.body.pitch, 2000);
  const price = Number(req.body.price);
  const timeline = sanitizeText(req.body.timeline, 60);

  if (!pitch || pitch.length < 20) {
    res.status(400).json({ error: 'Please write a personalized pitch of at least 20 characters.' });
    return;
  }
  if (!price || price <= 0) {
    res.status(400).json({ error: 'Please enter a valid proposed price greater than $0.' });
    return;
  }
  if (!timeline) {
    res.status(400).json({ error: 'Please specify an estimated delivery timeline (e.g., "5 days").' });
    return;
  }

  const creator = db.getFullCreator(req.user!.userId);
  const newProposal: CampaignProposal = {
    id: `prop-${crypto.randomUUID().slice(0, 8)}`,
    campaign_id: campaign.id,
    creator_id: req.user!.userId,
    pitch,
    price,
    timeline,
    portfolio_ids: Array.isArray(req.body.portfolio_ids) ? req.body.portfolio_ids : [],
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  state.campaign_proposals.unshift(newProposal);

  createNotification(
    campaign.brand_id,
    'proposal',
    `New Proposal from ${creator?.name || 'AI Creator'}`,
    `${creator?.name || 'A creator'} proposed $${price} (${timeline}) for "${campaign.title}".`,
    '/dashboard/brand'
  );

  db.save();
  res.status(201).json({
    proposal: {
      ...newProposal,
      campaign_title: campaign.title,
      brand_name: campaign.brand_name,
      creator_name: creator?.name,
      creator_avatar: creator?.avatar_url,
      creator_title: creator?.creator_profile.title,
      creator_rating: creator?.creator_profile.rating,
    },
  });
});

// Get Proposals for Authenticated User (Brand sees proposals on their campaigns; Creator sees their submitted proposals)
app.get('/api/proposals', requireAuth, (req: AuthRequest, res: Response) => {
  const state = db.getState();
  let list: CampaignProposal[] = [];

  if (req.user!.role === 'creator') {
    list = state.campaign_proposals.filter((p) => p.creator_id === req.user!.userId);
  } else if (req.user!.role === 'brand') {
    const brandCampaignIds = new Set(
      state.campaigns.filter((c) => c.brand_id === req.user!.userId).map((c) => c.id)
    );
    list = state.campaign_proposals.filter((p) => brandCampaignIds.has(p.campaign_id));
  } else {
    list = state.campaign_proposals;
  }

  const enriched = list.map((p) => {
    const camp = state.campaigns.find((c) => c.id === p.campaign_id);
    const creator = db.getFullCreator(p.creator_id);
    return {
      ...p,
      campaign_title: camp?.title || 'Campaign',
      brand_name: camp?.brand_name || 'Brand',
      creator_name: creator?.name || 'Creator',
      creator_avatar: creator?.avatar_url || '',
      creator_title: creator?.creator_profile.title || '',
      creator_rating: creator?.creator_profile.rating || 5.0,
    };
  });

  res.json({ proposals: enriched });
});

// Update Proposal Status (Brand accepts or rejects)
app.patch('/api/proposals/:id/status', requireRole('brand', 'admin'), (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const proposal = state.campaign_proposals.find((p) => p.id === req.params.id);
  if (!proposal) {
    res.status(404).json({ error: 'Proposal not found.' });
    return;
  }

  const campaign = state.campaigns.find((c) => c.id === proposal.campaign_id);
  if (!campaign) {
    res.status(404).json({ error: 'Associated campaign not found.' });
    return;
  }
  if (req.user!.role !== 'admin' && campaign.brand_id !== req.user!.userId) {
    res.status(403).json({ error: 'Only the campaign owner can accept or reject proposals.' });
    return;
  }

  const status = req.body.status;
  if (!['accepted', 'rejected'].includes(status)) {
    res.status(400).json({ error: 'Invalid status. Must be accepted or rejected.' });
    return;
  }

  proposal.status = status;

  if (status === 'accepted') {
    campaign.status = 'in_progress';
    campaign.hired_creator_id = proposal.creator_id;
    campaign.updated_at = new Date().toISOString();

    createNotification(
      proposal.creator_id,
      'proposal',
      'Proposal Accepted! 🎉',
      `${campaign.brand_name} accepted your $${proposal.price} proposal for "${campaign.title}"!`,
      '/dashboard/creator'
    );

    // Ensure a conversation exists between brand and creator for this campaign
    const existingConv = state.conversations.find(
      (c) => c.brand_id === campaign.brand_id && c.creator_id === proposal.creator_id
    );
    if (!existingConv) {
      const brandProfile = db.getProfileById(campaign.brand_id);
      const creatorProfile = db.getProfileById(proposal.creator_id);
      const convId = `conv-${crypto.randomUUID().slice(0, 8)}`;
      const welcomeMsg = `Hi ${creatorProfile?.name}! We just accepted your proposal for "${campaign.title}". Let’s kick off collaboration here!`;
      state.conversations.unshift({
        id: convId,
        brand_id: campaign.brand_id,
        brand_name: brandProfile?.company_name || brandProfile?.name || campaign.brand_name,
        brand_avatar: brandProfile?.avatar_url || campaign.brand_logo,
        creator_id: proposal.creator_id,
        creator_name: creatorProfile?.name || 'Creator',
        creator_avatar: creatorProfile?.avatar_url || '',
        campaign_id: campaign.id,
        campaign_title: campaign.title,
        last_message: welcomeMsg,
        last_message_at: new Date().toISOString(),
        unread_count: 1,
        created_at: new Date().toISOString(),
      });
      state.messages.push({
        id: `msg-${crypto.randomUUID().slice(0, 8)}`,
        conversation_id: convId,
        sender_id: campaign.brand_id,
        sender_name: brandProfile?.name || campaign.brand_name,
        sender_avatar: brandProfile?.avatar_url || campaign.brand_logo,
        body: welcomeMsg,
        read_status: false,
        created_at: new Date().toISOString(),
      });
    }
  } else {
    createNotification(
      proposal.creator_id,
      'proposal',
      'Proposal Status Update',
      `Your proposal for "${campaign.title}" was not selected this time.`,
      '/dashboard/creator'
    );
  }

  db.save();
  res.json({ proposal, campaign });
});

// Invitations: Brand invites Creator to Campaign
app.get('/api/invitations', requireAuth, (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const list =
    req.user!.role === 'creator'
      ? state.campaign_invitations.filter((i) => i.creator_id === req.user!.userId)
      : state.campaign_invitations.filter((i) => i.brand_id === req.user!.userId);
  res.json({ invitations: list });
});

app.post('/api/invitations', requireRole('brand', 'admin'), (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const campaignId = sanitizeText(req.body.campaign_id, 60);
  const creatorId = sanitizeText(req.body.creator_id, 60);
  const message = sanitizeText(req.body.message, 1000) || 'We would love to invite you to submit a proposal for our campaign!';

  const campaign = state.campaigns.find((c) => c.id === campaignId);
  const creator = db.getProfileById(creatorId);
  const brand = db.getProfileById(req.user!.userId);

  if (!campaign || !creator || !brand) {
    res.status(404).json({ error: 'Campaign or creator not found.' });
    return;
  }

  const duplicate = state.campaign_invitations.find(
    (i) => i.campaign_id === campaignId && i.creator_id === creatorId
  );
  if (duplicate) {
    res.status(409).json({ error: 'You have already invited this creator to this campaign.' });
    return;
  }

  const invite: CampaignInvitation = {
    id: `inv-${crypto.randomUUID().slice(0, 8)}`,
    campaign_id: campaign.id,
    campaign_title: campaign.title,
    brand_id: brand.id,
    brand_name: brand.company_name || brand.name,
    brand_logo: brand.avatar_url,
    creator_id: creator.id,
    creator_name: creator.name,
    creator_avatar: creator.avatar_url,
    message,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  state.campaign_invitations.unshift(invite);
  createNotification(
    creator.id,
    'invitation',
    `Campaign Invitation from ${invite.brand_name}`,
    `You have been invited to pitch on "${campaign.title}".`,
    `/campaigns/${campaign.id}`
  );

  db.save();
  res.status(201).json({ invitation: invite });
});

app.patch('/api/invitations/:id', requireRole('creator'), (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const invite = state.campaign_invitations.find(
    (i) => i.id === req.params.id && i.creator_id === req.user!.userId
  );
  if (!invite) {
    res.status(404).json({ error: 'Invitation not found.' });
    return;
  }
  if (['accepted', 'declined'].includes(req.body.status)) {
    invite.status = req.body.status;
    createNotification(
      invite.brand_id,
      'invitation',
      `Invitation ${invite.status === 'accepted' ? 'Accepted' : 'Declined'}`,
      `${invite.creator_name} ${invite.status} your invitation for "${invite.campaign_title}".`,
      `/campaigns/${invite.campaign_id}`
    );
    db.save();
  }
  res.json({ invitation: invite });
});

// ============================================================================
// 5. SAVED CREATORS (FAVORITES)
// ============================================================================
app.get('/api/favorites', requireAuth, (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const savedIds = state.saved_creators
    .filter((s) => s.brand_id === req.user!.userId)
    .map((s) => s.creator_id);
  const creators = savedIds
    .map((id) => db.getFullCreator(id))
    .filter((c): c is NonNullable<typeof c> => c !== null);
  res.json({ savedCreatorIds: savedIds, creators });
});

app.post('/api/favorites/:creatorId', requireAuth, (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const creatorId = String(req.params.creatorId);
  const existingIdx = state.saved_creators.findIndex(
    (s) => s.brand_id === req.user!.userId && s.creator_id === creatorId
  );

  if (existingIdx !== -1) {
    state.saved_creators.splice(existingIdx, 1);
    db.save();
    res.json({ saved: false, creatorId });
    return;
  }

  state.saved_creators.push({
    id: `fav-${crypto.randomUUID().slice(0, 8)}`,
    brand_id: req.user!.userId,
    creator_id: creatorId,
    created_at: new Date().toISOString(),
  });
  db.save();
  res.json({ saved: true, creatorId });
});

// ============================================================================
// 6. AI CREATOR MATCHING & AI CAMPAIGN BRIEF ASSISTANT
// ============================================================================
app.post('/api/ai/match-creators', async (req: Request, res: Response) => {
  try {
    const creators = db.getAllFullCreators();
    const state = db.getState();

    // If campaignId is provided, load campaign criteria
    if (req.body.campaignId) {
      const campaign = state.campaigns.find((c) => c.id === req.body.campaignId);
      if (!campaign) {
        res.status(404).json({ error: 'Campaign not found for matching.' });
        return;
      }
      const matches = await matchCreatorsToCampaign(creators, {
        title: campaign.title,
        description: campaign.description,
        category: campaign.category,
        required_skills: campaign.required_skills,
        required_ai_tools: campaign.required_ai_tools,
        budget_min: campaign.budget_min,
        budget_max: campaign.budget_max,
        experience_level: campaign.experience_level,
      });
      res.json({ matches, campaign });
      return;
    }

    // Custom matching criteria
    const matches = await matchCreatorsToCampaign(creators, {
      title: sanitizeText(req.body.title, 200),
      description: sanitizeText(req.body.description, 1500),
      category: sanitizeText(req.body.category, 100) || 'AI Video Generation',
      required_skills: Array.isArray(req.body.required_skills) ? req.body.required_skills : [],
      required_ai_tools: Array.isArray(req.body.required_ai_tools) ? req.body.required_ai_tools : [],
      budget_min: Number(req.body.budget_min) || 300,
      budget_max: Number(req.body.budget_max) || 1500,
      experience_level: req.body.experience_level || 'any',
    });

    res.json({ matches });
  } catch (err) {
    console.error('Error in AI creator matching:', err);
    res.status(500).json({ error: 'Failed to compute creator matches.' });
  }
});

app.post('/api/ai/generate-brief', async (req: Request, res: Response) => {
  try {
    const prompt = sanitizeText(req.body.prompt, 1500);
    const categoryHint = sanitizeText(req.body.category, 100);
    if (!prompt || prompt.length < 8) {
      res.status(400).json({
        error: 'Please describe your campaign idea in at least a few words (e.g., "I need an AI video advertisement for my new skincare product").',
      });
      return;
    }
    const brief = await generateStructuredBrief(prompt, categoryHint || undefined);
    res.json({ brief });
  } catch (err) {
    console.error('Error generating AI brief:', err);
    res.status(500).json({ error: 'Failed to generate campaign brief.' });
  }
});

// ============================================================================
// 7. MESSAGING & COLLABORATION ROUTES
// ============================================================================
app.get('/api/conversations', requireAuth, (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const userId = req.user!.userId;
  const list = state.conversations
    .filter((c) => c.brand_id === userId || c.creator_id === userId)
    .map((c) => {
      const unread = state.messages.filter(
        (m) => m.conversation_id === c.id && m.sender_id !== userId && !m.read_status
      ).length;
      return { ...c, unread_count: unread };
    })
    .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());

  res.json({ conversations: list });
});

app.post('/api/conversations', requireAuth, (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const targetUserId = sanitizeText(req.body.participant_id, 60);
  const campaignId = sanitizeText(req.body.campaign_id, 60) || undefined;
  const initialMessage = sanitizeText(req.body.message, 2000);

  const currentUser = db.getProfileById(req.user!.userId);
  const targetUser = db.getProfileById(targetUserId);

  if (!currentUser || !targetUser) {
    res.status(404).json({ error: 'Recipient user not found.' });
    return;
  }

  const brandUser = currentUser.role === 'brand' ? currentUser : targetUser;
  const creatorUser = currentUser.role === 'creator' ? currentUser : targetUser;

  let conv = state.conversations.find(
    (c) => c.brand_id === brandUser.id && c.creator_id === creatorUser.id
  );

  if (!conv) {
    const camp = campaignId ? state.campaigns.find((c) => c.id === campaignId) : undefined;
    conv = {
      id: `conv-${crypto.randomUUID().slice(0, 8)}`,
      brand_id: brandUser.id,
      brand_name: brandUser.company_name || brandUser.name,
      brand_avatar: brandUser.avatar_url,
      creator_id: creatorUser.id,
      creator_name: creatorUser.name,
      creator_avatar: creatorUser.avatar_url,
      campaign_id: camp?.id,
      campaign_title: camp?.title,
      last_message: initialMessage || 'Conversation started',
      last_message_at: new Date().toISOString(),
      unread_count: initialMessage ? 1 : 0,
      created_at: new Date().toISOString(),
    };
    state.conversations.unshift(conv);
  }

  if (initialMessage) {
    const msg: Message = {
      id: `msg-${crypto.randomUUID().slice(0, 8)}`,
      conversation_id: conv.id,
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      sender_avatar: currentUser.avatar_url,
      body: initialMessage,
      read_status: false,
      created_at: new Date().toISOString(),
    };
    state.messages.push(msg);
    conv.last_message = initialMessage;
    conv.last_message_at = msg.created_at;

    createNotification(
      targetUser.id,
      'message',
      `New Message from ${currentUser.name}`,
      initialMessage.slice(0, 90),
      '/messages'
    );
  }

  db.save();
  res.status(201).json({ conversation: conv });
});

app.get('/api/conversations/:id/messages', requireAuth, (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const conv = state.conversations.find((c) => c.id === req.params.id);
  if (!conv) {
    res.status(404).json({ error: 'Conversation not found.' });
    return;
  }
  if (conv.brand_id !== req.user!.userId && conv.creator_id !== req.user!.userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Access denied to this private conversation.' });
    return;
  }

  // Mark incoming messages as read
  let updated = false;
  state.messages.forEach((m) => {
    if (m.conversation_id === conv.id && m.sender_id !== req.user!.userId && !m.read_status) {
      m.read_status = true;
      updated = true;
    }
  });
  if (updated) db.save();

  const msgs = state.messages
    .filter((m) => m.conversation_id === conv.id)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  res.json({ conversation: conv, messages: msgs });
});

app.post('/api/conversations/:id/messages', requireAuth, (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const conv = state.conversations.find((c) => c.id === req.params.id);
  if (!conv) {
    res.status(404).json({ error: 'Conversation not found.' });
    return;
  }
  if (conv.brand_id !== req.user!.userId && conv.creator_id !== req.user!.userId) {
    res.status(403).json({ error: 'You are not a participant in this conversation.' });
    return;
  }

  const body = sanitizeText(req.body.body, 2000);
  if (!body) {
    res.status(400).json({ error: 'Message cannot be empty.' });
    return;
  }

  const sender = db.getProfileById(req.user!.userId)!;
  const newMsg: Message = {
    id: `msg-${crypto.randomUUID().slice(0, 8)}`,
    conversation_id: conv.id,
    sender_id: sender.id,
    sender_name: sender.name,
    sender_avatar: sender.avatar_url,
    body,
    read_status: false,
    created_at: new Date().toISOString(),
  };

  state.messages.push(newMsg);
  conv.last_message = body;
  conv.last_message_at = newMsg.created_at;

  const recipientId = conv.brand_id === sender.id ? conv.creator_id : conv.brand_id;
  createNotification(
    recipientId,
    'message',
    `New Message from ${sender.name}`,
    body.slice(0, 90),
    '/messages'
  );

  db.save();
  res.status(201).json({ message: newMsg });
});

// ============================================================================
// 8. REVIEWS & RATINGS (Completed Campaigns Only + Duplicate Prevention)
// ============================================================================
app.post('/api/reviews', requireRole('brand', 'admin'), (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const campaignId = sanitizeText(req.body.campaign_id, 60);
  const creatorId = sanitizeText(req.body.creator_id, 60);
  const rating = Number(req.body.rating);
  const feedback = sanitizeText(req.body.feedback, 1500);

  if (!campaignId || !creatorId || !feedback) {
    res.status(400).json({ error: 'Campaign, creator, rating, and written feedback are required.' });
    return;
  }
  if (isNaN(rating) || rating < 1 || rating > 5) {
    res.status(400).json({ error: 'Rating must be between 1 and 5 stars.' });
    return;
  }

  const campaign = state.campaigns.find((c) => c.id === campaignId);
  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found.' });
    return;
  }
  if (req.user!.role !== 'admin' && campaign.brand_id !== req.user!.userId) {
    res.status(403).json({ error: 'Only the brand that commissioned this campaign can leave a review.' });
    return;
  }
  if (campaign.status !== 'completed') {
    res.status(400).json({ error: 'Reviews can only be submitted after a campaign is marked Completed.' });
    return;
  }

  const duplicate = state.reviews.find(
    (r) => r.campaign_id === campaignId && r.creator_id === creatorId && r.reviewer_id === req.user!.userId
  );
  if (duplicate) {
    res.status(409).json({ error: 'You have already submitted a review for this campaign.' });
    return;
  }

  const reviewer = db.getProfileById(req.user!.userId)!;
  const newReview: Review = {
    id: `rev-${crypto.randomUUID().slice(0, 8)}`,
    campaign_id: campaign.id,
    campaign_title: campaign.title,
    creator_id: creatorId,
    reviewer_id: reviewer.id,
    reviewer_name: reviewer.name,
    reviewer_company: reviewer.company_name || campaign.brand_name,
    reviewer_avatar: reviewer.avatar_url,
    rating: Math.round(rating),
    feedback,
    created_at: new Date().toISOString(),
  };

  state.reviews.unshift(newReview);

  // Recalculate creator average rating
  const creatorReviews = state.reviews.filter((r) => r.creator_id === creatorId);
  const cp = state.creator_profiles.find((c) => c.creator_id === creatorId);
  if (cp && creatorReviews.length > 0) {
    const sum = creatorReviews.reduce((acc, r) => acc + r.rating, 0);
    cp.rating = Number((sum / creatorReviews.length).toFixed(2));
    cp.review_count = creatorReviews.length;
  }

  createNotification(
    creatorId,
    'review',
    `New ${newReview.rating}★ Review from ${reviewer.company_name || reviewer.name}!`,
    `"${feedback.slice(0, 80)}..."`,
    `/creators/${creatorId}`
  );

  db.save();
  res.status(201).json({ review: newReview, newAverageRating: cp?.rating, reviewCount: cp?.review_count });
});

// ============================================================================
// 9. NOTIFICATIONS ROUTES
// ============================================================================
app.get('/api/notifications', requireAuth, (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const list = state.notifications.filter((n) => n.recipient_id === req.user!.userId);
  res.json({ notifications: list });
});

app.post('/api/notifications/read-all', requireAuth, (req: AuthRequest, res: Response) => {
  const state = db.getState();
  state.notifications.forEach((n) => {
    if (n.recipient_id === req.user!.userId) n.read_status = true;
  });
  db.save();
  res.json({ success: true });
});

// ============================================================================
// 10. ADMIN & MODERATION ROUTES
// ============================================================================
app.post('/api/reports', requireAuth, (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const reporter = db.getProfileById(req.user!.userId)!;
  const itemType = ['portfolio', 'campaign', 'review', 'user'].includes(req.body.item_type)
    ? req.body.item_type
    : 'portfolio';
  const itemId = sanitizeText(req.body.item_id, 60);
  const itemTitle = sanitizeText(req.body.item_title, 150) || 'Reported Content';
  const reason = sanitizeText(req.body.reason, 500);

  if (!itemId || !reason) {
    res.status(400).json({ error: 'Item ID and reason are required to submit a moderation report.' });
    return;
  }

  const report = {
    id: `rep-${crypto.randomUUID().slice(0, 8)}`,
    reporter_id: reporter.id,
    reporter_name: reporter.name,
    item_type: itemType,
    item_id: itemId,
    item_title: itemTitle,
    reason,
    status: 'pending' as const,
    created_at: new Date().toISOString(),
  };

  state.reported_items.unshift(report);
  db.save();
  res.status(201).json({ report });
});

app.get('/api/admin/overview', requireRole('admin'), (_req: AuthRequest, res: Response) => {
  const state = db.getState();
  res.json({
    users: state.profiles,
    campaigns: state.campaigns,
    reports: state.reported_items,
    reviews: state.reviews,
    stats: {
      totalUsers: state.profiles.length,
      totalCreators: state.creator_profiles.length,
      totalBrands: state.profiles.filter((p) => p.role === 'brand').length,
      totalCampaigns: state.campaigns.length,
      totalProposals: state.campaign_proposals.length,
      pendingReports: state.reported_items.filter((r) => r.status === 'pending').length,
    },
  });
});

app.patch('/api/admin/users/:id/verify', requireRole('admin'), (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const user = state.profiles.find((p) => p.id === req.params.id);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  user.verified = !user.verified;
  db.save();
  res.json({ user });
});

app.patch('/api/admin/reports/:id', requireRole('admin'), (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const report = state.reported_items.find((r) => r.id === req.params.id);
  if (!report) {
    res.status(404).json({ error: 'Report not found.' });
    return;
  }
  if (['resolved', 'dismissed'].includes(req.body.status)) {
    report.status = req.body.status;
    db.save();
  }
  res.json({ report });
});

// Serve static frontend in production if dist exists
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      next();
    }
  });
}

app.listen(PORT, () => {
  console.log(`🚀 CreatorConnect AI Server running on http://localhost:${PORT}`);
});
