import { Router } from 'express';
import { CommissionController } from './CommissionController';
import { authAdminMiddleware } from '../middleware/authAdminMiddleware';
import { permissionMiddleware } from '../middleware/permissionMiddleware';

const router = Router();

// Commission Config Routes
router.post('/', authAdminMiddleware, permissionMiddleware('manageCommissions'), CommissionController.createCommissionConfig);
router.get('/', authAdminMiddleware, permissionMiddleware('viewAllCommissions'), CommissionController.getCommissionConfigsByCompany);
router.get('/user/:userId', authAdminMiddleware, permissionMiddleware('viewOwnCommissions'), CommissionController.getCommissionConfigByUserId);
router.put('/:id', authAdminMiddleware, permissionMiddleware('manageCommissions'), CommissionController.updateCommissionConfig);
router.delete('/:id', authAdminMiddleware, permissionMiddleware('manageCommissions'), CommissionController.deleteCommissionConfig);

// Commission Rule Routes
router.post('/rule', authAdminMiddleware, permissionMiddleware('manageCommissions'), CommissionController.createCommissionRule);
router.get('/:commissionId/rules', authAdminMiddleware, permissionMiddleware('viewOwnCommissions'), CommissionController.getCommissionRulesByConfig);
router.put('/rule/:id', authAdminMiddleware, permissionMiddleware('manageCommissions'), CommissionController.updateCommissionRule);
router.delete('/rule/:id', authAdminMiddleware, permissionMiddleware('manageCommissions'), CommissionController.deleteCommissionRule);

export default router; 