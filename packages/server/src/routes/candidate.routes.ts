import { Router } from 'express';
import { candidateController } from '../controllers/candidate.controller.js';
import { authorize } from '../middleware/authorize.js';
import { UserRole } from '@prisma/client';

const router = Router();

const staffRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT];
const managerRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER];
const applicantRoles = [UserRole.APPLICANT];

// List candidates (Staff only)
router.get('/', authorize(...staffRoles), candidateController.list);

// Get candidate statistics
router.get('/stats', authorize(...staffRoles), candidateController.getStats);

// Get my profile (Applicant)
router.get('/me', authorize(...applicantRoles), candidateController.getMyProfile);

// Get candidate by ID
router.get('/:id', authorize(...staffRoles), candidateController.getById);

// Update candidate (Staff)
router.patch('/:id', authorize(...staffRoles), candidateController.update);

// Apply to job (Applicant)
router.post('/apply', authorize(...applicantRoles), candidateController.applyToJob);

// Update application status (Manager+)
router.patch('/applications/:id/status', authorize(...managerRoles), candidateController.updateApplicationStatus);

export { router as candidateRouter };
