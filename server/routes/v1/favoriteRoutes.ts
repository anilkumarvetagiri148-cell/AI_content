import { Router, Response } from 'express';
import { db } from '../../db.js';
import { dbService } from '../../services/dbService.js';
import { requireAuth, AuthRequest } from '../../middleware/auth.js';

const router = Router();

// GET /api/v1/favorites
router.get('/', requireAuth, (req: AuthRequest, res: Response) => {
  const savedIds = dbService.getSavedCreatorIds(req.user!.userId);
  const creators = savedIds
    .map((id) => db.getFullCreator(id))
    .filter((c): c is NonNullable<typeof c> => c !== null);

  res.json({ savedCreatorIds: savedIds, creators });
});

// POST /api/v1/favorites/:creatorId
router.post('/:creatorId', requireAuth, (req: AuthRequest, res: Response) => {
  const creatorId = String(req.params.creatorId);
  const saved = dbService.toggleSavedCreator(req.user!.userId, creatorId);
  res.json({ saved, creatorId });
});

export default router;
