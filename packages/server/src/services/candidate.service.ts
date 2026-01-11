import { prisma } from '../lib/prisma.js';
import { CandidateStatus, ApplicationStatus, JobStatus, Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import type {
  UpdateCandidateInput,
  ListCandidatesInput,
  UpdateApplicationStatusInput,
} from '../validators/candidate.validator.js';

export const candidateService = {
  async list(tenantId: string, options: ListCandidatesInput) {
    const {
      page = 1,
      limit = 20,
      status,
      skills,
      location,
      minExperience,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const skip = (page - 1) * limit;

    const where: Prisma.CandidateWhereInput = {
      tenantId,
      ...(status && { status }),
      ...(minExperience && { experience: { gte: minExperience } }),
      ...(location && { currentLocation: { contains: location, mode: 'insensitive' } }),
      ...(skills && { skills: { hasSome: skills.split(',').map((s) => s.trim()) } }),
      ...(search && {
        user: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      }),
    };

    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
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
          _count: {
            select: { applications: true },
          },
        },
      }),
      prisma.candidate.count({ where }),
    ]);

    return {
      data: candidates,
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
    const candidate = await prisma.candidate.findFirst({
      where: { id, tenantId },
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
        applications: {
          orderBy: { appliedAt: 'desc' },
          include: {
            job: {
              include: {
                company: {
                  select: {
                    id: true,
                    name: true,
                    logoUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!candidate) {
      throw new AppError(404, 'Candidate not found');
    }

    return candidate;
  },

  async getByUserId(tenantId: string, userId: string) {
    const candidate = await prisma.candidate.findFirst({
      where: { tenantId, userId },
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
        applications: {
          orderBy: { appliedAt: 'desc' },
          include: {
            job: {
              include: {
                company: {
                  select: {
                    id: true,
                    name: true,
                    logoUrl: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return candidate;
  },

  async update(tenantId: string, id: string, data: UpdateCandidateInput) {
    const existing = await prisma.candidate.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new AppError(404, 'Candidate not found');
    }

    const candidate = await prisma.candidate.update({
      where: { id },
      data: {
        ...data,
        availableFrom: data.availableFrom ? new Date(data.availableFrom) : undefined,
      },
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
    });

    return candidate;
  },

  async applyToJob(tenantId: string, candidateId: string, jobId: string, notes?: string) {
    const [candidate, job] = await Promise.all([
      prisma.candidate.findFirst({ where: { id: candidateId, tenantId } }),
      prisma.job.findFirst({ where: { id: jobId, tenantId } }),
    ]);

    if (!candidate) {
      throw new AppError(404, 'Candidate not found');
    }

    if (!job) {
      throw new AppError(404, 'Job not found');
    }

    if (job.status !== JobStatus.OPEN) {
      throw new AppError(400, 'Job is not accepting applications');
    }

    // Check if already applied
    const existingApplication = await prisma.jobApplication.findUnique({
      where: { jobId_candidateId: { jobId, candidateId } },
    });

    if (existingApplication) {
      throw new AppError(400, 'Already applied to this job');
    }

    const application = await prisma.jobApplication.create({
      data: {
        jobId,
        candidateId,
        status: ApplicationStatus.APPLIED,
        notes,
      },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    return application;
  },

  async updateApplicationStatus(
    tenantId: string,
    applicationId: string,
    data: UpdateApplicationStatusInput
  ) {
    const application = await prisma.jobApplication.findFirst({
      where: { id: applicationId },
      include: {
        job: { select: { tenantId: true } },
      },
    });

    if (!application || application.job.tenantId !== tenantId) {
      throw new AppError(404, 'Application not found');
    }

    const updated = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: data.status,
        notes: data.notes,
      },
      include: {
        candidate: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    // If hired, update job filled positions
    if (data.status === ApplicationStatus.HIRED) {
      await prisma.job.update({
        where: { id: application.jobId },
        data: { filledPositions: { increment: 1 } },
      });

      // Update candidate status to placed
      await prisma.candidate.update({
        where: { id: application.candidateId },
        data: { status: CandidateStatus.PLACED },
      });
    }

    return updated;
  },

  async getStats(tenantId: string) {
    const [total, byStatus, activeApplications] = await Promise.all([
      prisma.candidate.count({ where: { tenantId } }),
      prisma.candidate.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true,
      }),
      prisma.jobApplication.count({
        where: {
          candidate: { tenantId },
          status: { notIn: [ApplicationStatus.HIRED, ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN] },
        },
      }),
    ]);

    return {
      total,
      activeApplications,
      byStatus: byStatus.reduce(
        (acc, item) => ({ ...acc, [item.status]: item._count }),
        {} as Record<string, number>
      ),
    };
  },
};
