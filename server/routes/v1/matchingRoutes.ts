import { Router, Request, Response } from 'express';
import { db } from '../../db.js';
import { dbService } from '../../services/dbService.js';
import { computeRecommendations } from '../../services/aiMatchingService.js';
import { generateStructuredBrief } from '../../aiEngine.js';
import { validateBody } from '../../middleware/validation.js';
import { matchingRecommendationsSchema, generateBriefSchema } from '../../validation/schemas.js';

const router = Router();

// POST /api/v1/matching/recommendations
router.post('/recommendations', validateBody(matchingRecommendationsSchema), async (req: Request, res: Response) => {
  try {
    const creators = db.getAllFullCreators();
    const { campaignId, category, required_skills, required_ai_tools, budget_min, budget_max, experience_level, availability, limit } = req.body;

    let targetCriteria = {
      category,
      required_skills,
      required_ai_tools,
      budget_min,
      budget_max,
      experience_level,
      availability,
    };

    let associatedCampaign = null;
    if (campaignId) {
      associatedCampaign = dbService.getCampaignById(campaignId);
      if (associatedCampaign) {
        targetCriteria = {
          category: associatedCampaign.category,
          required_skills: associatedCampaign.required_skills,
          required_ai_tools: associatedCampaign.required_ai_tools,
          budget_min: associatedCampaign.budget_min,
          budget_max: associatedCampaign.budget_max,
          experience_level: associatedCampaign.experience_level,
          availability: 'available',
        };
      }
    }

    const recommendations = computeRecommendations(creators, targetCriteria, limit || 12);
    res.json({
      recommendations,
      totalMatched: recommendations.length,
      criteria: targetCriteria,
      campaign: associatedCampaign,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to compute recommendations' });
  }
});

// POST /api/v1/matching/generate-brief
router.post('/generate-brief', validateBody(generateBriefSchema), async (req: Request, res: Response) => {
  try {
    const { prompt, category } = req.body;
    const brief = await generateStructuredBrief(prompt, category);
    res.json({ brief });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to generate brief' });
  }
});

export default router;
