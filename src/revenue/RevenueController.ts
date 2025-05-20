import { Request, Response } from 'express';
import { RevenueService } from './RevenueService';
import prisma from '../config/db/db';

const revenueService = new RevenueService();

export class RevenueController {
	// Faturamento mensal para o ano
	static async getMonthlyRevenue(req: Request, res: Response): Promise<void> {
		const { companyId, period, startDate, endDate } = req.query;
		const year = parseInt(req.query.year as string) || new Date().getFullYear();
		const userId = req.userId;

		try {
			if (!userId || !companyId) {
				res.status(400).json({ message: 'Parâmetros inválidos' });
				return;
			}

			// Parse date strings if provided
			const parsedStartDate = startDate ? new Date(startDate as string) : undefined;
			const parsedEndDate = endDate ? new Date(endDate as string) : undefined;

			console.log(`Buscando faturamento mensal com intervalo: ${parsedStartDate?.toISOString() || 'N/A'} a ${parsedEndDate?.toISOString() || 'N/A'}`);

			const revenue = await revenueService.getMonthlyRevenue(
				Number(companyId),
				year,
				period as string,
				parsedStartDate,
				parsedEndDate
			);

			res.status(200).json(revenue);
		} catch (error) {
			console.error('Erro ao buscar faturamento mensal:', error);
			res.status(500).json({ message: 'Erro ao buscar faturamento mensal' });
		}
	}

	// Faturamento por barbeiro
	static async getBarberRevenue(req: Request, res: Response): Promise<void> {
		const { companyId, period, startDate, endDate } = req.query;
		const year = parseInt(req.query.year as string) || new Date().getFullYear();
		const month = req.query.month ? parseInt(req.query.month as string) : undefined;
		const userId = req.userId;

		try {
			if (!userId || !companyId) {
				res.status(400).json({ message: 'Parâmetros inválidos' });
				return;
			}

			// Parse date strings if provided
			const parsedStartDate = startDate ? new Date(startDate as string) : undefined;
			const parsedEndDate = endDate ? new Date(endDate as string) : undefined;

			const revenue = await revenueService.getBarberRevenue(
				Number(companyId),
				(period as string) || 'year',
				year,
				month,
				parsedStartDate,
				parsedEndDate
			);
			res.status(200).json(revenue);
		} catch (error) {
			console.error('Erro ao buscar faturamento por barbeiro:', error);
			res.status(500).json({ message: 'Erro ao buscar faturamento por barbeiro' });
		}
	}

	// Faturamento mensal por barbeiro
	static async getBarberMonthlyRevenue(req: Request, res: Response): Promise<void> {
		const { companyId, startDate, endDate } = req.query;
		const year = parseInt(req.query.year as string) || new Date().getFullYear();
		const userId = req.userId;

		try {
			if (!userId || !companyId) {
				res.status(400).json({ message: 'Parâmetros inválidos' });
				return;
			}

			// Parse date strings if provided
			const parsedStartDate = startDate ? new Date(startDate as string) : undefined;
			const parsedEndDate = endDate ? new Date(endDate as string) : undefined;

			const revenue = await revenueService.getBarberMonthlyRevenue(
				Number(companyId),
				year,
				parsedStartDate,
				parsedEndDate
			);

			res.status(200).json(revenue);
		} catch (error) {
			console.error('Erro ao buscar faturamento mensal por barbeiro:', error);
			res.status(500).json({ message: 'Erro ao buscar faturamento mensal por barbeiro' });
		}
	}

	// Faturamento por serviço
	static async getServiceRevenue(req: Request, res: Response): Promise<void> {
		const { companyId, period, startDate, endDate } = req.query;
		const year = parseInt(req.query.year as string) || new Date().getFullYear();
		const month = req.query.month ? parseInt(req.query.month as string) : undefined;
		const specificUserId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
		const userId = req.userId;

		try {
			if (!userId || !companyId) {
				res.status(400).json({ message: 'Parâmetros inválidos' });
				return;
			}

			// Parse date strings if provided
			const parsedStartDate = startDate ? new Date(startDate as string) : undefined;
			const parsedEndDate = endDate ? new Date(endDate as string) : undefined;

			const revenue = await revenueService.getServiceRevenue(
				Number(companyId),
				specificUserId,
				(period as string) || 'year',
				year,
				month,
				parsedStartDate,
				parsedEndDate
			);
			res.status(200).json(revenue);
		} catch (error) {
			console.error('Erro ao buscar faturamento por serviço:', error);
			res.status(500).json({ message: 'Erro ao buscar faturamento por serviço' });
		}
	}

	// Faturamento por forma de pagamento
	static async getPaymentMethodRevenue(req: Request, res: Response): Promise<void> {
		const { companyId, period, startDate, endDate } = req.query;
		const year = parseInt(req.query.year as string) || new Date().getFullYear();
		const month = req.query.month ? parseInt(req.query.month as string) : undefined;
		const userId = req.userId;

		try {
			if (!userId || !companyId) {
				res.status(400).json({ message: 'Parâmetros inválidos' });
				return;
			}

			// Parse date strings if provided
			const parsedStartDate = startDate ? new Date(startDate as string) : undefined;
			const parsedEndDate = endDate ? new Date(endDate as string) : undefined;

			const revenue = await revenueService.getPaymentMethodRevenue(
				Number(companyId),
				(period as string) || 'year',
				year,
				month,
				parsedStartDate,
				parsedEndDate
			);
			res.status(200).json(revenue);
		} catch (error) {
			console.error('Erro ao buscar faturamento por método de pagamento:', error);
			res.status(500).json({ message: 'Erro ao buscar faturamento por método de pagamento' });
		}
	}

	// Faturamento por dia da semana
	static async getWeekdayRevenue(req: Request, res: Response): Promise<void> {
		const { companyId, period, startDate, endDate } = req.query;
		const year = parseInt(req.query.year as string) || new Date().getFullYear();
		const month = req.query.month ? parseInt(req.query.month as string) : undefined;
		const userId = req.userId;

		try {
			if (!userId || !companyId) {
				res.status(400).json({ message: 'Parâmetros inválidos' });
				return;
			}

			// Parse date strings if provided
			const parsedStartDate = startDate ? new Date(startDate as string) : undefined;
			const parsedEndDate = endDate ? new Date(endDate as string) : undefined;

			const revenue = await revenueService.getWeekdayRevenue(
				Number(companyId),
				(period as string) || 'year',
				year,
				month,
				parsedStartDate,
				parsedEndDate
			);
			res.status(200).json(revenue);
		} catch (error) {
			console.error('Erro ao buscar faturamento por dia da semana:', error);
			res.status(500).json({ message: 'Erro ao buscar faturamento por dia da semana' });
		}
	}

	// Faturamento por horário
	static async getHourlyRevenue(req: Request, res: Response): Promise<void> {
		const { companyId, period, startDate, endDate } = req.query;
		const year = parseInt(req.query.year as string) || new Date().getFullYear();
		const month = req.query.month ? parseInt(req.query.month as string) : undefined;
		const userId = req.userId;

		try {
			if (!userId || !companyId) {
				res.status(400).json({ message: 'Parâmetros inválidos' });
				return;
			}

			// Parse date strings if provided
			const parsedStartDate = startDate ? new Date(startDate as string) : undefined;
			const parsedEndDate = endDate ? new Date(endDate as string) : undefined;

			const revenue = await revenueService.getHourlyRevenue(
				Number(companyId),
				(period as string) || 'year',
				year,
				month,
				parsedStartDate,
				parsedEndDate
			);
			res.status(200).json(revenue);
		} catch (error) {
			console.error('Erro ao buscar faturamento por horário:', error);
			res.status(500).json({ message: 'Erro ao buscar faturamento por horário' });
		}
	}

	// Comparativo ano a ano
	static async getYearlyComparison(req: Request, res: Response): Promise<void> {
		const { companyId, startDate, endDate } = req.query;
		const year = parseInt(req.query.year as string) || new Date().getFullYear();
		const userId = req.userId;

		try {
			if (!userId || !companyId) {
				res.status(400).json({ message: 'Parâmetros inválidos' });
				return;
			}

			// Parse date strings if provided
			const parsedStartDate = startDate ? new Date(startDate as string) : undefined;
			const parsedEndDate = endDate ? new Date(endDate as string) : undefined;

			const revenue = await revenueService.getYearlyComparison(
				Number(companyId),
				year,
				parsedStartDate,
				parsedEndDate
			);

			res.status(200).json(revenue);
		} catch (error) {
			console.error('Erro ao buscar comparativo anual:', error);
			res.status(500).json({ message: 'Erro ao buscar comparativo anual' });
		}
	}

	// Ticket médio por barbeiro
	static async getAvgTicketByBarber(req: Request, res: Response): Promise<void> {
		const { companyId, period, startDate, endDate } = req.query;
		const year = parseInt(req.query.year as string) || new Date().getFullYear();
		const month = req.query.month ? parseInt(req.query.month as string) : undefined;
		const userId = req.userId;

		try {
			if (!userId || !companyId) {
				res.status(400).json({ message: 'Parâmetros inválidos' });
				return;
			}

			// Parse date strings if provided
			const parsedStartDate = startDate ? new Date(startDate as string) : undefined;
			const parsedEndDate = endDate ? new Date(endDate as string) : undefined;

			const revenue = await revenueService.getAvgTicketByBarber(
				Number(companyId),
				(period as string) || 'year',
				year,
				month,
				parsedStartDate,
				parsedEndDate
			);
			res.status(200).json(revenue);
		} catch (error) {
			console.error('Erro ao buscar ticket médio por barbeiro:', error);
			res.status(500).json({ message: 'Erro ao buscar ticket médio por barbeiro' });
		}
	}

	// Faturamento por usuário específico (para o barbeiro ver seus próprios dados)
	static async getUserRevenue(req: Request, res: Response): Promise<void> {
		const { companyId, period, startDate, endDate } = req.query;
		const year = parseInt(req.query.year as string) || new Date().getFullYear();
		const month = req.query.month ? parseInt(req.query.month as string) : undefined;
		const userId = req.userId;

		try {
			if (!userId || !companyId) {
				res.status(400).json({ message: 'Parâmetros inválidos' });
				return;
			}

			// Parse date strings if provided
			const parsedStartDate = startDate ? new Date(startDate as string) : undefined;
			const parsedEndDate = endDate ? new Date(endDate as string) : undefined;

			// Usamos o getMonthlyRevenue para obter todos os meses, mas filtramos pelo ID do usuário logado
			const allBarberData = await revenueService.getBarberMonthlyRevenue(
				Number(companyId),
				year,
				parsedStartDate,
				parsedEndDate
			);

			// Obter o nome do usuário para filtrar
			const userData = await prisma.user.findUnique({
				where: { id: userId },
				select: { name: true }
			});

			if (!userData) {
				res.status(404).json({ message: 'Usuário não encontrado' });
				return;
			}

			// Converter para o formato esperado no frontend (similar ao revenueData)
			const userRevenueData = allBarberData.map(monthData => ({
				name: monthData.name,
				total: monthData[userData.name] || 0
			}));

			res.status(200).json(userRevenueData);
		} catch (error) {
			console.error('Erro ao buscar faturamento do usuário:', error);
			res.status(500).json({ message: 'Erro ao buscar faturamento do usuário' });
		}
	}
} 