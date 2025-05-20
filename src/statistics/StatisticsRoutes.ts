import express from 'express';
import { StatisticsController } from './StatisticsController';
import { authAdminMiddleware } from '../middleware/authAdminMiddleware';
import { permissionMiddleware } from '../middleware/permissionMiddleware';

const router = express.Router();

// Rota para obter estatísticas do dashboard
router.get('/dashboard/:companyId',
	authAdminMiddleware,
	permissionMiddleware(['viewFullStatistics', 'viewOwnStatistics']),
	StatisticsController.getDashboardStats
);

// Rota para obter agendamentos do dia atual
router.get('/appointments/upcoming/:companyId',
	authAdminMiddleware,
	permissionMiddleware(['viewFullStatistics', 'viewOwnStatistics', 'viewAllAppointments', 'viewOwnAppointments']),
	StatisticsController.getUpcomingAppointments
);

// Rota para obter principais serviços
router.get('/services/top/:companyId',
	authAdminMiddleware,
	permissionMiddleware(['viewFullStatistics', 'viewOwnStatistics']),
	StatisticsController.getTopServices
);

// Rota para obter comissões dos barbeiros
router.get('/commissions/barber/:companyId',
	authAdminMiddleware,
	permissionMiddleware(['viewFullStatistics', 'viewOwnStatistics', 'viewAllCommissions', 'viewOwnCommissions']),
	StatisticsController.getBarberCommissions
);

// Rota para obter projeções de faturamento e comissões
router.get('/projections/:companyId',
	authAdminMiddleware,
	permissionMiddleware(['viewFullStatistics', 'viewOwnStatistics']),
	StatisticsController.getProjections
);

export default router; 