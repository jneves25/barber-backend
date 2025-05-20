"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = require("./UserController");
const authAdminMiddleware_1 = require("../middleware/authAdminMiddleware");
const permissionMiddleware_1 = require("../middleware/permissionMiddleware");
const router = (0, express_1.Router)();
router.get('/', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('viewUsers'), UserController_1.UserController.getUsers);
router.get('/userInfo', authAdminMiddleware_1.authAdminMiddleware, UserController_1.UserController.getUserInfo); // mudar pra viewOwnUser
router.get('/company', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('viewUsers'), UserController_1.UserController.getUsersByCompany);
router.get('/:id', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('viewUsers'), UserController_1.UserController.getUserById); // mudar pra viewOtherUsers
router.post('/', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('manageUsers'), UserController_1.UserController.createUser);
router.put('/:id', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('manageUsers'), UserController_1.UserController.updateUser);
router.delete('/:id', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('manageUsers'), UserController_1.UserController.deleteUser);
exports.default = router;
