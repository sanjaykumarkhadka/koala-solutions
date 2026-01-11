import { prisma } from '../lib/prisma.js';
import { Prisma } from '@prisma/client';
import { AppError } from '../middleware/errorHandler.js';
import type {
  CreateCompanyInput,
  UpdateCompanyInput,
  ListCompaniesInput,
} from '../validators/company.validator.js';

export const companyService = {
  async list(tenantId: string, options: ListCompaniesInput) {
    const {
      page = 1,
      limit = 20,
      search,
      country,
      industry,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options;

    const skip = (page - 1) * limit;

    const where: Prisma.CompanyWhereInput = {
      tenantId,
      ...(country && { country }),
      ...(industry && { industry }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { contactEmail: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [companies, total] = await Promise.all([
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          _count: {
            select: { jobs: true },
          },
        },
      }),
      prisma.company.count({ where }),
    ]);

    return {
      data: companies,
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
    const company = await prisma.company.findFirst({
      where: { id, tenantId },
      include: {
        jobs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            _count: {
              select: { applications: true },
            },
          },
        },
        _count: {
          select: { jobs: true },
        },
      },
    });

    if (!company) {
      throw new AppError(404, 'Company not found');
    }

    return company;
  },

  async create(tenantId: string, data: CreateCompanyInput) {
    const company = await prisma.company.create({
      data: {
        tenantId,
        ...data,
        website: data.website || null,
      },
    });

    return company;
  },

  async update(tenantId: string, id: string, data: UpdateCompanyInput) {
    const existing = await prisma.company.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new AppError(404, 'Company not found');
    }

    const updated = await prisma.company.update({
      where: { id },
      data: {
        ...data,
        website: data.website || null,
        logoUrl: data.logoUrl || null,
      },
    });

    return updated;
  },

  async delete(tenantId: string, id: string) {
    const existing = await prisma.company.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new AppError(404, 'Company not found');
    }

    await prisma.company.delete({ where: { id } });

    return { success: true };
  },

  async getStats(tenantId: string) {
    const [total, byCountry, byIndustry] = await Promise.all([
      prisma.company.count({ where: { tenantId } }),
      prisma.company.groupBy({
        by: ['country'],
        where: { tenantId },
        _count: true,
      }),
      prisma.company.groupBy({
        by: ['industry'],
        where: { tenantId, industry: { not: null } },
        _count: true,
      }),
    ]);

    return {
      total,
      byCountry: byCountry.reduce(
        (acc, item) => ({ ...acc, [item.country]: item._count }),
        {} as Record<string, number>
      ),
      byIndustry: byIndustry.reduce(
        (acc, item) => ({ ...acc, [item.industry || 'Other']: item._count }),
        {} as Record<string, number>
      ),
    };
  },
};
