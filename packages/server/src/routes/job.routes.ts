import { Router } from 'express';
import { jobController } from '../controllers/job.controller.js';
import { authorize } from '../middleware/authorize.js';
import { UserRole } from '@prisma/client';

const router = Router();

const staffRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT];
const managerRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER];

// List jobs
router.get('/', authorize(...staffRoles), jobController.list);

// Get job statistics
router.get('/stats', authorize(...staffRoles), jobController.getStats);

// Get job by ID
router.get('/:id', authorize(...staffRoles), jobController.getById);

// Get job applications
router.get('/:id/applications', authorize(...staffRoles), jobController.getApplications);

// Create job (Manager+)
router.post('/', authorize(...managerRoles), jobController.create);

// Update job (Manager+)
router.patch('/:id', authorize(...managerRoles), jobController.update);

// Update job status (Manager+)
router.patch('/:id/status', authorize(...managerRoles), jobController.updateStatus);

// Delete job (Manager+)
router.delete('/:id', authorize(...managerRoles), jobController.delete);

export { router as jobRouter };
