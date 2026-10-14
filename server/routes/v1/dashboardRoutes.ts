import { Router, Response } from 'express';
import { requireRole, AuthRequest } from '../../middleware/auth.js';
import { dbService } from '../../services/dbService.js';
import { computeRecommendations } from '../../services/aiMatchingService.js';

const router = Router();

// GET /api/v1/dashboard/creator - Real database metrics for creator
router.get('/creator', requireRole('creator'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const profile = await dbService.getProfileById(userId);
    const creatorProfile = await dbService.getCreatorProfileByUserId(userId);
    const portfolio = await dbService.getPortfolioProjectsByUserId(userId);
    const proposals = await dbService.getProposalsByCreator(userId);
    const notifications = await dbService.getNotifications(userId);

    // Calculate real stats
    const acceptedProposals = proposals.filter((p) => p.status === 'accepted');
    const totalEarnings = acceptedProposals.reduce((sum, p) => sum + (p.price || 0), 0);
    const activeProposals = proposals.filter((p) => p.status === 'pending');

    // Recent available campaigns matching creator category or skills
    const allCampaigns = await dbService.listCampaigns({ status: 'open' });
    const recommendedCampaigns = allCampaigns.slice(0, 5);

    res.json({
      profile,
      creatorProfile,
      portfolioCount: portfolio.length,
      stats: {
        totalEarnings,
        activeProposalsCount: activeProposals.length,
        acceptedProposalsCount: acceptedProposals.length,
        profileViews: creatorProfile?.profile_views || 0,
        averageRating: creatorProfile?.rating || 5.0,
        reviewCount: creatorProfile?.review_count || 0,
        completedCampaigns: creatorProfile?.completed_campaigns || acceptedProposals.length,
      },
      proposals: proposals.slice(0, 10),
      recentNotifications: notifications.slice(0, 5),
      recommendedCampaigns,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/v1/dashboard/brand - Real database metrics for brand
router.get('/brand', requireRole('brand', 'admin'), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const profile = await dbService.getProfileById(userId);
    const campaigns = await dbService.listCampaigns({ brandId: userId });
    const notifications = await dbService.getNotifications(userId);

    // Get all proposals across all brand's campaigns
    const allProposals = await dbService.getProposalsForBrand(userId);
    const pendingProposals = allProposals.filter((p) => p.status === 'pending');
    const acceptedProposals = allProposals.filter((p) => p.status === 'accepted');

    const totalSpent = acceptedProposals.reduce((sum, p) => sum + (p.price || 0), 0);
    const activeCampaigns = campaigns.filter((c) => c.status === 'open' || c.status === 'in_progress');

    // Top recommended creators for brand's latest campaign (if any)
    let topCreators: any[] = [];
    const allFullCreators = dbService.getAllFullCreators();

    if (campaigns.length > 0) {
      const latestCampaign = campaigns[0];
      const matchResult = computeRecommendations(
        allFullCreators,
        {
          category: latestCampaign.category,
          budget_min: latestCampaign.budget_min,
          budget_max: latestCampaign.budget_max,
          required_skills: latestCampaign.required_skills,
          required_ai_tools: latestCampaign.required_ai_tools,
        },
        5
      );
      topCreators = matchResult.map((m) => m.creator);
    } else {
      topCreators = allFullCreators.slice(0, 5);
    }

    res.json({
      profile,
      stats: {
        totalCampaigns: campaigns.length,
        activeCampaigns: activeCampaigns.length,
        totalSpent,
        totalProposalsReceived: allProposals.length,
        pendingProposalsCount: pendingProposals.length,
        hiredCreatorsCount: acceptedProposals.length,
      },
      campaigns: campaigns.slice(0, 10),
      pendingProposals: pendingProposals.slice(0, 10),
      topCreators,
      recentNotifications: notifications.slice(0, 5),
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
