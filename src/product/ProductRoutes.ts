import { Router } from 'express';
import { ProductController } from './ProductController';
import { authAdminMiddleware } from '../middleware/authAdminMiddleware';
import { permissionMiddleware } from '../middleware/permissionMiddleware';

const router = Router();

router.post('/', authAdminMiddleware, permissionMiddleware('manageProducts'), ProductController.createProduct);
router.get('/', authAdminMiddleware, permissionMiddleware('viewProducts'), ProductController.getAllProducts);
router.get('/company/:slug', ProductController.getProductsByCompanySlug);
router.get('/:id', authAdminMiddleware, permissionMiddleware('viewProducts'), ProductController.getProductById);
router.put('/:id', authAdminMiddleware, permissionMiddleware('manageProducts'), ProductController.updateProduct);
router.put('/:id/stock', authAdminMiddleware, permissionMiddleware('manageProducts'), ProductController.updateProductStock);
router.delete('/:id', authAdminMiddleware, permissionMiddleware('manageProducts'), ProductController.deleteProduct);

export default router; 