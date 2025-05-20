"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const StatisticsController_1 = require("./StatisticsController");
const authAdminMiddleware_1 = require("../middleware/authAdminMiddleware");
const permissionMiddleware_1 = require("../middleware/permissionMiddleware");
const router = express_1.default.Router();
// Rota para obter estatísticas do dashboard
router.get('/dashboard/:companyId', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)(['viewFullStatistics', 'viewOwnStatistics']), StatisticsController_1.StatisticsController.getDashboardStats);
// Rota para obter agendamentos do dia atual
router.get('/appointments/upcoming/:companyId', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)(['viewFullStatistics', 'viewOwnStatistics', 'viewAllAppointments', 'viewOwnAppointments']), StatisticsController_1.StatisticsController.getUpcomingAppointments);
// Rota para obter principais serviços
router.get('/services/top/:companyId', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)(['viewFullStatistics', 'viewOwnStatistics']), StatisticsController_1.StatisticsController.getTopServices);
// Rota para obter comissões dos barbeiros
router.get('/commissions/barber/:companyId', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)(['viewFullStatistics', 'viewOwnStatistics', 'viewAllCommissions', 'viewOwnCommissions']), StatisticsController_1.StatisticsController.getBarberCommissions);
// Rota para obter projeções de faturamento e comissões
router.get('/projections/:companyId', authAdminMiddleware_1.authAdminMiddleware, (0, permissionMiddleware_1.permissionMiddleware)(['viewFullStatistics', 'viewOwnStatistics']), StatisticsController_1.StatisticsController.getProjections);
exports.default = router;
