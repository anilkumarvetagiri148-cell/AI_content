export type UserRole = 'creator' | 'brand' | 'admin';

export type AvailabilityStatus = 'available' | 'busy' | 'unavailable';

export type ExperienceLevel = 'junior' | 'intermediate' | 'senior' | 'expert';

export type CampaignStatus = 'draft' | 'open' | 'in_progress' | 'completed';

export type ProposalStatus = 'pending' | 'accepted' | 'rejected';

export type InvitationStatus = 'pending' | 'accepted' | 'declined';

export type ContentFormat = 'video' | 'image' | 'audio' | 'interactive';

export interface ServicePackage {
  name: 'Starter' | 'Pro' | 'Enterprise' | string;
  price: number; // Stored in INR (₹)
  deliveryDays: number;
  revisions: number;
  description: string;
  deliverables: string[];
}

export interface SocialLinks {
  portfolio?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
  behance?: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url: string;
  bio: string;
  location: string;
  languages: string[];
  company_name?: string;
  website?: string;
  social_links: SocialLinks;
  verified: boolean;
  created_at: string;
}

export interface CreatorProfileData {
  creator_id: string;
  title: string;
  industry_category: string;
  specialization: string;
  secondary_categories: string[];
  skills: string[];
  ai_tools: string[];
  content_formats?: ContentFormat[];
  starting_price: number; // In INR (₹)
  packages: ServicePackage[];
  availability: AvailabilityStatus;
  experience_years: number;
  experience_level: ExperienceLevel;
  rating: number;
  review_count: number;
  completed_campaigns: number;
  profile_views: number;
  featured: boolean;
  response_time: string;
}

export interface PortfolioProject {
  id: string;
  creator_id: string;
  creator_name?: string;
  creator_avatar?: string;
  title: string;
  description: string;
  category: string;
  role: string;
  deliverables: string[];
  media_urls: string[];
  thumbnail_url: string;
  media_type: 'image' | 'video' | 'audio';
  ai_tools_used: string[];
  tags: string[];
  client_name?: string;
  views: number;
  likes: number;
  created_at: string;
}

export interface FullCreator extends Profile {
  creator_profile: CreatorProfileData;
  portfolio: PortfolioProject[];
  reviews: Review[];
}

export interface Campaign {
  id: string;
  brand_id: string;
  brand_name: string;
  brand_logo: string;
  title: string;
  description: string;
  category: string;
  content_type: string;
  goals: string;
  target_audience: string;
  deliverables: string[];
  budget_min: number;
  budget_max: number;
  deadline: string;
  required_skills: string[];
  required_ai_tools: string[];
  experience_level: 'any' | ExperienceLevel;
  reference_urls: string[];
  status: CampaignStatus;
  hired_creator_id?: string;
  proposal_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignProposal {
  id: string;
  campaign_id: string;
  campaign_title?: string;
  brand_name?: string;
  creator_id: string;
  creator_name?: string;
  creator_avatar?: string;
  creator_title?: string;
  creator_rating?: number;
  pitch: string;
  price: number;
  timeline: string;
  portfolio_ids: string[];
  status: ProposalStatus;
  created_at: string;
}

export interface CampaignInvitation {
  id: string;
  campaign_id: string;
  campaign_title: string;
  brand_id: string;
  brand_name: string;
  brand_logo: string;
  creator_id: string;
  creator_name: string;
  creator_avatar: string;
  message: string;
  status: InvitationStatus;
  created_at: string;
}

export interface SavedCreator {
  id: string;
  brand_id: string;
  creator_id: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  brand_id: string;
  brand_name: string;
  brand_avatar: string;
  creator_id: string;
  creator_name: string;
  creator_avatar: string;
  campaign_id?: string;
  campaign_title?: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string;
  body: string;
  read_status: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  campaign_id: string;
  campaign_title: string;
  creator_id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_company?: string;
  reviewer_avatar: string;
  rating: number;
  feedback: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  recipient_id: string;
  type: 'proposal' | 'invitation' | 'message' | 'campaign' | 'review' | 'system';
  title: string;
  message: string;
  link: string;
  read_status: boolean;
  created_at: string;
}

export interface ReportedItem {
  id: string;
  reporter_id: string;
  reporter_name: string;
  item_type: 'portfolio' | 'campaign' | 'review' | 'user';
  item_id: string;
  item_title: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface MatchFactorBreakdown {
  categoryScore: number;     // max 25
  skillsToolsScore: number;  // max 25
  portfolioScore: number;    // max 15
  budgetScore: number;       // max 15
  availabilityScore: number; // max 10
  reputationScore: number;   // max 10
}

export interface CreatorMatchResult {
  creator: FullCreator;
  matchScore: number; // 0-100
  summaryReason: string;
  reasons: string[];
  breakdown: MatchFactorBreakdown;
  relevantProjects: PortfolioProject[];
  budgetCompatibility: 'Ideal Fit' | 'Within Range' | 'Slightly Above Range' | 'Premium Option';
  engineMode: 'ai_enhanced' | 'deterministic_weighted';
}

export interface GeneratedBrief {
  title: string;
  description: string;
  category: string;
  content_type: string;
  goals: string;
  target_audience: string;
  deliverables: string[];
  required_skills: string[];
  required_ai_tools: string[];
  budget_min: number;
  budget_max: number;
  suggested_timeline_days: number;
  deadline: string;
  experience_level: ExperienceLevel;
  engineMode: 'ai_api' | 'intelligent_template';
}

export const DISCOVER_CATEGORIES = [
  'All Creators',
  'Finance & Investing',
  'Education & E-Learning',
  'Business & Entrepreneurship',
  'Technology & AI',
  'Gaming & Esports',
  'Health & Fitness',
  'Food & Cooking',
  'Travel & Tourism',
  'Fashion & Beauty',
  'Digital Marketing',
  'Social Media Influencers',
  'Entertainment & Comedy',
  'Science & Research',
  'Real Estate',
  'E-commerce & Product Advertising',
  'Photography & Videography',
  'Animation & Motion Graphics',
  'Music & Audio',
  'Lifestyle & Personal Development',
  'News & Media',
  'Automotive',
  'Agriculture & Farming',
  'Environment & Sustainability',
] as const;

export const CREATOR_CATEGORIES = DISCOVER_CATEGORIES.filter(
  (c) => c !== 'All Creators'
) as unknown as readonly string[];

export const AI_TOOLS_LIST = [
  'Midjourney v6',
  'Runway Gen-3 Alpha',
  'OpenAI Sora',
  'Stable Diffusion XL',
  'Flux.1 Pro',
  'ComfyUI',
  'ElevenLabs',
  'Kling AI',
  'Luma Dream Machine',
  'HeyGen',
  'Pika Labs',
  'Adobe Firefly',
  'Suno AI',
  'Magnific AI',
  'ControlNet / LoRA',
] as const;

export const SKILLS_FILTER_LIST = [
  'Cinematic AI Video',
  'Custom LoRA Training',
  'Market Data Visualization',
  '3D Motion Graphics',
  'Virtual Brand Ambassadors',
  'Multilingual Voice Cloning',
  'Photorealistic Product Renders',
  'Interactive Course Avatars',
  'Direct-Response Ad Hooks',
  'Architectural AI Walkthroughs',
  'Editorial Lookbooks',
  'Sonic Branding & AI Music',
] as const;

export function formatINR(amount: number): string {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}
