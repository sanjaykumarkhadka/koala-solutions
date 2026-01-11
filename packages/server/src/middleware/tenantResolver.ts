import type { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from './errorHandler.js';

/**
 * Middleware to resolve tenant from URL path parameter.
 * URL Pattern: /api/t/:tenantSlug/*
 *
 * This middleware:
 * 1. Extracts tenantSlug from request params
 * 2. Looks up the tenant in database
 * 3. Validates tenant exists and is active
 * 4. Attaches tenant to request object
 */
export async function tenantResolver(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { tenantSlug } = req.params;

    if (!tenantSlug) {
      throw new AppError(400, 'Tenant slug is required');
    }

    const tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });

    if (!tenant) {
      throw new AppError(404, 'Tenant not found');
    }

    if (tenant.status === 'SUSPENDED') {
      throw new AppError(403, 'This organization has been suspended');
    }

    if (tenant.status === 'PENDING') {
      throw new AppError(403, 'This organization is pending activation');
    }

    // Attach tenant to request
    req.tenant = tenant;

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to optionally resolve tenant from URL if present.
 * Used for routes that may or may not have tenant context.
 */
export async function optionalTenantResolver(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { tenantSlug } = req.params;

    if (tenantSlug) {
      const tenant = await prisma.tenant.findUnique({
        where: { slug: tenantSlug },
      });

      if (tenant && tenant.status === 'ACTIVE') {
        req.tenant = tenant;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Helper to get tenant ID from request.
 * Throws error if tenant is not set.
 */
export function getTenantId(req: Request): string {
  if (!req.tenant) {
    throw new AppError(500, 'Tenant not resolved');
  }
  return req.tenant.id;
}
