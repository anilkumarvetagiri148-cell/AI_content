import { Request, Response, NextFunction } from 'express';
import { db, verifyToken } from '../db.js';
import { UserRole } from '../../src/types/index.js';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: UserRole;
    email: string;
  };
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) {
      const verified = verifyToken(token);
      if (verified) {
        const profile = db.getProfileById(verified.userId);
        if (profile) {
          req.user = { userId: profile.id, role: profile.role, email: profile.email };
        }
      }
    }
  }
  next();
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  optionalAuth(req, res, () => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required. Please sign in.' });
      return;
    }
    next();
  });
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    requireAuth(req, res, () => {
      if (!req.user || !roles.includes(req.user.role)) {
        res.status(403).json({
          error: `Access denied. Required role: ${roles.join(' or ')}. Your account role is ${req.user?.role || 'guest'}.`,
        });
        return;
      }
      next();
    });
  };
}
