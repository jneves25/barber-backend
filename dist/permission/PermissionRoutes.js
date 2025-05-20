"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/permissionRoutes.ts
const express_1 = require("express");
const PermissionController_1 = require("./PermissionController");
const authAdminMiddleware_1 = require("../middleware/authAdminMiddleware");
const permissionMiddleware_1 = require("../middleware/permissionMiddleware");
const router = (0, express_1.Router)();
router.post('/', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('managePermissions'), PermissionController_1.PermissionController.createPermission);
router.get('/', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('viewPermissions'), PermissionController_1.PermissionController.getAllPermissions);
router.get('/:id', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('viewPermissions'), PermissionController_1.PermissionController.getPermissionById);
router.put('/:id', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('managePermissions'), PermissionController_1.PermissionController.updatePermission);
router.delete('/:id', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('managePermissions'), PermissionController_1.PermissionController.deletePermission);
exports.default = router;
