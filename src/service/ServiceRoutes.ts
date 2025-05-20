import { Router } from 'express';
import { ServiceController } from './ServiceController';
import { authAdminMiddleware } from '../middleware/authAdminMiddleware';
import { permissionMiddleware } from '../middleware/permissionMiddleware';

const router = Router();

router.post('/', authAdminMiddleware, permissionMiddleware('manageServices'), ServiceController.createService);
router.put('/:id', authAdminMiddleware, permissionMiddleware('manageServices'), ServiceController.updateService);
router.delete('/:id', authAdminMiddleware, permissionMiddleware('manageServices'), ServiceController.deleteService);
router.get('/', authAdminMiddleware, permissionMiddleware('viewServices'), ServiceController.getAllServices);
router.get('/company/:slug', ServiceController.getServicesByCompanySlug);
router.get('/:id', authAdminMiddleware, permissionMiddleware('viewServices'), ServiceController.getServiceById);

export default router;