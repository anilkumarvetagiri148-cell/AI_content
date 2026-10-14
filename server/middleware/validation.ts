import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = err.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`);
        res.status(400).json({
          error: issues[0] || 'Invalid request payload',
          details: issues,
        });
        return;
      }
      res.status(400).json({ error: 'Request body validation failed' });
    }
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.query = schema.parse(req.query) as any;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const issues = err.issues.map((i) => `${i.path.join('.') || 'query'}: ${i.message}`);
        res.status(400).json({
          error: issues[0] || 'Invalid query parameters',
          details: issues,
        });
        return;
      }
      res.status(400).json({ error: 'Query parameters validation failed' });
    }
  };
}
