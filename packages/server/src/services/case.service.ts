import { prisma } from '../lib/prisma.js';
import { CaseStatus, Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import type {
  CreateCaseInput,
  UpdateCaseInput,
  UpdateCaseStatusInput,
  ListCasesInput,
  CreateTimelineEventInput,
} from '../validators/case.validator.js';

export const caseService = {
  /**
   * List cases with filtering and pagination
   */
  async list(tenantId: string, options: ListCasesInput) {
    const {
      page = 1,
      limit = 20,
      status,
      visaType,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      assignedToId,
    } = options;

    const skip = (page - 1) * limit;

    const where: Prisma.CaseWhereInput = {
      tenantId,
      ...(status && { status }),
      ...(visaType && { visaType }),
      ...(assignedToId && { assignedToId }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { caseNumber: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              documents: true,
              timeline: true,
            },
          },
        },
      }),
      prisma.case.count({ where }),
    ]);

    return {
      data: cases,
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
   * Get case by ID
   */
  async getById(tenantId: string, id: string) {
    const caseData = await prisma.case.findFirst({
      where: { id, tenantId },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        lead: {
          select: {
            id: true,
            source: true,
          },
        },
        documents: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        timeline: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
        _count: {
          select: {
            documents: true,
          },
        },
      },
    });

    if (!caseData) {
      throw new AppError(404, 'Case not found');
    }

    return caseData;
  },

  /**
   * Create a new case
   */
  async create(tenantId: string, data: CreateCaseInput, createdById: string) {
    // Generate case number
    const lastCase = await prisma.case.findFirst({
      where: { tenantId },
      orderBy: { caseNumber: 'desc' },
    });
    const nextNumber = lastCase
      ? parseInt(lastCase.caseNumber.replace('CASE-', '')) + 1
      : 1;
    const caseNumber = `CASE-${String(nextNumber).padStart(6, '0')}`;

    const newCase = await prisma.case.create({
      data: {
        tenantId,
        createdById,
        caseNumber,
        applicantId: createdById, // Default to creator, can be updated
        status: CaseStatus.DRAFT,
        ...data,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Add timeline entry
    await prisma.timelineEvent.create({
      data: {
        tenantId,
        caseId: newCase.id,
        createdById,
        type: 'STATUS_CHANGE',
        title: 'Case created',
        description: `Case ${caseNumber} was created`,
      },
    });

    return newCase;
  },

  /**
   * Update a case
   */
  async update(tenantId: string, id: string, data: UpdateCaseInput, userId: string) {
    const existing = await prisma.case.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new AppError(404, 'Case not found');
    }

    const updated = await prisma.case.update({
      where: { id },
      data,
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Add timeline entry
    await prisma.timelineEvent.create({
      data: {
        tenantId,
        caseId: id,
        createdById: userId,
        type: 'NOTE_ADDED',
        title: 'Case updated',
        description: 'Case details were updated',
      },
    });

    return updated;
  },

  /**
   * Update case status
   */
  async updateStatus(
    tenantId: string,
    id: string,
    data: UpdateCaseStatusInput,
    userId: string
  ) {
    const existing = await prisma.case.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new AppError(404, 'Case not found');
    }

    const previousStatus = existing.status;

    const updated = await prisma.case.update({
      where: { id },
      data: { status: data.status },
    });

    // Add timeline entry
    await prisma.timelineEvent.create({
      data: {
        tenantId,
        caseId: id,
        createdById: userId,
        type: 'STATUS_CHANGE',
        title: `Status changed to ${data.status.replace(/_/g, ' ')}`,
        description: data.notes || `Status changed from ${previousStatus} to ${data.status}`,
      },
    });

    return updated;
  },

  /**
   * Assign case to an agent
   */
  async assign(tenantId: string, id: string, agentId: string, userId: string) {
    const caseData = await prisma.case.findFirst({
      where: { id, tenantId },
    });

    if (!caseData) {
      throw new AppError(404, 'Case not found');
    }

    const agent = await prisma.user.findFirst({
      where: {
        id: agentId,
        tenantId,
        role: { in: ['ADMIN', 'MANAGER', 'AGENT'] },
      },
    });

    if (!agent) {
      throw new AppError(404, 'Agent not found');
    }

    const updated = await prisma.case.update({
      where: { id },
      data: { assignedToId: agentId },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Add timeline entry
    await prisma.timelineEvent.create({
      data: {
        tenantId,
        caseId: id,
        createdById: userId,
        type: 'ASSIGNMENT_CHANGED',
        title: `Assigned to ${agent.firstName} ${agent.lastName}`,
        description: `Case was assigned to ${agent.firstName} ${agent.lastName}`,
      },
    });

    return updated;
  },

  /**
   * Delete a case
   */
  async delete(tenantId: string, id: string) {
    const existing = await prisma.case.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new AppError(404, 'Case not found');
    }

    // Delete related records first
    await prisma.$transaction([
      prisma.timelineEvent.deleteMany({ where: { caseId: id } }),
      prisma.document.deleteMany({ where: { caseId: id } }),
      prisma.case.delete({ where: { id } }),
    ]);

    return { success: true };
  },

  /**
   * Get case timeline
   */
  async getTimeline(tenantId: string, caseId: string) {
    const caseData = await prisma.case.findFirst({
      where: { id: caseId, tenantId },
    });

    if (!caseData) {
      throw new AppError(404, 'Case not found');
    }

    const timeline = await prisma.timelineEvent.findMany({
      where: { caseId },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return timeline;
  },

  /**
   * Add timeline event
   */
  async addTimelineEvent(
    tenantId: string,
    caseId: string,
    data: CreateTimelineEventInput,
    userId: string
  ) {
    const caseData = await prisma.case.findFirst({
      where: { id: caseId, tenantId },
    });

    if (!caseData) {
      throw new AppError(404, 'Case not found');
    }

    const event = await prisma.timelineEvent.create({
      data: {
        tenantId,
        caseId,
        createdById: userId,
        ...data,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return event;
  },

  /**
   * Get case statistics
   */
  async getStats(tenantId: string) {
    const [byStatus, byVisaType, total, thisMonth] = await Promise.all([
      prisma.case.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true,
      }),
      prisma.case.groupBy({
        by: ['visaType'],
        where: { tenantId },
        _count: true,
      }),
      prisma.case.count({ where: { tenantId } }),
      prisma.case.count({
        where: {
          tenantId,
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      }),
    ]);

    return {
      total,
      thisMonth,
      byStatus: byStatus.reduce(
        (acc, item) => ({ ...acc, [item.status]: item._count }),
        {} as Record<string, number>
      ),
      byVisaType: byVisaType.reduce(
        (acc, item) => ({ ...acc, [item.visaType]: item._count }),
        {} as Record<string, number>
      ),
    };
  },
};
