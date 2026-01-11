import { Request, Response, NextFunction } from 'express';
import { portalService } from '../services/portal.service.js';
import { getTenantId } from '../middleware/tenantResolver.js';

export const portalController = {
  // ============== COMPANY PORTAL ==============

  async getCompanyDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const userId = req.user!.id;

      const dashboard = await portalService.getCompanyDashboard(tenantId, userId);

      res.status(200).json({
        status: 'success',
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCompanyJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const userId = req.user!.id;

      const jobs = await portalService.getCompanyJobs(tenantId, userId);

      res.status(200).json({
        status: 'success',
        data: jobs,
      });
    } catch (error) {
      next(error);
    }
  },

  async getCompanyApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const userId = req.user!.id;

      const applications = await portalService.getCompanyApplications(tenantId, userId);

      res.status(200).json({
        status: 'success',
        data: applications,
      });
    } catch (error) {
      next(error);
    }
  },

  // ============== APPLICANT PORTAL ==============

  async getApplicantDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const userId = req.user!.id;

      const dashboard = await portalService.getApplicantDashboard(tenantId, userId);

      res.status(200).json({
        status: 'success',
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyApplications(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const userId = req.user!.id;

      const applications = await portalService.getMyApplications(tenantId, userId);

      res.status(200).json({
        status: 'success',
        data: applications,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyCase(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const userId = req.user!.id;

      const visaCase = await portalService.getMyCase(tenantId, userId);

      res.status(200).json({
        status: 'success',
        data: visaCase,
      });
    } catch (error) {
      next(error);
    }
  },

  async getMyDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const userId = req.user!.id;

      const documents = await portalService.getMyDocuments(tenantId, userId);

      res.status(200).json({
        status: 'success',
        data: documents,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAvailableJobs(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const { page, limit, search } = req.query;

      const result = await portalService.getAvailableJobs(tenantId, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        search: search as string | undefined,
      });

      res.status(200).json({
        status: 'success',
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  },
};
