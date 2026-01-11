import { Request, Response, NextFunction } from 'express';
import { caseService } from '../services/case.service.js';
import {
  createCaseSchema,
  updateCaseSchema,
  updateCaseStatusSchema,
  assignCaseSchema,
  listCasesSchema,
  createTimelineEventSchema,
} from '../validators/case.validator.js';
import { AppError } from '../middleware/errorHandler.js';
import { getTenantId } from '../middleware/tenantResolver.js';

export const caseController = {
  /**
   * GET /api/t/:tenantSlug/cases
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const validation = listCasesSchema.safeParse(req.query);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const result = await caseService.list(tenantId, validation.data);

      res.status(200).json({
        status: 'success',
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/t/:tenantSlug/cases/stats
   */
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const stats = await caseService.getStats(tenantId);

      res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/t/:tenantSlug/cases/:id
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;

      const caseData = await caseService.getById(tenantId, id);

      res.status(200).json({
        status: 'success',
        data: caseData,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/t/:tenantSlug/cases
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const userId = req.user!.id;

      const validation = createCaseSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const caseData = await caseService.create(tenantId, validation.data, userId);

      res.status(201).json({
        status: 'success',
        data: caseData,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/t/:tenantSlug/cases/:id
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const userId = req.user!.id;
      const { id } = req.params;

      const validation = updateCaseSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const caseData = await caseService.update(tenantId, id, validation.data, userId);

      res.status(200).json({
        status: 'success',
        data: caseData,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/t/:tenantSlug/cases/:id/status
   */
  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const userId = req.user!.id;
      const { id } = req.params;

      const validation = updateCaseStatusSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const caseData = await caseService.updateStatus(tenantId, id, validation.data, userId);

      res.status(200).json({
        status: 'success',
        data: caseData,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/t/:tenantSlug/cases/:id/assign
   */
  async assign(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const userId = req.user!.id;
      const { id } = req.params;

      const validation = assignCaseSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const caseData = await caseService.assign(tenantId, id, validation.data.agentId, userId);

      res.status(200).json({
        status: 'success',
        data: caseData,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/t/:tenantSlug/cases/:id
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;

      await caseService.delete(tenantId, id);

      res.status(200).json({
        status: 'success',
        message: 'Case deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/t/:tenantSlug/cases/:id/timeline
   */
  async getTimeline(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;

      const timeline = await caseService.getTimeline(tenantId, id);

      res.status(200).json({
        status: 'success',
        data: timeline,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/t/:tenantSlug/cases/:id/timeline
   */
  async addTimelineEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const userId = req.user!.id;
      const { id } = req.params;

      const validation = createTimelineEventSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const event = await caseService.addTimelineEvent(tenantId, id, validation.data, userId);

      res.status(201).json({
        status: 'success',
        data: event,
      });
    } catch (error) {
      next(error);
    }
  },
};
