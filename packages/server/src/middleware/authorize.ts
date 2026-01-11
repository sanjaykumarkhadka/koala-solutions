import type { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';
import { AppError } from './errorHandler.js';

/**
 * Middleware to authorize based on user roles
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError(403, 'Insufficient permissions'));
      return;
    }

    next();
  };
}

/**
 * Middleware to require super admin role
 */
export function requireSuperAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    next(new AppError(401, 'Authentication required'));
    return;
  }

  if (req.user.role !== UserRole.SUPER_ADMIN) {
    next(new AppError(403, 'Super admin access required'));
    return;
  }

  next();
}

/**
 * Middleware to require admin or higher role
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    next(new AppError(401, 'Authentication required'));
    return;
  }

  const adminRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN];

  if (!adminRoles.includes(req.user.role)) {
    next(new AppError(403, 'Admin access required'));
    return;
  }

  next();
}

/**
 * Middleware to require manager or higher role
 */
export function requireManager(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    next(new AppError(401, 'Authentication required'));
    return;
  }

  const managerRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER];

  if (!managerRoles.includes(req.user.role)) {
    next(new AppError(403, 'Manager access required'));
    return;
  }

  next();
}

/**
 * Middleware to ensure user belongs to the tenant in the URL
 */
export function requireTenantMembership(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || !req.tenant) {
    next(new AppError(401, 'Authentication required'));
    return;
  }

  if (req.user.tenantId !== req.tenant.id) {
    next(new AppError(403, 'Access denied to this organization'));
    return;
  }

  next();
}
