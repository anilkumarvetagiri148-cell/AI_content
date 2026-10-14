import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../../db.js';
import { dbService } from '../../services/dbService.js';
import { requireAuth, requireRole, AuthRequest } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validation.js';
import { createProposalSchema, updateProposalStatusSchema } from '../../validation/schemas.js';
import { CampaignProposal } from '../../../src/types/index.js';

const router = Router();

// GET /api/v1/proposals
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
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

  res.json({ proposals: enriched, total: enriched.length });
});

// POST /api/v1/proposals/campaign/:id (or /api/v1/campaigns/:id/proposals)
router.post('/campaign/:id', requireRole('creator'), validateBody(createProposalSchema), (req: AuthRequest, res: Response) => {
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

// PATCH /api/v1/proposals/:id/status (Brand owner or admin)
router.patch('/:id/status', requireRole('brand', 'admin'), validateBody(updateProposalStatusSchema), (req: AuthRequest, res: Response) => {
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

  proposal.status = req.body.status;

  if (req.body.status === 'accepted') {
    campaign.status = 'in_progress';
    campaign.hired_creator_id = proposal.creator_id;
    campaign.updated_at = new Date().toISOString();

    dbService.createNotification({
      id: `notif-${crypto.randomUUID().slice(0, 8)}`,
      recipient_id: proposal.creator_id,
      type: 'proposal',
      title: 'Proposal Accepted! 🎉',
      message: `${campaign.brand_name} accepted your proposal for "${campaign.title}"!`,
      link: '/dashboard/creator',
      read_status: false,
      created_at: new Date().toISOString(),
    });

    // Ensure conversation exists
    let conv = state.conversations.find(
      (c) => c.brand_id === campaign.brand_id && c.creator_id === proposal.creator_id
    );
    if (!conv) {
      const brandProfile = db.getProfileById(campaign.brand_id);
      const creatorProfile = db.getProfileById(proposal.creator_id);
      conv = {
        id: `conv-${crypto.randomUUID().slice(0, 8)}`,
        brand_id: campaign.brand_id,
        brand_name: brandProfile?.company_name || brandProfile?.name || campaign.brand_name,
        brand_avatar: brandProfile?.avatar_url || campaign.brand_logo,
        creator_id: proposal.creator_id,
        creator_name: creatorProfile?.name || 'Creator',
        creator_avatar: creatorProfile?.avatar_url || '',
        campaign_id: campaign.id,
        campaign_title: campaign.title,
        last_message: `Hi ${creatorProfile?.name}! We accepted your proposal for "${campaign.title}". Let's kick off collaboration!`,
        last_message_at: new Date().toISOString(),
        unread_count: 1,
        created_at: new Date().toISOString(),
      };
      state.conversations.unshift(conv);
    }
  } else {
    dbService.createNotification({
      id: `notif-${crypto.randomUUID().slice(0, 8)}`,
      recipient_id: proposal.creator_id,
      type: 'proposal',
      title: 'Proposal Status Update',
      message: `Your proposal for "${campaign.title}" was not selected this time.`,
      link: '/dashboard/creator',
      read_status: false,
      created_at: new Date().toISOString(),
    });
  }

  db.save();
  res.json({ proposal, campaign });
});

export default router;
