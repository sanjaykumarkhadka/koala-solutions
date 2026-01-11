import { Router } from 'express';
import { companyController } from '../controllers/company.controller.js';
import { authorize } from '../middleware/authorize.js';
import { UserRole } from '@prisma/client';

const router = Router();

const staffRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.AGENT];
const managerRoles = [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER];

// List companies
router.get('/', authorize(...staffRoles), companyController.list);

// Get company statistics
router.get('/stats', authorize(...staffRoles), companyController.getStats);

// Get company by ID
router.get('/:id', authorize(...staffRoles), companyController.getById);

// Create company (Manager+)
router.post('/', authorize(...managerRoles), companyController.create);

// Update company (Manager+)
router.patch('/:id', authorize(...managerRoles), companyController.update);

// Delete company (Manager+)
router.delete('/:id', authorize(...managerRoles), companyController.delete);

export { router as companyRouter };
