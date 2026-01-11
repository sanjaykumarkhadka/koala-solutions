import { Request, Response, NextFunction } from 'express';
import { jobService } from '../services/job.service.js';
import {
  createJobSchema,
  updateJobSchema,
  listJobsSchema,
} from '../validators/job.validator.js';
import { AppError } from '../middleware/errorHandler.js';
import { getTenantId } from '../middleware/tenantResolver.js';
import { JobStatus } from '@prisma/client';

export const jobController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const validation = listJobsSchema.safeParse(req.query);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const result = await jobService.list(tenantId, validation.data);

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

      const job = await jobService.getById(tenantId, id);

      res.status(200).json({
        status: 'success',
        data: job,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const userId = req.user!.id;
      const validation = createJobSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const job = await jobService.create(tenantId, validation.data, userId);

      res.status(201).json({
        status: 'success',
        data: job,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;

      const validation = updateJobSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const job = await jobService.update(tenantId, id, validation.data);

      res.status(200).json({
        status: 'success',
        data: job,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !Object.values(JobStatus).includes(status)) {
        throw new AppError(400, 'Invalid job status');
      }

      const job = await jobService.updateStatus(tenantId, id, status);

      res.status(200).json({
        status: 'success',
        data: job,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;

      await jobService.delete(tenantId, id);

      res.status(200).json({
        status: 'success',
        message: 'Job deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const stats = await jobService.getStats(tenantId);

      res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  async getApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;

      const applications = await jobService.getApplications(tenantId, id);

      res.status(200).json({
        status: 'success',
        data: applications,
      });
    } catch (error) {
      next(error);
    }
  },
};
