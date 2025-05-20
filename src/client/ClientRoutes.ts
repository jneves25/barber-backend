import { Router } from 'express';
import { ClientController } from './ClientController';
import { authAdminMiddleware } from '../middleware/authAdminMiddleware';
import { permissionMiddleware } from '../middleware/permissionMiddleware';
import { authClientMiddleware } from '../middleware/authClientMiddleware';

const router = Router();

// Public routes for client self-registration and login
router.post('/auth/register', ClientController.registerClient);
router.post('/auth/login', ClientController.loginClient);
router.get('/personal/', authClientMiddleware, ClientController.getClientInformation);
router.put('/personal/:id', authClientMiddleware, ClientController.updateClient);
router.delete('/personal/:id', authClientMiddleware, ClientController.deleteClient);

// Admin routes that require admin/barber authentication to manipulate
router.post('/', authAdminMiddleware, permissionMiddleware('manageClients'), ClientController.registerClientAdmin);
router.get('/', authAdminMiddleware, permissionMiddleware('viewAllClients'), ClientController.getAllClientsByCompany);
router.get('/barber', authAdminMiddleware, permissionMiddleware('viewOwnClients'), ClientController.getClientsByBarber);
router.get('/:id', authAdminMiddleware, permissionMiddleware('viewAllClients'), ClientController.getClientById);

export default router;