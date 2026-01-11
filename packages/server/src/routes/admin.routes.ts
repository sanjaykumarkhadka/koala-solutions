import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { authorize } from '../middleware/authorize.js';
import { UserRole } from '@prisma/client';

const router = Router();

const adminRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN];

// Dashboard
router.get('/dashboard', authorize(...adminRoles), adminController.getDashboard);

// Team management
router.get('/team', authorize(...adminRoles), adminController.listTeam);
router.post('/team', authorize(...adminRoles), adminController.inviteTeamMember);
router.patch('/team/:id', authorize(...adminRoles), adminController.updateTeamMember);
router.delete('/team/:id', authorize(...adminRoles), adminController.removeTeamMember);

// Settings
router.get('/settings', authorize(...adminRoles), adminController.getSettings);
router.patch('/settings', authorize(...adminRoles), adminController.updateSettings);

export { router as adminRouter };
