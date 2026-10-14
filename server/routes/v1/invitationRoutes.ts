import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../../db.js';
import { requireAuth, requireRole, AuthRequest } from '../../middleware/auth.js';
import { CampaignInvitation } from '../../../src/types/index.js';

const router = Router();

// GET /api/v1/invitations - List invitations for authenticated user
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const list =
    req.user!.role === 'creator'
      ? state.campaign_invitations.filter((i) => i.creator_id === req.user!.userId)
      : state.campaign_invitations.filter((i) => i.brand_id === req.user!.userId);
  res.json({ invitations: list });
});

// POST /api/v1/invitations - Invite a creator to a campaign
router.post('/', requireRole('brand', 'admin'), (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const campaignId = String(req.body.campaign_id || '').trim();
  const creatorId = String(req.body.creator_id || '').trim();
  const message = String(req.body.message || '').trim() || 'We would love to invite you to submit a proposal for our campaign!';

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
  state.notifications.unshift({
    id: `notif-${crypto.randomUUID().slice(0, 8)}`,
    recipient_id: creator.id,
    type: 'invitation',
    title: `Campaign Invitation from ${invite.brand_name}`,
    message: `You've been invited to apply to "${campaign.title}". Check details and submit your proposal!`,
    link: `/campaigns/${campaign.id}`,
    read_status: false,
    created_at: new Date().toISOString(),
  });

  db.save();
  res.status(201).json({ invitation: invite });
});

// PATCH /api/v1/invitations/:id - Accept/Decline invitation
router.patch('/:id', requireRole('creator'), (req: AuthRequest, res: Response) => {
  const state = db.getState();
  const invite = state.campaign_invitations.find((i) => i.id === req.params.id);
  if (!invite) {
    res.status(404).json({ error: 'Invitation not found.' });
    return;
  }
  if (invite.creator_id !== req.user!.userId) {
    res.status(403).json({ error: 'Unauthorized to respond to this invitation.' });
    return;
  }

  const { status } = req.body;
  if (!['accepted', 'declined'].includes(status)) {
    res.status(400).json({ error: 'Invalid invitation status.' });
    return;
  }

  invite.status = status;
  db.save();
  res.json({ invitation: invite });
});

export default router;
