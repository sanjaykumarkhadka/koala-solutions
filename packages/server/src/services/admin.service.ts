import { prisma } from '../lib/prisma.js';
import { UserRole, UserStatus, CaseStatus, LeadStatus, JobStatus } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import bcrypt from 'bcryptjs';

export const adminService = {
  /**
   * Get admin dashboard statistics
   */
  async getDashboardStats(tenantId: string) {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalUsers,
      totalLeads,
      totalCases,
      totalJobs,
      leadsThisMonth,
      casesThisMonth,
      leadsByStatus,
      casesByStatus,
      jobsByStatus,
      recentActivity,
    ] = await Promise.all([
      prisma.user.count({ where: { tenantId } }),
      prisma.lead.count({ where: { tenantId } }),
      prisma.case.count({ where: { tenantId } }),
      prisma.job.count({ where: { tenantId } }),
      prisma.lead.count({
        where: { tenantId, createdAt: { gte: thisMonth } },
      }),
      prisma.case.count({
        where: { tenantId, createdAt: { gte: thisMonth } },
      }),
      prisma.lead.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true,
      }),
      prisma.case.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true,
      }),
      prisma.job.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true,
      }),
      prisma.timelineEvent.findMany({
        where: { case: { tenantId } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          createdBy: {
            select: { firstName: true, lastName: true, avatarUrl: true },
          },
          case: {
            select: { caseNumber: true },
          },
        },
      }),
    ]);

    return {
      overview: {
        totalUsers,
        totalLeads,
        totalCases,
        totalJobs,
        leadsThisMonth,
        casesThisMonth,
      },
      leadsByStatus: leadsByStatus.reduce(
        (acc, item) => ({ ...acc, [item.status]: item._count }),
        {} as Record<string, number>
      ),
      casesByStatus: casesByStatus.reduce(
        (acc, item) => ({ ...acc, [item.status]: item._count }),
        {} as Record<string, number>
      ),
      jobsByStatus: jobsByStatus.reduce(
        (acc, item) => ({ ...acc, [item.status]: item._count }),
        {} as Record<string, number>
      ),
      recentActivity,
    };
  },

  /**
   * List team members
   */
  async listTeam(tenantId: string) {
    const users = await prisma.user.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        avatarUrl: true,
        lastLoginAt: true,
        createdAt: true,
        _count: {
          select: {
            assignedLeads: true,
            assignedCases: true,
          },
        },
      },
    });

    return users;
  },

  /**
   * Invite team member
   */
  async inviteTeamMember(
    tenantId: string,
    data: {
      email: string;
      firstName: string;
      lastName: string;
      role: UserRole;
    }
  ) {
    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: { tenantId, email: data.email },
    });

    if (existing) {
      throw new AppError(400, 'User with this email already exists');
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const user = await prisma.user.create({
      data: {
        tenantId,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        status: UserStatus.PENDING,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // In production, send email with temp password
    return { user, tempPassword };
  },

  /**
   * Update team member
   */
  async updateTeamMember(
    tenantId: string,
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      role?: UserRole;
      status?: UserStatus;
    }
  ) {
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return updated;
  },

  /**
   * Remove team member
   */
  async removeTeamMember(tenantId: string, userId: string) {
    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    await prisma.user.delete({ where: { id: userId } });

    return { success: true };
  },

  /**
   * Get tenant settings
   */
  async getSettings(tenantId: string) {
    const [tenant, settings] = await Promise.all([
      prisma.tenant.findUnique({
        where: { id: tenantId },
        select: {
          id: true,
          name: true,
          slug: true,
          domain: true,
          plan: true,
          status: true,
        },
      }),
      prisma.tenantSettings.findUnique({
        where: { tenantId },
      }),
    ]);

    return {
      tenant,
      settings: settings || {
        logoUrl: null,
        primaryColor: '#0ea5e9',
        timezone: 'UTC',
        dateFormat: 'YYYY-MM-DD',
      },
    };
  },

  /**
   * Update tenant settings
   */
  async updateSettings(
    tenantId: string,
    data: {
      name?: string;
      logoUrl?: string;
      primaryColor?: string;
      timezone?: string;
      dateFormat?: string;
    }
  ) {
    const { name, ...settingsData } = data;

    if (name) {
      await prisma.tenant.update({
        where: { id: tenantId },
        data: { name },
      });
    }

    const settings = await prisma.tenantSettings.upsert({
      where: { tenantId },
      create: {
        tenantId,
        ...settingsData,
      },
      update: settingsData,
    });

    return settings;
  },
};
