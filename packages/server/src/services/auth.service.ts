import { prisma } from '../lib/prisma.js';
import { UserRole, UserStatus } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateTokenPair, verifyRefreshToken, type JwtPayload } from '../utils/jwt.js';
import { AppError } from '../middleware/errorHandler.js';

export interface RegisterInput {
  tenantId: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
  tenantSlug?: string;
}

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterInput) {
    // Check if email already exists in this tenant
    const existingUser = await prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId: data.tenantId,
          email: data.email,
        },
      },
    });

    if (existingUser) {
      throw new AppError(400, 'Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        tenantId: data.tenantId,
        email: data.email,
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || UserRole.APPLICANT,
        status: UserStatus.ACTIVE,
      },
      include: {
        tenant: true,
      },
    });

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokenPair(payload);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
      },
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug,
      },
      ...tokens,
    };
  },

  /**
   * Login user
   */
  async login(data: LoginInput) {
    // Find user - if tenantSlug provided, search within that tenant
    // Otherwise, find user by email across all tenants
    let user;

    if (data.tenantSlug) {
      const tenant = await prisma.tenant.findUnique({
        where: { slug: data.tenantSlug },
      });

      if (!tenant) {
        throw new AppError(404, 'Organization not found');
      }

      if (tenant.status !== 'ACTIVE') {
        throw new AppError(403, 'Organization is not active');
      }

      user = await prisma.user.findUnique({
        where: {
          tenantId_email: {
            tenantId: tenant.id,
            email: data.email,
          },
        },
        include: {
          tenant: true,
        },
      });
    } else {
      // Find first active user with this email
      user = await prisma.user.findFirst({
        where: {
          email: data.email,
          status: UserStatus.ACTIVE,
          tenant: {
            status: 'ACTIVE',
          },
        },
        include: {
          tenant: true,
        },
      });
    }

    if (!user) {
      throw new AppError(401, 'Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError(403, 'Account is not active');
    }

    // Verify password
    const isValid = await comparePassword(data.password, user.passwordHash);

    if (!isValid) {
      throw new AppError(401, 'Invalid email or password');
    }

    // Generate tokens
    const payload: JwtPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role,
    };

    const tokens = generateTokenPair(payload);

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      user: {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatarUrl,
      },
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug,
      },
      ...tokens,
    };
  },

  /**
   * Refresh access token
   */
  async refresh(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);

      // Verify user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        include: {
          tenant: true,
        },
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new AppError(401, 'Invalid refresh token');
      }

      if (user.tenant.status !== 'ACTIVE') {
        throw new AppError(403, 'Organization is not active');
      }

      // Generate new tokens
      const newPayload: JwtPayload = {
        userId: user.id,
        tenantId: user.tenantId,
        email: user.email,
        role: user.role,
      };

      const tokens = generateTokenPair(newPayload);

      return tokens;
    } catch {
      throw new AppError(401, 'Invalid refresh token');
    }
  },

  /**
   * Get current user
   */
  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: {
          include: {
            settings: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      status: user.status,
      avatarUrl: user.avatarUrl,
      lastLoginAt: user.lastLoginAt,
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug,
        plan: user.tenant.plan,
        settings: user.tenant.settings,
      },
    };
  },
};
