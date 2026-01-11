import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { registerSchema, loginSchema, refreshSchema } from '../validators/auth.validator.js';
import { AppError } from '../middleware/errorHandler.js';

export const authController = {
  /**
   * POST /api/auth/register
   * Register a new user (requires tenant context)
   */
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.tenant) {
        throw new AppError(400, 'Tenant context required for registration');
      }

      const validation = registerSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const result = await authService.register({
        tenantId: req.tenant.id,
        ...validation.data,
      });

      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/login
   * Login user
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = loginSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const result = await authService.login(validation.data);

      res.json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/refresh
   * Refresh access token
   */
  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = refreshSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const tokens = await authService.refresh(validation.data.refreshToken);

      res.json({
        status: 'success',
        data: tokens,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/auth/logout
   * Logout user (client-side token removal)
   */
  async logout(_req: Request, res: Response, _next: NextFunction) {
    // JWT tokens are stateless, so logout is handled client-side
    // In a production app, you might want to maintain a token blacklist
    res.json({
      status: 'success',
      message: 'Logged out successfully',
    });
  },

  /**
   * GET /api/auth/me
   * Get current user info
   */
  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError(401, 'Not authenticated');
      }

      const user = await authService.me(req.user.id);

      res.json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },
};
