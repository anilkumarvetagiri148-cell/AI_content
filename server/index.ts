import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { env } from './config/env.js';
import { securityHeaders, corsMiddleware } from './middleware/security.js';
import { rateLimit } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRouter from './routes/index.js';
import { UserRole } from '../src/types/index.js';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
    email: string;
  };
}

const app = express();
const PORT = Number(env.PORT) || 3001;

// 1. Security Headers & CORS
app.use(securityHeaders);
app.use(corsMiddleware);

// 2. Body Parsing (JSON limit 10MB for base64 media uploads)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Global Rate Limiter (200 requests per minute per IP)
app.use(rateLimit({ windowMs: 60 * 1000, max: 200 }));

// 4. Mount Master API Router
// /api/v1 is standard REST v1, /api provides 100% backward compatibility
app.use('/api/v1', apiRouter);
app.use('/api', apiRouter);

// 5. Serve Frontend static assets in production if dist directory exists
const distPath = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 6. Centralized Error Handling
app.use(errorHandler);

// 7. Start server if run directly (not imported by tests or serverless runner)
const isDirectRun = Boolean(
  process.argv[1] &&
  (process.argv[1].endsWith('server\\index.ts') ||
   process.argv[1].endsWith('server/index.ts') ||
   process.argv[1].endsWith('server\\index.js') ||
   process.argv[1].endsWith('server/index.js'))
);

if (isDirectRun && process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 CreatorConnect AI Server running on http://localhost:${PORT}`);
    console.log(`📡 API v1 base: http://localhost:${PORT}/api/v1`);
    console.log(`🩺 Health check: http://localhost:${PORT}/api/v1/health`);
  });
}

export { app };
export default app;
