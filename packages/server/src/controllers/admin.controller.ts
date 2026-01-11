import { Request, Response, NextFunction } from 'express';
import { adminService } from '../services/admin.service.js';
import { getTenantId } from '../middleware/tenantResolver.js';
import { AppError } from '../middleware/errorHandler.js';
import { UserRole, UserStatus } from '@prisma/client';
import { z } from 'zod';

const inviteTeamMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.nativeEnum(UserRole),
});

const updateTeamMemberSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  role: z.nativeEnum(UserRole).optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

const updateSettingsSchema = z.object({
  name: z.string().min(1).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
});

export const adminController = {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const stats = await adminService.getDashboardStats(tenantId);

      res.status(200).json({
        status: 'success',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  },

  async listTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const team = await adminService.listTeam(tenantId);

      res.status(200).json({
        status: 'success',
        data: team,
      });
    } catch (error) {
      next(error);
    }
  },

  async inviteTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const validation = inviteTeamMemberSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const result = await adminService.inviteTeamMember(tenantId, validation.data);

      res.status(201).json({
        status: 'success',
        data: result.user,
        message: `Invitation sent. Temporary password: ${result.tempPassword}`,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;

      const validation = updateTeamMemberSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const user = await adminService.updateTeamMember(tenantId, id, validation.data);

      res.status(200).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  },

  async removeTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const { id } = req.params;

      await adminService.removeTeamMember(tenantId, id);

      res.status(200).json({
        status: 'success',
        message: 'Team member removed successfully',
      });
    } catch (error) {
      next(error);
    }
  },

  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);
      const settings = await adminService.getSettings(tenantId);

      res.status(200).json({
        status: 'success',
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  },

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = getTenantId(req);

      const validation = updateSettingsSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(400, validation.error.errors[0]?.message || 'Validation failed');
      }

      const settings = await adminService.updateSettings(tenantId, validation.data);

      res.status(200).json({
        status: 'success',
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  },
};
