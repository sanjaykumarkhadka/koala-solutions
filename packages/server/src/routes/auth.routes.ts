import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { onboardingController } from '../controllers/onboarding.controller.js';
import { authenticate } from '../middleware/auth.js';
import { optionalTenantResolver } from '../middleware/tenantResolver.js';

const router = Router();

// Public routes
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Get tenants for email (for multi-tenant login flow)
router.get('/tenants', onboardingController.getTenantsForEmail);

// Registration requires tenant context (optional - can be from body or URL)
router.post('/register', optionalTenantResolver, authController.register);

// Protected routes
router.get('/me', authenticate, authController.me);

export { router as authRouter };
