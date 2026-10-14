import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../../middleware/auth.js';
import { uploadMedia } from '../../services/storageService.js';

const router = Router();

// POST /api/v1/upload - Secure media asset upload
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { filename, mimeType, base64Data, dataUrl } = req.body;

    let buffer: Buffer;
    let finalMime = mimeType || 'image/png';
    let finalName = filename || 'upload.png';

    if (dataUrl && typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
      const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        res.status(400).json({ error: 'Invalid data URL format. Expected data:[mime];base64,[data]' });
        return;
      }
      finalMime = match[1];
      buffer = Buffer.from(match[2], 'base64');
    } else if (base64Data && typeof base64Data === 'string') {
      buffer = Buffer.from(base64Data, 'base64');
    } else {
      res.status(400).json({
        error: 'Please provide either dataUrl (data:image/...;base64,...) or base64Data with filename and mimeType.',
      });
      return;
    }

    const result = await uploadMedia(buffer, finalName, finalMime);
    res.status(201).json({
      success: true,
      url: result.url,
      filename: result.filename,
      sizeBytes: result.sizeBytes,
      mimeType: result.mimeType,
    });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router;
