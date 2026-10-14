import { Router } from 'express';
import { dbService } from '../services/dbService.js';
import { env } from '../config/env.js';

import authRoutes from './v1/authRoutes.js';
import creatorRoutes from './v1/creatorRoutes.js';
import portfolioRoutes from './v1/portfolioRoutes.js';
import campaignRoutes from './v1/campaignRoutes.js';
import proposalRoutes from './v1/proposalRoutes.js';
import invitationRoutes from './v1/invitationRoutes.js';
import favoriteRoutes from './v1/favoriteRoutes.js';
import messageRoutes from './v1/messageRoutes.js';
import reviewRoutes from './v1/reviewRoutes.js';
import matchingRoutes from './v1/matchingRoutes.js';
import notificationRoutes from './v1/notificationRoutes.js';
import dashboardRoutes from './v1/dashboardRoutes.js';
import adminRoutes from './v1/adminRoutes.js';
import reportRoutes from './v1/reportRoutes.js';
import uploadRoutes from './v1/uploadRoutes.js';

const apiRouter = Router();

// Health check endpoint
apiRouter.get('/health', (_req, res) => {
  const stats = dbService.getAdminStats();
  res.json({
    status: 'ok',
    platform: 'CreatorConnect AI',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    counts: {
      creators: stats.usersByRole.creator,
      brands: stats.usersByRole.brand,
      campaigns: stats.totalCampaigns,
      proposals: stats.totalProposals,
      portfolios: stats.totalPortfolios,
      reviews: stats.totalReviews,
    },
    services: {
      aiMatchingEngine: true,
      supabaseConfigured: Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY),
      aiProviderConfigured: Boolean(env.GEMINI_API_KEY || env.OPENAI_API_KEY),
    },
  });
});

// Mount modular sub-routers
apiRouter.use('/auth', authRoutes);
apiRouter.use('/creators', creatorRoutes);
apiRouter.use('/portfolio', portfolioRoutes);
apiRouter.use('/campaigns', campaignRoutes);
apiRouter.use('/proposals', proposalRoutes);
apiRouter.use('/invitations', invitationRoutes);
apiRouter.use('/favorites', favoriteRoutes);
apiRouter.use('/conversations', messageRoutes);
apiRouter.use('/reviews', reviewRoutes);
apiRouter.use('/matching', matchingRoutes);
apiRouter.use('/ai', matchingRoutes); // Compatibility alias
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/reports', reportRoutes);
apiRouter.use('/upload', uploadRoutes);

export default apiRouter;
