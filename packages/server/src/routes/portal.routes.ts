import { Router } from 'express';
import { portalController } from '../controllers/portal.controller.js';
import { authorize } from '../middleware/authorize.js';
import { UserRole } from '@prisma/client';

const router = Router();

// ============== COMPANY PORTAL ==============
// These routes are for users with COMPANY role

router.get('/company/dashboard', authorize(UserRole.COMPANY), portalController.getCompanyDashboard);
router.get('/company/jobs', authorize(UserRole.COMPANY), portalController.getCompanyJobs);
router.get('/company/applications', authorize(UserRole.COMPANY), portalController.getCompanyApplications);

// ============== APPLICANT PORTAL ==============
// These routes are for users with APPLICANT role

router.get('/applicant/dashboard', authorize(UserRole.APPLICANT), portalController.getApplicantDashboard);
router.get('/applicant/applications', authorize(UserRole.APPLICANT), portalController.getMyApplications);
router.get('/applicant/case', authorize(UserRole.APPLICANT), portalController.getMyCase);
router.get('/applicant/documents', authorize(UserRole.APPLICANT), portalController.getMyDocuments);
router.get('/applicant/jobs', authorize(UserRole.APPLICANT), portalController.getAvailableJobs);

export { router as portalRouter };
