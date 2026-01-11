import { prisma } from '../lib/prisma.js';
import { Plan, TenantStatus } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';

export interface CreateTenantInput {
  name: string;
  slug: string;
  plan?: Plan;
}

export interface UpdateTenantInput {
  name?: string;
  domain?: string;
  plan?: Plan;
  status?: TenantStatus;
}

export const tenantService = {
  /**
   * Create a new tenant
   */
  async create(data: CreateTenantInput) {
    // Check if slug is already taken
    const existing = await prisma.tenant.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new AppError(400, 'Tenant slug is already in use');
    }

    // Create tenant with default settings
    const tenant = await prisma.tenant.create({
      data: {
        name: data.name,
        slug: data.slug,
        plan: data.plan || Plan.FREE,
        settings: {
          create: {
            primaryColor: '#0ea5e9',
            timezone: 'UTC',
            dateFormat: 'YYYY-MM-DD',
          },
        },
      },
      include: {
        settings: true,
      },
    });

    return tenant;
  },

  /**
   * Get tenant by slug
   */
  async findBySlug(slug: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { slug },
      include: {
        settings: true,
      },
    });

    return tenant;
  },

  /**
   * Get tenant by ID
   */
  async findById(id: string) {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: {
        settings: true,
      },
    });

    return tenant;
  },

  /**
   * Update tenant
   */
  async update(id: string, data: UpdateTenantInput) {
    const tenant = await prisma.tenant.update({
      where: { id },
      data,
      include: {
        settings: true,
      },
    });

    return tenant;
  },

  /**
   * Check if slug is available
   */
  async isSlugAvailable(slug: string): Promise<boolean> {
    const existing = await prisma.tenant.findUnique({
      where: { slug },
    });

    return !existing;
  },

  /**
   * Get all tenants (for super admin)
   */
  async findAll(options: { page?: number; limit?: number; status?: TenantStatus }) {
    const { page = 1, limit = 20, status } = options;
    const skip = (page - 1) * limit;

    const where = status ? { status } : {};

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              users: true,
              leads: true,
              cases: true,
            },
          },
        },
      }),
      prisma.tenant.count({ where }),
    ]);

    return {
      data: tenants,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
    };
  },

  /**
   * Get tenant statistics
   */
  async getStats(tenantId: string) {
    const [leads, cases, users, jobs] = await Promise.all([
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
      prisma.user.count({
        where: { tenantId },
      }),
      prisma.job.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true,
      }),
    ]);

    return {
      leads: leads.reduce(
        (acc, item) => ({
          ...acc,
          [item.status]: item._count,
        }),
        {} as Record<string, number>
      ),
      cases: cases.reduce(
        (acc, item) => ({
          ...acc,
          [item.status]: item._count,
        }),
        {} as Record<string, number>
      ),
      users,
      jobs: jobs.reduce(
        (acc, item) => ({
          ...acc,
          [item.status]: item._count,
        }),
        {} as Record<string, number>
      ),
    };
  },
};
