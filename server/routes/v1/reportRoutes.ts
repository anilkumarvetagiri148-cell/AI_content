import { Router, Response } from 'express';
import crypto from 'crypto';
import { db } from '../../db.js';
import { requireAuth, requireRole, AuthRequest } from '../../middleware/auth.js';

const router = Router();

// POST /api/v1/reports - Submit moderation report
router.post('/', requireAuth, (req: AuthRequest, res: Response) => {
  const state = db.getState() as any;
  if (!state.reported_items) state.reported_items = [];

  const itemType = String(req.body.item_type || 'creator');
  const itemId = String(req.body.item_id || '');
  const itemTitle = String(req.body.item_title || '');
  const reason = String(req.body.reason || '').trim();

  if (!itemId || !reason) {
    res.status(400).json({ error: 'Item ID and reason are required.' });
    return;
  }

  const report = {
    id: `rep-${crypto.randomUUID().slice(0, 8)}`,
    reporter_id: req.user!.userId,
    reporter_name: req.user!.email,
    item_type: itemType,
    item_id: itemId,
    item_title: itemTitle,
    reason,
    status: 'pending' as const,
    created_at: new Date().toISOString(),
  };

  state.reported_items.unshift(report);
  db.save();
  res.status(201).json({ report });
});

// GET /api/v1/reports - List reports (Admin)
router.get('/', requireRole('admin'), (_req: AuthRequest, res: Response) => {
  const state = db.getState() as any;
  res.json({ reports: state.reported_items || [] });
});

// PATCH /api/v1/reports/:id - Resolve/Dismiss report (Admin)
router.patch('/:id', requireRole('admin'), (req: AuthRequest, res: Response) => {
  const state = db.getState() as any;
  if (!state.reported_items) state.reported_items = [];
  const report = state.reported_items.find((r: any) => r.id === req.params.id);
  if (!report) {
    res.status(404).json({ error: 'Report not found.' });
    return;
  }
  if (['resolved', 'dismissed'].includes(req.body.status)) {
    report.status = req.body.status;
    db.save();
  }
  res.json({ report });
});

export default router;
