// src/routes/permissionRoutes.ts
import { Router } from 'express';
import { PermissionController } from './PermissionController';
import { authAdminMiddleware } from '../middleware/authAdminMiddleware';
import { permissionMiddleware } from '../middleware/permissionMiddleware';

const router = Router();

router.post('/', authAdminMiddleware, permissionMiddleware('managePermissions'), PermissionController.createPermission);
router.get('/', authAdminMiddleware, permissionMiddleware('viewPermissions'), PermissionController.getAllPermissions);
router.get('/:id', authAdminMiddleware, permissionMiddleware('viewPermissions'), PermissionController.getPermissionById);
router.put('/:id', authAdminMiddleware, permissionMiddleware('managePermissions'), PermissionController.updatePermission);
router.delete('/:id', authAdminMiddleware, permissionMiddleware('managePermissions'), PermissionController.deletePermission);

export default router;
