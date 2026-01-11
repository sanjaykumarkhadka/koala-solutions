import { prisma } from '../lib/prisma.js';
import { ApplicationStatus, JobStatus } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';

export const portalService = {
  // ============== COMPANY PORTAL ==============

  async getCompanyDashboard(tenantId: string, userId: string) {
    // Get jobs created by this user (company)
    const [jobs, recentApplications, stats] = await Promise.all([
      prisma.job.findMany({
        where: { tenantId, createdById: userId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          _count: { select: { applications: true } },
        },
      }),
      prisma.jobApplication.findMany({
        where: {
          job: { tenantId, createdById: userId },
        },
        orderBy: { appliedAt: 'desc' },
        take: 10,
        include: {
          job: { select: { id: true, title: true } },
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
      }),
      prisma.job.aggregate({
        where: { tenantId, createdById: userId },
        _count: true,
      }),
    ]);

    const openJobs = jobs.filter((j) => j.status === JobStatus.OPEN).length;
    const totalApplications = jobs.reduce((sum, j) => sum + j._count.applications, 0);

    return {
      stats: {
        totalJobs: stats._count,
        openJobs,
        totalApplications,
      },
      recentJobs: jobs,
      recentApplications,
    };
  },

  async getCompanyJobs(tenantId: string, userId: string) {
    const jobs = await prisma.job.findMany({
      where: { tenantId, createdById: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { applications: true } },
      },
    });

    return jobs;
  },

  async getCompanyApplications(tenantId: string, userId: string) {
    const applications = await prisma.jobApplication.findMany({
      where: {
        job: { tenantId, createdById: userId },
      },
      orderBy: { appliedAt: 'desc' },
      include: {
        job: { select: { id: true, title: true } },
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

  // ============== APPLICANT PORTAL ==============

  async getApplicantDashboard(tenantId: string, userId: string) {
    // Get candidate profile
    const candidate = await prisma.candidate.findFirst({
      where: { tenantId, userId },
      include: {
        applications: {
          orderBy: { appliedAt: 'desc' },
          take: 5,
          include: {
            job: {
              include: {
                company: { select: { id: true, name: true, logoUrl: true } },
              },
            },
          },
        },
      },
    });

    // Get user's visa case if any
    const visaCase = await prisma.case.findFirst({
      where: { tenantId, applicantId: userId },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: { select: { documents: true } },
      },
    });

    // Get available jobs with visa sponsorship
    const visaSponsorJobs = await prisma.job.findMany({
      where: {
        tenantId,
        status: JobStatus.OPEN,
        visaSponsorship: true,
      },
      take: 5,
      include: {
        company: { select: { id: true, name: true, logoUrl: true } },
      },
    });

    return {
      candidate,
      visaCase,
      recentApplications: candidate?.applications || [],
      recommendedJobs: visaSponsorJobs,
      stats: {
        totalApplications: candidate?.applications.length || 0,
        pendingApplications: candidate?.applications.filter(
          (a) => ![ApplicationStatus.HIRED, ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN].includes(a.status)
        ).length || 0,
        hasVisaCase: !!visaCase,
      },
    };
  },

  async getMyApplications(tenantId: string, userId: string) {
    const candidate = await prisma.candidate.findFirst({
      where: { tenantId, userId },
    });

    if (!candidate) {
      return [];
    }

    const applications = await prisma.jobApplication.findMany({
      where: { candidateId: candidate.id },
      orderBy: { appliedAt: 'desc' },
      include: {
        job: {
          include: {
            company: { select: { id: true, name: true, logoUrl: true } },
          },
        },
      },
    });

    return applications;
  },

  async getMyCase(tenantId: string, userId: string) {
    const visaCase = await prisma.case.findFirst({
      where: { tenantId, applicantId: userId },
      include: {
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
        },
        timeline: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            createdBy: {
              select: { id: true, firstName: true, lastName: true, avatarUrl: true },
            },
          },
        },
      },
    });

    if (!visaCase) {
      throw new AppError(404, 'No visa case found');
    }

    return visaCase;
  },

  async getMyDocuments(tenantId: string, userId: string) {
    const visaCase = await prisma.case.findFirst({
      where: { tenantId, applicantId: userId },
    });

    if (!visaCase) {
      return [];
    }

    const documents = await prisma.document.findMany({
      where: { caseId: visaCase.id },
      orderBy: { createdAt: 'desc' },
    });

    return documents;
  },

  async getAvailableJobs(tenantId: string, options: { page?: number; limit?: number; search?: string } = {}) {
    const { page = 1, limit = 20, search } = options;
    const skip = (page - 1) * limit;

    const where = {
      tenantId,
      status: JobStatus.OPEN,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { description: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          company: { select: { id: true, name: true, logoUrl: true } },
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
      },
    };
  },
};
