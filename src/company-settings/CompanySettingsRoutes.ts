import { Router } from 'express';
import { CompanySettingsController } from './CompanySettingsController';
import { authAdminMiddleware } from '../middleware/authAdminMiddleware';
import { permissionMiddleware } from '../middleware/permissionMiddleware';

const router = Router();

router.post('/', authAdminMiddleware, permissionMiddleware('manageSettings'), CompanySettingsController.createSettings);
router.get('/company/:companyId', authAdminMiddleware, permissionMiddleware('manageSettings'), CompanySettingsController.getSettingsByCompanyId);
router.put('/:id', authAdminMiddleware, permissionMiddleware('manageSettings'), CompanySettingsController.updateSettings);
router.delete('/:id', authAdminMiddleware, permissionMiddleware('manageSettings'), CompanySettingsController.deleteSettings);

export default router; 