import { Router } from 'express';
import { RevenueController } from './RevenueController';
import { authAdminMiddleware } from '../middleware/authAdminMiddleware';
import { permissionMiddleware } from '../middleware/permissionMiddleware';

const router = Router();

// Endpoints para administradores (requer viewFullRevenue)
router.get('/monthly', authAdminMiddleware, permissionMiddleware(['viewFullRevenue', 'viewOwnRevenue']), RevenueController.getMonthlyRevenue);
router.get('/barber', authAdminMiddleware, permissionMiddleware('viewFullRevenue'), RevenueController.getBarberRevenue);
router.get('/barber/monthly', authAdminMiddleware, permissionMiddleware('viewFullRevenue'), RevenueController.getBarberMonthlyRevenue);
router.get('/service', authAdminMiddleware, permissionMiddleware(['viewFullRevenue', 'viewOwnRevenue']), RevenueController.getServiceRevenue);
router.get('/payment', authAdminMiddleware, permissionMiddleware(['viewFullRevenue', 'viewOwnRevenue']), RevenueController.getPaymentMethodRevenue);
router.get('/weekday', authAdminMiddleware, permissionMiddleware(['viewFullRevenue', 'viewOwnRevenue']), RevenueController.getWeekdayRevenue);
router.get('/hourly', authAdminMiddleware, permissionMiddleware(['viewFullRevenue', 'viewOwnRevenue']), RevenueController.getHourlyRevenue);
router.get('/yearly-comparison', authAdminMiddleware, permissionMiddleware(['viewFullRevenue', 'viewOwnRevenue']), RevenueController.getYearlyComparison);
router.get('/avg-ticket', authAdminMiddleware, permissionMiddleware('viewFullRevenue'), RevenueController.getAvgTicketByBarber);

// Endpoint específico para barbeiros visualizarem seu próprio faturamento
router.get('/user', authAdminMiddleware, permissionMiddleware('viewOwnRevenue'), RevenueController.getUserRevenue);

export default router; 