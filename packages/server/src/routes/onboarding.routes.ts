import { Router } from 'express';
import { onboardingController } from '../controllers/onboarding.controller.js';

const router = Router();

// Check slug availability
router.post('/check-slug', onboardingController.checkSlug);

// Create new agency
router.post('/create-agency', onboardingController.createAgency);

// Get tenants for email (used in login flow)
router.get('/tenants', onboardingController.getTenantsForEmail);

export { router as onboardingRouter };
