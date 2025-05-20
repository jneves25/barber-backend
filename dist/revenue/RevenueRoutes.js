"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const RevenueController_1 = require("./RevenueController");
const authAdminMiddleware_1 = require("../middleware/authAdminMiddleware");
const permissionMiddleware_1 = require("../middleware/permissionMiddleware");
const router = (0, express_1.Router)();
// Endpoints para administradores (requer viewFullRevenue)
router.get('/monthly', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)(['viewFullRevenue', 'viewOwnRevenue']), RevenueController_1.RevenueController.getMonthlyRevenue);
router.get('/barber', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('viewFullRevenue'), RevenueController_1.RevenueController.getBarberRevenue);
router.get('/barber/monthly', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('viewFullRevenue'), RevenueController_1.RevenueController.getBarberMonthlyRevenue);
router.get('/service', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)(['viewFullRevenue', 'viewOwnRevenue']), RevenueController_1.RevenueController.getServiceRevenue);
router.get('/payment', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)(['viewFullRevenue', 'viewOwnRevenue']), RevenueController_1.RevenueController.getPaymentMethodRevenue);
router.get('/weekday', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)(['viewFullRevenue', 'viewOwnRevenue']), RevenueController_1.RevenueController.getWeekdayRevenue);
router.get('/hourly', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)(['viewFullRevenue', 'viewOwnRevenue']), RevenueController_1.RevenueController.getHourlyRevenue);
router.get('/yearly-comparison', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)(['viewFullRevenue', 'viewOwnRevenue']), RevenueController_1.RevenueController.getYearlyComparison);
router.get('/avg-ticket', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('viewFullRevenue'), RevenueController_1.RevenueController.getAvgTicketByBarber);
// Endpoint específico para barbeiros visualizarem seu próprio faturamento
router.get('/user', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)('viewOwnRevenue'), RevenueController_1.RevenueController.getUserRevenue);
exports.default = router;
