import { prisma } from '../lib/prisma.js';
import { Plan, TenantStatus, UserRole, UserStatus } from '@prisma/client';
import { hashPassword } from '../utils/password.js';
import { generateTokenPair, type JwtPayload } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';
import type { CreateAgencyInput } from '../validators/onboarding.validator.js';

export const onboardingService = {
  /**
   * Check if a slug is available
   */
  async checkSlug(slug: string): Promise<{ available: boolean; suggestion?: string }> {
    const existing = await prisma.tenant.findUnique({
      where: { slug },
    });

    if (!existing) {
      return { available: true };
    }

    // Generate a suggestion
    const suggestion = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    return { available: false, suggestion };
  },

  /**
   * Create a new agency with an admin user
   */
  async createAgency(data: CreateAgencyInput) {
    // Check if slug is available
    const existing = await prisma.tenant.findUnique({
      where: { slug: data.slug },
    });

    if (existing) {
      throw new AppError(400, 'This URL is already taken. Please choose a different one.');
    }

    // Check if email is used by any admin across tenants (optional check)
    // For now, we allow same email in different tenants

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create tenant and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: data.agencyName,
          slug: data.slug,
          plan: Plan.FREE,
          status: TenantStatus.ACTIVE,
          settings: {
            create: {
              primaryColor: data.primaryColor || '#0ea5e9',
              timezone: data.timezone || 'UTC',
              dateFormat: 'YYYY-MM-DD',
            },
          },
        },
        include: {
          settings: true,
        },
      });

      // Create admin user
      const user = await tx.user.create({
        data: {
          tenantId: tenant.id,
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: UserRole.ADMIN,
          status: UserStatus.ACTIVE,
        },
      });

      return { tenant, user };
    });

    // Generate auth tokens
    const payload: JwtPayload = {
      userId: result.user.id,
      tenantId: result.tenant.id,
      email: result.user.email,
      role: result.user.role,
    };

    const tokens = generateTokenPair(payload);

    // Update last login
    await prisma.user.update({
      where: { id: result.user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        id: result.user.id,
        tenantId: result.tenant.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        status: result.user.status,
        avatarUrl: result.user.avatarUrl,
      },
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        slug: result.tenant.slug,
        plan: result.tenant.plan,
        settings: result.tenant.settings,
      },
      ...tokens,
    };
  },

  /**
   * Get tenants associated with an email
   */
  async getTenantsForEmail(email: string) {
    const users = await prisma.user.findMany({
      where: {
        email,
        status: UserStatus.ACTIVE,
        tenant: {
          status: TenantStatus.ACTIVE,
        },
      },
      include: {
        tenant: true,
      },
    });

    return users.map((user) => ({
      id: user.tenant.id,
      name: user.tenant.name,
      slug: user.tenant.slug,
    }));
  },
};
