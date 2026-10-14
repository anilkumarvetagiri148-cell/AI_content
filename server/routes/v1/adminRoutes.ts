import { Router, Response } from 'express';
import { requireRole, AuthRequest } from '../../middleware/auth.js';
import { dbService } from '../../services/dbService.js';
import { env } from '../../config/env.js';

const router = Router();

// GET /api/v1/admin/overview - Platform analytics & administrative KPIs
router.get('/overview', requireRole('admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const stats = await dbService.getAdminStats();
    res.json({
      status: 'ok',
      platform: 'CreatorConnect AI',
      environment: env.NODE_ENV,
      stats,
      system: {
        aiConfigured: Boolean(env.GEMINI_API_KEY || env.OPENAI_API_KEY),
        supabaseConfigured: Boolean(env.SUPABASE_URL && env.SUPABASE_ANON_KEY),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// PATCH /api/v1/admin/users/:id/verify - Verify creator/brand
router.patch('/users/:id/verify', requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const targetUserId = String(req.params.id);
    const { verified = true } = req.body;
    const updated = await dbService.setUserVerification(targetUserId, Boolean(verified));
    if (!updated) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({
      success: true,
      message: `User ${targetUserId} verified status set to ${verified}`,
      user: updated,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// GET /api/v1/admin/reports - Get moderation reports
router.get('/reports', requireRole('admin'), async (_req: AuthRequest, res: Response) => {
  try {
    const reports = await dbService.getReports();
    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// PATCH /api/v1/admin/reports/:id - Resolve or dismiss a report
router.patch('/reports/:id', requireRole('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const reportId = String(req.params.id);
    const { status = 'resolved', resolution_notes } = req.body;
    const updated = await dbService.updateReportStatus(reportId, status, resolution_notes);
    if (!updated) {
      res.status(404).json({ error: 'Report not found' });
      return;
    }
    res.json({
      success: true,
      message: `Report ${reportId} status updated to ${status}`,
      report: updated,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
