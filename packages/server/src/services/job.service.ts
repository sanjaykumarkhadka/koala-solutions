import { prisma } from '../lib/prisma.js';
import { JobStatus, Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import type {
  CreateJobInput,
  UpdateJobInput,
  ListJobsInput,
} from '../validators/job.validator.js';

export const jobService = {
  async list(tenantId: string, options: ListJobsInput) {
    const {
      page = 1,
      limit = 20,
      status,
      jobType,
      companyId,
      country,
      visaSponsorship,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const skip = (page - 1) * limit;

    const where: Prisma.JobWhereInput = {
      tenantId,
      ...(status && { status }),
      ...(jobType && { jobType }),
      ...(companyId && { companyId }),
      ...(country && { country }),
      ...(visaSponsorship !== undefined && { visaSponsorship }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
            },
          },
          _count: {
            select: { applications: true },
          },
        },
      }),
      prisma.job.count({ where }),
    ]);

    return {
      data: jobs,
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

  async getById(tenantId: string, id: string) {
    const job = await prisma.job.findFirst({
      where: { id, tenantId },
      include: {
        company: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        applications: {
          orderBy: { appliedAt: 'desc' },
          take: 20,
          include: {
            candidate: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    avatarUrl: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!job) {
      throw new AppError(404, 'Job not found');
    }

    return job;
  },

  async create(tenantId: string, data: CreateJobInput, createdById: string) {
    // Verify company exists
    const company = await prisma.company.findFirst({
      where: { id: data.companyId, tenantId },
    });

    if (!company) {
      throw new AppError(404, 'Company not found');
    }

    const job = await prisma.job.create({
      data: {
        tenantId,
        createdById,
        ...data,
        status: JobStatus.DRAFT,
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return job;
  },

  async update(tenantId: string, id: string, data: UpdateJobInput) {
    const existing = await prisma.job.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new AppError(404, 'Job not found');
    }

    const job = await prisma.job.update({
      where: { id },
      data: {
        ...data,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return job;
  },

  async updateStatus(tenantId: string, id: string, status: JobStatus) {
    const existing = await prisma.job.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new AppError(404, 'Job not found');
    }

    const job = await prisma.job.update({
      where: { id },
      data: { status },
    });

    return job;
  },

  async delete(tenantId: string, id: string) {
    const existing = await prisma.job.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new AppError(404, 'Job not found');
    }

    await prisma.$transaction([
      prisma.jobApplication.deleteMany({ where: { jobId: id } }),
      prisma.job.delete({ where: { id } }),
    ]);

    return { success: true };
  },

  async getStats(tenantId: string) {
    const [total, byStatus, byType, openPositions] = await Promise.all([
      prisma.job.count({ where: { tenantId } }),
      prisma.job.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true,
      }),
      prisma.job.groupBy({
        by: ['jobType'],
        where: { tenantId },
        _count: true,
      }),
      prisma.job.aggregate({
        where: { tenantId, status: JobStatus.OPEN },
        _sum: { openPositions: true },
      }),
    ]);

    return {
      total,
      openPositions: openPositions._sum.openPositions || 0,
      byStatus: byStatus.reduce(
        (acc, item) => ({ ...acc, [item.status]: item._count }),
        {} as Record<string, number>
      ),
      byType: byType.reduce(
        (acc, item) => ({ ...acc, [item.jobType]: item._count }),
        {} as Record<string, number>
      ),
    };
  },

  async getApplications(tenantId: string, jobId: string) {
    const job = await prisma.job.findFirst({
      where: { id: jobId, tenantId },
    });

    if (!job) {
      throw new AppError(404, 'Job not found');
    }

    const applications = await prisma.jobApplication.findMany({
      where: { jobId },
      orderBy: { appliedAt: 'desc' },
      include: {
        candidate: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    return applications;
  },
};
