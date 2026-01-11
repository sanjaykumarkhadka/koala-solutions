import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { AppError } from './errorHandler.js';

/**
 * Middleware to authenticate requests using JWT
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Authentication required');
    }

    const token = authHeader.substring(7);

    try {
      const payload = verifyAccessToken(token);

      // Fetch user from database
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          tenant: true,
        },
      });

      if (!user) {
        throw new AppError(401, 'User not found');
      }

      if (user.status !== 'ACTIVE') {
        throw new AppError(403, 'Account is not active');
      }

      if (user.tenant.status !== 'ACTIVE') {
        throw new AppError(403, 'Organization is not active');
      }

      // Attach user and tenant to request
      req.user = user;
      req.tenant = user.tenant;

      next();
    } catch {
      throw new AppError(401, 'Invalid or expired token');
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication - doesn't fail if no token provided
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      try {
        const payload = verifyAccessToken(token);

        const user = await prisma.user.findUnique({
          where: { id: payload.userId },
          include: {
            tenant: true,
          },
        });

        if (user && user.status === 'ACTIVE' && user.tenant.status === 'ACTIVE') {
          req.user = user;
          req.tenant = user.tenant;
        }
      } catch {
        // Invalid token - just continue without auth
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}
