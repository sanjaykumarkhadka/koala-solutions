import { prisma } from '../lib/prisma.js';
import { LeadStatus, LeadSource, Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import type {
  CreateLeadInput,
  UpdateLeadInput,
  ListLeadsInput,
} from '../validators/lead.validator.js';

export const leadService = {
  /**
   * List leads with filtering and pagination
   */
  async list(tenantId: string, options: ListLeadsInput) {
    const {
      page = 1,
      limit = 20,
      status,
      source,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      assignedToId,
    } = options;

    const skip = (page - 1) * limit;

    const where: Prisma.LeadWhereInput = {
      tenantId,
      ...(status && { status }),
      ...(source && { source }),
      ...(assignedToId && { assignedToId }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
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
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.lead.count({ where }),
    ]);

    return {
      data: leads,
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
   * Get lead by ID
   */
  async getById(tenantId: string, id: string) {
    const lead = await prisma.lead.findFirst({
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
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        case: {
          select: {
            id: true,
            caseNumber: true,
            status: true,
          },
        },
      },
    });

    if (!lead) {
      throw new AppError(404, 'Lead not found');
    }

    return lead;
  },

  /**
   * Create a new lead
   */
  async create(tenantId: string, data: CreateLeadInput, createdById: string) {
    const lead = await prisma.lead.create({
      data: {
        tenantId,
        createdById,
        ...data,
        status: LeadStatus.NEW,
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

    return lead;
  },

  /**
   * Update a lead
   */
  async update(tenantId: string, id: string, data: UpdateLeadInput) {
    // Check if lead exists
    const existing = await prisma.lead.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new AppError(404, 'Lead not found');
    }

    const lead = await prisma.lead.update({
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

    return lead;
  },

  /**
   * Delete a lead
   */
  async delete(tenantId: string, id: string) {
    const existing = await prisma.lead.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new AppError(404, 'Lead not found');
    }

    // Check if lead has been converted to a case
    if (existing.caseId) {
      throw new AppError(400, 'Cannot delete a lead that has been converted to a case');
    }

    await prisma.lead.delete({ where: { id } });

    return { success: true };
  },

  /**
   * Assign lead to an agent
   */
  async assign(tenantId: string, id: string, agentId: string) {
    // Verify lead exists
    const lead = await prisma.lead.findFirst({
      where: { id, tenantId },
    });

    if (!lead) {
      throw new AppError(404, 'Lead not found');
    }

    // Verify agent exists and belongs to the tenant
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

    const updatedLead = await prisma.lead.update({
      where: { id },
      data: {
        assignedToId: agentId,
        status: lead.status === LeadStatus.NEW ? LeadStatus.CONTACTED : lead.status,
      },
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

    return updatedLead;
  },

  /**
   * Convert lead to case
   */
  async convertToCase(tenantId: string, id: string, userId: string) {
    const lead = await prisma.lead.findFirst({
      where: { id, tenantId },
    });

    if (!lead) {
      throw new AppError(404, 'Lead not found');
    }

    if (lead.caseId) {
      throw new AppError(400, 'Lead has already been converted to a case');
    }

    // Create case and update lead in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Generate case number
      const lastCase = await tx.case.findFirst({
        where: { tenantId },
        orderBy: { caseNumber: 'desc' },
      });
      const nextNumber = lastCase
        ? parseInt(lastCase.caseNumber.replace('CASE-', '')) + 1
        : 1;
      const caseNumber = `CASE-${String(nextNumber).padStart(6, '0')}`;

      // Create case
      const newCase = await tx.case.create({
        data: {
          tenantId,
          leadId: lead.id,
          applicantId: lead.createdById, // TODO: Create applicant user if needed
          caseNumber,
          firstName: lead.firstName,
          lastName: lead.lastName,
          email: lead.email,
          phone: lead.phone,
          nationality: lead.nationality,
          destinationCountry: lead.destinationCountry,
          visaType: lead.interestedVisa ? 'WORK' : 'WORK', // Default to WORK
          createdById: userId,
        },
      });

      // Update lead status and link to case
      await tx.lead.update({
        where: { id },
        data: {
          status: LeadStatus.WON,
          caseId: newCase.id,
        },
      });

      return newCase;
    });

    return result;
  },

  /**
   * Get lead statistics
   */
  async getStats(tenantId: string) {
    const [byStatus, bySource, total, thisMonth] = await Promise.all([
      prisma.lead.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: true,
      }),
      prisma.lead.groupBy({
        by: ['source'],
        where: { tenantId },
        _count: true,
      }),
      prisma.lead.count({ where: { tenantId } }),
      prisma.lead.count({
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
      bySource: bySource.reduce(
        (acc, item) => ({ ...acc, [item.source]: item._count }),
        {} as Record<string, number>
      ),
    };
  },
};
