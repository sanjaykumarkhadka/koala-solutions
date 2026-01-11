import { Request, Response, NextFunction } from 'express';
import { companyService } from '../services/company.service.js';
import {
  createCompanySchema,
  updateCompanySchema,
  listCompaniesSchema,
} from '../validators/company.validator.js';
import { AppError } from '../middleware/errorHandler.js';
import { getTenantId } from '../middleware/tenantResolver.js';

export const companyController = {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const validation = listCompaniesSchema.safeParse(req.query);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const result = await companyService.list(tenantId, validation.data);

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

      const company = await companyService.getById(tenantId, id);

      res.status(200).json({
        status: 'success',
        data: company,
      });
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const validation = createCompanySchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const company = await companyService.create(tenantId, validation.data);

      res.status(201).json({
        status: 'success',
        data: company,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;

      const validation = updateCompanySchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const company = await companyService.update(tenantId, id, validation.data);

      res.status(200).json({
        status: 'success',
        data: company,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;

      await companyService.delete(tenantId, id);

      res.status(200).json({
        status: 'success',
        message: 'Company deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const stats = await companyService.getStats(tenantId);

      res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },
};
