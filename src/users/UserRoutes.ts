import { Router } from 'express';
import { UserController } from './UserController';
import { authAdminMiddleware } from '../middleware/authAdminMiddleware';
import { permissionMiddleware } from '../middleware/permissionMiddleware';

const router = Router();

router.get('/', authAdminMiddleware, permissionMiddleware('viewUsers'), UserController.getUsers);
router.get('/userInfo', authAdminMiddleware, UserController.getUserInfo); // mudar pra viewOwnUser
router.get('/company', authAdminMiddleware, permissionMiddleware('viewUsers'), UserController.getUsersByCompany);
router.get('/:id', authAdminMiddleware, permissionMiddleware('viewUsers'), UserController.getUserById); // mudar pra viewOtherUsers
router.post('/', authAdminMiddleware, permissionMiddleware('manageUsers'), UserController.createUser);
router.put('/:id', authAdminMiddleware, permissionMiddleware('manageUsers'), UserController.updateUser);
router.delete('/:id', authAdminMiddleware, permissionMiddleware('manageUsers'), UserController.deleteUser);

export default router;