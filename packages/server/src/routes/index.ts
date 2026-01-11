import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { onboardingRouter } from './onboarding.routes.js';
import { leadRouter } from './lead.routes.js';
import { caseRouter } from './case.routes.js';
import { companyRouter } from './company.routes.js';
import { jobRouter } from './job.routes.js';
import { candidateRouter } from './candidate.routes.js';
import { portalRouter } from './portal.routes.js';
import { adminRouter } from './admin.routes.js';
import { tenantResolver } from '../middleware/tenantResolver.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// API version info
router.get('/', (_req, res) => {
  res.json({
    name: 'Koala Migration Platform API',
    version: '1.0.0',
    status: 'running',
  });
});

// Public routes
router.use('/auth', authRouter);
router.use('/onboarding', onboardingRouter);

// Tenant-scoped routes (all require authentication and tenant context)
router.use('/t/:tenantSlug/leads', tenantResolver, authenticate, leadRouter);
router.use('/t/:tenantSlug/cases', tenantResolver, authenticate, caseRouter);
router.use('/t/:tenantSlug/companies', tenantResolver, authenticate, companyRouter);
router.use('/t/:tenantSlug/jobs', tenantResolver, authenticate, jobRouter);
router.use('/t/:tenantSlug/candidates', tenantResolver, authenticate, candidateRouter);
router.use('/t/:tenantSlug/portal', tenantResolver, authenticate, portalRouter);
router.use('/t/:tenantSlug/admin', tenantResolver, authenticate, adminRouter);

// Future tenant routes:
// router.use('/t/:tenantSlug/conversations', tenantResolver, authenticate, messagingRouter);

// Super admin routes will be added here:
// router.use('/admin', authenticate, requireSuperAdmin, superAdminRouter);

export { router };
