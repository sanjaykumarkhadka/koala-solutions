import { Request, Response, NextFunction } from 'express';
import { onboardingService } from '../services/onboarding.service.js';
import { checkSlugSchema, createAgencySchema } from '../validators/onboarding.validator.js';
import { AppError } from '../middleware/errorHandler.js';

export const onboardingController = {
  /**
   * POST /api/onboarding/check-slug
   * Check if a slug is available
   */
  async checkSlug(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = checkSlugSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const result = await onboardingService.checkSlug(validation.data.slug);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/onboarding/create-agency
   * Create a new agency with admin user
   */
  async createAgency(req: Request, res: Response, next: NextFunction) {
    try {
      const validation = createAgencySchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const result = await onboardingService.createAgency(validation.data);

      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/onboarding/tenants
   * Get tenants for an email (for login flow)
   */
  async getTenantsForEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.query;

      if (!email || typeof email !== 'string') {
        throw new AppError(400, 'Email is required');
      }

      const tenants = await onboardingService.getTenantsForEmail(email);

      res.status(200).json({
        status: 'success',
        data: tenants,
      });
    } catch (error) {
      next(error);
    }
  },
};
