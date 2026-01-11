import { Request, Response, NextFunction } from 'express';
import { leadService } from '../services/lead.service.js';
import {
  createLeadSchema,
  updateLeadSchema,
  assignLeadSchema,
  listLeadsSchema,
} from '../validators/lead.validator.js';
import { AppError } from '../middleware/errorHandler.js';
import { getTenantId } from '../middleware/tenantResolver.js';

export const leadController = {
  /**
   * GET /api/t/:tenantSlug/leads
   * List leads with filtering and pagination
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const validation = listLeadsSchema.safeParse(req.query);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const result = await leadService.list(tenantId, validation.data);

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
   * GET /api/t/:tenantSlug/leads/stats
   * Get lead statistics
   */
  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const stats = await leadService.getStats(tenantId);

      res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/t/:tenantSlug/leads/:id
   * Get lead by ID
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;

      const lead = await leadService.getById(tenantId, id);

      res.status(200).json({
        status: 'success',
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/t/:tenantSlug/leads
   * Create a new lead
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const userId = req.user!.id;

      const validation = createLeadSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const lead = await leadService.create(tenantId, validation.data, userId);

      res.status(201).json({
        status: 'success',
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/t/:tenantSlug/leads/:id
   * Update a lead
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;

      const validation = updateLeadSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const lead = await leadService.update(tenantId, id, validation.data);

      res.status(200).json({
        status: 'success',
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/t/:tenantSlug/leads/:id
   * Delete a lead
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;

      await leadService.delete(tenantId, id);

      res.status(200).json({
        status: 'success',
        message: 'Lead deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/t/:tenantSlug/leads/:id/assign
   * Assign lead to an agent
   */
  async assign(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;

      const validation = assignLeadSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const lead = await leadService.assign(tenantId, id, validation.data.agentId);

      res.status(200).json({
        status: 'success',
        data: lead,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/t/:tenantSlug/leads/:id/convert
   * Convert lead to case
   */
  async convertToCase(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;
      const userId = req.user!.id;

      const newCase = await leadService.convertToCase(tenantId, id, userId);

      res.status(201).json({
        status: 'success',
        data: newCase,
        message: 'Lead successfully converted to case',
      });
    } catch (error) {
      next(error);
    }
  },
};
