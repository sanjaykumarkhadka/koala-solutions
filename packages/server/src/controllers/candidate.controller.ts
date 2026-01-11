import { Request, Response, NextFunction } from 'express';
import { candidateService } from '../services/candidate.service.js';
import {
  updateCandidateSchema,
  listCandidatesSchema,
  applyToJobSchema,
  updateApplicationStatusSchema,
} from '../validators/candidate.validator.js';
import { AppError } from '../middleware/errorHandler.js';
import { getTenantId } from '../middleware/tenantResolver.js';

export const candidateController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const validation = listCandidatesSchema.safeParse(req.query);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const result = await candidateService.list(tenantId, validation.data);

      res.status(200).json({
        status: 'success',
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;

      const candidate = await candidateService.getById(tenantId, id);

      res.status(200).json({
        status: 'success',
        data: candidate,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const userId = req.user!.id;

      const candidate = await candidateService.getByUserId(tenantId, userId);

      if (!candidate) {
        throw new AppError(404, 'Candidate profile not found');
      }

      res.status(200).json({
        status: 'success',
        data: candidate,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;

      const validation = updateCandidateSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const candidate = await candidateService.update(tenantId, id, validation.data);

      res.status(200).json({
        status: 'success',
        data: candidate,
      });
    } catch (error) {
      next(error);
    }
  },

  async applyToJob(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const validation = applyToJobSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      // Get candidate ID from user
      const candidate = await candidateService.getByUserId(tenantId, req.user!.id);
      if (!candidate) {
        throw new AppError(404, 'You need a candidate profile to apply');
      }

      const application = await candidateService.applyToJob(
        tenantId,
        candidate.id,
        validation.data.jobId,
        validation.data.notes
      );

      res.status(201).json({
        status: 'success',
        data: application,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateApplicationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;

      const validation = updateApplicationStatusSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const application = await candidateService.updateApplicationStatus(
        tenantId,
        id,
        validation.data
      );

      res.status(200).json({
        status: 'success',
        data: application,
      });
    } catch (error) {
      next(error);
    }
  },

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const stats = await candidateService.getStats(tenantId);

      res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },
};
