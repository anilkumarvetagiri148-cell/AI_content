import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth.js';
import { dbService } from '../../services/dbService.js';

const router = Router();

// GET /api/v1/notifications - Get all notifications for authenticated user
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const notifications = await dbService.getNotifications(userId);
    const unreadCount = notifications.filter(n => !n.read_status).length;
    res.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST /api/v1/notifications/read-all - Mark all as read
router.post('/read-all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    await dbService.markAllNotificationsRead(userId);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// PATCH /api/v1/notifications/:id/read - Mark single notification as read
router.patch('/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const notifId = String(req.params.id);
    await dbService.markNotificationRead(userId, notifId);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default router;
