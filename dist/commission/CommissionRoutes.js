"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CommissionController_1 = require("./CommissionController");
const authAdminMiddleware_1 = require("../middleware/authAdminMiddleware");
const permissionMiddleware_1 = require("../middleware/permissionMiddleware");
const router = (0, express_1.Router)();
// Commission Config Routes
router.post('/', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('manageCommissions'), CommissionController_1.CommissionController.createCommissionConfig);
router.get('/', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('viewAllCommissions'), CommissionController_1.CommissionController.getCommissionConfigsByCompany);
router.get('/user/:userId', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('viewOwnCommissions'), CommissionController_1.CommissionController.getCommissionConfigByUserId);
router.put('/:id', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('manageCommissions'), CommissionController_1.CommissionController.updateCommissionConfig);
router.delete('/:id', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('manageCommissions'), CommissionController_1.CommissionController.deleteCommissionConfig);
// Commission Rule Routes
router.post('/rule', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('manageCommissions'), CommissionController_1.CommissionController.createCommissionRule);
router.get('/:commissionId/rules', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('viewOwnCommissions'), CommissionController_1.CommissionController.getCommissionRulesByConfig);
router.put('/rule/:id', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('manageCommissions'), CommissionController_1.CommissionController.updateCommissionRule);
router.delete('/rule/:id', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('manageCommissions'), CommissionController_1.CommissionController.deleteCommissionRule);
exports.default = router;
