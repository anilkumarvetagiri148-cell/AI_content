import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../../db.js';
import { dbService } from '../../services/dbService.js';
import { optionalAuth, requireRole, AuthRequest } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validation.js';
import { createCampaignSchema, updateCampaignSchema, createProposalSchema } from '../../validation/schemas.js';
import { Campaign, CampaignStatus, CampaignProposal } from '../../../src/types/index.js';

const router = Router();

// GET /api/v1/campaigns
router.get('/', optionalAuth, (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const search = String(req.query.search || '').toLowerCase().trim();
  const category = String(req.query.category || '').trim();
  const status = String(req.query.status || '').trim();
  const minBudget = req.query.minBudget ? Number(req.query.minBudget) : undefined;
  const brandId = String(req.query.brandId || '').trim();

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
  if (category && category !== 'All' && category !== 'All Categories') {
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

  res.json({ campaigns: enriched, total: enriched.length });
});

// GET /api/v1/campaigns/:id
router.get('/:id', optionalAuth, (req: AuthRequest, res: Response) => {
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
    res.status(403).json({ error: 'This draft campaign is private to the owning brand.' });
    return;
  }

  let proposals: any[] = [];
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

// POST /api/v1/campaigns (Brand or Admin only)
router.post('/', requireRole('brand', 'admin'), validateBody(createCampaignSchema), (req: AuthRequest, res: Response) => {
  const brandProfile = db.getProfileById(req.user!.userId);
  if (!brandProfile) {
    res.status(404).json({ error: 'Brand profile not found.' });
    return;
  }

  const now = new Date().toISOString();
  const newCampaign: Campaign = {
    id: `camp-${crypto.randomUUID().slice(0, 8)}`,
    brand_id: brandProfile.id,
    brand_name: brandProfile.company_name || brandProfile.name,
    brand_logo: brandProfile.avatar_url,
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    content_type: req.body.content_type || 'AI Video Commercial + Stills',
    goals: req.body.goals || '',
    target_audience: req.body.target_audience || '',
    deliverables: req.body.deliverables,
    budget_min: req.body.budget_min,
    budget_max: req.body.budget_max,
    deadline: req.body.deadline,
    required_skills: req.body.required_skills || [],
    required_ai_tools: req.body.required_ai_tools || [],
    experience_level: req.body.experience_level || 'intermediate',
    reference_urls: req.body.reference_urls || [],
    status: req.body.status || 'open',
    created_at: now,
    updated_at: now,
  };

  dbService.createCampaign(newCampaign);
  res.status(201).json({ campaign: newCampaign });
});

// POST /api/v1/campaigns/:id/proposals (Creator only) - Submit proposal to campaign
router.post('/:id/proposals', requireRole('creator'), validateBody(createProposalSchema), (req: AuthRequest, res: Response) => {
  const campaignId = String(req.params.id);
  const campaign = dbService.getCampaignById(campaignId);
  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found.' });
    return;
  }
  if (campaign.status !== 'open') {
    res.status(400).json({ error: 'Proposals can only be submitted to Open campaigns.' });
    return;
  }

  // Prevent duplicate proposal for same campaign and creator
  const existing = dbService.getProposals({ campaignId, creatorId: req.user!.userId });
  if (existing.length > 0) {
    res.status(409).json({ error: 'You have already submitted a proposal for this campaign.' });
    return;
  }

  const creator = db.getFullCreator(req.user!.userId);
  const newProposal: CampaignProposal = {
    id: `prop-${crypto.randomUUID().slice(0, 8)}`,
    campaign_id: campaign.id,
    creator_id: req.user!.userId,
    pitch: req.body.pitch,
    price: req.body.price,
    timeline: req.body.timeline,
    portfolio_ids: req.body.portfolio_ids || [],
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  dbService.createProposal(newProposal);

  dbService.createNotification({
    id: `notif-${crypto.randomUUID().slice(0, 8)}`,
    recipient_id: campaign.brand_id,
    type: 'proposal',
    title: `New Proposal from ${creator?.name || 'AI Creator'}`,
    message: `${creator?.name || 'A creator'} proposed ₹${newProposal.price.toLocaleString('en-IN')} (${newProposal.timeline}) for "${campaign.title}".`,
    link: '/dashboard/brand',
    read_status: false,
    created_at: new Date().toISOString(),
  });

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

// PUT /api/v1/campaigns/:id (Brand owner or Admin only)
router.put('/:id', requireRole('brand', 'admin'), validateBody(updateCampaignSchema), (req: AuthRequest, res: Response) => {
  const campaign = dbService.getCampaignById(String(req.params.id));
  if (!campaign) {
    res.status(404).json({ error: 'Campaign not found.' });
    return;
  }
  if (req.user!.role !== 'admin' && campaign.brand_id !== req.user!.userId) {
    res.status(403).json({ error: 'You do not have permission to modify another brand’s campaign.' });
    return;
  }

  const prevStatus = campaign.status;
  const updated = dbService.updateCampaign(campaign.id, {
    ...req.body,
    updated_at: new Date().toISOString(),
  });

  if (prevStatus !== 'completed' && updated?.status === 'completed' && updated?.hired_creator_id) {
    const state = db.getState();
    const cp = state.creator_profiles.find((c) => c.creator_id === updated.hired_creator_id);
    if (cp) cp.completed_campaigns += 1;
    dbService.createNotification({
      id: `notif-${crypto.randomUUID().slice(0, 8)}`,
      recipient_id: updated.hired_creator_id,
      type: 'campaign',
      title: 'Campaign Marked Completed! 🏆',
      message: `"${updated.title}" has been marked Completed by ${updated.brand_name}.`,
      link: '/dashboard/creator',
      read_status: false,
      created_at: new Date().toISOString(),
    });
  }

  res.json({ campaign: updated });
});

export default router;
