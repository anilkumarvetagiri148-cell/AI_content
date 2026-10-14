import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../../db.js';
import { dbService } from '../../services/dbService.js';
import { requireRole, AuthRequest } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validation.js';
import { createReviewSchema } from '../../validation/schemas.js';
import { Review } from '../../../src/types/index.js';

const router = Router();

// POST /api/v1/reviews (Brand/Admin only, on completed campaigns)
router.post('/', requireRole('brand', 'admin'), validateBody(createReviewSchema), (req: AuthRequest, res: Response) => {
  const { campaign_id, creator_id, rating } = req.body;
  const feedback = req.body.feedback || req.body.review_text || '';
  const state = db.getState();

  const campaign = dbService.getCampaignById(campaign_id);
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
    (r) => r.campaign_id === campaign_id && r.creator_id === creator_id && r.reviewer_id === req.user!.userId
  );
  if (duplicate) {
    res.status(409).json({ error: 'You have already submitted a review for this campaign.' });
    return;
  }

  const reviewer = dbService.getProfileById(req.user!.userId)!;
  const newReview: Review = {
    id: `rev-${crypto.randomUUID().slice(0, 8)}`,
    campaign_id,
    campaign_title: campaign.title,
    creator_id,
    reviewer_id: reviewer.id,
    reviewer_name: reviewer.name,
    reviewer_company: reviewer.company_name || campaign.brand_name,
    reviewer_avatar: reviewer.avatar_url,
    rating,
    feedback,
    created_at: new Date().toISOString(),
  };

  dbService.createReview(newReview);

  dbService.createNotification({
    id: `notif-${crypto.randomUUID().slice(0, 8)}`,
    recipient_id: creator_id,
    type: 'review',
    title: `New ${rating}★ Verified Review from ${reviewer.company_name || reviewer.name}!`,
    message: `"${feedback.slice(0, 80)}..."`,
    link: `/creators/${creator_id}`,
    read_status: false,
    created_at: new Date().toISOString(),
  });

  const fullCreator = db.getFullCreator(creator_id);
  res.status(201).json({
    review: newReview,
    averageRating: fullCreator?.creator_profile.rating,
    reviewCount: fullCreator?.creator_profile.review_count,
  });
});

export default router;
