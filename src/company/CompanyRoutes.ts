// src/routes/CompanyRoutes.ts
import { Router } from 'express';
import { CompanyController } from './CompanyController';
import { authAdminMiddleware } from '../middleware/authAdminMiddleware';
import { permissionMiddleware } from '../middleware/permissionMiddleware';

const router = Router();

router.post('/', authAdminMiddleware, permissionMiddleware('manageCompany'), CompanyController.createCompany);
router.get('/', authAdminMiddleware, permissionMiddleware('viewCompanys'), CompanyController.getAllCompanys);
router.get('/slug/:slug', CompanyController.getCompanyBySlug);
router.get('/:id', authAdminMiddleware, permissionMiddleware('viewCompanys'), CompanyController.getCompanyById);
router.put('/:id', authAdminMiddleware, permissionMiddleware('manageCompany'), CompanyController.updateCompany);
router.post('/members', authAdminMiddleware, permissionMiddleware('addMember'), CompanyController.addMemberToCompany);
router.get('/user/:userId', authAdminMiddleware, permissionMiddleware('viewCompanys'), CompanyController.getUserCompanys);

export default router;
