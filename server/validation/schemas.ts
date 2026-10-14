import { z } from 'zod';

export const signupSchema = z.object({
  email: z.string().email('Please provide a valid email address').max(120),
  password: z.string().min(6, 'Password must be at least 6 characters long').max(128),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  role: z.enum(['creator', 'brand', 'admin']).default('creator'),
  company_name: z.string().max(120).optional(),
  specialization: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters long').optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  bio: z.string().max(2000).optional(),
  location: z.string().max(100).optional(),
  company_name: z.string().max(120).optional(),
  website: z.string().max(300).optional(),
  avatar_url: z.string().max(800).optional(),
  languages: z.array(z.string().max(50)).optional(),
  social_links: z.record(z.string(), z.string()).optional(),
  
  // Creator specific fields
  title: z.string().max(150).optional(),
  specialization: z.string().max(100).optional(),
  secondary_categories: z.array(z.string().max(100)).optional(),
  skills: z.array(z.string().max(100)).optional(),
  ai_tools: z.array(z.string().max(100)).optional(),
  starting_price: z.number().min(0).optional(),
  availability: z.enum(['available', 'busy', 'unavailable']).optional(),
  experience_years: z.number().min(0).optional(),
  experience_level: z.enum(['junior', 'intermediate', 'senior', 'expert']).optional(),
  packages: z.array(z.any()).optional(),
});

export const createPortfolioSchema = z.object({
  title: z.string().min(3, 'Title is required').max(180),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2500),
  category: z.string().min(2).max(100),
  role: z.string().max(100).default('Lead AI Creator'),
  thumbnail_url: z.string().min(5, 'Cover thumbnail URL is required').max(1000),
  media_urls: z.array(z.string().max(1000)).default([]),
  media_type: z.enum(['image', 'video', 'audio', 'interactive']).default('image'),
  deliverables: z.array(z.string().max(150)).default([]),
  ai_tools_used: z.array(z.string().max(80)).default([]),
  tags: z.array(z.string().max(60)).default([]),
  client_name: z.string().max(120).optional(),
});

export const baseCampaignSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(15, 'Description must be at least 15 characters').max(4000),
  category: z.string().min(2).max(100),
  content_type: z.string().max(120).default('AI Video & Stills'),
  goals: z.string().max(1500).default(''),
  target_audience: z.string().max(800).default(''),
  deliverables: z.array(z.string().max(200)).default(['4K Final Master Deliverables']),
  budget_min: z.number().min(0, 'Minimum budget cannot be negative'),
  budget_max: z.number().min(0, 'Maximum budget cannot be negative'),
  deadline: z.string().min(4, 'Valid deadline is required'),
  required_skills: z.array(z.string().max(80)).default([]),
  required_ai_tools: z.array(z.string().max(80)).default([]),
  experience_level: z.enum(['any', 'junior', 'intermediate', 'senior', 'expert']).default('intermediate'),
  reference_urls: z.array(z.string().max(1000)).default([]),
  status: z.enum(['draft', 'open', 'in_progress', 'completed', 'cancelled']).default('open'),
});

export const createCampaignSchema = baseCampaignSchema.refine((data) => data.budget_max >= data.budget_min, {
  message: 'Maximum budget must be greater than or equal to minimum budget',
  path: ['budget_max'],
});

export const updateCampaignSchema = baseCampaignSchema.partial();

export const createProposalSchema = z.object({
  pitch: z.string().min(15, 'Proposal pitch must be at least 15 characters').max(3000),
  price: z.number().min(1, 'Proposed price must be greater than 0'),
  timeline: z.string().min(2, 'Timeline is required (e.g., "5 days")').max(80),
  portfolio_ids: z.array(z.string()).default([]),
});

export const updateProposalStatusSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
});

export const createReviewSchema = z.object({
  campaign_id: z.string().min(1, 'Campaign ID is required'),
  creator_id: z.string().min(1, 'Creator ID is required'),
  rating: z.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  feedback: z.string().min(5, 'Review feedback must be at least 5 characters').max(2000).optional(),
  review_text: z.string().min(5).max(2000).optional(),
}).refine((data) => Boolean(data.feedback || data.review_text), {
  message: 'Review feedback is required',
  path: ['feedback'],
});

export const createConversationSchema = z.object({
  participant_id: z.string().min(1, 'Target participant ID is required'),
  campaign_id: z.string().optional(),
  message: z.string().max(3000).optional(),
});

export const sendMessageSchema = z.object({
  body: z.string().min(1, 'Message body cannot be empty').max(3000),
  attachment_urls: z.array(z.string().max(1000)).optional(),
});

export const matchingRecommendationsSchema = z.object({
  campaignId: z.string().optional(),
  category: z.string().max(100).optional(),
  required_skills: z.array(z.string()).optional(),
  required_ai_tools: z.array(z.string()).optional(),
  budget_min: z.number().optional(),
  budget_max: z.number().optional(),
  experience_level: z.string().optional(),
  availability: z.string().optional(),
  limit: z.number().int().min(1).max(50).default(12),
});

export const generateBriefSchema = z.object({
  prompt: z.string().min(5, 'Please describe your campaign concept').max(2500),
  category: z.string().max(100).optional(),
});
