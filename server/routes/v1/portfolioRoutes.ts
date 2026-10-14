import { Router, Response } from 'express';
import crypto from 'crypto';
import { requireRole, AuthRequest } from '../../middleware/auth.js';
import { validateBody } from '../../middleware/validation.js';
import { createPortfolioSchema } from '../../validation/schemas.js';
import { dbService } from '../../services/dbService.js';
import { PortfolioProject } from '../../../src/types/index.js';

const router = Router();

// POST /api/v1/portfolio (Creator only)
router.post('/', requireRole('creator'), validateBody(createPortfolioSchema), (req: AuthRequest, res: Response) => {
  const { title, description, category, role, thumbnail_url, media_urls, media_type, deliverables, ai_tools_used, tags, client_name } = req.body;

  const newProject: PortfolioProject = {
    id: `port-${crypto.randomUUID().slice(0, 8)}`,
    creator_id: req.user!.userId,
    title,
    description,
    category,
    role: role || 'Lead AI Creator',
    thumbnail_url,
    media_urls: media_urls && media_urls.length > 0 ? media_urls : [thumbnail_url],
    media_type: media_type || 'image',
    deliverables: deliverables || ['4K Master Assets'],
    ai_tools_used: ai_tools_used || ['Midjourney v6', 'Flux.1 Pro'],
    tags: tags || ['AI Creative'],
    client_name: client_name || undefined,
    views: 1,
    likes: 1,
    created_at: new Date().toISOString(),
  };

  dbService.addPortfolioProject(newProject);
  res.status(201).json({ project: newProject });
});

// DELETE /api/v1/portfolio/:id (Creator owner or admin)
router.delete('/:id', requireRole('creator', 'admin'), (req: AuthRequest, res: Response) => {
  try {
    const success = dbService.deletePortfolioProject(
      String(req.params.id),
      req.user!.userId,
      req.user!.role === 'admin'
    );
    if (!success) {
      res.status(404).json({ error: 'Portfolio project not found.' });
      return;
    }
    res.json({ success: true, message: 'Portfolio project deleted successfully' });
  } catch (err: any) {
    res.status(403).json({ error: err.message || 'Unauthorized to delete this project.' });
  }
});

export default router;
