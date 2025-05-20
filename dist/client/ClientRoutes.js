"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ClientController_1 = require("./ClientController");
const authAdminMiddleware_1 = require("../middleware/authAdminMiddleware");
const permissionMiddleware_1 = require("../middleware/permissionMiddleware");
const authClientMiddleware_1 = require("../middleware/authClientMiddleware");
const router = (0, express_1.Router)();
// Public routes for client self-registration and login
router.post('/auth/register', ClientController_1.ClientController.registerClient);
router.post('/auth/login', ClientController_1.ClientController.loginClient);
router.get('/personal/', authClientMiddleware_1.authClientMiddleware, ClientController_1.ClientController.getClientInformation);
router.put('/personal/:id', authClientMiddleware_1.authClientMiddleware, ClientController_1.ClientController.updateClient);
router.delete('/personal/:id', authClientMiddleware_1.authClientMiddleware, ClientController_1.ClientController.deleteClient);
// Admin routes that require admin/barber authentication to manipulate
router.post('/', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('manageClients'), ClientController_1.ClientController.registerClientAdmin);
router.get('/', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('viewAllClients'), ClientController_1.ClientController.getAllClientsByCompany);
router.get('/barber', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('viewOwnClients'), ClientController_1.ClientController.getClientsByBarber);
router.get('/:id', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('viewAllClients'), ClientController_1.ClientController.getClientById);
exports.default = router;
