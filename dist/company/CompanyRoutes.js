"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/CompanyRoutes.ts
const express_1 = require("express");
const CompanyController_1 = require("./CompanyController");
const authAdminMiddleware_1 = require("../middleware/authAdminMiddleware");
const permissionMiddleware_1 = require("../middleware/permissionMiddleware");
const router = (0, express_1.Router)();
router.post('/', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('manageCompany'), CompanyController_1.CompanyController.createCompany);
router.get('/', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('viewCompanys'), CompanyController_1.CompanyController.getAllCompanys);
router.get('/slug/:slug', CompanyController_1.CompanyController.getCompanyBySlug);
router.get('/:id', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('viewCompanys'), CompanyController_1.CompanyController.getCompanyById);
router.put('/:id', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('manageCompany'), CompanyController_1.CompanyController.updateCompany);
router.post('/members', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('addMember'), CompanyController_1.CompanyController.addMemberToCompany);
router.get('/user/:userId', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('viewCompanys'), CompanyController_1.CompanyController.getUserCompanys);
exports.default = router;
