import { Request, Response, NextFunction } from 'express';
import { ENV } from '../config/env.js';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${req.method} ${req.url} (${statusCode}):`, err.stack || err);

  res.status(statusCode).json({
    error: message,
    status: statusCode,
    code: err.code || undefined,
    ...(ENV.isProduction ? {} : { stack: err.stack }),
  });
}
