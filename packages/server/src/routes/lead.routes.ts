import { Router } from 'express';
import { leadController } from '../controllers/lead.controller.js';
import { authorize } from '../middleware/authorize.js';
import { UserRole } from '@prisma/client';

const router = Router();

// All lead routes require at least Agent role
const staffRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT];
const managerRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER];

// List leads
router.get('/', authorize(...staffRoles), leadController.list);

// Get lead statistics
router.get('/stats', authorize(...staffRoles), leadController.getStats);

// Get lead by ID
router.get('/:id', authorize(...staffRoles), leadController.getById);

// Create lead
router.post('/', authorize(...staffRoles), leadController.create);

// Update lead
router.patch('/:id', authorize(...staffRoles), leadController.update);

// Delete lead (Manager+)
router.delete('/:id', authorize(...managerRoles), leadController.delete);

// Assign lead to agent (Manager+)
router.post('/:id/assign', authorize(...managerRoles), leadController.assign);

// Convert lead to case
router.post('/:id/convert', authorize(...staffRoles), leadController.convertToCase);

export { router as leadRouter };
