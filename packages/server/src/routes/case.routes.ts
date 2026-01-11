import { Router } from 'express';
import { caseController } from '../controllers/case.controller.js';
import { authorize } from '../middleware/authorize.js';
import { UserRole } from '@prisma/client';

const router = Router();

const staffRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT];
const managerRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER];
const adminRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN];

// List cases
router.get('/', authorize(...staffRoles), caseController.list);

// Get case statistics
router.get('/stats', authorize(...staffRoles), caseController.getStats);

// Get case by ID
router.get('/:id', authorize(...staffRoles), caseController.getById);

// Create case
router.post('/', authorize(...staffRoles), caseController.create);

// Update case
router.patch('/:id', authorize(...staffRoles), caseController.update);

// Update case status
router.patch('/:id/status', authorize(...staffRoles), caseController.updateStatus);

// Assign case to agent (Manager+)
router.post('/:id/assign', authorize(...managerRoles), caseController.assign);

// Delete case (Admin only)
router.delete('/:id', authorize(...adminRoles), caseController.delete);

// Timeline
router.get('/:id/timeline', authorize(...staffRoles), caseController.getTimeline);
router.post('/:id/timeline', authorize(...staffRoles), caseController.addTimelineEvent);

export { router as caseRouter };
